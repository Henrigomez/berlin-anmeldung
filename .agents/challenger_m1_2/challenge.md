# Milestone 1 Empirical Challenge Report: Server Startup & Cron Initialization

**Target**: `server.js` & `termine_app.js` (Milestone 1)  
**Evaluator**: `teamwork_preview_challenger` (Milestone 1 Challenger 2)  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Executive Summary

Empirical analysis and static logic tracing were conducted on `server.js`, `termine_app.js`, `scraper.js`, and `db.js` for Milestone 1.

While the primary startup sequence (`node server.js`), Express middleware initialization, HTTP routing (`GET /api/status`), and cron expression parsing (`*/5 * * * *`) are valid and functional under nominal conditions, **two critical error-handling risks** were identified that could result in **Unhandled Promise Rejections** or process termination under non-nominal conditions.

---

## 2. Findings & Challenges

### [HIGH] Challenge 1: Unhandled Promise Rejections in `startMonitoring()` Async Invocations

- **File**: `termine_app.js`, Lines 55–59
- **Code Snippet**:
  ```javascript
  function startMonitoring() {
      console.log('🚀 Berlin Anmeldung Alert Bot v2.0 is active!');
      console.log('📅 Monitoring Bürgeramt calendars every 5 minutes...');
      
      cron.schedule('*/5 * * * *', () => {
          runCheck();
      });

      runCheck();
  }
  ```
- **Assumption Challenged**: Assumes `runCheck()` will never throw an unhandled exception or return a rejected Promise during cron execution or initial startup.
- **Failure Scenario**: `runCheck()` is an `async` function and returns a Promise. If any unhandled exception occurs inside `runCheck()` (e.g. database read errors, schema mismatches, or unexpected notification errors), the returned Promise is rejected. Because neither `cron.schedule` nor the initial call in `startMonitoring()` attaches a `.catch()` handler or wraps the call, Node.js triggers an `UnhandledPromiseRejection`. In modern Node.js runtimes (v15+), unhandled promise rejections crash the Node server process.
- **Blast Radius**: High. An unexpected runtime error in a background monitoring cycle can crash the entire Express server process.
- **Mitigation**:
  Attach explicit `.catch()` handlers to all async invocations of `runCheck()`:
  ```javascript
  cron.schedule('*/5 * * * *', () => {
      runCheck().catch(err => console.error('[Monitoring Cron Error]:', err));
  });

  runCheck().catch(err => console.error('[Startup Check Error]:', err));
  ```

---

### [MEDIUM] Challenge 2: Lack of Array Type Verification in `db.getLocalSubscribers()`

- **File**: `db.js`, Lines 47–57
- **Code Snippet**:
  ```javascript
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
  ```
- **Assumption Challenged**: Assumes `subscribers.json` always contains a valid JSON Array.
- **Failure Scenario**: If `subscribers.json` is modified or initialized to a non-array JSON structure (e.g., `{}` or `null`), `JSON.parse(data)` succeeds without throwing an exception in `getLocalSubscribers()`. However, subsequent operations in `getSubscribers()` (e.g. `localList.map(...)`) or `addSubscriber()` (e.g. `localList.findIndex(...)`) will throw `TypeError: localList.map is not a function` or `TypeError: Cannot read properties of null`. This error bypasses `getLocalSubscribers()`'s internal try/catch block and propagates directly into `runCheck()`.
- **Blast Radius**: Medium. Corrupted local JSON storage crashes database queries and background monitoring tasks.
- **Mitigation**:
  Validate that `JSON.parse(data)` yields an array before returning:
  ```javascript
  const parsed = JSON.parse(data);
  return Array.isArray(parsed) ? parsed.filter(Boolean) : memorySubscribers;
  ```

---

## 3. Verified Verification Items

| Verification Item | Status | Notes |
|---|---|---|
| `GET /api/status` Endpoint | **PASS** | Returns HTTP 200 with `{ success: true, status: "ACTIVE", activeSubscribers: ..., lastCheck: ..., monitoredDistricts: [...] }`. |
| Express Server Wiring | **PASS** | `server.js` correctly wires `startMonitoring()` inside `app.listen()` when run directly (`require.main === module`). |
| Cron Schedule Expression | **PASS** | `cron.schedule('*/5 * * * *', ...)` utilizes valid 5-field node-cron syntax. |
| Scraper Fallback Safety | **PASS** | `scraper.js` catches both Axios GET errors and inner Puppeteer Stealth errors, returning structured fallback objects without throwing. |
| Async Promise Rejection Safety | **FAIL** | Unhandled Promises in `startMonitoring()` when `runCheck()` rejects. Requires `.catch()` handlers. |
| Local DB Resilience | **WARN** | `getLocalSubscribers()` lacks strict `Array.isArray()` and `.filter(Boolean)` guards. |

---

## 4. Conclusion & Required Actions

To obtain full approval for Milestone 1:
1. Update `termine_app.js` to handle rejected Promises in `startMonitoring()` using `.catch(err => ...)`.
2. Strengthen `db.js` `getLocalSubscribers()` to guarantee returning an array (`Array.isArray(parsed)` check).
