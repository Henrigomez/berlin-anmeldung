# Original User Request

## Initial Request — 2026-08-10T12:43:51Z

Build a complete "Anmeldung" (address registration) automation platform for Berlin expats. The system must monitor Bürgeramt appointment availability in real-time and send instant notifications to users via Email and Telegram when slots open up.

Working directory: C:\Users\henry\Documents\antigravity\wise-bardeen
Integrity mode: development

## Requirements

### R1. Existing Codebase Integration
The system must be built directly into the existing codebase provided in the working directory (berlinanmeldung.com logic). Do not start a completely new server from scratch.

### R2. Bürgeramt Scraping
The system must be capable of scraping or requesting the official Berlin Bürgeramt website to detect available appointment slots.

### R3. Notifications
When an appointment is found, the system must trigger automated notifications via both Email and Telegram to subscribed users.

## Acceptance Criteria

### Execution & Integration
- [ ] Running `node server.js` starts the application without any fatal errors or missing dependencies.

### Verification (Programmatic Test)
- [ ] There is a test script `test_scraper.js` that successfully simulates finding an appointment and correctly triggers the notification logic.
