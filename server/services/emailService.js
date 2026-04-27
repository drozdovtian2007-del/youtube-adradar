const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationCode(email, code) {
  if (!resend) {
    console.log(`📬 [DEV] Код для ${email}: ${code}`);
    return;
  }

  const from = process.env.EMAIL_FROM || 'YouTube AdRadar <onboarding@resend.dev>';

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'Код подтверждения YouTube AdRadar',
    html: `<div style="font-family:sans-serif;max-width:400px;margin:auto">
      <h2 style="color:#a855f7">YouTube AdRadar</h2>
      <p>Ваш код подтверждения:</p>
      <p style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e1b4b;background:#f3f4f6;padding:16px;text-align:center;border-radius:8px">${code}</p>
      <p style="color:#6b7280;font-size:13px">Код действителен 15 минут. Если вы не регистрировались — проигнорируйте это письмо.</p>
    </div>`
  });

  if (error) throw new Error(error.message || 'Resend send error');
}

module.exports = { sendVerificationCode, generateCode };
