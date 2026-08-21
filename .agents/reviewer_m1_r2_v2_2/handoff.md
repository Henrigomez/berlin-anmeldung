# Handoff & Review Report — Milestone 1 Round 2 Robustness Review (Reviewer 2)

**Reviewer**: `reviewer_m1_r2_v2_2`  
**Date**: 2026-08-10  
**Target Files**: `termine_app.js`, `db.js`, `scraper.js`  
**Verdict**: **APPROVE**

---

## Review Summary

The Round 2 changes submitted in `worker_m1_r2/changes.md` successfully and completely address the previous concerns regarding:
1. **Unhandled promise rejections during cron execution** in `termine_app.js`.
2. **Corrupted subscriber JSON handling** (non-array JSON objects) in `db.js`.

No integrity violations, hardcoded test shortcuts, or unhandled rejection paths were found. Code quality, interface contract compliance, and error handling meet the project standards. A minor recommendation regarding Puppeteer browser process cleanup in `scraper.js` under timeout conditions is noted below for future maintenance.

---

## 1. Observation

### Observation 1: Promise Rejection Handling in `termine_app.js`
In `termine_app.js` (lines 51–60):
```javascript
function startMonitoring() {
    console.log('🚀 Berlin Anmeldung Alert Bot v2.0 is active!');
    console.log('📅 Monitoring Bürgeramt calendars every 5 minutes...');
    
    cron.schedule('*/5 * * * *', () => {
        runCheck().catch(err => console.error('[Cron Error] Execution failed:', err));
    });

    runCheck().catch(err => console.error('[Cron Error] Execution failed:', err));
}
```
Both invocations of `runCheck()` (the recurring `cron.schedule` callback and the immediate startup call) attach `.catch(err => console.error('[Cron Error] Execution failed:', err))`.

### Observation 2: Array Validation in `db.js`
In `db.js` (lines 47–58):
```javascript
function getLocalSubscribers() {
    try {
        if (fs.existsSync(SUBSCRIBERS_FILE)) {
            const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        // Fallback to memory
    }
    return memorySubscribers;
}
```
`JSON.parse(data)` output is stored in `parsed` and validated with `Array.isArray(parsed) ? parsed : []`.

### Observation 3: Puppeteer Process Management in `scraper.js`
In `scraper.js` (lines 56–79):
```javascript
try {
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 ...');

    await page.goto(ANMELDUNG_URL, { waitUntil: 'networkidle2', timeout: 25000 });
    const html = await page.content();
    await browser.close();

    const { dates, appointments } = parseAppointments(html);
    return { found: dates.length > 0, dates, appointments, url: ANMELDUNG_URL };
} catch (puppeteerErr) {
    console.error('[Scraper Error]: Failed to fetch appointments via Puppeteer fallback.', puppeteerErr.message);
    return { found: false, dates: [], appointments: [], url: ANMELDUNG_URL };
}
```
If `page.goto()` times out or throws an error, execution jumps directly to `catch (puppeteerErr)`, bypassing `await browser.close()`.

---

## 2. Logic Chain

1. **Unhandled Promise Rejections in `termine_app.js`**:
   - `runCheck()` is an `async` function, which inherently returns a JavaScript Promise.
   - If an uncaught error occurs inside `runCheck()` (e.g. database read failure, scraper failure, network timeout), the returned Promise rejects.
   - By appending `.catch(err => console.error('[Cron Error] Execution failed:', err))` to both `runCheck()` calls in `startMonitoring()`, any rejected Promise is intercepted by the `.catch` handler and logged to stderr.
   - Therefore, unhandled promise rejections are completely prevented during both scheduled cron cycles and application boot.

2. **Corrupted / Non-Array JSON Handling in `db.js`**:
   - When `subscribers.json` exists on disk containing valid JSON that is not an Array (e.g., `{}` or `null` or `123`), `JSON.parse(data)` succeeds without throwing a `SyntaxError`.
   - Before Round 2, `getLocalSubscribers()` would return `{}` or `null`. Subsequent callers like `getSubscribers()` invoked `localList.map(...)`, causing `TypeError: localList.map is not a function`.
   - In Round 2, `Array.isArray(parsed) ? parsed : []` ensures `getLocalSubscribers()` returns `[]` whenever `parsed` is not an Array.
   - If `subscribers.json` contains malformed JSON syntax, `JSON.parse(data)` throws an error caught by `catch (e)`, which returns `memorySubscribers` (`[]`).
   - Therefore, `getLocalSubscribers()` strictly guarantees an Array return value under all disk storage conditions.

