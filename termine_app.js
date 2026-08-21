const cron = require('node-cron');
const scraper = require('./scraper');
const emailer = require('./emailer');
const telegram = require('./telegram');
const db = require('./db');

let lastAlertedDates = '';

async function runCheck() {
    console.log(`[${new Date().toLocaleTimeString()}] 🔍 Checking Bürgeramt appointment availability...`);
    
    const subscribers = await db.getSubscribers();
    console.log(`📊 Active Subscribers in DB: ${subscribers.length}`);

    const result = await scraper.checkAppointments();

    if (result.found) {
        console.log(`✅ APPOINTMENTS FOUND! Dates: ${result.dates.join(', ')}`);
        
        if (!result.appointments || result.appointments.length === 0) {
            result.appointments = (result.dates || []).map(date => ({
                date: date,
                time: 'Ganztägig',
                location: 'Bürgeramt Berlin',
                link: result.url || 'https://service.berlin.de/terminvereinbarung/termin/day/120686/'
            }));
        }

        const currentDatesString = result.dates.join(',');
        
        if (currentDatesString !== lastAlertedDates) {
            // Email alerts
            try {
                const recipientEmails = subscribers.map(s => s.email).filter(Boolean);
                if (recipientEmails.length > 0) {
                    console.log(`📧 Sending email alert to ${recipientEmails.length} subscribers...`);
                    await emailer.sendAlert(result.dates, result.url, recipientEmails);
                } else {
                    console.log('ℹ️ Appointments found, but no email subscribers registered yet.');
                }
            } catch (emailErr) {
                console.error('[Email Dispatch Error] Failed to send email alerts:', emailErr.message || emailErr);
            }

            // Telegram alerts
            try {
                const telegramSubscribers = subscribers.map(s => s.telegram).filter(Boolean);
                if (telegramSubscribers.length > 0) {
                    console.log(`📱 Sending Telegram alerts to ${telegramSubscribers.length} subscribers...`);
                    await Promise.allSettled(
                        telegramSubscribers.map(chatId => telegram.sendTelegramAlert(chatId, result.appointments || []))
                    );
                }
            } catch (telegramErr) {
                console.error('[Telegram Dispatch Error] Failed to send Telegram alerts:', telegramErr.message || telegramErr);
            }

            lastAlertedDates = currentDatesString;
        } else {
            console.log('⏭️ Dates are identical to previous check. Suppressing duplicate alert.');
        }

    } else {
        console.log('❌ No open slots found in this cycle.');
    }
}

function startMonitoring() {
    console.log('🚀 Berlin Anmeldung Alert Bot v2.0 is active!');
    console.log('📅 Monitoring Bürgeramt calendars every 5 minutes...');
    
    cron.schedule('*/5 * * * *', () => {
        runCheck().catch(err => console.error('[Cron Error] Execution failed:', err));
    });

    runCheck().catch(err => console.error('[Cron Error] Execution failed:', err));
}

if (require.main === module) {
    startMonitoring();
}

module.exports = {
    startMonitoring,
    runCheck
};
