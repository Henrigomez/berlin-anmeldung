# Project: Berlin Anmeldung Automation Platform

## Architecture
- CommonJS Node.js + Express web application (`server.js`)
- Background node-cron task running inside `server.js` (or imported helper) monitoring Bürgeramt availability
- Bürgeramt Scraper module (`scraper.js`): Axios/Cheerio primary with Puppeteer stealth fallback
- Notification Dispatchers:
  - `emailer.js`: Resend API -> Nodemailer SMTP -> Simulator fallback
  - `telegram.js`: Telegram Bot API -> Simulator fallback
- Database / Persistence (`db.js`):
  - Stores subscribers with `{ email, telegram, subscribedAt }`
  - Firebase Firestore with local `subscribers.json` / in-memory fallback
- Test Harness (`test_scraper.js`):
  - Zero external network dependency test runner verifying scraper simulation and alert triggering

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Bürgeramt Scraper | Scrape/request service.berlin.de slot availability (120686) using Axios/Cheerio with Puppeteer fallback | M1 | survey (explorer 2) |
| 2 | Subscriber Persistence & API | Save email and telegram contact data in db.js via POST /api/subscribe | M1 | survey (explorer 1) |
| 3 | Telegram Notification Engine | Format & send appointment alerts via Telegram Bot API with Markdown & simulator mode | M2 | survey (spec miner 3) |
| 4 | Email Notification Engine | Multi-tiered email dispatching (Resend, Nodemailer, Simulator) | M2 | survey (spec miner 3) |
| 5 | Background Cron & Server Wire-up | Wire cron polling loop into server.js / termine_app.js to trigger both email & telegram alerts | M1 | survey (explorer 1) |
| 6 | Test Simulation Harness | test_scraper.js script simulating slot detection and notification execution without external network | M3 | survey (spec miner 3) |
| 7 | Full E2E Integration & Verification | node server.js running smoothly without fatal errors; test_scraper.js exit 0 test pass | M3 | survey (spec miner 3) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Scraper & DB Integration | Refactor scraper.js (Axios primary), enhance db.js (telegram contact storage), wire cron loop into server.js | None | DONE |
| 2 | Dual Notification Pipeline | Enhance telegram.js appointment adapter & wire email/telegram alerts in notification loop | M1 | DONE |
| 3 | E2E Test Suite & Test Harness | Create test_scraper.js simulation harness & verify node server.js execution | M1, M2 | DONE |




## Interface Contracts
### scraper.js ↔ notification loop
- `checkAppointments()` returns `Promise<{ found: boolean, dates: string[], url: string, appointments?: Array<{date, time, location, link}> }>`

### db.js ↔ server.js / notification loop
- `addSubscriber(email, telegram)` -> `Promise<boolean>`
- `getSubscribers()` -> `Promise<Array<{ email: string, telegram?: string, subscribedAt: string }>>`

### emailer.js ↔ notification loop
- `sendAlert(dates, bookingUrl, recipientEmails)` -> `Promise<boolean>`

### telegram.js ↔ notification loop
- `sendTelegramAlert(chatId, appointments)` -> `Promise<{ success: boolean, simulated?: boolean, error?: string }>`

### test_scraper.js harness contract
- Invocation: `node test_scraper.js`
- Behavior: Mocks appointment discovery, executes emailer and telegram notification functions, exits with code 0 on success, 1 on failure.

## Code Layout
- Root directory `C:\Users\henry\Documents\antigravity\wise-bardeen\`
- `server.js`: Main Express web server & cron job initialization
- `scraper.js`: Bürgeramt scraping module
- `emailer.js`: Email alert module
- `telegram.js`: Telegram alert module
- `db.js`: Subscriber database module
- `test_scraper.js`: Offline simulation test script
- `subscribers.json`: Local JSON fallback data store
