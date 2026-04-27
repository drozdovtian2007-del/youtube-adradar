const pool = require('../db/database');

async function getCache(videoId) {
  const { rows } = await pool.query('SELECT * FROM video_cache WHERE video_id = $1', [videoId]);
  return rows[0] || null;
}

async function setCache(videoId, videoTitle, channelName, resultJson) {
  const { rows } = await pool.query(
    `INSERT INTO video_cache (video_id, video_title, channel_name, result_json)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (video_id) DO UPDATE SET result_json = EXCLUDED.result_json, analyzed_at = NOW()
     RETURNING *`,
    [videoId, videoTitle, channelName, JSON.stringify(resultJson)]
  );
  return rows[0];
}

async function saveHistory(userId, videoCacheId) {
  if (!userId) return;
  await pool.query('INSERT INTO user_history (user_id, video_cache_id) VALUES ($1, $2)', [userId, videoCacheId]);
}

module.exports = { getCache, setCache, saveHistory };
