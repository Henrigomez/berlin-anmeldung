# ⚡ Berlin Termine Pro & Expat Bureaucracy Platform

> **Ultra-Luxury Full-Stack Web Application & Automated Bürgeramt Appointment Alert Bot for Berlin Expats and Residents.**

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![Express](https://img.shields.io/badge/Express-4.19-blue.svg)
![Puppeteer](https://img.shields.io/badge/Puppeteer-Stealth-orange.svg)
![PDFKit](https://img.shields.io/badge/PDFKit-Generator-red.svg)
![Web%20Audio%20API](https://img.shields.io/badge/Web%20Audio%20API-Synthesizer-purple.svg)
![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)

---

## 🌟 Overview

Navigating bureaucracy in Berlin is notoriously challenging for expats and new residents—specifically securing an **Anmeldung** (address registration) appointment at a local Bürgeramt. 

**Berlin Termine Pro** is an end-to-end digital platform designed to solve this exact problem. It combines continuous automated WAF-bypassing web scraping, instant multi-channel alert dispatching (Email & Telegram), an automated official PDF registration form generator, interactive bureaucracy checklists, localized multi-language support (8 languages), and real-time Web Audio API focus soundscapes.

---

## 🔥 Key Features & Architecture

### 1. 🤖 Stealth Bürgeramt Scraper Bot (`scraper.js` & `termine_app.js`)
- **Anti-Detection**: Built with `puppeteer-extra-plugin-stealth` and randomized viewport dimensions to bypass government Cloudflare/WAF `403 Forbidden` protection.
- **Smart Fallback Engine**: Automated fallbacks to Axios HTTP request parsers with Cheerio HTML traversal.
- **Cron Scheduler**: Runs periodic check cycles across all 12 Berlin administrative districts.

### 2. 📄 Official Anmeldeformular PDF Generator (`pdf_generator.js`)
- **Instant Pre-Filled Documents**: Native server-side PDF stream rendering via `pdfkit`.
- **Legal Compliance**: Formatted according to German Federal Registration Law (*§ 17 Bundesmeldegesetz - BMG*).
- **Multi-Field Form Validation**: Generates ready-to-print PDFs with user personal details, previous address, landlord (*Wohnungsgeber*) confirmation notes, and legal declaration signature fields.

### 3. 📱 Multi-Channel Instant Alerts (`telegram.js` & `emailer.js`)
- **Telegram Bot API Transporter**: Sends rich Markdown alert notifications with direct booking links in under 1 second.
- **Nodemailer SMTP Transporter**: Formatted HTML email alert dispatching.

### 4. 🎵 Native Web Audio API Soundscape Synthesizer (`public/app.js`)
- **Zero External Audio Assets**: Pure browser-native synthesis using dual `OscillatorNode` and `GainNode` audio graphs.
- **Focus Soundscapes**: Real-time ambient harmonic chords (*Cmaj7*, *Fmaj7*, *Am7*) engineered for stress relief and focus.

### 5. 🌍 8-Language Localization (i18n)
- Seamless real-time translation dictionary supporting:
  - 🇬🇧 English, 🇩🇪 German, 🇪🇸 Spanish, 🇫🇷 French, 🇮🇹 Italian, 🇹🇷 Turkish, 🇵🇱 Polish, 🇺🇦 Ukrainian.

### 6. 📊 Expat Survival Checklist & Dynamic News Feed
- **Stateful Progress Tracker**: Interactive checklist backed by `localStorage` state persistence.
- **Category Filterable News Feed**: Dynamic news articles categorized by *Bureaucracy*, *Finances*, *Housing*, and *Transport*.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, Firebase Firestore / JSON DB, PDFKit, Axios, Cheerio, Node-Cron, Nodemailer.
- **Scraper**: Puppeteer Extra Stealth, Chromium headless.
- **Frontend**: Native HTML5, Modern Vanilla CSS3 (Glassmorphism design system, HSL color tokens, CSS grid/flexbox), JavaScript ES6+.
- **Audio Engine**: Web Audio API (Synthesizers, Equalizer CSS animations).
- **Deployment & Cloud**: Vercel Serverless Architecture / Render Worker.

---

## 🚀 Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/berlin-anmeldung.git
   cd berlin-anmeldung
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Chromium browser for Puppeteer**:
   ```bash
   npx puppeteer install chrome
   ```

4. **Environment Variables Configuration**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=your-app-password
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   ```

5. **Start the Web Application & Server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

6. **Start the Background Scraper Bot**:
   ```bash
   npm run bot
   ```

---

## 👨‍💻 Author

Developed with ❤️ by **Henry Saah**.
