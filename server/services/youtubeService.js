const axios = require('axios');

const API_KEY = process.env.YOUTUBE_API_KEY;

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getVideoInfo(videoId) {
  const res = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      key: API_KEY,
      id: videoId,
      part: 'snippet'
    }
  });
  const item = res.data.items?.[0];
  if (!item) throw new Error('Видео не найдено');
  return {
    title: item.snippet.title,
    channelName: item.snippet.channelTitle,
    description: item.snippet.description
  };
}

async function getCaptions(videoId) {
  try {
    const { getSubtitles } = require('youtube-captions-scraper');
    const langs = ['ru', 'en'];
    for (const lang of langs) {
      try {
        const captions = await getSubtitles({ videoID: videoId, lang });
        if (captions && captions.length > 0) {
          return captions.map(c => `[${formatTime(c.start)}] ${c.text}`).join('\n');
        }
      } catch {}
    }
  } catch {}
  return '';
}

function formatTime(seconds) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

module.exports = { extractVideoId, getVideoInfo, getCaptions };
