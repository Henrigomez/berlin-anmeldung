const { sendTelegramAlert } = require('../../telegram');
const { sendAlert } = require('../../emailer');

async function runTests() {
    console.log('=== STARTING EMPIRICAL TEST SUITE FOR MILESTONE 2 ===\n');

    let passCount = 0;
    let failCount = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`[PASS] ${message}`);
            passCount++;
        } else {
            console.error(`[FAIL] ${message}`);
            failCount++;
        }
    }

    // --- TELEGRAM TESTS ---
    console.log('--- TEST GROUP 1: Telegram Alert (telegram.js) ---');

    // Test 1.1: Valid chatId + valid appointments (Simulator mode)
    try {
        const res = await sendTelegramAlert('123456', [
            { date: '15.08.2026', time: '10:00', location: 'Bürgeramt Mitte', link: 'http://example.com/1' }
        ]);
        assert(res.success === true && res.simulated === true, '1.1: Valid chatId + appointments returns success=true & simulated=true');
    } catch (e) {
        assert(false, `1.1: Unexpected exception: ${e.message}`);
    }

    // Test 1.2: Valid chatId + empty appointments array []
    try {
        const res = await sendTelegramAlert('123456', []);
        assert(res.success === true && res.simulated === true, '1.2: Valid chatId + empty appointments array [] returns success=true');
    } catch (e) {
        assert(false, `1.2: Unexpected exception: ${e.message}`);
    }

    // Test 1.3: Valid chatId + undefined appointments
    try {
        const res = await sendTelegramAlert('123456', undefined);
        assert(res.success === true && res.simulated === true, '1.3: Valid chatId + undefined appointments returns success=true');
    } catch (e) {
        assert(false, `1.3: Unexpected exception: ${e.message}`);
    }

    // Test 1.4: Valid chatId + null appointments
    try {
        const res = await sendTelegramAlert('123456', null);
        assert(res.success === true && res.simulated === true, '1.4: Valid chatId + null appointments returns success=true');
    } catch (e) {
        assert(false, `1.4: Unexpected exception: ${e.message}`);
    }

    // Test 1.5: Valid chatId + non-array appointments (e.g. object/string/number)
    try {
        const res = await sendTelegramAlert('123456', "not an array");
        assert(res.success === true && res.simulated === true, '1.5: Valid chatId + string appointments returns success=true');
    } catch (e) {
        assert(false, `1.5: Unexpected exception: ${e.message}`);
    }

    // Test 1.6: Valid chatId + appointments containing partial/missing fields
    try {
        const res = await sendTelegramAlert('123456', [
            { date: '16.08.2026' }, // missing time, location, link
            {},                     // empty object
            null,                   // null element in array
            undefined               // undefined element in array
        ]);
        assert(res.success === true && res.simulated === true, '1.6: Appointments with missing/null/undefined elements handled gracefully');
    } catch (e) {
        assert(false, `1.6: Unexpected exception: ${e.message}`);
    }

    // Test 1.7: Missing chatId (null, undefined, empty string)
    try {
        const resNull = await sendTelegramAlert(null);
        const resUndef = await sendTelegramAlert(undefined);
        const resEmpty = await sendTelegramAlert('');
        assert(
            resNull.success === false && resNull.error === 'Invalid Chat ID' &&
            resUndef.success === false && resUndef.error === 'Invalid Chat ID' &&
            resEmpty.success === false && resEmpty.error === 'Invalid Chat ID',
            '1.7: Missing/null/empty chatId returns success=false & error="Invalid Chat ID"'
        );
    } catch (e) {
        assert(false, `1.7: Unexpected exception: ${e.message}`);
    }

    // Test 1.8: Unconfigured TELEGRAM_BOT_TOKEN (Simulator mode)
    try {
        const origToken = process.env.TELEGRAM_BOT_TOKEN;
        delete process.env.TELEGRAM_BOT_TOKEN;
        const resNoToken = await sendTelegramAlert('123456', [{ date: '15.08.2026' }]);
        process.env.TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
        const resDefaultToken = await sendTelegramAlert('123456', [{ date: '15.08.2026' }]);
        process.env.TELEGRAM_BOT_TOKEN = origToken;
        assert(
            resNoToken.simulated === true && resDefaultToken.simulated === true,
            '1.8: Unconfigured/default TELEGRAM_BOT_TOKEN triggers simulator mode'
        );
    } catch (e) {
        assert(false, `1.8: Unexpected exception: ${e.message}`);
    }

    // Test 1.9: Error handling when axios call fails (e.g. invalid API token)
    try {
        const origToken = process.env.TELEGRAM_BOT_TOKEN;
        process.env.TELEGRAM_BOT_TOKEN = '123456789:INVALID_BOT_TOKEN_FOR_TESTING';
        const resError = await sendTelegramAlert('123456', [{ date: '15.08.2026' }]);
        process.env.TELEGRAM_BOT_TOKEN = origToken;
        assert(resError.success === false && typeof resError.error === 'string', '1.9: Failed API request returns success=false with error string');
    } catch (e) {
        assert(false, `1.9: Unexpected exception: ${e.message}`);
    }

    // --- EMAILER TESTS ---
    console.log('\n--- TEST GROUP 2: Email Alert (emailer.js) ---');

    // Test 2.1: Valid dates + bookingUrl + recipientEmails (Simulator mode)
    try {
        const res = await sendAlert(['15.08.2026'], 'http://example.com', ['test@example.com']);
        assert(res === true, '2.1: Valid input returns true (simulator mode)');
    } catch (e) {
        assert(false, `2.1: Unexpected exception: ${e.message}`);
    }

    // Test 2.2: Empty recipientEmails array []
    try {
        const res = await sendAlert(['15.08.2026'], 'http://example.com', []);
        assert(res === false, '2.2: Empty recipientEmails array returns false');
    } catch (e) {
        assert(false, `2.2: Unexpected exception: ${e.message}`);
    }

    // Test 2.3: null or undefined recipientEmails
    try {
        const resNull = await sendAlert(['15.08.2026'], 'http://example.com', null);
        const resUndef = await sendAlert(['15.08.2026'], 'http://example.com', undefined);
        assert(resNull === false && resUndef === false, '2.3: Null/undefined recipientEmails returns false');
    } catch (e) {
        assert(false, `2.3: Unexpected exception: ${e.message}`);
    }

    // Test 2.4: Empty dates array []
    try {
        const res = await sendAlert([], 'http://example.com', ['test@example.com']);
        assert(res === true, '2.4: Empty dates array [] returns true (simulator mode)');
    } catch (e) {
        assert(false, `2.4: Unexpected exception: ${e.message}`);
    }

    // Test 2.5: Missing / undefined dates parameter (e.g. sendAlert(undefined, url, recipients))
    try {
        const res = await sendAlert(undefined, 'http://example.com', ['test@example.com']);
        assert(res === true || res === false, '2.5: Undefined dates parameter executed without fatal crash');
    } catch (e) {
        assert(false, `2.5: EXCEPTION ON UNDEFINED DATES: ${e.message}`);
    }

    // Test 2.6: null dates parameter (e.g. sendAlert(null, url, recipients))
    try {
        const res = await sendAlert(null, 'http://example.com', ['test@example.com']);
        assert(res === true || res === false, '2.6: Null dates parameter executed without fatal crash');
    } catch (e) {
        assert(false, `2.6: EXCEPTION ON NULL DATES: ${e.message}`);
    }

    // Test 2.7: Unconfigured environment variables fallback (Simulator mode)
    try {
        const origResend = process.env.RESEND_API_KEY;
        const origUser = process.env.EMAIL_USER;
        delete process.env.RESEND_API_KEY;
        delete process.env.EMAIL_USER;
        const res = await sendAlert(['15.08.2026'], 'http://example.com', ['user@example.com']);
        process.env.RESEND_API_KEY = origResend;
        process.env.EMAIL_USER = origUser;
        assert(res === true, '2.7: Unconfigured credentials fall back to simulator mode returning true');
    } catch (e) {
        assert(false, `2.7: Unexpected exception: ${e.message}`);
    }

    // Test 2.8: Resend failure fallback
    try {
        // If Resend API key is present but invalid, test if error is handled gracefully
        const origResend = process.env.RESEND_API_KEY;
        const origUser = process.env.EMAIL_USER;
        process.env.RESEND_API_KEY = 're_invalid_key_for_testing_123';
        delete process.env.EMAIL_USER; // disable nodemailer so it hits simulator/end
        
        // Re-require emailer to pick up env change or test inline
        const resendModule = require('../../emailer');
        const res = await resendModule.sendAlert(['15.08.2026'], 'http://example.com', ['user@example.com']);
        
        process.env.RESEND_API_KEY = origResend;
        process.env.EMAIL_USER = origUser;
        assert(typeof res === 'boolean', '2.8: Resend API failure handled gracefully returning boolean');
    } catch (e) {
        assert(false, `2.8: Unexpected exception: ${e.message}`);
    }

    console.log(`\n=== TEST SUITE COMPLETED: ${passCount} PASSED, ${failCount} FAILED ===`);
}

runTests();
