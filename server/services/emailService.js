const EMAIL_FROM = process.env.EMAIL_FROM || 'drozdovtian2007@gmail.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'YouTube AdRadar';

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

async function sendViaBrevo(email, code) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM },
      to: [{ email }],
      subject: 'Код подтверждения YouTube AdRadar',
      htmlContent: buildHtml(code)
    })
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Brevo ${resp.status}: ${text}`);
  }
}

async function sendViaResend(email, code) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: email,
      subject: 'Код подтверждения YouTube AdRadar',
      html: buildHtml(code)
    })
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Resend ${resp.status}: ${text}`);
  }
}

async function sendVerificationCode(email, code) {
  return sendViaBrevo(email, code);
}

module.exports = { sendVerificationCode, generateCode };
