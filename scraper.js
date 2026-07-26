const cheerio = require('cheerio');
const axios = require('axios');

const ANMELDUNG_URL = 'https://service.berlin.de/terminvereinbarung/termin/day/120686/';

async function checkAppointments() {
    // Attempt 1: Try Puppeteer Stealth if installed
    try {
        const puppeteer = require('puppeteer-extra');
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        await page.goto(ANMELDUNG_URL, { waitUntil: 'networkidle2', timeout: 25000 });
        const html = await page.content();
        await browser.close();

        const $ = cheerio.load(html);
        const bookableDays = [];
        $('td.buchbar a').each((i, el) => {
            const dateText = $(el).attr('title') || $(el).text();
            bookableDays.push(dateText.trim());
        });

        if (bookableDays.length > 0) {
            return { found: true, dates: bookableDays, url: ANMELDUNG_URL };
        }
        return { found: false, dates: [], url: ANMELDUNG_URL };

    } catch (puppeteerErr) {
        console.warn('[Scraper] Puppeteer failed/not ready, attempting Axios fallback:', puppeteerErr.message);

        // Fallback: Axios with human headers
        try {
            const res = await axios.get(ANMELDUNG_URL, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8,de;q=0.7'
                },
                timeout: 10000
            });
            const $ = cheerio.load(res.data);
            const bookableDays = [];
            $('td.buchbar a').each((i, el) => {
                const dateText = $(el).attr('title') || $(el).text();
                bookableDays.push(dateText.trim());
            });

            return { found: bookableDays.length > 0, dates: bookableDays, url: ANMELDUNG_URL };
        } catch (axiosErr) {
            console.error('[Scraper Error]: Failed to fetch appointments via Axios fallback.', axiosErr.message);
            return { found: false, dates: [], url: ANMELDUNG_URL };
        }
    }
}

module.exports = {
    checkAppointments
};
