const pool = require('./database');

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        subscription_tier TEXT DEFAULT 'free',
        email_verified INTEGER DEFAULT 0,
        verification_code TEXT,
        verification_expires_at TIMESTAMPTZ
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS video_cache (
        id SERIAL PRIMARY KEY,
        video_id TEXT UNIQUE NOT NULL,
        video_title TEXT,
        channel_name TEXT,
        result_json TEXT,
        analyzed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        video_cache_id INTEGER REFERENCES video_cache(id),
        requested_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Migrations completed');
  } finally {
    client.release();
  }
}

module.exports = runMigrations;
