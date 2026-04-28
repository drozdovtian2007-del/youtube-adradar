const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationCode(email, code) {
  if (!transporter) {
    console.log(`📬 [DEV] Код для ${email}: ${code}`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `YouTube AdRadar <${from}>`,
    to: email,
    subject: 'Код подтверждения YouTube AdRadar',
    html: `<div style="font-family:sans-serif;max-width:400px;margin:auto">
      <h2 style="color:#a855f7">YouTube AdRadar</h2>
      <p>Ваш код подтверждения:</p>
      <p style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e1b4b;background:#f3f4f6;padding:16px;text-align:center;border-radius:8px">${code}</p>
      <p style="color:#6b7280;font-size:13px">Код действителен 15 минут. Если вы не регистрировались — проигнорируйте это письмо.</p>
    </div>`
  });
}

module.exports = { sendVerificationCode, generateCode };
