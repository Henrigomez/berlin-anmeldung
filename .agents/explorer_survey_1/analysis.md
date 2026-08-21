# Codebase Survey & Integration Strategy Analysis

**Project**: Berlin Anmeldung Automation Platform (`wise-bardeen`)  
**Investigated Directory**: `C:\Users\henry\Documents\antigravity\wise-bardeen`  
**Date**: 2026-08-10  
**Investigator**: teamwork_preview_explorer (Survey Explorer 1)

---

## 1. Executive Summary

The existing codebase (`wise-bardeen`) is a Node.js + Express application ("Berlin Termine Luxury Portal / Expat Bureaucracy Hub") designed to provide Bürgeramt appointment alerts, PDF registration form generation, and expat guides.

While basic scraper (`scraper.js`), emailer (`emailer.js`), telegram (`telegram.js`), database (`db.js`), and standalone bot (`termine_app.js`) files exist, they are currently partially decoupled from `server.js` and Telegram notifications are not yet fully wired into the main notification loop.

This analysis provides a comprehensive audit of the server stack, file structure, existing routes, dependencies, and a concrete roadmap to integrate the scraper and notification modules directly into `server.js` and create the required `test_scraper.js` verification script.

---

## 2. Directory Structure & File Listing

```
C:\Users\henry\Documents\antigravity\wise-bardeen\
├── .env                       # Environment configuration (PORT, RESEND_API_KEY, TELEGRAM_BOT_TOKEN, etc.)
├── .gitignore                 # Standard git ignore patterns
├── IMPRESSUM.md               # Legal impressum documentation
├── LICENSE                    # Software license (MIT/Custom)
├── ORIGINAL_REQUEST.md        # User specifications and acceptance criteria
├── PRIVACY_POLICY.md          # Privacy policy documentation
├── README.md                  # Project overview & startup instructions
├── TERMS_OF_SERVICE.md        # Terms of service documentation
├── db.js                      # Database adapter (Firestore + local subscribers.json fallback)
├── emailer.js                 # Resend API & Nodemailer fallback email alert module
├── package.json               # NPM package configuration & dependencies
├── package-lock.json          # Dependency lockfile
├── pdf_generator.js           # PDFKit template generator for Berlin Anmeldung form
├── scraper.js                 # Puppeteer Stealth + Axios/Cheerio appointment scraper
├── server.js                  # Main Express web server & API router
├── stripe.js                  # Stripe Checkout session creator (€4.99 VIP pass)
├── subscribers.json           # Local JSON fallback store for user subscriptions
├── telegram.js                # Telegram Bot API notification helper
├── termine_app.js             # Standalone node-cron appointment monitor script
├── vercel.json                # Vercel Serverless routing configuration
└── public/                    # Frontend static web application
    ├── app.js                 # Frontend JS application logic (fetch endpoints, UI rendering)
    ├── index.html             # Landing page HTML
    ├── styles.css             # Main stylesheet
    ├── email-preview.html     # HTML preview for email template
    ├── play-graphics.html     # Marketing graphics container
    ├── impressum.html         # Impressum static page
    ├── privacy.html           # Privacy static page
    ├── terms.html             # Terms static page
    ├── manifest.json          # Web app manifest
    ├── robots.txt             # Search engine robots rule file
    └── sitemap.xml            # XML sitemap
```

---

## 3. Server Stack & Dependencies

### Server Architecture
- **Runtime**: Node.js (CommonJS `require` format).
- **Framework**: Express.js (v4.19.2).
- **Deployment Support**: Standalone Node (`app.listen` on `process.env.PORT || 3000`) & Vercel Serverless Function export (`module.exports = app`).

### Key Dependencies (`package.json`)
| Dependency | Version | Purpose |
|---|---|---|
| `express` | `^4.19.2` | Core HTTP web framework & API routing |
| `cors` | `^2.8.5` | Cross-Origin Resource Sharing middleware |
| `dotenv` | `^16.4.5` | Loads environment variables from `.env` |
| `axios` | `^1.6.8` | HTTP client for Telegram alerts, weather API & HTTP fallback scraper |
| `cheerio` | `^1.0.0-rc.12` | HTML parsing for Bürgeramt DOM elements (`td.buchbar a`) |
| `puppeteer` | `^22.6.5` | Headless Chrome automation for scraping |
| `puppeteer-extra` | `^3.3.6` | Plugin framework for Puppeteer |
| `puppeteer-extra-plugin-stealth` | `^2.11.2` | Anti-bot detection stealth plugin for Puppeteer |
| `node-cron` | `^3.0.3` | Scheduled execution of periodic appointment checks |
| `nodemailer` | `^6.9.13` | SMTP fallback email transport |
| `resend` | `^6.18.0` | Primary transactional email API |
| `firebase-admin` | `^12.1.0` | Optional Firestore database integration |
| `stripe` | `^22.3.2` | VIP payment checkout integration |
| `pdfkit` | `^0.19.1` | Streamed PDF form generation |
| `jimp` | `^1.6.1` | Image manipulation utility |

