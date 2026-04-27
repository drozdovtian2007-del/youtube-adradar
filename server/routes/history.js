const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  db.all(`
    SELECT vc.video_id, vc.video_title, vc.channel_name, vc.result_json, uh.requested_at
    FROM user_history uh
    JOIN video_cache vc ON uh.video_cache_id = vc.id
    WHERE uh.user_id = ?
    ORDER BY uh.requested_at DESC
    LIMIT 50
  `, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ ...r, ads: JSON.parse(r.result_json) })));
  });
});

module.exports = router;
