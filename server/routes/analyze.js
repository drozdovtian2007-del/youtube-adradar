const express = require('express');
const router = express.Router();
const { extractVideoId, getVideoInfo, getCaptions } = require('../services/youtubeService');
const { analyzeAds } = require('../services/claudeService');
const { getCache, setCache } = require('../services/cacheService');
const { getRemaining, consume, DAILY_LIMIT } = require('../services/rateLimiter');

router.get('/limits', (req, res) => {
  res.json({ remaining: getRemaining(req), limit: DAILY_LIMIT });
});

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Укажите ссылку на видео' });

    const videoId = extractVideoId(url);
    if (!videoId) return res.status(400).json({ error: 'Не удалось распознать ID видео' });

    const cached = await getCache(videoId);
    if (cached) {
      return res.json({
        fromCache: true,
        remaining: getRemaining(req),
        limit: DAILY_LIMIT,
        videoId,
        videoTitle: cached.video_title,
        channelName: cached.channel_name,
        ads: JSON.parse(cached.result_json)
      });
    }

    if (!consume(req)) {
      return res.status(429).json({
        error: `Лимит ${DAILY_LIMIT} запросов в день исчерпан. Попробуйте завтра.`,
        remaining: 0,
        limit: DAILY_LIMIT
      });
    }

    const [videoInfo, captions] = await Promise.all([
      getVideoInfo(videoId),
      getCaptions(videoId)
    ]);

    const ads = await analyzeAds({ ...videoInfo, captions });

    await setCache(videoId, videoInfo.title, videoInfo.channelName, ads);

    res.json({
      fromCache: false,
      remaining: getRemaining(req),
      limit: DAILY_LIMIT,
      videoId,
      videoTitle: videoInfo.title,
      channelName: videoInfo.channelName,
      ads
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Ошибка анализа' });
  }
});

module.exports = router;
