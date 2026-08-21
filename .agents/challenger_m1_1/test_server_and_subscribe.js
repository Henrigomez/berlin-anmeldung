const http = require('http');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '../..');
const app = require(path.join(rootDir, 'server.js'));
const db = require(path.join(rootDir, 'db.js'));

async function testSubscribeEndpoint() {
    console.log("=== TESTING POST /api/subscribe ENDPOINT & SERVER ===");
    let passed = 0;
    let failed = 0;

    function assert(cond, msg) {
        if (cond) {
            console.log(`[PASS] ${msg}`);
            passed++;
        } else {
            console.error(`[FAIL] ${msg}`);
            failed++;
        }
    }

    const subscribersFile = path.join(rootDir, 'subscribers.json');
    let originalSubscribersData = null;
    if (fs.existsSync(subscribersFile)) {
        originalSubscribersData = fs.readFileSync(subscribersFile, 'utf8');
    }

    // Start server on dynamic port
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    function postJSON(pathUrl, data) {
        return new Promise((resolve, reject) => {
            const bodyStr = JSON.stringify(data);
            const req = http.request({
                hostname: '127.0.0.1',
                port: port,
                path: pathUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(bodyStr)
                }
            }, (res) => {
                let resData = '';
                res.on('data', chunk => resData += chunk);
                res.on('end', () => {
                    try {
                        resolve({ statusCode: res.statusCode, body: JSON.parse(resData) });
                    } catch (e) {
                        resolve({ statusCode: res.statusCode, body: resData });
                    }
                });
            });
            req.on('error', reject);
            req.write(bodyStr);
            req.end();
        });
    }

    function getJSON(pathUrl) {
        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: '127.0.0.1',
                port: port,
                path: pathUrl,
                method: 'GET'
            }, (res) => {
                let resData = '';
                res.on('data', chunk => resData += chunk);
                res.on('end', () => {
                    try {
                        resolve({ statusCode: res.statusCode, body: JSON.parse(resData) });
                    } catch (e) {
                        resolve({ statusCode: res.statusCode, body: resData });
                    }
                });
            });
            req.on('error', reject);
            req.end();
        });
    }

    try {
        // Reset DB file
        fs.writeFileSync(subscribersFile, JSON.stringify([], null, 2));

        // 1. Test POST /api/subscribe with BOTH email & telegram
        const resDual = await postJSON('/api/subscribe', {
            email: 'user_both@berlin.de',
            telegram: '@berlin_user_tg'
        });
        assert(resDual.statusCode === 201, `POST /api/subscribe with dual contact returned status 201 (got ${resDual.statusCode})`);
        assert(resDual.body.success === true, "POST /api/subscribe response success is true");

        // Verify stored data in DB
        let subscribers = await db.getSubscribers();
        let foundDual = subscribers.find(s => s.email === 'user_both@berlin.de');
        assert(foundDual && foundDual.email === 'user_both@berlin.de' && foundDual.telegram === '@berlin_user_tg',
            "DB contains record storing BOTH email ('user_both@berlin.de') and telegram ('@berlin_user_tg')");

        // 2. Test POST /api/subscribe with ONLY email
        const resEmail = await postJSON('/api/subscribe', {
            email: 'user_email_only@berlin.de'
        });
        assert(resEmail.statusCode === 201, "POST /api/subscribe with email only returned status 201");
        subscribers = await db.getSubscribers();
        let foundEmail = subscribers.find(s => s.email === 'user_email_only@berlin.de');
        assert(foundEmail && foundEmail.email === 'user_email_only@berlin.de' && foundEmail.telegram === '',
            "DB contains record storing email with empty telegram");

        // 3. Test POST /api/subscribe with ONLY telegram
        const resTg = await postJSON('/api/subscribe', {
            telegram: '@tg_only_handle'
        });
        assert(resTg.statusCode === 201, "POST /api/subscribe with telegram only returned status 201");
        subscribers = await db.getSubscribers();
        let foundTg = subscribers.find(s => s.telegram === '@tg_only_handle');
        assert(foundTg && foundTg.telegram === '@tg_only_handle' && foundTg.email === '',
            "DB contains record storing telegram handle with empty email");

        // 4. Test POST /api/subscribe with INVALID input (neither email nor telegram)
        const resEmpty = await postJSON('/api/subscribe', {});
        assert(resEmpty.statusCode === 400, `POST /api/subscribe with missing data returned status 400 (got ${resEmpty.statusCode})`);

        // 5. Test POST /api/subscribe with INVALID email format
        const resBadEmail = await postJSON('/api/subscribe', { email: 'not-an-email' });
        assert(resBadEmail.statusCode === 400, `POST /api/subscribe with invalid email format returned status 400 (got ${resBadEmail.statusCode})`);

        // 6. Test GET /api/status endpoint
        const resStatus = await getJSON('/api/status');
        assert(resStatus.statusCode === 200, "GET /api/status returned status 200");
        assert(resStatus.body.status === 'ACTIVE', "GET /api/status returns active status");

    } finally {
        server.close();
        if (originalSubscribersData !== null) {
            fs.writeFileSync(subscribersFile, originalSubscribersData);
        } else {
            if (fs.existsSync(subscribersFile)) fs.unlinkSync(subscribersFile);
        }
    }

    console.log(`\n=== ENDPOINT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
    return failed;
}

testSubscribeEndpoint().then(failures => {
    process.exit(failures > 0 ? 1 : 0);
}).catch(err => {
    console.error("Test server error:", err);
    process.exit(1);
});
