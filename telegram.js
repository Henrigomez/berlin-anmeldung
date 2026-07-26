const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Sends a Telegram notification for newly found Berlin Termine.
 * @param {string|number} chatId - Telegram chat ID or user handle
 * @param {Array} appointments - Available appointments
 */
async function sendTelegramAlert(chatId, appointments) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const messageText = `🚨 *BERLIN ANMELDUNG TERMIN GEFUNDEN!* 🚨\n\n` +
        `Es wurden soeben *${appointments.length} freie Termine* im Bürgeramt gefunden:\n\n` +
        appointments.map(apt => `📅 *${apt.date}* um *${apt.time}*\n📍 Ort: ${apt.location || 'Bürgeramt Berlin'}\n🔗 [Hier Buchungsseite öffnen](${apt.link})`).join('\n\n') +
        `\n\n⚡ _Schnell buchen! Die Termine sind in ca. 60 Sekunden ausgebucht._`;

    if (!botToken || botToken.includes('YOUR_TELEGRAM')) {
        console.log(`[TELEGRAM SIMULATOR] Would send alert to Chat ID ${chatId}:\n${messageText}`);
        return { success: true, simulated: true };
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: messageText,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
        });
        console.log(`[TELEGRAM] Sent alert successfully to Chat ID ${chatId}`);
        return { success: true };
    } catch (error) {
        console.error(`[TELEGRAM ERROR] Failed to send message to ${chatId}:`, error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { sendTelegramAlert };
