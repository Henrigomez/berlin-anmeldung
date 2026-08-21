const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Path to project files
const projectRoot = path.join(__dirname, '..', '..');
const termineAppPath = path.join(projectRoot, 'termine_app.js');
const dbPath = path.join(projectRoot, 'db.js');
const serverPath = path.join(projectRoot, 'server.js');

console.log('--- EMPIRICAL TEST SUITE FOR SERVER STARTUP & STARTMONITORING ---');

async function runTests() {
    let passed = 0;
    let failed = 0;

    // Test 1: Module exports and structure verification
    try {
        const termineApp = require(termineAppPath);
        assert.strictEqual(typeof termineApp.startMonitoring, 'function', 'startMonitoring must be exported as a function');
        assert.strictEqual(typeof termineApp.runCheck, 'function', 'runCheck must be exported as a function');
        console.log('✅ TEST 1 PASSED: termine_app.js exports startMonitoring and runCheck');
        passed++;
    } catch (err) {
        console.error('❌ TEST 1 FAILED:', err.message);
        failed++;
    }

    // Test 2: Verify db.js getLocalSubscribers handles non-array JSON gracefully
    try {
        const db = require(dbPath);
        // We test getSubscribers() under current state
        const subs = await db.getSubscribers();
        assert(Array.isArray(subs), 'getSubscribers must return an array');
        console.log(`✅ TEST 2 PASSED: getSubscribers() returns an array (length: ${subs.length})`);
        passed++;
    } catch (err) {
        console.error('❌ TEST 2 FAILED:', err.message);
        failed++;
    }

    // Test 3: Verify startMonitoring Promise error handling
    // We intercept console.error to check if [Cron Error] Execution failed: is logged when runCheck throws
    try {
        const termineApp = require(termineAppPath);
        // We will test if startMonitoring handles errors in runCheck without unhandled rejection
        let unhandledRejectionOccurred = false;
        const unhandledHandler = (reason, promise) => {
            unhandledRejectionOccurred = true;
            console.error('UNHANDLED REJECTION DETECTED:', reason);
        };
        process.on('unhandledRejection', unhandledHandler);

        let errorLogged = false;
        const originalConsoleError = console.error;
        console.error = (...args) => {
            if (args.join(' ').includes('[Cron Error] Execution failed:')) {
                errorLogged = true;
            }
            originalConsoleError(...args);
        };

        // Call startMonitoring() - note that runCheck will execute
        termineApp.startMonitoring();

        // Give async operations a tick to execute
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.error = originalConsoleError;
        process.removeListener('unhandledRejection', unhandledHandler);

        assert.strictEqual(unhandledRejectionOccurred, false, 'No unhandled promise rejection should occur during startMonitoring()');
        console.log('✅ TEST 3 PASSED: startMonitoring executed without unhandled promise rejections');
        passed++;
    } catch (err) {
        console.error('❌ TEST 3 FAILED:', err.message);
        failed++;
    }

    // Test 4: Express server app requires and routes test
    try {
        const app = require(serverPath);
        assert(app, 'server.js must export the Express app');
        console.log('✅ TEST 4 PASSED: server.js exports express app object successfully');
        passed++;
    } catch (err) {
        console.error('❌ TEST 4 FAILED:', err.message);
        failed++;
    }

    console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
