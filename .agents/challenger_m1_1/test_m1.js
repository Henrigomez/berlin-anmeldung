const path = require('path');
const fs = require('fs');

// We need to require modules from the root workspace directory
const rootDir = path.resolve(__dirname, '../..');
const dbPath = path.join(rootDir, 'db.js');
const scraperPath = path.join(rootDir, 'scraper.js');
const termineAppPath = path.join(rootDir, 'termine_app.js');
const serverPath = path.join(rootDir, 'server.js');

const db = require(dbPath);
const scraper = require(scraperPath);
const termineApp = require(termineAppPath);

async function runTests() {
    console.log("=== STARTING EMPIRICAL CHALLENGE TESTS ===");
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`[PASS] ${message}`);
            passed++;
        } else {
            console.error(`[FAIL] ${message}`);
            failed++;
        }
    }

    // Backup existing subscribers.json if present
    const subscribersFile = path.join(rootDir, 'subscribers.json');
    let originalSubscribersData = null;
    if (fs.existsSync(subscribersFile)) {
        originalSubscribersData = fs.readFileSync(subscribersFile, 'utf8');
    }

    try {
        // Reset subscribers file to empty array for predictable testing
        fs.writeFileSync(subscribersFile, JSON.stringify([], null, 2));

        // --- TEST SET 1: DB API Functions ---
        console.log("\n--- Test Set 1: DB API Functions ---");
        
        // 1.1 Add email subscriber only
        const res1 = await db.addSubscriber("test_email_only@example.com", "");
        assert(res1 === true, "addSubscriber with email only returned true");

        // 1.2 Add telegram subscriber only
        const res2 = await db.addSubscriber("", "@test_tg_only");
        assert(res2 === true, "addSubscriber with telegram only returned true");

        // 1.3 Add dual subscriber (both email and telegram)
        const res3 = await db.addSubscriber("test_dual@example.com", "@test_dual_tg");
        assert(res3 === true, "addSubscriber with both email and telegram returned true");

        // 1.4 Add empty subscriber (neither email nor telegram)
        const res4 = await db.addSubscriber("", "");
        assert(res4 === false, "addSubscriber with empty email and telegram returned false");

        // 1.5 Retrieve all subscribers via getSubscribers()
        const subscribers = await db.getSubscribers();
        assert(Array.isArray(subscribers), "getSubscribers() returns an array");
        assert(subscribers.length === 3, `getSubscribers() returned ${subscribers.length} subscribers (expected 3)`);

        const emailOnlySub = subscribers.find(s => s.email === "test_email_only@example.com");
        assert(emailOnlySub && emailOnlySub.email === "test_email_only@example.com" && emailOnlySub.telegram === "" && !!emailOnlySub.subscribedAt, 
            "Email-only subscriber correctly formatted with empty telegram and subscribedAt");

        const tgOnlySub = subscribers.find(s => s.telegram === "@test_tg_only");
        assert(tgOnlySub && tgOnlySub.email === "" && tgOnlySub.telegram === "@test_tg_only" && !!tgOnlySub.subscribedAt, 
            "Telegram-only subscriber correctly formatted with empty email and subscribedAt");

        const dualSub = subscribers.find(s => s.email === "test_dual@example.com");
        assert(dualSub && dualSub.email === "test_dual@example.com" && dualSub.telegram === "@test_dual_tg" && !!dualSub.subscribedAt, 
            "Dual subscriber correctly formatted with email, telegram, and subscribedAt");

        // 1.6 Backward compatibility: getSubscriberEmails()
        const emails = await db.getSubscriberEmails();
        assert(Array.isArray(emails), "getSubscriberEmails() returns an array");
        assert(emails.length === 2, `getSubscriberEmails() returned ${emails.length} emails (expected 2)`);
        assert(emails.includes("test_email_only@example.com") && emails.includes("test_dual@example.com"), "getSubscriberEmails() returned only non-empty email addresses");

        // 1.7 Update existing subscriber (add telegram to existing email-only subscriber)
        const resUpdate = await db.addSubscriber("test_email_only@example.com", "@added_tg_handle");
        assert(resUpdate === true, "addSubscriber update existing returned true");
        const updatedSubs = await db.getSubscribers();
        const updatedSub = updatedSubs.find(s => s.email === "test_email_only@example.com");
        assert(updatedSub && updatedSub.telegram === "@added_tg_handle", "Updating existing email subscriber added Telegram handle without duplicating record");
        assert(updatedSubs.length === 3, "Total subscriber count remains 3 after update");

        // --- TEST SET 2: Scraper Module Execution ---
        console.log("\n--- Test Set 2: Scraper Module Execution ---");
        
        console.log("Invoking scraper.checkAppointments()...");
        const scraperRes = await scraper.checkAppointments();
        assert(typeof scraperRes === 'object' && scraperRes !== null, "checkAppointments() returned an object");
        assert(typeof scraperRes.found === 'boolean', "checkAppointments().found is a boolean");
        assert(Array.isArray(scraperRes.dates), "checkAppointments().dates is an array");
        assert(Array.isArray(scraperRes.appointments), "checkAppointments().appointments is an array");
        assert(typeof scraperRes.url === 'string' && scraperRes.url.includes('service.berlin.de'), "checkAppointments().url is valid Bürgeramt URL");

        if (scraperRes.appointments.length > 0) {
            const firstAppt = scraperRes.appointments[0];
            assert(firstAppt.date && firstAppt.time && firstAppt.location && firstAppt.link, "Appointment items contain date, time, location, link");
        } else {
            console.log("ℹ️ No active appointment slots currently found on live site (normal).");
        }

        // --- TEST SET 3: Termine App & Monitoring Functions ---
        console.log("\n--- Test Set 3: Termine App & Monitoring ---");
        assert(typeof termineApp.startMonitoring === 'function', "startMonitoring is exported as a function");
        assert(typeof termineApp.runCheck === 'function', "runCheck is exported as a function");

        // Execute runCheck directly
        console.log("Executing termineApp.runCheck()...");
        await termineApp.runCheck();
        assert(true, "runCheck() completed without throwing errors");

    } finally {
        // Restore original subscribers data
        if (originalSubscribersData !== null) {
            fs.writeFileSync(subscribersFile, originalSubscribersData);
        } else {
            if (fs.existsSync(subscribersFile)) fs.unlinkSync(subscribersFile);
        }
    }

    console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
    return failed;
}

runTests().then(failures => {
    process.exit(failures > 0 ? 1 : 0);
}).catch(err => {
    console.error("Test execution fatal error:", err);
    process.exit(1);
});