---

## 4. Current Server Routes & Logic (`server.js`)

| Method | Endpoint | Handler Logic |
|---|---|---|
| `GET` | `/sitemap.xml` | Serves `public/sitemap.xml` |
| `GET` | `/robots.txt` | Serves `public/robots.txt` |
| `GET` | `/email-preview` | Serves `public/email-preview.html` |
| `GET` | `/play-graphics` | Serves `public/play-graphics.html` |
| `GET` | `/api/weather` | Proxies Open-Meteo Berlin forecast with hardcoded fallback |
| `GET` | `/api/events` | Returns JSON array of curated Berlin events |
| `GET` | `/api/news` | Returns JSON array of expat news & bureaucracy guides |
| `POST` | `/api/subscribe` | Validates input, saves subscriber via `db.addSubscriber(email)` |
| `POST` | `/api/create-checkout-session` | Creates Stripe checkout session via `stripe.js` |
| `POST` | `/api/generate-pdf` | Streams filled Anmeldung PDF document via `pdf_generator.js` |
| `GET` | `/api/status` | Returns bot status (`ACTIVE`), subscriber count, and last check timestamp |
| `GET` | `*` | Catch-all fallback serving `public/index.html` |

---

## 5. Module Capabilities & Existing Gap Analysis

### 5.1 Scraper Module (`scraper.js`)
- **Target URL**: `https://service.berlin.de/terminvereinbarung/termin/day/120686/`
- **Method**: Attempts Puppeteer Stealth first (`td.buchbar a`). If Puppeteer fails or isn't supported in environment, falls back to `axios.get` + `cheerio`.
- **Output**: `{ found: boolean, dates: string[], url: string }`.

### 5.2 Notification Modules
- **Email (`emailer.js`)**: `sendAlert(dates, bookingUrl, recipientEmails)`. Tries Resend API first (`RESEND_API_KEY`), falls back to Nodemailer (`EMAIL_USER`, `EMAIL_APP_PASSWORD`), or logs simulation.
- **Telegram (`telegram.js`)**: `sendTelegramAlert(chatId, appointments)`. Sends Markdown formatted alert via Telegram Bot API using `TELEGRAM_BOT_TOKEN`. Simulates if token is unconfigured.

### 5.3 Identified Code Gaps
1. **Telegram Notifications Not Integrated**: `termine_app.js` only calls `sendAlert()` (email). It does NOT call `sendTelegramAlert()`.
2. **Subscriber Data Schema**: `db.js` currently only accepts and stores `email`. It does not store `telegram` handles/chat IDs passed in `POST /api/subscribe` (`req.body.telegram`).
3. **Server Integration**: `server.js` does not launch background cron checking when starting (`node server.js`). Cron logic is currently isolated in `termine_app.js`.
4. **Missing Verification Script**: `test_scraper.js` requested in `ORIGINAL_REQUEST.md` is currently missing.

---

## 6. Integration Roadmap & Recommendations

To fulfill all requirements in `ORIGINAL_REQUEST.md`, the following changes are recommended for the implementation phase:

### Step 1: Enhance `db.js` to Store Telegram & Subscriber Data
- Update `addSubscriber(email, telegram)` in `db.js` to store subscriber objects `{ email, telegram, subscribedAt }`.
- Add `getSubscribers()` method returning full subscriber objects so both email and telegram notifications can be dispatched.

### Step 2: Integrate Telegram & Email in Notification Pipeline
- Update notification logic so that when new appointments are detected, both `sendAlert(dates, url, subscriberEmails)` and `sendTelegramAlert(chatId, appointments)` (for registered telegram subscribers or broadcast chat) are executed.

### Step 3: Integrate Background Cron Scheduler in `server.js`
- Import `node-cron`, `checkAppointments`, `sendAlert`, `sendTelegramAlert`, and `db` directly inside `server.js`.
- When `require.main === module` (i.e. running via `node server.js`), start the background cron job (or periodic interval) so that launching `node server.js` immediately activates both HTTP web server and appointment monitoring bot seamlessly.

### Step 4: Create `test_scraper.js`
- Create `test_scraper.js` at root level (`C:\Users\henry\Documents\antigravity\wise-bardeen\test_scraper.js`).
- Test script should:
  1. Trigger appointment checking simulation.
  2. Call `sendAlert` (Email) and `sendTelegramAlert` (Telegram).
  3. Verify execution without fatal errors.
  4. Print clear success confirmation for automated verification.
