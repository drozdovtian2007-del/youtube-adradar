const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');
const { sendVerificationCode, generateCode } = require('../services/emailService');

const CODE_TTL_MS = 15 * 60 * 1000;

async function issueAndSendCode(userId, email) {
  const code = generateCode();
  const expires = new Date(Date.now() + CODE_TTL_MS).toISOString();
  await pool.query('UPDATE users SET verification_code = $1, verification_expires_at = $2 WHERE id = $3', [code, expires, userId]);
  try {
    await sendVerificationCode(email, code);
  } catch (e) {
    console.error('Не удалось отправить email:', e.message);
  }
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });
    const { rows } = await pool.query('SELECT id, email_verified FROM users WHERE email = $1', [email]);
    const existing = rows[0];
    if (existing && existing.email_verified) return res.status(400).json({ error: 'Email уже занят' });

    const hash = await bcrypt.hash(password, 10);
    let userId;
    if (existing) {
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, existing.id]);
      userId = existing.id;
    } else {
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, 0) RETURNING id',
        [email, hash]
      );
      userId = result.rows[0].id;
    }
    await issueAndSendCode(userId, email);
    res.json({ needsVerification: true, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Неверный email или пароль' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Неверный email или пароль' });
    if (!user.email_verified) {
      await issueAndSendCode(user.id, user.email);
      return res.json({ needsVerification: true, email: user.email });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email и код обязательны' });
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Пользователь не найден' });
    if (user.email_verified) {
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.json({ token, email: user.email });
    }
    if (!user.verification_code || user.verification_code !== String(code).trim()) {
      return res.status(400).json({ error: 'Неверный код' });
    }
    if (user.verification_expires_at && new Date(user.verification_expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Срок действия кода истёк. Запросите новый.' });
    }
    await pool.query('UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = $1', [user.id]);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;
    const { rows } = await pool.query('SELECT id, email, email_verified FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Пользователь не найден' });
    if (user.email_verified) return res.status(400).json({ error: 'Email уже подтверждён' });
    await issueAndSendCode(user.id, user.email);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
