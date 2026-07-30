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

async function renderExecutiveAssets() {
    const executablePath = findBrowserPath();
    console.log("Rendering Ultra-Executive Assets using browser at:", executablePath);

    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const outputDir = path.join(__dirname, 'public', 'play_assets');
    fs.mkdirSync(outputDir, { recursive: true });

    // 1. CONCEPT A: El Escudo Soberano (Sovereign Gold Crest) - 512x512 PNG
    const conceptA_HTML = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 512px; height: 512px;
            background: #07090e;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            font-family: 'Cinzel', 'Trajan Pro', 'Georgia', serif;
            overflow: hidden;
        }
        .outer-border {
            width: 440px; height: 440px;
            border-radius: 60px;
            background: linear-gradient(135deg, #1e293b 0%, #090d16 100%);
            border: 2px solid rgba(251, 191, 36, 0.4);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            box-shadow: inset 0 0 40px rgba(0,0,0,0.9), 0 20px 50px rgba(0,0,0,0.8);
            position: relative;
        }
        .gold-frame {
            width: 380px; height: 380px;
            border-radius: 46px;
            border: 3px solid;
            border-image: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c) 1;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            background: radial-gradient(circle at 50% 30%, #151c2c 0%, #07090e 100%);
            padding: 20px;
        }
        .svg-crest {
            width: 140px; height: 140px;
            margin-bottom: 15px;
            filter: drop-shadow(0 10px 20px rgba(191, 149, 63, 0.5));
        }
        .brand-title {
            background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 30px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;
        }
        .brand-sub {
            color: #10b981; font-size: 13px; font-weight: 800; letter-spacing: 6px; margin-top: 5px; text-transform: uppercase;
            font-family: 'Segoe UI', sans-serif;
        }
    </style>
    </head>
    <body>
        <div class="outer-border">
            <div class="gold-frame">
                <svg class="svg-crest" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#bf953f" />
                            <stop offset="25%" stop-color="#fcf6ba" />
                            <stop offset="50%" stop-color="#b38728" />
                            <stop offset="75%" stop-color="#fbf5b7" />
                            <stop offset="100%" stop-color="#aa771c" />
                        </linearGradient>
                    </defs>
                    <!-- Crown & Pillars Crest -->
                    <path d="M50 5 L62 25 L85 20 L75 42 L95 55 L70 65 L50 95 L30 65 L5 55 L25 42 L15 20 L38 25 Z" stroke="url(#goldGrad)" stroke-width="3.5" fill="none" />
                    <circle cx="50" cy="50" r="18" stroke="url(#goldGrad)" stroke-width="3" fill="none"/>
                    <path d="M42 50 L50 40 L58 50 L50 60 Z" fill="url(#goldGrad)"/>
                </svg>
                <div class="brand-title">BERLIN</div>
                <div class="brand-sub">ANMELDUNG PRO</div>
            </div>
        </div>
    </body>
    </html>
    `;

    // 2. CONCEPT B: La Llave Centurión de Oro 24K (Centurion Key of Access) - 512x512 PNG
    const conceptB_HTML = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 512px; height: 512px;
            background: #05070a;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden;
        }
        .card-container {
            width: 440px; height: 440px;
            border-radius: 60px;
            background: radial-gradient(circle at 40% 30%, #1e293b 0%, #05070a 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            box-shadow: 0 25px 60px rgba(0,0,0,0.9);
            position: relative;
        }
        .glow-aura {
            position: absolute; width: 260px; height: 260px; border-radius: 50%;
            background: rgba(16, 185, 129, 0.12); filter: blur(40px);
        }
        .svg-key {
            width: 170px; height: 170px; z-index: 2; margin-bottom: 10px;
            filter: drop-shadow(0 15px 25px rgba(0,0,0,0.8));
        }
        .text-main {
            z-index: 2; font-size: 32px; font-weight: 900; letter-spacing: 4px;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .text-gold {
            z-index: 2; font-size: 15px; font-weight: 800; letter-spacing: 6px; margin-top: 4px;
            background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 50%, #aa771c 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
    </style>
    </head>
    <body>
        <div class="card-container">
            <div class="glow-aura"></div>
            <svg class="svg-key" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="gold24k" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fef08a" />
                        <stop offset="30%" stop-color="#fbbf24" />
                        <stop offset="70%" stop-color="#d97706" />
                        <stop offset="100%" stop-color="#78350f" />
                    </linearGradient>
                </defs>
                <!-- Executive Key & Diamond -->
                <circle cx="35" cy="35" r="22" stroke="url(#gold24k)" stroke-width="7" fill="none"/>
                <circle cx="35" cy="35" r="10" fill="url(#gold24k)"/>
                <path d="M51 49 L85 83 M73 71 L83 61 M81 79 L91 69" stroke="url(#gold24k)" stroke-width="7" stroke-linecap="round"/>
            </svg>
            <div class="text-main">BERLIN</div>
            <div class="text-gold">TERMINE VIP</div>
        </div>
    </body>
    </html>
    `;

    // 3. CONCEPT C: El Monograma Real 'B' (Royal Monogram B) - 512x512 PNG
    const conceptC_HTML = `
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
        .mono-card {
            width: 440px; height: 440px; border-radius: 60px;
            background: linear-gradient(145deg, #0f172a 0%, #070a11 100%);
            border: 2px solid rgba(251, 191, 36, 0.5);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            box-shadow: 0 30px 70px rgba(0,0,0,0.95);
        }
        .monogram-text {
            font-size: 190px; font-weight: 900; line-height: 0.9;
            background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 30%, #b38728 60%, #fbf5b7 80%, #aa771c 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 15px 30px rgba(191, 149, 63, 0.4));
            margin-bottom: 10px;
        }
        .mono-sub {
            color: #ffffff; font-size: 16px; font-weight: 800; letter-spacing: 7px; text-transform: uppercase;
        }
    </style>
    </head>
    <body>
        <div class="mono-card">
            <div class="monogram-text">B</div>
            <div class="mono-sub">BERLIN TERMINE</div>
        </div>
    </body>
    </html>
    `;

    // Render 3 PNGs
    await page.setViewport({ width: 512, height: 512 });

    await page.setContent(conceptA_HTML);
    await page.screenshot({ path: path.join(outputDir, 'app_icon_sovereign.png'), type: 'png' });

    await page.setContent(conceptB_HTML);
    await page.screenshot({ path: path.join(outputDir, 'app_icon_centurion.png'), type: 'png' });

    await page.setContent(conceptC_HTML);
    await page.screenshot({ path: path.join(outputDir, 'app_icon_monogram_gold.png'), type: 'png' });

    // Set default icon (512x512) to Concept A (Sovereign Crest)
    await page.setContent(conceptA_HTML);
    await page.screenshot({ path: path.join(outputDir, 'app_icon_512.png'), type: 'png' });

    // 4. Update Feature Graphic (1024x500 PNG) to Executive Standard
    const featureHTML = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 1024px; height: 500px;
            background: linear-gradient(135deg, #07090e 0%, #0f172a 50%, #05070a 100%);
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 80px; font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden;
        }
        .left-content { max-width: 600px; }
        .badge {
            background: rgba(251, 191, 36, 0.12); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.5);
            padding: 8px 22px; border-radius: 20px; font-size: 13px; font-weight: 800; letter-spacing: 3px;
            display: inline-block; margin-bottom: 20px; text-transform: uppercase;
        }
        h1 {
            color: #ffffff; font-size: 46px; font-weight: 900; line-height: 1.15; margin-bottom: 15px;
            letter-spacing: -0.5px;
        }
        h1 span {
            background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 50%, #aa771c 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        p { color: #94a3b8; font-size: 20px; line-height: 1.45; }
        .right-emblem {
            width: 290px; height: 290px; border-radius: 50px;
            background: radial-gradient(circle at 40% 30%, #1e293b 0%, #07090e 100%);
            border: 2px solid rgba(251, 191, 36, 0.4);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        }
        .right-emblem .crown { font-size: 100px; filter: drop-shadow(0 10px 20px rgba(251, 191, 36, 0.5)); }
        .right-emblem .text {
            color: #fbbf24; font-size: 20px; font-weight: 900; letter-spacing: 3px; margin-top: 5px;
        }
    </style>
    </head>
    <body>
        <div class="left-content">
            <div class="badge">OFFICIAL CIVIC CONCIERGE HUB</div>
            <h1>BERLIN <span>TERMINE PRO</span></h1>
            <p>Bürgeramt & Anmeldung Citas Automáticas. Alertas en tiempo real con estándar corporativo de alta precisión.</p>
        </div>
        <div class="right-emblem">
            <div class="crown">👑</div>
            <div class="text">EXECUTIVE</div>
        </div>
    </body>
    </html>
    `;

    await page.setViewport({ width: 1024, height: 500 });
    await page.setContent(featureHTML);
    await page.screenshot({ path: path.join(outputDir, 'feature_graphic_1024.png'), type: 'png' });

    await browser.close();
    console.log("All Ultra-Executive assets successfully rendered!");
}

renderExecutiveAssets().catch(err => {
    console.error("Executive rendering failed:", err);
    process.exit(1);
});
