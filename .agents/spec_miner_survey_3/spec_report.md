# Specification Mining Report: Notification Services & Test Simulation Harness

**Agent**: `teamwork_preview_spec_miner` (Spec Miner 3)  
**Date**: 2026-08-10  
**Target Repository**: `C:\Users\henry\Documents\antigravity\wise-bardeen`  
**Original Request Document**: `ORIGINAL_REQUEST.md`

---

## Executive Summary

This specification report documents the complete interface contracts, configuration requirements, data formats, fallback mechanics, and test harness specifications for:
1. **Email Notifications Service** (`emailer.js`)
2. **Telegram Notifications Service** (`telegram.js`)
3. **Test Simulation Harness** (`test_scraper.js`)

---

## 1. Email Notifications Specification (`emailer.js`)

### 1.1 Overview & Architecture
`emailer.js` provides an alert dispatching engine that formats and sends Bürgeramt appointment alerts to registered subscribers. It uses a **three-tiered dispatch strategy**:
1. **Tier 1 (Resend API)**: Direct HTTP REST dispatch via the official `resend` SDK.
2. **Tier 2 (Nodemailer SMTP)**: Fallback transport using Nodemailer SMTP (supporting Outlook, Hotmail, Gmail, etc.) using `bcc` blind carbon copy for subscriber privacy.
3. **Tier 3 (Simulator Mode)**: Local mock simulation mode when no external credentials/API keys are provided.

### 1.2 Configuration & Environment Variables
| Variable Name | Required / Optional | Description |
|---------------|---------------------|-------------|
| `RESEND_API_KEY` | Optional (Tier 1) | API key for Resend service. If provided, Resend API client is instantiated. |
| `EMAIL_USER` | Optional (Tier 2) | Sender email address (e.g. Gmail / Outlook / Hotmail address). |
| `EMAIL_APP_PASSWORD` / `EMAIL_PASS` | Optional (Tier 2) | App-specific password or account password for SMTP authentication. |

### 1.3 Interface Contract
- **Exported Function**: `sendAlert(dates, bookingUrl, recipientEmails = [])`
  - **Inputs**:
    - `dates` (`Array<string>`): List of available appointment dates (e.g. `['2026-08-15', '2026-08-18']`).
    - `bookingUrl` (`string`): Direct URL to the appointment booking calendar on `service.berlin.de`.
    - `recipientEmails` (`Array<string>`): List of subscriber email addresses to receive the alert.
  - **Returns**: `Promise<boolean>` — Resolves to `true` if email dispatch succeeds or simulation completes; returns `false` if `recipientEmails` is empty or SMTP transport fails.

### 1.4 HTML Email Template Specification
- **Theme**: Dark glassmorphic design (`#090d16` background, `#0f172a` card container).
- **Header**: Gradient top accent bar (`#38bdf8`, `#818cf8`, `#fbbf24`), `BERLINANMELDUNG.COM` title, `⚡ PRIORITY ALERT` badge.
- **Body**: Title `"¡Nuevas Citas de Bürgeramt Disponibles en Berlín!"`.
- **Slot List**: Grid of green styled date cards (`#34d399` text, `#10b981` `DISPONIBLE` badge).
- **CTA Button**: High-visibility gradient CTA button (`👉 Reservar Cita Ahora en Berlin.de ⚡`) pointing directly to `bookingUrl`.
- **Founder's Advice**: Callout box warning that Berlin appointments disappear in <90 seconds.
- **Signature**: Executive signature block for CEO Henri Gomez Amsatu.
- **Footer**: Copyright note and legal links (`Datenschutz`, `Impressum`).

---

## 2. Telegram Notifications Specification (`telegram.js`)

### 2.1 Overview & Architecture
`telegram.js` provides instant alert notifications to Telegram users or channels via the Telegram Bot API (`sendMessage` endpoint). It includes an automatic fallback to **Simulator Mode** when bot tokens are missing or unconfigured.

### 2.2 Configuration & Environment Variables
| Variable Name | Required / Optional | Description |
|---------------|---------------------|-------------|
| `TELEGRAM_BOT_TOKEN` | Required for Live Mode | Telegram Bot API token obtained from `@BotFather`. |

### 2.3 Interface Contract
- **Exported Function**: `sendTelegramAlert(chatId, appointments)`
  - **Inputs**:
    - `chatId` (`string | number`): Target Telegram chat ID or handle.
    - `appointments` (`Array<Object>`): Array of appointment objects containing `{ date, time, location, link }`.
  - **Returns**: `Promise<{ success: boolean, simulated?: boolean, error?: string }>`
    - `{ success: true }` on live API dispatch success.
    - `{ success: true, simulated: true }` when running in Simulator Mode.
    - `{ success: false, error: string }` on failure.

