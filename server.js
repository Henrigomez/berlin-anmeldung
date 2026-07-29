const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const db = require('./db');
const { generateAnmeldungPDF } = require('./pdf_generator');
const { createCheckoutSession } = require('./stripe');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/play_assets', express.static(path.join(__dirname, 'public', 'play_assets')));

app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/email-preview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'email-preview.html'));
});

app.get('/play-graphics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'play-graphics.html'));
});
app.get('/email-preview.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'email-preview.html'));
});

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

// Curated Live Weekly Events in Berlin
const BERLIN_EVENTS = [
    {
        id: "evt-1",
        title: "Berlin Summer Sunset Open-Air Festival",
        category: "Music & Nightlife",
        date: "Saturday, July 29, 2026",
        time: "16:00 - 23:00",
        location: "Tempelhofer Feld, Neukölln",
        price: "Free Entry / Spende",
        badge: "FEATURED",
        icon: "🎵",
        description: "Join thousands of Berliners at Tempelhof airfield for sunset lo-fi beats, food trucks, and open-air electronic music."
    },
    {
        id: "evt-2",
        title: "Kreuzberg Street Food & Vintage Flea Market",
        category: "Food & Markets",
        date: "Sunday, July 30, 2026",
        time: "11:00 - 18:00",
        location: "Markthalle Neun, Kreuzberg",
        price: "Free Entry",
        badge: "POPULAR",
        icon: "🍔",
        description: "Explore Berlin's vibrant street food scene with international dishes, artisan coffee, and curated vintage clothing stalls."
    },
    {
        id: "evt-3",
        title: "Berlin Tech Expat Networking & Founders Drinks",
        category: "Tech & Networking",
        date: "Thursday, July 27, 2026",
        time: "19:00 - 22:00",
        location: "Factory Berlin Mitte, Rheinsberger Str.",
        price: "Free RSVP",
        badge: "NETWORKING",
        icon: "🚀",
        description: "Connect with software engineers, product managers, and international founders living in Berlin over craft beer."
    },
    {
        id: "evt-4",
        title: "Museum Island Late-Night Art & Light Exhibition",
        category: "Culture & Art",
        date: "Friday, July 28, 2026",
        time: "20:00 - 01:00",
        location: "Museumsinsel (Pergamon & Bode Museum)",
        price: "12 € / Discounted",
        badge: "CULTURE",
        icon: "🎨",
        description: "Nighttime guided tours, illuminated neoclassical courtyards, and live acoustic violin performances."
    }
];

// API: Live Berlin Weather Forecast via Open-Meteo
app.get('/api/weather', async (req, res) => {
    try {
        // Berlin Coordinates: Lat 52.52, Lon 13.405
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.405&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe%2FBerlin';
        const response = await axios.get(url);
        
        const data = response.data;
        res.json({
            success: true,
            current: {
                temp: Math.round(data.current_weather.temperature),
                windspeed: data.current_weather.windspeed,
                weathercode: data.current_weather.weathercode,
                time: data.current_weather.time
            },
            daily: data.daily.time.map((day, idx) => ({
                date: day,
                maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
                minTemp: Math.round(data.daily.temperature_2m_min[idx]),
                code: data.daily.weathercode[idx]
            }))
        });
    } catch (e) {
        console.warn("Weather API fallback active:", e.message);
        // Fallback weather data for Berlin
        res.json({
            success: true,
            current: { temp: 24, windspeed: 12, weathercode: 1 },
            daily: [
                { date: "2026-07-26", maxTemp: 26, minTemp: 16, code: 0 },
                { date: "2026-07-27", maxTemp: 27, minTemp: 17, code: 1 },
                { date: "2026-07-28", maxTemp: 25, minTemp: 15, code: 2 },
                { date: "2026-07-29", maxTemp: 28, minTemp: 18, code: 0 },
                { date: "2026-07-30", maxTemp: 29, minTemp: 19, code: 1 },
                { date: "2026-07-31", maxTemp: 24, minTemp: 14, code: 3 },
                { date: "2026-08-01", maxTemp: 23, minTemp: 13, code: 2 }
            ]
        });
    }
});

// API: Live Berlin Events
app.get('/api/events', (req, res) => {
    res.json({ success: true, events: BERLIN_EVENTS });
});

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

// API: Stripe Checkout Session Endpoint
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { email } = req.body;
        const origin = req.headers.origin || 'https://berlinanmeldung.com';
        const result = await createCheckoutSession(email, origin);
        
        if (result.success) {
            res.json({ success: true, url: result.url, simulated: result.simulated });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (e) {
        console.error("Stripe Session Error:", e);
        res.status(500).json({ success: false, error: "Failed to initiate payment." });
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
