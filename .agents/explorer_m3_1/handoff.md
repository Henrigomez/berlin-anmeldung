# Milestone 3 Handoff & Implementation Report: E2E Test Suite & Test Harness Explorer

**Agent**: `explorer_m3_1`  
**Milestone**: Milestone 3 (E2E Test Suite & Test Harness)  
**Target File to Create**: `C:\Users\henry\Documents\antigravity\wise-bardeen\test_scraper.js`  
**Target File to Verify**: `C:\Users\henry\Documents\antigravity\wise-bardeen\server.js`  
**Date**: 2026-08-10  

---

## 1. Observation

### 1.1 Project & Request Specification Analysis
- **ORIGINAL_REQUEST.md**:
  - Line 24: `node server.js` must start application without any fatal errors or missing dependencies.
  - Line 27: `test_scraper.js` must exist and successfully simulate finding an appointment and correctly trigger notification logic.
- **PROJECT.md**:
  - Feature 6: Test Simulation Harness (`test_scraper.js` simulating slot detection and notification execution without external network).
  - Feature 7: Full E2E Integration & Verification (`node server.js` running smoothly; `test_scraper.js` exit 0 test pass).
  - Harness Contract: Invocation `node test_scraper.js`. Mocks appointment discovery, executes emailer and telegram notification functions, exits with code `0` on success, `1` on failure.

### 1.2 Existing Core Modules Inventory
1. **`scraper.js`** (`C:\Users\henry\Documents\antigravity\wise-bardeen\scraper.js`):
   - Uses `cheerio` and `axios` with `puppeteer-extra-plugin-stealth` fallback.
   - Internal helper `parseAppointments(html)` extracts `<td class="buchbar"><a>` elements.
   - `checkAppointments()` performs HTTP GET to `https://service.berlin.de/terminvereinbarung/termin/day/120686/`.
2. **`emailer.js`** (`C:\Users\henry\Documents\antigravity\wise-bardeen\emailer.js`):
   - Priority 1: Resend API (if `RESEND_API_KEY` present).
   - Priority 2: Nodemailer SMTP (if `EMAIL_USER` & `EMAIL_APP_PASSWORD` present).
   - Priority 3: Simulator mode fallback (`console.warn('[Emailer Simulator] Would send luxury email alert to:', recipientEmails)` returning `true`).
3. **`telegram.js`** (`C:\Users\henry\Documents\antigravity\wise-bardeen\telegram.js`):
   - Priority 1: Telegram Bot API POST to `api.telegram.org/bot<TOKEN>/sendMessage`.
   - Priority 2: Simulator mode fallback (if token missing or placeholder) printing `[TELEGRAM SIMULATOR]` and returning `{ success: true, simulated: true }`.
4. **`db.js`** (`C:\Users\henry\Documents\antigravity\wise-bardeen\db.js`):
   - Firebase Firestore with fallback to local `subscribers.json` and in-memory fallback array `memorySubscribers`.
   - Exports `addSubscriber(email, telegram)`, `getSubscribers()`, `getSubscriberEmails()`.
5. **`termine_app.js`** (`C:\Users\henry\Documents\antigravity\wise-bardeen\termine_app.js`):
   - Orchestrates `runCheck()` and `startMonitoring()`.
   - Reads subscribers via `db.getSubscribers()`, runs `scraper.checkAppointments()`.
   - Dispatches email alerts via `emailer.sendAlert()` and Telegram alerts via `telegram.sendTelegramAlert()`.
   - Deduplicates alerts via `lastAlertedDates`.
6. **`server.js`** (`C:\Users\henry\Documents\antigravity\wise-bardeen\server.js`):
   - Express server providing REST API endpoints (`/api/weather`, `/api/events`, `/api/subscribe`, `/api/create-checkout-session`, `/api/generate-pdf`, `/api/news`, `/api/status`).
   - Exports Express `app` (`module.exports = app;`).
   - Launches server listening and calls `startMonitoring()` when executed as main module (`if (require.main === module)`).
7. **Missing Component**:
   - `test_scraper.js` does NOT exist in root directory yet. It must be created by Worker (Milestone 3).

---

## 2. Logic Chain

1. **Requirement Mapping**:
   - The system requires a zero-dependency offline E2E simulation script named `test_scraper.js` in the project root.
   - The test script must execute without live internet access, verifying that when appointments are discovered, both Email and Telegram dispatches are triggered and fall back cleanly to simulator modes.
   - The test script must return process exit code `0` on success, or `1` on failure.