### 2.4 Message Formatting Specification
- **Parse Mode**: `Markdown`
- **Link Preview**: Enabled (`disable_web_page_preview: false`)
- **Template**:
```markdown
🚨 *BERLIN ANMELDUNG TERMIN GEFUNDEN!* 🚨

Es wurden soeben *<count> freie Termine* im Bürgeramt gefunden:

📅 *<date>* um *<time>*
📍 Ort: <location | Bürgeramt Berlin>
🔗 [Hier Buchungsseite öffnen](<link>)

⚡ _Schnell buchen! Die Termine sind in ca. 60 Sekunden ausgebucht._
```

### 2.5 Noted Gaps & Integration Requirements
- **Data Model Mismatch**: `scraper.js` currently returns dates as simple string arrays (e.g. `['2026-08-15']`), whereas `telegram.js` expects objects with `.date`, `.time`, `.location`, and `.link`. Notification orchestrators must map simple date strings into structured appointment objects.
- **Cron Integration**: `termine_app.js` currently only calls `sendAlert()` (email). The bot worker must be updated to also call `sendTelegramAlert()`.
- **Subscriber Persistence**: `db.js` currently stores email addresses. Support should be added for Telegram subscriber IDs or unified user subscriber objects.

---

## 3. Test Simulation Harness Specification (`test_scraper.js`)

### 3.1 Overview & Acceptance Criteria
Per **R3** and Acceptance Criteria in `ORIGINAL_REQUEST.md`, a test simulation harness (`test_scraper.js`) must be provided to verify the end-to-end alert pipeline without relying on external live websites during test execution.

### 3.2 Key Requirements for `test_scraper.js`
1. **Zero External Network Dependencies**: Must NOT make live HTTP/Puppeteer calls to `service.berlin.de` during test execution.
2. **Deterministic Execution**: Must work out of the box when invoked via `node test_scraper.js`.
3. **Notification Pipeline Verification**:
   - Must simulate finding open appointment slot(s).
   - Must trigger `sendAlert()` from `emailer.js`.
   - Must trigger `sendTelegramAlert()` from `telegram.js`.
   - Must verify both functions execute successfully (either live or in simulator mode).
4. **Exit Codes & Logging**:
   - Print clear, readable console logs indicating mock appointment generation, email alert execution status, and Telegram alert execution status.
   - Return process exit code `0` on successful completion.
   - Return process exit code `1` on assertion or execution failure.

### 3.3 Recommended Harness Test Flow
```
[Start test_scraper.js]
       │
       ▼
[1. Generate Mock Appointments Data] 
 (Dates: ['15.08.2026', '18.08.2026'], URL: 'https://service.berlin.de/...')
       │
       ▼
[2. Prepare Mock Test Subscribers]
 (Email: 'test-subscriber@example.com', ChatID: '123456789')
       │
       ▼
[3. Invoke emailer.sendAlert()] ────► Assert return value === true
       │
       ▼
[4. Invoke telegram.sendTelegramAlert()] ────► Assert return object.success === true
       │
       ▼
[5. Print Test Summary Log & Process Exit 0]
```

---

