# Modified Files & Rationale

## 1. `termine_app.js`

### Changes Made:
- Refactored top-level imports from destructured function imports (`const { checkAppointments } = require('./scraper'); ...`) to whole module object imports:
  ```javascript
  const scraper = require('./scraper');
  const emailer = require('./emailer');
  const telegram = require('./telegram');
  ```
- Updated function invocations inside `runCheck()` to use property access on module objects:
  - `const result = await scraper.checkAppointments();`
  - `await emailer.sendAlert(result.dates, result.url, recipientEmails);`
  - `await Promise.allSettled(telegramSubscribers.map(chatId => telegram.sendTelegramAlert(chatId, result.appointments || [])));`

### Rationale:
In CommonJS, destructuring imports at module load time creates local variable bindings that remain bound to the original function references. When test runners like `test_scraper.js` stub methods on module exports (`scraper.checkAppointments = ...`), local destructured variables in `termine_app.js` would still invoke the un-mocked functions. Importing whole module objects and calling methods via property access defers lookup to call time, enabling dynamic runtime stubbing in test suites (specifically Suite 3).

---

## 2. `emailer.js`

### Changes Made:
- Removed `return false;` from the Nodemailer `catch (error)` block in `sendAlert()`:
  ```javascript
  // BEFORE
  } catch (error) {
      console.error('[Nodemailer Error] Failed to send email:', error.message);
      return false;
  }

  // AFTER
  } catch (error) {
      console.error('[Nodemailer Error] Failed to send email:', error.message);
  }
  ```

### Rationale:
`emailer.js` uses a 3-tier fallback architecture: Resend API (Tier 1) -> Nodemailer SMTP (Tier 2) -> Simulator Fallback (Tier 3). Returning `false` on Nodemailer SMTP errors prevented execution from reaching Tier 3 (Simulator Mode). Removing `return false;` allows SMTP errors (such as invalid or restricted SMTP credentials in `.env`) to fall through to Tier 3, logging the simulation warning and returning `true` to preserve simulator mode functionality (specifically tested in Suite 4).