2. **Simulator Fallback Mechanics**:
   - When running offline without credentials (`RESEND_API_KEY` and `TELEGRAM_BOT_TOKEN` unset), `emailer.sendAlert` and `telegram.sendTelegramAlert` naturally activate their built-in simulator modes.
   - By seeding subscriber records with both `email` and `telegram` fields (e.g. `{ email: 'm3test@example.com', telegram: '123456789' }`), calling `termineApp.runCheck()` triggers both dispatch paths concurrently and deterministically.

3. **`server.js` Health & Integrity**:
   - `server.js` imports all dependencies (`express`, `cors`, `dotenv`, `axios`, `./db`, `./pdf_generator`, `./stripe`, `./termine_app`).
   - `package.json` contains all required packages (`express`, `cors`, `dotenv`, `axios`, `firebase-admin`, `nodemailer`, `resend`, `stripe`, `pdfkit`, `jimp`, `cheerio`, `puppeteer`, `node-cron`).
   - Loading `server.js` programmatically verifies module syntax, dependency resolution, and route definitions.

---

## 3. Caveats

- **Live Bürgeramt Scraping**: Real live scraping of `service.berlin.de` depends on external government server availability and network connectivity. The harness MUST mock `scraper.checkAppointments` or test offline HTML string parsing to guarantee deterministic, zero-network execution in CI/CD environments.
- **FS Permissions**: `db.js` handles read-only filesystems by falling back to `memorySubscribers`. The test harness should clean up any test subscribers or mock `db.getSubscribers` to avoid polluting `subscribers.json`.
- **Process Exit Handling**: `test_scraper.js` must explicitly invoke `process.exit(0)` or `process.exit(1)` after printing test results, as asynchronous handles (like timers or DB connections) could otherwise keep the Node process running indefinitely.

---

## 4. Conclusion

Milestone 3 implementation requires creating `C:\Users\henry\Documents\antigravity\wise-bardeen\test_scraper.js` to serve as the official E2E test harness. The harness must execute 5 test suites covering:
1. Offline HTML parser validation.
2. Subscriber persistence (DB module).
3. End-to-end appointment discovery and dual notification dispatch (`runCheck` integration).
4. Email and Telegram simulator fallback validation.
5. `server.js` Express app loading and route registration sanity check.

When all 5 suites pass, `test_scraper.js` will output a clear summary and exit with code `0`. If any assertion fails, it will output the error and exit with code `1`.

---

## 5. Implementation Strategy & Verification Plan for Worker (Milestone 3)

### Step 1: Create `test_scraper.js` in Root Directory
Worker should write `C:\Users\henry\Documents\antigravity\wise-bardeen\test_scraper.js` containing:
- Module imports (`assert`, `./scraper`, `./emailer`, `./telegram`, `./db`, `./termine_app`, `./server`).
- Mock state handlers (`restoreMocks()`) to ensure isolation between tests.
- **Suite 1: Scraper Parsing Check**:
  - Pass synthetic HTML with `<td class="buchbar"><a title="15.09.2026" href="/terminvereinbarung/termin/day/120686/2026-09-15/">15.09.2026</a></td>`.
  - Assert parsed dates array contains `'15.09.2026'`.
- **Suite 2: DB Subscriber Operations**:
  - Call `addSubscriber('test-m3@example.com', '987654321')`.
  - Call `getSubscribers()` and verify the record is present.
- **Suite 3: E2E Dual Dispatch Simulation**:
  - Mock `db.getSubscribers` to return `[{ email: 'e2e@test.com', telegram: '5551234' }]`.
  - Mock `scraper.checkAppointments` to return `{ found: true, dates: ['2026-10-01'], url: 'https://service.berlin.de/...' }`.
  - Track calls to `emailer.sendAlert` and `telegram.sendTelegramAlert`.
  - Execute `termineApp.runCheck()`.
  - Assert both `emailer.sendAlert` and `telegram.sendTelegramAlert` were invoked with correct parameters.
- **Suite 4: Simulator Fallbacks**:
  - Test real `sendAlert` and `sendTelegramAlert` with empty API credentials to verify clean simulator return (`true` / `{ success: true, simulated: true }`).
- **Suite 5: Server.js Module Verification**:
  - Require `./server` and verify `app` is defined and has Express routes configured (`app._router.stack`).
- **Exit Code Dispatch**:
  - If `failCount === 0`, print pass banner and call `process.exit(0)`.
  - If `failCount > 0`, print error summary and call `process.exit(1)`.

### Step 2: Verification Steps
1. Run `node test_scraper.js` in terminal.
2. Confirm output reports 5/5 PASSED with zero failures.
3. Confirm process exits with code 0 (`echo $?` or process exit code check).
4. Run `node server.js` startup test to verify server initializes smoothly.
