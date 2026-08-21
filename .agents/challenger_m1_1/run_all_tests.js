const { execSync } = require('child_process');
const path = require('path');

console.log("Running all challenger M1 empirical test suites...");

try {
    console.log("\n1. Running DB & Scraper Unit Tests...");
    const out1 = execSync(`node "${path.join(__dirname, 'test_m1.js')}"`, { encoding: 'utf8' });
    console.log(out1);

    console.log("\n2. Running POST /api/subscribe & Server Integration Tests...");
    const out2 = execSync(`node "${path.join(__dirname, 'test_server_and_subscribe.js')}"`, { encoding: 'utf8' });
    console.log(out2);

    console.log("\n✅ ALL SUITES PASSED SUCCESSFULLY!");
} catch (err) {
    console.error("\n❌ SUITE FAILED:");
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    process.exit(1);
}
