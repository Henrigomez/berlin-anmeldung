const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Sends a Telegram notification for newly found Berlin Termine.
 * @param {string|number} chatId - Telegram chat ID or user handle
 * @param {Array} appointments - Available appointments
 */
async function sendTelegramAlert(chatId, appointments = []) {
    if (!chatId) {
        return { success: false, error: 'Invalid Chat ID' };
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const safeAppointments = Array.isArray(appointments) ? appointments : [];

    const messageText = `🚨 *BERLIN ANMELDUNG TERMIN GEFUNDEN!* 🚨\n\n` +
        `Es wurden soeben *${safeAppointments.length} freie Termine* im Bürgeramt gefunden:\n\n` +
        safeAppointments.map(apt => {
            const dateStr = apt?.date || 'Unbekanntes Datum';
            const timeStr = apt?.time || 'Ganztägig';
            const locStr = apt?.location || 'Bürgeramt Berlin';
            const linkStr = apt?.link || 'https://service.berlin.de/terminvereinbarung/termin/day/120686/';
            return `📅 *${dateStr}* um *${timeStr}*\n📍 Ort: ${locStr}\n🔗 [Hier Buchungsseite öffnen](${linkStr})`;
        }).join('\n\n') +
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
