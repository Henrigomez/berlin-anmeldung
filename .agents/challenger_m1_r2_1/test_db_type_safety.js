const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '../..');
const subscribersPath = path.join(projectRoot, 'subscribers.json');
const dbPath = path.join(projectRoot, 'db.js');

// Backup original subscribers.json if exists
let originalContent = null;
let fileExisted = fs.existsSync(subscribersPath);
if (fileExisted) {
    originalContent = fs.readFileSync(subscribersPath, 'utf8');
}

const testCases = [
    { name: 'JSON Object {}', content: '{}' },
    { name: 'JSON Object with keys', content: '{"subscribers": ["test@example.com"]}' },
    { name: 'JSON String', content: '"invalid array"' },
    { name: 'JSON Number', content: '42' },
    { name: 'JSON Boolean true', content: 'true' },
    { name: 'JSON Boolean false', content: 'false' },
    { name: 'JSON Null', content: 'null' },
    { name: 'Malformed JSON', content: 'not json {' },
    { name: 'Empty string', content: '' }
];

async function runTests() {
    delete require.cache[require.resolve(dbPath)];
    const db = require(dbPath);

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const tc of testCases) {
        try {
            fs.writeFileSync(subscribersPath, tc.content, 'utf8');
            const result = await db.getSubscribers();
            const emails = await db.getSubscriberEmails();

            assert(Array.isArray(result), `Expected Array, got ${typeof result}`);
            assert(Array.isArray(emails), `Expected Array, got ${typeof emails}`);

            console.log(`[PASS] ${tc.name}: getSubscribers() returned Array(length=${result.length})`);
            results.push({ name: tc.name, pass: true, resultLength: result.length });
            passed++;
        } catch (err) {
            console.error(`[FAIL] ${tc.name}: Threw error: ${err.stack || err}`);
            results.push({ name: tc.name, pass: false, error: err.message });
            failed++;
        }
    }

    // Restore original file
    if (fileExisted) {
        fs.writeFileSync(subscribersPath, originalContent, 'utf8');
    } else if (fs.existsSync(subscribersPath)) {
        fs.unlinkSync(subscribersPath);
    }

    console.log(`\nTest Summary: ${passed} passed, ${failed} failed out of ${testCases.length} tests.`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test execution failed:', err);
    if (fileExisted && originalContent !== null) {
        fs.writeFileSync(subscribersPath, originalContent, 'utf8');
    }
    process.exit(1);
});