3. **Scraper & Cron Resiliency**:
   - Axios primary scraper handles timeouts (10s) and network errors cleanly, falling back to Puppeteer Stealth.
   - Deduplication via `lastAlertedDates` in `termine_app.js` prevents alert spamming when slots remain open across consecutive 5-minute cycles.

---

## 3. Caveats

- **Puppeteer Browser Process Cleanup**: If Axios fails and Puppeteer secondary fallback times out on `page.goto`, the Chromium process instance launched by `puppeteer.launch()` is not cleaned up because `browser.close()` is placed after `goto` inside the `try` block. Placing `browser.close()` in a `finally` block is recommended for continuous server operations.
- **Single-threaded File Locking**: `db.js` relies on `fs.readFileSync` and `fs.writeFileSync` for local fallback persistence. In standard single-process deployment, this is safe; under concurrent multi-process file writes, Firestore (`useFirebase`) or file locks prevent write tearing.

---

## 4. Conclusion

The fixes applied in Round 2 completely resolve the unhandled promise rejection issue in `termine_app.js` and the corrupted subscriber JSON bug in `db.js`. All acceptance criteria and interface contracts in `PROJECT.md` are fulfilled.

**Final Verdict**: **APPROVE**

---

## 5. Verification Method

1. **Unhandled Rejection Verification**:
   - Inspect `termine_app.js` lines 55–59. Verify `.catch()` handlers are attached to both `runCheck()` calls.
   - Test by throwing a synthetic error inside `runCheck()`: observe console output shows `[Cron Error] Execution failed:` and process does not terminate with `UnhandledPromiseRejection`.

2. **Corrupted JSON Verification**:
   - Create `subscribers.json` with contents `{}` or `null` or `{ "invalid": "structure" }`.
   - Call `db.getSubscribers()`: verify it returns an empty array `[]` without throwing `TypeError: localList.map is not a function`.
   - Call `db.addSubscriber("test@example.com", "chat123")`: verify `subscribers.json` is updated to a valid JSON array `[{ "email": "test@example.com", ... }]`.

3. **Scraper Contract Verification**:
   - Inspect `scraper.js`: verify `checkAppointments()` returns `{ found: boolean, dates: string[], appointments: Array, url: string }`.

---

## Findings & Recommendations

### [Minor] Resource Cleanup in `scraper.js` (Puppeteer Fallback)
- **Where**: `scraper.js`, lines 61–70
- **Problem**: If `page.goto()` throws a timeout exception, `browser.close()` is not reached, leaving an orphaned Chromium process in memory.
- **Suggestion**: Wrap Puppeteer browser lifecycle in `try...finally`:
  ```javascript
  let browser = null;
  try {
      browser = await puppeteer.launch(...);
      // ... navigate & extract content ...
  } finally {
      if (browser) await browser.close();
  }
  ```

---

## Verified Claims Matrix

| Claim | Verification Method | Result |
|---|---|---|
| Cron unhandled promise rejections prevented | Code inspection of `termine_app.js` lines 55–59 | PASS |
| Non-array corrupted JSON in `subscribers.json` handled safely | Code inspection of `db.js` lines 51–53 | PASS |
| Interface contracts in `PROJECT.md` satisfied | Signature & return type inspection across `scraper.js`, `db.js`, `termine_app.js` | PASS |
| Integrity violations (hardcoded test results / facades) | Full codebase grep & static review | NONE DETECTED |

---

## Adversarial Challenge Summary

- **Attack Scenario 1 (Corrupted `subscribers.json` containing `{}` or `null`)**:
  - *Result*: Handled by `Array.isArray(parsed) ? parsed : []`. Returns `[]`, prevents `TypeError`. **PASS**
- **Attack Scenario 2 (Scraper network drop / timeout)**:
  - *Result*: Axios primary catches error, logs warning, attempts Puppeteer. If Puppeteer also fails, returns `{ found: false, dates: [], appointments: [], url: ANMELDUNG_URL }`. **PASS**
- **Attack Scenario 3 (Uncaught exception in `runCheck`)**:
  - *Result*: Intercepted by `.catch(err => console.error('[Cron Error] Execution failed:', err))`. Process remains healthy. **PASS**
