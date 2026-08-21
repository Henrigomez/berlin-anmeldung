# Changes Report — Milestone 1 Round 2

## Files Modified

### 1. `termine_app.js`
- **Location**: `startMonitoring()` function (lines 51–60)
- **Change**: Attached `.catch(err => console.error('[Cron Error] Execution failed:', err))` to both invocations of `runCheck()` (inside `cron.schedule('*/5 * * * *', ...)` and the initial startup call).
- **Rationale**: `runCheck()` is an `async` function returning a Promise. Without a `.catch()` handler, any rejected promise during scheduled execution or application startup would result in an `UnhandledPromiseRejection`, potentially crashing the process or leaking unhandled errors. Adding `.catch()` ensures all promise rejections are logged gracefully with the tag `[Cron Error] Execution failed:`.

### 2. `db.js`
- **Location**: `getLocalSubscribers()` function (lines 47–58)
- **Change**: Stored `JSON.parse(data)` into variable `const parsed` and checked `Array.isArray(parsed) ? parsed : []` before returning.
- **Rationale**: If `subscribers.json` exists on disk containing valid JSON that is not an Array (e.g. `{}` or `null`), `JSON.parse(data)` would return a non-array object without throwing a syntax error. Callers expecting an array (such as `getSubscribers()`) would subsequently fail with a `TypeError` when calling array methods like `.map()`. Validating `Array.isArray(parsed)` guarantees that `getLocalSubscribers()` returns an Array in all code paths.
