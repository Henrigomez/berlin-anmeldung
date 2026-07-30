const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

function findBrowserPath() {
    const paths = [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function renderLogos() {
    const executablePath = findBrowserPath();
    console.log("Using browser at:", executablePath);

    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const outputDir = path.join(__dirname, 'public', 'play_assets');
    fs.mkdirSync(outputDir, { recursive: true });

    // VARIANTE 1: Escudo Oso de Oro (Golden Berlin Bear Shield)
    const logo1HTML = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 512px; height: 512px;
            background: #090d16;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden;
        }
        .shield-outer {
            width: 360px; height: 420px;
            background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
            border: 6px solid #fbbf24;
            border-radius: 40px 40px 180px 180px;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            box-shadow: 0 0 50px rgba(251, 191, 36, 0.35);
        }
        .bear-icon { font-size: 130px; filter: drop-shadow(0 10px 20px rgba(251, 191, 36, 0.6)); margin-bottom: 10px; }
        .text-b { color: #fbbf24; font-size: 32px; font-weight: 900; letter-spacing: 3px; }
        .text-s { color: #10b981; font-size: 16px; font-weight: 800; letter-spacing: 5px; }
    </style>
    </head>
    <body>
        <div class="shield-outer">
            <div class="bear-icon">🐻</div>
            <div class="text-b">BERLIN</div>
            <div class="text-s">TERMINE</div>
        </div>
    </body>
    </html>
    `;

    // VARIANTE 2: Puerta de Brandeburgo de Oro (Brandenburg Gate Luxury)
    const logo2HTML = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 512px; height: 512px;
            background: radial-gradient(circle at 50% 40%, #1e1b4b 0%, #090d16 100%);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden;
            border: 12px solid #fbbf24; border-radius: 100px;
        }
        .icon { font-size: 140px; filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.8)); margin-bottom: 5px; }
        .title { color: #ffffff; font-size: 34px; font-weight: 900; letter-spacing: 3px; }
        .title span { color: #fbbf24; }
        .sub { color: #10b981; font-size: 15px; font-weight: 800; letter-spacing: 4px; margin-top: 2px; }
    </style>
    </head>
    <body>
        <div class="icon">🏛️</div>
        <div class="title">BERLIN <span>PRO</span></div>
        <div class="sub">CITAS & ANMELDUNG</div>
    </body>
    </html>
    `;

    // VARIANTE 3: Monograma Monolítico 'B' FinTech (Futuristic 'B' Emblem)
    const logo3HTML = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 512px; height: 512px;
            background: #090d16;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden;
        }
        .box {
            width: 380px; height: 380px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 80px;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            box-shadow: 0 0 60px rgba(16, 185, 129, 0.5);
            border: 4px solid #a7f3d0;
        }
        .letter { color: #ffffff; font-size: 200px; font-weight: 900; line-height: 1; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .label { color: #000; background: #fbbf24; font-size: 18px; font-weight: 900; padding: 6px 18px; border-radius: 20px; letter-spacing: 2px; margin-top: -10px; }
    </style>
    </head>
    <body>
        <div class="box">
            <div class="letter">B</div>
            <div class="label">TERMINE PRO</div>
        </div>
    </body>
    </html>
    `;

    await page.setViewport({ width: 512, height: 512 });

    await page.setContent(logo1HTML);
    await page.screenshot({ path: path.join(outputDir, 'app_icon_bear.png'), type: 'png' });

    await page.setContent(logo2HTML);
    await page.screenshot({ path: path.join(outputDir, 'app_icon_gate.png'), type: 'png' });

    await page.setContent(logo3HTML);
    await page.screenshot({ path: path.join(outputDir, 'app_icon_monogram.png'), type: 'png' });

    // Set default app_icon_512.png to Option 2 (Brandenburg Gate Luxury)
    await page.setContent(logo2HTML);
    await page.screenshot({ path: path.join(outputDir, 'app_icon_512.png'), type: 'png' });

    await browser.close();
    console.log("3 New Logo Variants rendered successfully!");
}

renderLogos().catch(err => {
    console.error("Rendering failed:", err);
    process.exit(1);
});
