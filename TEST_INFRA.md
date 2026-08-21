# E2E Test Infra: Berlin Anmeldung Automation Platform

## Test Philosophy
- Opaque-box, requirement-driven testing.
- Offline simulation harness (`test_scraper.js`) for CI/CD and verification.

## Feature Inventory
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|--------|:------:|:------:|:------:|:------:|
| 1 | Server Startup (`node server.js`) | ORIGINAL_REQUEST R1 | ✓ | ✓ | ✓ | ✓ |
| 2 | Bürgeramt Scraper | ORIGINAL_REQUEST R2 | ✓ | ✓ | ✓ | ✓ |
| 3 | Email Alerts | ORIGINAL_REQUEST R3 | ✓ | ✓ | ✓ | ✓ |
| 4 | Telegram Alerts | ORIGINAL_REQUEST R3 | ✓ | ✓ | ✓ | ✓ |
| 5 | Test Simulation Harness (`test_scraper.js`) | Acceptance Criteria | ✓ | ✓ | ✓ | ✓ |

## Test Architecture
- Harness script: `test_scraper.js`
- Verification commands:
  - `node test_scraper.js`
  - `node server.js` startup test
