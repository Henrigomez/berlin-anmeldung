# Milestone 1 (Scraper & DB Integration) Analysis & Implementation Plan

## Executive Summary
This report provides comprehensive technical recommendations, exact file diff outlines, step-by-step instructions, and verification procedures for Milestone 1: Scraper & DB Integration of the Berlin Anmeldung Automation Platform.

---

## 1. Scope & Objectives
1. **Scraper Refactoring (`scraper.js`)**: Invert scrape order to attempt primary fetch via Axios GET with Cheerio and proper HTTP headers (`User-Agent`, `Accept-Language: de-DE,de;q=0.9`), falling back to Puppeteer Stealth. Standardize the return payload to include both `dates: string[]` and structured `appointments: Array<{ date: string, time: string, location: string, link: string }>`.
2. **Database Integration (`db.js`)**: Upgrade `addSubscriber(email, telegram)` and `getSubscribers()` to persist and retrieve both email and Telegram contacts (`{ email, telegram, subscribedAt }`).
3. **Background Cron Loop (`termine_app.js` & `server.js`)**: Encapsulate the Bürgeramt monitoring loop in `startMonitoring()` inside `termine_app.js` and wire it directly into `server.js` so `node server.js` starts both Express and the periodic appointment scanner.
4. **Subscribe API Update (`server.js`)**: Extract `req.body.telegram` in `POST /api/subscribe` and forward both email and Telegram fields to `db.addSubscriber(email, telegram)`.

---

## 2. File-by-File Analysis & Proposed Modifications

### A. `scraper.js`
#### Observations
- Lines 8–35 attempt Puppeteer Stealth first.
- Lines 40–59 fallback to Axios.
- Return payload currently contains only `{ found: boolean, dates: string[], url: string }`.

#### Recommended Changes
- Make Axios GET the primary request method. Include headers:
  - `User-Agent`: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36`
  - `Accept-Language`: `de-DE,de;q=0.9`
- Maintain Puppeteer Stealth inside the `catch` block as a fallback.
- Extract common HTML parsing logic into a helper `parseAppointments(html)` function.
- Build both `dates: string[]` and `appointments: Array<{ date: string, time: string, location: string, link: string }>`.

#### Proposed Code (`scraper.js`)
```javascript
const cheerio = require('cheerio');
const axios = require('axios');

const ANMELDUNG_URL = 'https://service.berlin.de/terminvereinbarung/termin/day/120686/';

/**
 * Parses appointment dates and structured appointment objects from service.berlin.de HTML
 */
function parseAppointments(html) {
    const $ = cheerio.load(html);
    const bookableDays = [];
    const appointments = [];

    $('td.buchbar a').each((i, el) => {
        const dateText = ($(el).attr('title') || $(el).text()).trim();
        const href = $(el).attr('href') || '';
        const link = href ? (href.startsWith('http') ? href : `https://service.berlin.de${href}`) : ANMELDUNG_URL;
        
        if (dateText) {
            bookableDays.push(dateText);
            appointments.push({
                date: dateText,
                time: 'Ganztägig / Online',
                location: 'Bürgeramt Berlin',
                link: link
            });
        }
    });

    return { dates: bookableDays, appointments };
}

async function checkAppointments() {
    // Primary Attempt: Axios GET with German locale headers
    try {
        const res = await axios.get(ANMELDUNG_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept-Language': 'de-DE,de;q=0.9'
            },
            timeout: 10000
        });

        const { dates, appointments } = parseAppointments(res.data);
        return {
            found: dates.length > 0,
            dates,
            appointments,
            url: ANMELDUNG_URL
        };

    } catch (axiosErr) {
        console.warn('[Scraper] Primary Axios GET failed, attempting Puppeteer Stealth fallback:', axiosErr.message);

        // Secondary Fallback: Puppeteer Stealth
        try {
            const puppeteer = require('puppeteer-extra');
            const StealthPlugin = require('puppeteer-extra-plugin-stealth');
            puppeteer.use(StealthPlugin());

            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

            await page.goto(ANMELDUNG_URL, { waitUntil: 'networkidle2', timeout: 25000 });
            const html = await page.content();
            await browser.close();

            const { dates, appointments } = parseAppointments(html);
            return {
                found: dates.length > 0,
                dates,
                appointments,
                url: ANMELDUNG_URL
            };
        } catch (puppeteerErr) {
            console.error('[Scraper Error]: Failed to fetch appointments via Puppeteer fallback.', puppeteerErr.message);
            return {
                found: false,
                dates: [],
                appointments: [],
                url: ANMELDUNG_URL
            };
        }
    }
}

