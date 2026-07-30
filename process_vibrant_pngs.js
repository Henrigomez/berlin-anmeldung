const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function processVibrantPNGs() {
    const artifactDir = 'C:\\Users\\henry\\.gemini\\antigravity\\brain\\fb1c965d-f719-4f76-a744-ec817e4aae54';
    const outputDir = path.join(__dirname, 'public', 'play_assets');
    fs.mkdirSync(outputDir, { recursive: true });

    const crownJpg = path.join(artifactDir, 'app_icon_vibrant_crown_1785435392520.jpg');
    const keyJpg = path.join(artifactDir, 'app_icon_vibrant_key_1785435402644.jpg');

    // 1. Crown 3D PNG -> 512x512
    const crownImg = await Jimp.read(crownJpg);
    crownImg.resize({ w: 512, h: 512 });
    await crownImg.write(path.join(outputDir, 'app_icon_vibrant_crown.png'));
    console.log("App Icon Vibrant Crown 512x512 PNG processed.");

    // 2. Key 3D PNG -> 512x512
    const keyImg = await Jimp.read(keyJpg);
    keyImg.resize({ w: 512, h: 512 });
    await keyImg.write(path.join(outputDir, 'app_icon_vibrant_key.png'));
    console.log("App Icon Vibrant Key 512x512 PNG processed.");

    // 3. Set default app_icon_512.png to Crown 3D PNG
    await crownImg.write(path.join(outputDir, 'app_icon_512.png'));
    console.log("Default app_icon_512.png updated with vibrant crown 3D PNG.");
}

processVibrantPNGs().catch(err => {
    console.error("Processing failed:", err);
    process.exit(1);
});
