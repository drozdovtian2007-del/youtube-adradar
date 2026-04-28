const nodemailer = require('nodemailer');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'YouTube AdRadar <onboarding@resend.dev>';

let transporter = null;
if (!RESEND_API_KEY && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildHtml(code) {
  return `<div style="font-family:sans-serif;max-width:400px;margin:auto">
    <h2 style="color:#a855f7">YouTube AdRadar</h2>
    <p>Ваш код подтверждения:</p>
    <p style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e1b4b;background:#f3f4f6;padding:16px;text-align:center;border-radius:8px">${code}</p>
    <p style="color:#6b7280;font-size:13px">Код действителен 15 минут. Если вы не регистрировались — проигнорируйте это письмо.</p>
  </div>`;
}

async function sendVerificationCode(email, code) {
  if (RESEND_API_KEY) {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: email,
        subject: 'Код подтверждения YouTube AdRadar',
        html: buildHtml(code)
      })
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Resend ${resp.status}: ${text}`);
    }
    return;
  }

  if (transporter) {
    await transporter.sendMail({
      from: `YouTube AdRadar <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Код подтверждения YouTube AdRadar',
      html: buildHtml(code)
    });
    return;
  }

  console.log(`📬 [DEV] Код для ${email}: ${code}`);
}

module.exports = { sendVerificationCode, generateCode };