## 4. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Email Notification | Resend API Transporter | Primary email dispatch via Resend HTTP API | `dates` (Array<string>), `bookingUrl` (string), `recipientEmails` (Array<string>) | `Promise<boolean>` (true on success) | Catches error, logs `[Resend Error]`, falls back to Nodemailer | `emailer.js` lines 136-150 |
| 2 | Email Notification | Nodemailer SMTP Transporter | Secondary fallback email dispatch via Nodemailer SMTP (Gmail/Outlook/Hotmail) | `dates`, `bookingUrl`, `recipientEmails`, `process.env.EMAIL_USER`, `process.env.EMAIL_APP_PASSWORD` | `Promise<boolean>` (true on success) | Catches error, logs `[Nodemailer Error]`, falls back to Simulator | `emailer.js` lines 152-174 |
| 3 | Email Notification | Email Simulator Mode | Fallback mode when no email API keys or credentials are provided | `dates`, `bookingUrl`, `recipientEmails` | `Promise<boolean>` (true) | None (logs simulated output) | `emailer.js` lines 176-177 |
| 4 | Email Notification | HTML Email Template | Styled HTML email template with logo, slot badges, booking button, advice, signature | `dates`, `bookingUrl` | Formatted HTML string | N/A | `emailer.js` lines 20-134 |
| 5 | Telegram Notification | Telegram Bot API Transporter | Dispatch Markdown alert via Telegram Bot API `sendMessage` endpoint | `chatId` (string\|number), `appointments` (Array<Object>) | `Promise<{success: boolean}>` | Catches HTTP error, returns `{success: false, error}` | `telegram.js` lines 24-37 |
| 6 | Telegram Notification | Telegram Simulator Mode | Fallback mode when `TELEGRAM_BOT_TOKEN` is missing or placeholder | `chatId`, `appointments` | `Promise<{success: true, simulated: true}>` | None (logs simulated message) | `telegram.js` lines 19-22 |
| 7 | Telegram Notification | Markdown Message Formatting | Formats appointment array into rich Markdown text with dates, times, locations, direct links | `appointments` | Markdown formatted text string | N/A | `telegram.js` lines 14-18 |
| 8 | Test Simulation Harness | `test_scraper.js` Acceptance Test | Automated test script to simulate appointment discovery and verify notification triggers | Command line invocation (`node test_scraper.js`) | Console output & process exit code (0 or 1) | Throws error or exits with code 1 on failed assertion | `ORIGINAL_REQUEST.md` R3/Verification & codebase analysis |
| 9 | Subscriber Persistence | Local & Firebase Subscriber DB | Manages subscriber list in local JSON / memory or Firebase Firestore | `email` (string) | `Promise<Array<string>>` for get, `Promise<boolean>` for add | Falls back to local/memory storage if Firebase fails | `db.js` lines 1-113 |
| 10 | Subscriber API Endpoint | `/api/subscribe` Route | Express API endpoint to register email and telegram notifications | HTTP POST `{ email, telegram }` | JSON response `{ success: true, message }` | 400 Bad Request for missing/invalid input, 500 on server error | `server.js` lines 183-206 |
| 11 | Bot Scheduler Engine | `termine_app.js` Cron Worker | Periodic worker running every 5 min to check scraper and dispatch alerts | `node-cron` schedule (`*/5 * * * *`) | Console logs, calls `sendAlert()` | Suppresses duplicate alerts if dates match previous check | `termine_app.js` lines 1-48 |

---

## 5. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Email Notification | Empty `recipientEmails` array `[]` | `sendAlert` logs `[Emailer] No recipients specified.` and immediately returns `false`. |
| 2 | Email Notification | Missing `RESEND_API_KEY` and missing `EMAIL_USER`/`EMAIL_APP_PASSWORD` | Logs simulation warning `[Emailer Simulator] Would send luxury email alert...` and returns `true`. |
| 3 | Email Notification | Resend API failure (e.g. rate limit / network error) | Logs `[Resend Error]` message, gracefully falls through to Nodemailer fallback or simulator. |
| 4 | Telegram Notification | Missing `TELEGRAM_BOT_TOKEN` or set to default `'YOUR_TELEGRAM...'` | Bypasses HTTP POST, logs `[TELEGRAM SIMULATOR]` alert content, returns `{ success: true, simulated: true }`. |
| 5 | Telegram Notification | Invalid `chatId` or Bot API network error | Catches error from Axios POST, logs `[TELEGRAM ERROR]`, returns `{ success: false, error: error.message }`. |
| 6 | Telegram Notification | `appointments` array in `telegram.js` vs `dates` array in `scraper.js` data format mismatch | `telegram.js` expects objects `{ date, time, location, link }`, whereas `scraper.js` returns simple date string array `['...']`. If passed strings without `date`/`time` properties, message renders `undefined` in template unless mapped/handled. |
| 7 | Scraper / Notification Loop | Duplicate appointment detection in `termine_app.js` | Checks `currentDatesString !== lastAlertedDates`. If identical, suppresses notification dispatch (`⏭️ Dates are identical to previous check. Suppressing duplicate alert.`). |
| 8 | Test Simulation Harness (`test_scraper.js`) | Execution without live internet connection or external API credentials | Harness must run in simulator mode using mock appointments & subscribers, ensuring 0 external network dependencies and returning exit code 0. |

---

## 6. Recommendations for Implementers

1. **Implement `test_scraper.js`**: Create `test_scraper.js` in the project root meeting all specifications in Section 3.
2. **Unify Notification Dispatcher**: Wire `sendTelegramAlert` into `termine_app.js` alongside `sendAlert` (email).
3. **Data Transformation Adapter**: Create a mapper function that transforms string dates from `checkAppointments()` (e.g. `['2026-08-15']`) into formatted objects suitable for `sendTelegramAlert()` (e.g. `[{ date: '15.08.2026', time: '10:00 (Ganztägig)', location: 'Bürgeramt Berlin', link: result.url }]`).
4. **Telegram Subscriber Storage**: Extend `db.js` to store and retrieve Telegram chat IDs or user contact profiles so Telegram notifications reach subscribed users.
