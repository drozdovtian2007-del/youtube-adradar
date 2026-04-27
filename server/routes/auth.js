const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { sendVerificationCode, generateCode } = require('../services/emailService');

function dbGet(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
  });
}
function dbRun(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) { if (err) reject(err); else resolve(this); });
  });
}

const CODE_TTL_MS = 15 * 60 * 1000;

async function issueAndSendCode(userId, email) {
  const code = generateCode();
  const expires = new Date(Date.now() + CODE_TTL_MS).toISOString();
  await dbRun('UPDATE users SET verification_code = ?, verification_expires_at = ? WHERE id = ?', [code, expires, userId]);
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
    const existing = await dbGet('SELECT id, email_verified FROM users WHERE email = ?', [email]);
    if (existing && existing.email_verified) return res.status(400).json({ error: 'Email уже занят' });

    const hash = await bcrypt.hash(password, 10);
    let userId;
    if (existing) {
      await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [hash, existing.id]);
      userId = existing.id;
    } else {
      const result = await dbRun('INSERT INTO users (email, password_hash, email_verified) VALUES (?, ?, 0)', [email, hash]);
      userId = result.lastID;
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
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
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
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
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
    await dbRun('UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = ?', [user.id]);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await dbGet('SELECT id, email, email_verified FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Пользователь не найден' });
    if (user.email_verified) return res.status(400).json({ error: 'Email уже подтверждён' });
    await issueAndSendCode(user.id, user.email);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