module.exports = {
    checkAppointments
};
```

---

### B. `db.js`
#### Observations
- Line 67: `async function addSubscriber(email)` currently accepts only `email`.
- Line 92: `async function getSubscriberEmails()` returns array of strings.

#### Recommended Changes
- Update `addSubscriber(email, telegram)` signature.
- Normalize input strings and handle lookup/deduplication in `localList` by email or Telegram contact.
- Implement `getSubscribers()` returning `Promise<Array<{ email: string, telegram?: string, subscribedAt: string }>>`.
- Retain `getSubscriberEmails()` for backward compatibility.

#### Proposed Code (`db.js`)
```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use /tmp on serverless environments (Vercel, AWS Lambda) or fallback to local dir
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const SUBSCRIBERS_FILE = isServerless 
    ? path.join(os.tmpdir(), 'subscribers.json') 
    : path.join(__dirname, 'subscribers.json');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');

let db = null;
let useFirebase = false;
let memorySubscribers = [];

try {
    if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        const admin = require('firebase-admin');
        const serviceAccount = require(SERVICE_ACCOUNT_PATH);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        db = admin.firestore();
        useFirebase = true;
        console.log('[Database] Connected to Firebase Firestore.');
    } else {
        console.log('[Database] serviceAccountKey.json not found. Using local/tmp subscribers storage.');
    }
} catch (e) {
    console.error('[Database Error] Firebase init failed, using local storage fallback:', e.message);
}

try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
    }
} catch (err) {
    console.warn('[Database Warning] Could not write subscribers file, using memory storage:', err.message);
}

function getLocalSubscribers() {
    try {
        if (fs.existsSync(SUBSCRIBERS_FILE)) {
            const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        // Fallback to memory
    }
    return memorySubscribers;
}

function saveLocalSubscribers(list) {
    try {
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2));
    } catch (e) {
        memorySubscribers = list;
    }
}

async function addSubscriber(email, telegram) {
    const emailNormalized = email ? String(email).toLowerCase().trim() : '';
    const telegramNormalized = telegram ? String(telegram).trim() : '';
    
    if (!emailNormalized && !telegramNormalized) return false;

    // Save locally/memory
    const localList = getLocalSubscribers();
    const existingIndex = localList.findIndex(s => 
        (emailNormalized && s.email === emailNormalized) || 
        (telegramNormalized && s.telegram === telegramNormalized)
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
        if (emailNormalized) localList[existingIndex].email = emailNormalized;
        if (telegramNormalized) localList[existingIndex].telegram = telegramNormalized;
    } else {
        localList.push({ 
            email: emailNormalized, 
            telegram: telegramNormalized, 
            subscribedAt: now 
        });
    }
    saveLocalSubscribers(localList);

    // Save to Firebase if available
    if (useFirebase && db) {
        try {
            const docId = emailNormalized || telegramNormalized;
            await db.collection('subscribers').doc(docId).set({
                email: emailNormalized,
                telegram: telegramNormalized,
                subscribedAt: now
            }, { merge: true });
        } catch (e) {
            console.error('[Firebase Error] addSubscriber failed:', e.message);
        }
    }
    return true;
}

async function getSubscribers() {
    if (useFirebase && db) {
        try {
            const snapshot = await db.collection('subscribers').get();
            const list = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                list.push({
                    email: data.email || '',
                    telegram: data.telegram || '',
                    subscribedAt: data.subscribedAt || new Date().toISOString()
                });
            });
            if (list.length > 0) return list;
        } catch (e) {
            console.error('[Firebase Error] getSubscribers failed, falling back to local:', e.message);
        }
    }
    
    // Fallback to local/memory
    const localList = getLocalSubscribers();
    return localList.map(s => ({
        email: s.email || '',
        telegram: s.telegram || '',
        subscribedAt: s.subscribedAt || new Date().toISOString()
    }));
}

async function getSubscriberEmails() {
    const subscribers = await getSubscribers();
    return subscribers.map(s => s.email).filter(Boolean);
}

module.exports = {
    addSubscriber,
    getSubscribers,
    getSubscriberEmails
};
```

---

### C. `termine_app.js`
#### Observations
- Executes cron scheduling top-level upon import.
- Uses `getSubscriberEmails()` and sends email alerts.

#### Recommended Changes
- Export `startMonitoring()` function that schedules node-cron and runs initial check.
- In `runCheck()`, query `db.getSubscribers()` and trigger email alerts for email subscribers and Telegram alerts via `sendTelegramAlert(chatId, result.appointments)` for Telegram subscribers.
- Auto-invoke `startMonitoring()` when `require.main === module`.

#### Proposed Code (`termine_app.js`)
```javascript
const cron = require('node-cron');
const { checkAppointments } = require('./scraper');
const { sendAlert } = require('./emailer');
const { sendTelegramAlert } = require('./telegram');
const db = require('./db');

let lastAlertedDates = '';

