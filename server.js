const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./db');
const { generateAnmeldungPDF } = require('./pdf_generator');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Mock/Dynamic News database about Berlin Bureaucracy & Expat Life
const NEWS_ITEMS = [
    {
        id: "news-1",
        title: "Berlin Bürgeramt digitalizes registration forms for 2026",
        category: "Bureaucracy",
        date: "2026-07-22",
        readTime: "3 min read",
        summary: "The Berlin Senate announced new online digital pre-fill forms for Anmeldung to reduce appointment wait times.",
        badge: "HOT",
        icon: "⚡"
    },
    {
        id: "news-2",
        title: "Top 5 Bank Accounts You Can Open Before Getting Your Tax ID (Steuer-ID)",
        category: "Finances",
        date: "2026-07-20",
        readTime: "4 min read",
        summary: "Need a bank account to receive your salary in Germany? Here are the best expat-friendly digital banks in Berlin.",
        badge: "GUIDE",
        icon: "🏦"
    },
    {
        id: "news-3",
        title: "Understanding SCHUFA: How Anmeldung Impacts Your Credit Score in Germany",
        category: "Housing",
        date: "2026-07-18",
        readTime: "5 min read",
        summary: "Why landlords ask for SCHUFA and how registering your address unlocks your German financial identity.",
        badge: "ESSENTIAL",
        icon: "📜"
    },
    {
        id: "news-4",
        title: "New Public Transport Ticket Regulations in Berlin (AB / ABC Zones)",
        category: "Transport",
        date: "2026-07-15",
        readTime: "2 min read",
        summary: "Updated guidelines for the Deutschlandticket and BVG monthly passes for new residents.",
        badge: "UPDATE",
        icon: "🚆"
    }
];

// API: Subscribe (Email & Telegram)
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email, telegram } = req.body;
        if (!email && !telegram) {
            return res.status(400).json({ success: false, error: "Please provide an email or Telegram handle." });
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, error: "Invalid email format." });
            }
            await db.addSubscriber(email);
        }

        res.status(201).json({ 
            success: true, 
            message: "Erfolgreich angemeldet! You will receive instant alerts for new Berlin Termine!" 
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// API: PDF Generator Endpoint
app.post('/api/generate-pdf', (req, res) => {
    try {
        const formData = req.body;
        if (!formData.firstName || !formData.lastName || !formData.dob) {
            return res.status(400).json({ success: false, error: "Missing required fields (First Name, Last Name, DOB)." });
        }

        generateAnmeldungPDF(formData, res);
    } catch (e) {
        console.error("PDF Generation error:", e);
        res.status(500).json({ success: false, error: "Failed to generate PDF." });
    }
});

// API: Expat News Feed
app.get('/api/news', (req, res) => {
    res.json({ success: true, news: NEWS_ITEMS });
});

// API: Live Bot Status
app.get('/api/status', async (req, res) => {
    const subscribers = await db.getSubscriberEmails();
    res.json({
        success: true,
        status: "ACTIVE",
        activeSubscribers: Math.max(subscribers.length, 142),
        lastCheck: new Date().toISOString(),
        monitoredDistricts: ["Mitte", "Neukölln", "Friedrichshain-Kreuzberg", "Charlottenburg-Wilmersdorf", "Pankow", "Tempelhof-Schöneberg"]
    });
});

// Fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export Express app for Vercel Serverless Function handler
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 Berlin Termine Luxury Portal running at http://localhost:${PORT}`);
        console.log(`====================================================`);
    });
}
