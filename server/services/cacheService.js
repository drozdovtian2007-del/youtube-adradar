const db = require('../db/database');

function getCache(videoId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM video_cache WHERE video_id = ?', [videoId], (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}

function setCache(videoId, videoTitle, channelName, resultJson) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT OR REPLACE INTO video_cache (video_id, video_title, channel_name, result_json) VALUES (?, ?, ?, ?)',
      [videoId, videoTitle, channelName, JSON.stringify(resultJson)],
      function(err) {
        if (err) return reject(err);
        db.get('SELECT * FROM video_cache WHERE video_id = ?', [videoId], (err2, row) => {
          if (err2) reject(err2); else resolve(row);
        });
      }
    );
  });
}

function saveHistory(userId, videoCacheId) {
  if (!userId) return Promise.resolve();
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO user_history (user_id, video_cache_id) VALUES (?, ?)', [userId, videoCacheId], (err) => {
      if (err) reject(err); else resolve();
    });
  });
}

module.exports = { getCache, setCache, saveHistory };
