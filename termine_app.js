const cron = require('node-cron');
const { checkAppointments } = require('./scraper');
const { sendAlert } = require('./emailer');
const db = require('./db');

console.log('🚀 Berlin Anmeldung Alert Bot v2.0 is active!');
console.log('📅 Monitoring Bürgeramt calendars every 5 minutes...');

let lastAlertedDates = '';

async function runCheck() {
    console.log(`[${new Date().toLocaleTimeString()}] 🔍 Checking Bürgeramt appointment availability...`);
    
    const subscriberEmails = await db.getSubscriberEmails();
    console.log(`📊 Active Subscribers in DB: ${subscriberEmails.length}`);

    const result = await checkAppointments();

    if (result.found) {
        console.log(`✅ APPOINTMENTS FOUND! Dates: ${result.dates.join(', ')}`);
        
        const currentDatesString = result.dates.join(',');
        
        if (currentDatesString !== lastAlertedDates) {
            if (subscriberEmails.length > 0) {
                console.log(`📧 Sending email alert to ${subscriberEmails.length} subscribers...`);
                await sendAlert(result.dates, result.url, subscriberEmails);
            } else {
                console.log('ℹ️ Appointments found, but no subscribers registered yet.');
            }
            lastAlertedDates = currentDatesString;
        } else {
            console.log('⏭️ Dates are identical to previous check. Suppressing duplicate alert.');
        }

    } else {
        console.log('❌ No open slots found in this cycle.');
    }
}

// Scheduled check every 5 minutes
cron.schedule('*/5 * * * *', () => {
    runCheck();
});

// Run initial check on launch
runCheck();
