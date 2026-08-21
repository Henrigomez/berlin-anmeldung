const assert = require('assert');
const scraper = require('./scraper');
const emailer = require('./emailer');
const telegram = require('./telegram');
const db = require('./db');
const termineApp = require('./termine_app');

async function runAllSuites() {
    console.log('====================================================');
    console.log('🚀 Running Berlin Termine E2E Simulation Test Harness');
    console.log('====================================================\n');

    let passCount = 0;
    let failCount = 0;

    // --- Suite 1: Scraper HTML Parsing Check ---
    try {
        console.log('--- [Suite 1/5] Scraper HTML Parsing Check ---');
        const sampleHtml = `
            <!DOCTYPE html>
            <html>
            <body>
                <table>
                    <tr>
                        <td class="buchbar">
                            <a title="15.09.2026" href="/terminvereinbarung/termin/day/120686/2026-09-15/">15.09.2026</a>
                        </td>
                        <td class="buchbar">
                            <a title="16.09.2026" href="/terminvereinbarung/termin/day/120686/2026-09-16/">16.09.2026</a>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const parsed = scraper.parseAppointments(sampleHtml);
        assert(parsed && Array.isArray(parsed.dates), 'Parsed result must contain dates array');
        assert.strictEqual(parsed.dates.length, 2, 'Should extract exactly 2 bookable dates');
        assert.deepStrictEqual(parsed.dates, ['15.09.2026', '16.09.2026'], 'Dates extracted must match HTML content');
        assert.strictEqual(parsed.appointments.length, 2, 'Should extract 2 appointment objects');
        assert.strictEqual(parsed.appointments[0].date, '15.09.2026', 'First appointment date must match');
        assert.strictEqual(
            parsed.appointments[0].link,
            'https://service.berlin.de/terminvereinbarung/termin/day/120686/2026-09-15/',
            'Appointment link must be formatted as absolute URL'
        );

        console.log('✅ Suite 1 PASSED: HTML parsing extracts dates & structured appointment objects successfully.\n');
        passCount++;
    } catch (err) {
        console.error('❌ Suite 1 FAILED:', err.message, '\n');
        failCount++;
    }

    // --- Suite 2: Subscriber Database Operations Test ---
    try {
        console.log('--- [Suite 2/5] Subscriber Database Operations Test ---');
        const testEmail = `test_harness_${Date.now()}@example.com`;
        const testTelegram = `9988776655_${Date.now()}`;

        const addResult = await db.addSubscriber(testEmail, testTelegram);
        assert.strictEqual(addResult, true, 'db.addSubscriber must return true on success');

        const subscribers = await db.getSubscribers();
        assert(Array.isArray(subscribers), 'db.getSubscribers must return an array');
        
        const found = subscribers.find(s => s.email === testEmail && s.telegram === testTelegram);
        assert(found, `Subscriber with email ${testEmail} and telegram ${testTelegram} must exist in DB`);
        assert(found.subscribedAt, 'Subscriber record must contain subscribedAt timestamp');

        console.log('✅ Suite 2 PASSED: Database addSubscriber and getSubscribers verified.\n');
        passCount++;
    } catch (err) {
        console.error('❌ Suite 2 FAILED:', err.message, '\n');
        failCount++;
    }

    // --- Suite 3: End-to-End Appointment Discovery and Dual Notification Dispatch Test ---
    try {
        console.log('--- [Suite 3/5] End-to-End Appointment Discovery and Dual Notification Dispatch ---');
        
        const e2eEmail = `e2e_user_${Date.now()}@example.com`;
        const e2eTelegram = `tg_chat_${Date.now()}`;
        await db.addSubscriber(e2eEmail, e2eTelegram);

        const origCheckAppointments = scraper.checkAppointments;
        const origSendAlert = emailer.sendAlert;
        const origSendTelegramAlert = telegram.sendTelegramAlert;

        let emailDispatchCalled = false;
        let emailRecipientsSent = [];
        let telegramDispatchCalled = false;
        let telegramChatIdsSent = [];

        // Mock scraper.checkAppointments to simulate slot discovery offline
        scraper.checkAppointments = async () => ({
            found: true,
            dates: ['20.10.2026'],
            url: 'https://service.berlin.de/terminvereinbarung/termin/day/120686/',
            appointments: [{
                date: '20.10.2026',
                time: '11:00',
                location: 'Bürgeramt Mitte',
                link: 'https://service.berlin.de/terminvereinbarung/termin/day/120686/'
            }]
        });

        // Intercept email alert dispatch
        emailer.sendAlert = async (dates, bookingUrl, recipientEmails) => {
            emailDispatchCalled = true;
            emailRecipientsSent = recipientEmails;
            return origSendAlert(dates, bookingUrl, recipientEmails);
        };

        // Intercept telegram alert dispatch
        telegram.sendTelegramAlert = async (chatId, appointments) => {
            telegramDispatchCalled = true;
            telegramChatIdsSent.push(chatId);
            return origSendTelegramAlert(chatId, appointments);
        };

        try {
            await termineApp.runCheck();

            assert.strictEqual(emailDispatchCalled, true, 'Email dispatch must be triggered when appointments are found');
            assert(emailRecipientsSent.includes(e2eEmail), `Email recipients must include ${e2eEmail}`);
            assert.strictEqual(telegramDispatchCalled, true, 'Telegram dispatch must be triggered when appointments are found');
            assert(telegramChatIdsSent.includes(e2eTelegram), `Telegram chat IDs must include ${e2eTelegram}`);

            console.log('✅ Suite 3 PASSED: E2E appointment discovery triggers both Email and Telegram alert dispatches.\n');
            passCount++;
        } finally {
            // Restore original module functions
            scraper.checkAppointments = origCheckAppointments;
            emailer.sendAlert = origSendAlert;
            telegram.sendTelegramAlert = origSendTelegramAlert;
        }
    } catch (err) {
        console.error('❌ Suite 3 FAILED:', err.message, '\n');
        failCount++;
    }

    // --- Suite 4: Emailer and Telegram Simulator Fallback Mode Validation ---
    try {
        console.log('--- [Suite 4/5] Emailer & Telegram Simulator Fallback Mode Validation ---');

        const emailResult = await emailer.sendAlert(
            ['22.10.2026'],
            'https://service.berlin.de/terminvereinbarung/termin/day/120686/',
            ['simulator_recipient@example.com']
        );
        assert.strictEqual(emailResult, true, 'Emailer sendAlert must return true in simulator fallback mode');

        const telegramResult = await telegram.sendTelegramAlert('simulator_chat_999', [
            { date: '22.10.2026', time: '14:00', location: 'Bürgeramt Neukölln', link: 'https://service.berlin.de/' }
        ]);
        assert.strictEqual(telegramResult.success, true, 'Telegram alert must return success: true in simulator mode');
        assert.strictEqual(telegramResult.simulated, true, 'Telegram alert must set simulated: true in simulator mode');

        console.log('✅ Suite 4 PASSED: Emailer and Telegram simulator modes fall back gracefully.\n');
        passCount++;
    } catch (err) {
        console.error('❌ Suite 4 FAILED:', err.message, '\n');
        failCount++;
    }

    // --- Suite 5: Express Server App Load and Route Initialization Check ---
    try {
        console.log('--- [Suite 5/5] Express Server (server.js) Load & Route Initialization ---');
        const app = require('./server');
        assert.strictEqual(typeof app, 'function', 'server.js must export Express app function');

        assert(app._router && Array.isArray(app._router.stack), 'Express router stack must be initialized');

        const registeredRoutes = app._router.stack
            .filter(layer => layer.route)
            .map(layer => ({
                path: layer.route.path,
                methods: Object.keys(layer.route.methods)
            }));

        const requiredEndpoints = [
            '/api/weather',
            '/api/events',
            '/api/subscribe',
            '/api/create-checkout-session',
            '/api/generate-pdf',
            '/api/news',
            '/api/status'
        ];

        for (const endpoint of requiredEndpoints) {
            const found = registeredRoutes.find(r => r.path === endpoint);
            assert(found, `Server missing required REST route: ${endpoint}`);
        }

        console.log('✅ Suite 5 PASSED: server.js loads cleanly and initializes all 7 core REST API routes.\n');
        passCount++;
    } catch (err) {
        console.error('❌ Suite 5 FAILED:', err.message, '\n');
        failCount++;
    }

    // --- Summary & Exit Code Resolution ---
    console.log('====================================================');
    console.log(`📊 E2E Test Harness Summary: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================');

    if (failCount === 0) {
        console.log('🎉 ALL 5 TEST SUITES PASSED SUCCESSFULLY!');
        process.exit(0);
    } else {
        console.error(`💥 ${failCount} TEST SUITE(S) FAILED.`);
        process.exit(1);
    }
}

runAllSuites().catch(err => {
    console.error('Fatal Test Harness Error:', err);
    process.exit(1);
});
