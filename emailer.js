const { Resend } = require('resend');
const nodemailer = require('nodemailer');
require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Send an email alert to multiple recipients using Resend or Nodemailer fallback
 */
async function sendAlert(dates, bookingUrl, recipientEmails = []) {
    if (!recipientEmails || recipientEmails.length === 0) {
        console.log('[Emailer] No recipients specified.');
        return false;
    }

    const datesFormatted = dates.map(d => `<li>📅 <strong>${d}</strong></li>`).join('');

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #334155;">
            <h2 style="color: #38bdf8; margin-top: 0;">⚡ ¡Nuevas Citas de Anmeldung Disponibles en Berlín!</h2>
            <p style="font-size: 16px; color: #cbd5e1;">¡Atención! Nuestro bot ha detectado turnos libres en el Bürgeramt de Berlín:</p>
            
            <ul style="font-size: 18px; color: #4ade80; background: #1e293b; padding: 15px 25px; border-radius: 8px; list-style-type: none;">
                ${datesFormatted}
            </ul>

            <p style="margin: 25px 0;">
                <a href="${bookingUrl}" target="_blank" style="background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">👉 Reservar Cita Ahora en Berlin.de</a>
            </p>

            <p style="font-size: 13px; color: #94a3b8; border-top: 1px solid #334155; padding-top: 15px;">
                💡 <em>Tip de Experto:</em> Las citas en Berlín vuelan en menos de 2 minutos. Si al hacer clic ya no está disponible, no te preocupes, el bot seguirá buscando por ti.
            </p>
            <p style="font-size: 11px; color: #64748b; text-align: center;">
                Enviado desde BerlinAnmeldung.com • Servicio de Alertas Automatizadas de Bürgeramt
            </p>
        </div>
    `;

    // 1. Try Resend API
    if (resend) {
        try {
            const data = await resend.emails.send({
                from: 'Berlin Termine Alerts <onboarding@resend.dev>',
                to: recipientEmails,
                subject: '⚡ ¡Cita de Anmeldung Encontrada en Berlín!',
                html: htmlContent,
            });
            console.log('[Resend Success] Alert emails sent via Resend API:', data);
            return true;
        } catch (err) {
            console.error('[Resend Error] Failed to send via Resend:', err.message);
        }
    }

    // 2. Nodemailer Fallback
    if (EMAIL_USER && EMAIL_APP_PASSWORD) {
        try {
            const isHotmail = EMAIL_USER.includes('@outlook') || EMAIL_USER.includes('@hotmail') || EMAIL_USER.includes('@live');
            const transporter = nodemailer.createTransport({
                service: isHotmail ? 'hotmail' : 'gmail',
                auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD }
            });

            const info = await transporter.sendMail({
                from: `"Berlin Termine Alerts" <${EMAIL_USER}>`,
                bcc: recipientEmails,
                subject: '⚡ ¡Cita de Anmeldung Encontrada en Berlín!',
                html: htmlContent
            });

            console.log(`[Nodemailer Success] Alert email sent! Message ID: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('[Nodemailer Error] Failed to send email:', error.message);
            return false;
        }
    }

    console.warn('[Emailer Simulator] Would send email alert to:', recipientEmails);
    return true;
}

module.exports = { sendAlert };
