const cheerio = require('cheerio');
const axios = require('axios');

const ANMELDUNG_URL = 'https://service.berlin.de/terminvereinbarung/termin/day/120686/';

/**
 * Parses appointment dates and structured appointment objects from service.berlin.de HTML
 */
function parseAppointments(html) {
    const $ = cheerio.load(html);
    const bookableDays = [];
    const appointments = [];

    $('td.buchbar a').each((i, el) => {
        const dateText = (($(el).attr('title') || $(el).text()) || '').trim();
        const href = $(el).attr('href') || '';
        const link = href ? (href.startsWith('http') ? href : `https://service.berlin.de${href}`) : ANMELDUNG_URL;
        
        if (dateText) {
            bookableDays.push(dateText);
            appointments.push({
                date: dateText,
                time: 'Ganztägig / Online',
                location: 'Bürgeramt Berlin',
                link: link
            });
        }
    });

    return { dates: bookableDays, appointments };
}

async function checkAppointments() {
    // Primary Attempt: Axios GET with German locale headers
    try {
        const res = await axios.get(ANMELDUNG_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept-Language': 'de-DE,de;q=0.9'
            },
            timeout: 10000
        });

        const { dates, appointments } = parseAppointments(res.data);
        return {
            found: dates.length > 0,
            dates,
            appointments,
            url: ANMELDUNG_URL
        };

    } catch (axiosErr) {
        console.warn('[Scraper] Primary Axios GET failed, attempting Puppeteer Stealth fallback:', axiosErr.message);

        // Secondary Fallback: Puppeteer Stealth
        try {
            const puppeteer = require('puppeteer-extra');
            const StealthPlugin = require('puppeteer-extra-plugin-stealth');
            puppeteer.use(StealthPlugin());

            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

            await page.goto(ANMELDUNG_URL, { waitUntil: 'networkidle2', timeout: 25000 });
            const html = await page.content();
            await browser.close();

            const { dates, appointments } = parseAppointments(html);
            return {
                found: dates.length > 0,
                dates,
                appointments,
                url: ANMELDUNG_URL
            };
        } catch (puppeteerErr) {
            console.error('[Scraper Error]: Failed to fetch appointments via Puppeteer fallback.', puppeteerErr.message);
            return {
                found: false,
                dates: [],
                appointments: [],
                url: ANMELDUNG_URL
            };
        }
    }
}

module.exports = {
    checkAppointments,
    parseAppointments
};

