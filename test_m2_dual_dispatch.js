const assert = require('assert');
const path = require('path');

// Require original modules
const scraper = require('./scraper');
const emailer = require('./emailer');
const telegram = require('./telegram');
const db = require('./db');
const termineApp = require('./termine_app');

console.log('🧪 Starting Empirical Verification Suite for Milestone 2 Dual Dispatch Loop...\n');

let passCount = 0;
let failCount = 0;

function reportResult(name, success, extraInfo = '') {
    if (success) {
        console.log(`  ✅ PASS: ${name} ${extraInfo}`);
        passCount++;
    } else {
        console.error(`  ❌ FAIL: ${name} ${extraInfo}`);
        failCount++;
    }
}

// Helper to save original functions for restore
const origGetSubscribers = db.getSubscribers;
const origCheckAppointments = scraper.checkAppointments;
const origSendAlert = emailer.sendAlert;
const origSendTelegramAlert = telegram.sendTelegramAlert;

function restoreAll() {
    db.getSubscribers = origGetSubscribers;
    scraper.checkAppointments = origCheckAppointments;
    emailer.sendAlert = origSendAlert;
    telegram.sendTelegramAlert = origSendTelegramAlert;
}

async function runTests() {
    try {
        // ==========================================
        // TEST 1: Dual Dispatch & Concurrent Telegram Execution
        // ==========================================
        console.log('Test 1: Dual Dispatch & Concurrency (Email + Telegram via Promise.allSettled)');
        {
            const testSubscribers = [
                { email: 'sub1@test.com', telegram: '10001' },
                { email: 'sub2@test.com', telegram: '10002' },
                { email: 'sub3@test.com', telegram: '10003' }
            ];

            let emailCalledWith = null;
            let telegramCalls = [];
            let telegramCallTimes = [];

            db.getSubscribers = async () => testSubscribers;
            scraper.checkAppointments = async () => ({
                found: true,
                dates: ['2026-09-10', '2026-09-11'],
                appointments: [
                    { date: '2026-09-10', time: '10:00', location: 'Bürgeramt Mitte', link: 'https://service.berlin.de/1' },
                    { date: '2026-09-11', time: '14:30', location: 'Bürgeramt Neukölln', link: 'https://service.berlin.de/2' }
                ],
                url: 'https://service.berlin.de/terminvereinbarung/termin/day/120686/'
            });

            emailer.sendAlert = async (dates, url, recipients) => {
                emailCalledWith = { dates, url, recipients };
                return true;
            };

            telegram.sendTelegramAlert = async (chatId, appointments) => {
                const startTime = Date.now();
                telegramCallTimes.push(startTime);
                // Simulate slight delay to test concurrency
                await new Promise(r => setTimeout(r, 50));
                telegramCalls.push({ chatId, appointments });
                return { success: true };
            };

            await termineApp.runCheck();

            const emailSuccess = emailCalledWith &&
                emailCalledWith.recipients.length === 3 &&
                emailCalledWith.recipients.includes('sub1@test.com') &&
                emailCalledWith.recipients.includes('sub2@test.com') &&
                emailCalledWith.recipients.includes('sub3@test.com');

            const telegramSuccess = telegramCalls.length === 3 &&
                telegramCalls.some(c => c.chatId === '10001') &&
                telegramCalls.some(c => c.chatId === '10002') &&
                telegramCalls.some(c => c.chatId === '10003');

            // Concurrency check: all start timestamps should be within 15ms of each other
            const maxTimeDiff = Math.max(...telegramCallTimes) - Math.min(...telegramCallTimes);
            const isConcurrent = maxTimeDiff < 15;

            reportResult('Dual Email + Telegram Dispatch', emailSuccess && telegramSuccess, `(Email recipients: ${emailCalledWith?.recipients.length}, Telegram calls: ${telegramCalls.length})`);
            reportResult('Concurrent Execution via Promise.allSettled', isConcurrent, `(Max start time diff across calls: ${maxTimeDiff}ms)`);
        }

        restoreAll();

        // ==========================================
        // TEST 2: Fault Isolation — Email Error does NOT block Telegram Dispatch
        // ==========================================
        console.log('\nTest 2: Fault Isolation (Email failure does NOT block Telegram alerts)');
        {
            const testSubscribers = [
                { email: 'failing@test.com', telegram: '20001' }
            ];

            let telegramExecuted = false;

            db.getSubscribers = async () => testSubscribers;
            scraper.checkAppointments = async () => ({
                found: true,
                dates: ['2026-09-12'],
                url: 'https://service.berlin.de/terminvereinbarung/termin/day/120686/'
            });

            emailer.sendAlert = async () => {
                throw new Error('SMTP_SERVER_DOWN: Connection refused');
            };

            telegram.sendTelegramAlert = async (chatId) => {
                if (chatId === '20001') telegramExecuted = true;
                return { success: true };
            };

            // Should not throw unhandled exception
            await termineApp.runCheck();

            reportResult('Telegram dispatch fires even when Email fails', telegramExecuted);
        }

        restoreAll();

        // ==========================================
        // TEST 3: Fault Isolation — Single Subscriber Telegram Rejection does NOT block Others
        // ==========================================
        console.log('\nTest 3: Telegram Subscriber Error Isolation (One failed subscriber does NOT block others)');
        {
            const testSubscribers = [
                { email: 'userA@test.com', telegram: '30001' },
                { email: 'userB@test.com', telegram: '30002_FAIL' },
                { email: 'userC@test.com', telegram: '30003' }
            ];

            const successfulTelegramChats = [];

            db.getSubscribers = async () => testSubscribers;
            scraper.checkAppointments = async () => ({
                found: true,
                dates: ['2026-09-15'],
                url: 'https://service.berlin.de/terminvereinbarung/termin/day/120686/'
            });

            emailer.sendAlert = async () => true;

            telegram.sendTelegramAlert = async (chatId) => {
                if (chatId === '30002_FAIL') {
                    throw new Error('Telegram API 403: Bot was blocked by the user');
                }
                successfulTelegramChats.push(chatId);
                return { success: true };
            };

            await termineApp.runCheck();

            const isolationSuccess = successfulTelegramChats.includes('30001') && successfulTelegramChats.includes('30003');

            reportResult('Telegram subscriber failure isolation', isolationSuccess, `(Successful chats: ${successfulTelegramChats.join(', ')})`);
        }

        restoreAll();

        // ==========================================
        // TEST 4: Fallback Appointment Mapping
        // ==========================================
        console.log('\nTest 4: Fallback Appointment Mapping when `result.appointments` is missing/empty');
        {
            const testSubscribers = [{ email: 'fallback@test.com', telegram: '40001' }];
            let receivedAppointments = null;

            db.getSubscribers = async () => testSubscribers;
            scraper.checkAppointments = async () => ({
                found: true,
                dates: ['2026-09-20'],
                appointments: [], // Empty array!
                url: 'https://service.berlin.de/terminvereinbarung/termin/day/120686/'
            });

            emailer.sendAlert = async () => true;
            telegram.sendTelegramAlert = async (chatId, appointments) => {
                receivedAppointments = appointments;
                return { success: true };
            };

            await termineApp.runCheck();

            const fallbackValid = Array.isArray(receivedAppointments) &&
                receivedAppointments.length === 1 &&
                receivedAppointments[0].date === '2026-09-20' &&
                receivedAppointments[0].time === 'Ganztägig' &&
                receivedAppointments[0].location === 'Bürgeramt Berlin';

            reportResult('Default appointment object fallback populates missing structure', fallbackValid, `(Generated appointment: ${JSON.stringify(receivedAppointments?.[0])})`);
        }

        restoreAll();

        // ==========================================
        // TEST 5: Duplicate Alert Suppression
        // ==========================================
        console.log('\nTest 5: Duplicate Alert Suppression on Same Dates');
        {
            const testSubscribers = [{ email: 'dup@test.com', telegram: '50001' }];
            let alertCount = 0;

            db.getSubscribers = async () => testSubscribers;
            scraper.checkAppointments = async () => ({
                found: true,
                dates: ['2026-09-25'],
                url: 'https://service.berlin.de/terminvereinbarung/termin/day/120686/'
            });

            emailer.sendAlert = async () => { alertCount++; return true; };
            telegram.sendTelegramAlert = async () => { alertCount++; return { success: true }; };

            await termineApp.runCheck();
            const firstCallCount = alertCount;

            // Second call with same date
            await termineApp.runCheck();
            const secondCallCount = alertCount;

            const duplicateSuppressed = firstCallCount > 0 && secondCallCount === firstCallCount;
            reportResult('Duplicate alert suppression prevents duplicate notifications', duplicateSuppressed, `(Call 1 alerts: ${firstCallCount}, Call 2 alerts: ${secondCallCount})`);
        }

        restoreAll();

        console.log(`\n==========================================`);
        console.log(`Empirical Test Summary: ${passCount} PASSED, ${failCount} FAILED.`);
        console.log(`==========================================\n`);

        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }

    } catch (err) {
        console.error('💥 Unhandled Exception during test execution:', err);
        process.exit(1);
    }
}

runTests();