async function runCheck() {
    console.log(`[${new Date().toLocaleTimeString()}] 🔍 Checking Bürgeramt appointment availability...`);
    
    const subscribers = await db.getSubscribers();
    console.log(`📊 Active Subscribers in DB: ${subscribers.length}`);

    const result = await checkAppointments();

    if (result.found) {
        console.log(`✅ APPOINTMENTS FOUND! Dates: ${result.dates.join(', ')}`);
        
        const currentDatesString = result.dates.join(',');
        
        if (currentDatesString !== lastAlertedDates) {
            // Email alerts
            const recipientEmails = subscribers.map(s => s.email).filter(Boolean);
            if (recipientEmails.length > 0) {
                console.log(`📧 Sending email alert to ${recipientEmails.length} subscribers...`);
                await sendAlert(result.dates, result.url, recipientEmails);
            } else {
                console.log('ℹ️ Appointments found, but no email subscribers registered yet.');
            }

            // Telegram alerts
            const telegramSubscribers = subscribers.map(s => s.telegram).filter(Boolean);
            if (telegramSubscribers.length > 0) {
                console.log(`📱 Sending Telegram alerts to ${telegramSubscribers.length} subscribers...`);
                for (const chatId of telegramSubscribers) {
                    await sendTelegramAlert(chatId, result.appointments || []);
                }
            }

            lastAlertedDates = currentDatesString;
        } else {
            console.log('⏭️ Dates are identical to previous check. Suppressing duplicate alert.');
        }

    } else {
        console.log('❌ No open slots found in this cycle.');
    }
}

function startMonitoring() {
    console.log('🚀 Berlin Anmeldung Alert Bot v2.0 is active!');
    console.log('📅 Monitoring Bürgeramt calendars every 5 minutes...');
    
    cron.schedule('*/5 * * * *', () => {
        runCheck();
    });

    runCheck();
}

if (require.main === module) {
    startMonitoring();
}

module.exports = {
    startMonitoring,
    runCheck
};
```

---

### D. `server.js`
#### Observations
- Line 184–206: `POST /api/subscribe` passes only `email` to `db.addSubscriber(email)`.
- Server startup does not call `startMonitoring()`.

#### Recommended Changes
- Import `startMonitoring` from `./termine_app`.
- Update `POST /api/subscribe` to extract `telegram` from `req.body` and pass `await db.addSubscriber(email, telegram)`.
- Invoke `startMonitoring()` in `app.listen` callback.

#### Diff Outline (`server.js`)
```javascript
// Add import at top
const { startMonitoring } = require('./termine_app');

// Update POST /api/subscribe
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
        }

        await db.addSubscriber(email, telegram);

        res.status(201).json({ 
            success: true, 
            message: "Erfolgreich angemeldet! You will receive instant alerts for new Berlin Termine!" 
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Update server listen block
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 Berlin Termine Luxury Portal running at http://localhost:${PORT}`);
        console.log(`====================================================`);
        startMonitoring();
    });
}
```

---

## 3. Step-by-Step Worker Implementation Guide

1. **Step 1: Edit `scraper.js`**
   - Implement `parseAppointments(html)` helper.
   - Refactor `checkAppointments()` to run Axios GET primary with German locale headers (`de-DE,de;q=0.9`), and Puppeteer Stealth secondary.
   - Return `{ found: boolean, dates: string[], appointments: Array<{date, time, location, link}>, url: string }`.

2. **Step 2: Edit `db.js`**
   - Update `addSubscriber(email, telegram)`.
   - Add `getSubscribers()` returning list of subscriber objects `{ email, telegram, subscribedAt }`.
   - Re-implement `getSubscriberEmails()` using `getSubscribers()`.

3. **Step 3: Edit `termine_app.js`**
   - Update `runCheck()` to use `db.getSubscribers()`.
   - Dispatch email and Telegram alerts when appointments are found.
   - Export `startMonitoring()` and `runCheck()`.

4. **Step 4: Edit `server.js`**
   - Import `startMonitoring` from `./termine_app`.
   - Update `POST /api/subscribe` route to extract `telegram` and invoke `db.addSubscriber(email, telegram)`.
   - Update `app.listen()` block to trigger `startMonitoring()`.

---

## 4. Independent Verification Plan

1. **Test Server & Cron Startup**:
   - Command: `node server.js` (stop with Ctrl+C after verifying log output)
   - Expected Output:
     - `🚀 Berlin Termine Luxury Portal running at http://localhost:3000`
     - `🚀 Berlin Anmeldung Alert Bot v2.0 is active!`
     - `📅 Monitoring Bürgeramt calendars every 5 minutes...`
     - `[XX:XX:XX] 🔍 Checking Bürgeramt appointment availability...`

2. **Test Scraper Data Contract**:
   - Command: `node -e "require('./scraper').checkAppointments().then(r => console.log(JSON.stringify(r, null, 2)))"`
   - Expected Output: JSON object with keys `found`, `dates`, `appointments`, and `url`.

3. **Test Database Functions**:
   - Command: `node -e "const db=require('./db'); db.addSubscriber('unit@test.de', '@unittester').then(() => db.getSubscribers()).then(console.log)"`
   - Expected Output: Array containing `{ email: 'unit@test.de', telegram: '@unittester', subscribedAt: '...' }`.

4. **Test API Subscribe Endpoint**:
   - Command: `Invoke-RestMethod -Uri "http://localhost:3000/api/subscribe" -Method POST -ContentType "application/json" -Body '{"email":"api@test.com","telegram":"@apitest"}'`
   - Expected Output: `{ success: true, message: "Erfolgreich angemeldet!..." }`.
