const express = require('express');
const router = express.Router();
const { extractVideoId, getVideoInfo, getCaptions } = require('../services/youtubeService');
const { analyzeAds } = require('../services/claudeService');
const { getCache, setCache } = require('../services/cacheService');
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
        videoId,
        videoTitle: cached.video_title,
        channelName: cached.channel_name,
        ads: JSON.parse(cached.result_json)
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
