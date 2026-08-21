const { Resend } = require('resend');
const nodemailer = require('nodemailer');
require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Send an email alert to multiple recipients using Resend or Nodemailer fallback
 */
async function sendAlert(dates, bookingUrl, recipientEmails = []) {
    if (!recipientEmails || recipientEmails.length === 0) {
        console.log('[Emailer] No recipients specified.');
        return false;
    }

    const datesFormatted = dates.map(d => `
        <div style="background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.3); padding: 14px 20px; border-radius: 10px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 16px; font-weight: 700; color: #34d399;">📅 ${d}</span>
            <span style="background: #10b981; color: #000; font-weight: 900; font-size: 11px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">DISPONIBLE</span>
        </div>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bürgeramt Appointment Alert</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #090d16; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 10px;">
                <tr>
                    <td align="center">
                        <!-- Main Card Container -->
                        <table width="100%" max-width="620" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background: #0f172a; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6); overflow: hidden;">
                            
                            <!-- Header Gradient Accent Bar -->
                            <tr>
                                <td style="height: 5px; background: linear-gradient(90deg, #38bdf8, #818cf8, #fbbf24);"></td>
                            </tr>

                            <!-- Header Section -->
                            <tr>
                                <td style="padding: 35px 35px 20px 35px; text-align: left;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td>
                                                <span style="font-size: 1.4rem; font-weight: 900; color: #f8fafc; letter-spacing: -0.5px;">
                                                    BERLIN<span style="color: #38bdf8;">ANMELDUNG</span>.COM
                                                </span>
                                            </td>
                                            <td align="right">
                                                <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 20px; text-transform: uppercase;">
                                                    ⚡ PRIORITY ALERT
                                                </span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Hero Body Content -->
                            <tr>
                                <td style="padding: 10px 35px 30px 35px; text-align: left;">
                                    <h1 style="color: #f8fafc; font-size: 24px; font-weight: 800; margin: 0 0 12px 0; line-height: 1.3;">
                                        ¡Nuevas Citas de Bürgeramt Disponibles en Berlín!
                                    </h1>
                                    <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                                        Nuestro escáner automatizado ha detectado cupos libres en tiempo real para tu trámite de <strong>Anmeldung</strong>:
                                    </p>

                                    <!-- Available Slots Grid -->
                                    ${datesFormatted}

                                    <!-- Action Button -->
                                    <div style="margin: 32px 0 25px 0; text-align: center;">
                                        <a href="${bookingUrl}" target="_blank" style="background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); color: #090d16; text-decoration: none; padding: 18px 36px; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(56, 189, 248, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                                            👉 Reservar Cita Ahora en Berlin.de ⚡
                                        </a>
                                    </div>

                                    <!-- Expert Advice Box -->
                                    <div style="background: rgba(30, 41, 59, 0.6); border-left: 4px solid #fbbf24; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 25px;">
                                        <p style="margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.5;">
                                            💡 <strong>Consejo del Fundador:</strong> Las citas en Berlín suelen agotarse en menos de 90 segundos. Si al hacer clic la cita ya fue reservada por otra persona, no te preocupes: nuestro bot continuará escaneando 24/7 por ti.
                                        </p>
                                    </div>
                                </td>
                            </tr>

                            <!-- Executive Signature Section -->
                            <tr>
                                <td style="padding: 25px 35px; background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.08);">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td style="width: 52px; vertical-align: top;">
                                                <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #38bdf8, #6366f1); border-radius: 50%; color: #000; font-weight: 900; font-size: 18px; line-height: 44px; text-align: center;">
                                                    HG
                                                </div>
                                            </td>
                                            <td style="vertical-align: top; padding-left: 10px;">
                                                <p style="margin: 0; color: #f8fafc; font-weight: 800; font-size: 15px;">Henri Gomez Amsatu</p>
                                                <p style="margin: 2px 0 0 0; color: #38bdf8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Founder & Chief Executive Officer (CEO)</p>
                                                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Berlin Termine Pro • <a href="https://berlinanmeldung.com" style="color: #64748b; text-decoration: underline;">BerlinAnmeldung.com</a></p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer Section -->
                            <tr>
                                <td style="padding: 20px 35px; background: #090d16; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                                    <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px;">
                                        © 2026 BerlinAnmeldung.com • Cloud Automated Bureaucracy Platform
                                    </p>
                                    <p style="margin: 0; color: #475569; font-size: 11px;">
                                        Berlin, Deutschland • <a href="https://berlinanmeldung.com/privacy.html" style="color: #64748b; text-decoration: underline;">Datenschutz</a> • <a href="https://berlinanmeldung.com/impressum.html" style="color: #64748b; text-decoration: underline;">Impressum</a>
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    // 1. Try Resend API
    if (resend) {
        try {
            const data = await resend.emails.send({
                from: 'Henri Gomez - BerlinAnmeldung <onboarding@resend.dev>',
                to: recipientEmails,
                subject: '⚡ ¡Cita de Bürgeramt Disponible en Berlín!',
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
                from: `"Henri Gomez Amsatu | BerlinAnmeldung" <${EMAIL_USER}>`,
                bcc: recipientEmails,
                subject: '⚡ ¡Cita de Bürgeramt Disponible en Berlín!',
                html: htmlContent
            });

            console.log(`[Nodemailer Success] Alert email sent! Message ID: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('[Nodemailer Error] Failed to send email:', error.message);
        }
    }

    console.warn('[Emailer Simulator] Would send luxury email alert to:', recipientEmails);
    return true;
}

module.exports = { sendAlert };
