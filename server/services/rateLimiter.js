const DAILY_LIMIT = 10;

// ip -> { count, resetAt }
const store = new Map();

function getKey(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
}

function getEntry(ip) {
  const now = Date.now();
  let entry = store.get(ip);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: startOfNextDay() };
    store.set(ip, entry);
  }
  return entry;
}

function startOfNextDay() {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime();
}

function getRemaining(req) {
  const ip = getKey(req);
  const entry = getEntry(ip);
  return Math.max(0, DAILY_LIMIT - entry.count);
}

function consume(req) {
  const ip = getKey(req);
  const entry = getEntry(ip);
  if (entry.count >= DAILY_LIMIT) return false;
  entry.count++;
  return true;
}

module.exports = { getRemaining, consume, DAILY_LIMIT };
