const db = require('./database');

function runMigrations() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        subscription_tier TEXT DEFAULT 'free',
        email_verified INTEGER DEFAULT 0,
        verification_code TEXT,
        verification_expires_at DATETIME
      )`);
      db.run(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN verification_code TEXT`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN verification_expires_at DATETIME`, () => {});
      db.run(`CREATE TABLE IF NOT EXISTS video_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id TEXT UNIQUE NOT NULL,
        video_title TEXT,
        channel_name TEXT,
        result_json TEXT,
        analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS user_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        video_cache_id INTEGER,
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (video_cache_id) REFERENCES video_cache(id)
      )`, (err) => {
        if (err) reject(err);
        else { console.log('Migrations completed'); resolve(); }
      });
    });
  });
}

module.exports = runMigrations;
