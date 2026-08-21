const { sendTelegramAlert } = require('../../telegram');
const { sendAlert } = require('../../emailer');

async function testTelegram() {
    console.log('==================================================');
    console.log('--- TELEGRAM ALERT TESTS ---');
    console.log('==================================================');

    // 1. Missing / Invalid Chat ID
    console.log('\n[Test T1] null chatId:');
    const t1 = await sendTelegramAlert(null, [{ date: '12.08.2026' }]);
    console.log('Result:', t1);

    console.log('\n[Test T2] undefined chatId:');
    const t2 = await sendTelegramAlert(undefined, [{ date: '12.08.2026' }]);
    console.log('Result:', t2);

    console.log('\n[Test T3] empty string chatId:');
    const t3 = await sendTelegramAlert('', [{ date: '12.08.2026' }]);
    console.log('Result:', t3);

    console.log('\n[Test T4] 0 chatId:');
    const t4 = await sendTelegramAlert(0, [{ date: '12.08.2026' }]);
    console.log('Result:', t4);

    console.log('\n[Test T5] false chatId:');
    const t5 = await sendTelegramAlert(false, [{ date: '12.08.2026' }]);
    console.log('Result:', t5);

    // 2. Empty / Undefined / Malformed Appointments
    console.log('\n[Test T6] Valid chatId, empty appointments array []:');
    const t6 = await sendTelegramAlert('123456', []);
    console.log('Result:', t6);

    console.log('\n[Test T7] Valid chatId, omitted/undefined appointments:');
    const t7 = await sendTelegramAlert('123456');
    console.log('Result:', t7);

    console.log('\n[Test T8] Valid chatId, null appointments:');
    const t8 = await sendTelegramAlert('123456', null);
    console.log('Result:', t8);

    console.log('\n[Test T9] Valid chatId, non-array appointments ("string"):');
    const t9 = await sendTelegramAlert('123456', 'not an array');
    console.log('Result:', t9);

    console.log('\n[Test T10] Valid chatId, appointment object missing fields (empty object {}):');
    const t10 = await sendTelegramAlert('123456', [{}]);
    console.log('Result:', t10);

    console.log('\n[Test T11] Valid chatId, array with null and undefined elements:');
    const t11 = await sendTelegramAlert('123456', [null, undefined]);
    console.log('Result:', t11);

    console.log('\n[Test T12] Valid chatId, populated appointments:');
    const t12 = await sendTelegramAlert('123456', [
        { date: '15.08.2026', time: '10:30', location: 'Bürgeramt Mitte', link: 'https://service.berlin.de/1' },
        { date: '16.08.2026', time: '14:00', location: 'Bürgeramt Neukölln', link: 'https://service.berlin.de/2' }
    ]);
    console.log('Result:', t12);

    // 3. Token configurations & error handling
    console.log('\n[Test T13] Simulated Telegram Bot Token set to invalid real-looking token (API error handling test):');
    process.env.TELEGRAM_BOT_TOKEN = '123456789:AAA_dummy_token_for_testing';
    const t13 = await sendTelegramAlert('123456', [{ date: '12.08.2026' }]);
    console.log('Result:', t13);
    delete process.env.TELEGRAM_BOT_TOKEN;
}

async function testEmailer() {
    console.log('\n==================================================');
    console.log('--- EMAILER ALERT TESTS ---');
    console.log('==================================================');

    // 1. Missing / Empty recipient emails
    console.log('\n[Test E1] Empty recipientEmails array []:');
    const e1 = await sendAlert(['12.08.2026'], 'https://service.berlin.de', []);
    console.log('Result:', e1);

    console.log('\n[Test E2] null recipientEmails:');
    const e2 = await sendAlert(['12.08.2026'], 'https://service.berlin.de', null);
    console.log('Result:', e2);

    console.log('\n[Test E3] undefined recipientEmails (default param):');
    const e3 = await sendAlert(['12.08.2026'], 'https://service.berlin.de');
    console.log('Result:', e3);

    // 2. Simulator Fallback Mode (No API keys set)
    console.log('\n[Test E4] Valid recipients, Simulator Fallback mode:');
    const e4 = await sendAlert(['12.08.2026', '13.08.2026'], 'https://service.berlin.de', ['user1@example.com', 'user2@example.com']);
    console.log('Result:', e4);

    // 3. Edge cases for dates parameter
    console.log('\n[Test E5] Empty dates array []:');
    const e5 = await sendAlert([], 'https://service.berlin.de', ['user@example.com']);
    console.log('Result:', e5);

    console.log('\n[Test E6] undefined dates parameter:');
    try {
        const e6 = await sendAlert(undefined, 'https://service.berlin.de', ['user@example.com']);
        console.log('Result:', e6);
    } catch (err) {
        console.log('CAUGHT EXCEPTION in sendAlert(undefined):', err.message);
    }

    console.log('\n[Test E7] null dates parameter:');
    try {
        const e7 = await sendAlert(null, 'https://service.berlin.de', ['user@example.com']);
        console.log('Result:', e7);
    } catch (err) {
        console.log('CAUGHT EXCEPTION in sendAlert(null):', err.message);
    }
}

async function main() {
    await testTelegram();
    await testEmailer();
}

main().catch(console.error);
