const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function analyzeAds({ title, channelName, description, captions }) {
  const text = [
    `Название видео: ${title}`,
    `Канал: ${channelName}`,
    `Описание:\n${description}`,
    captions ? `Субтитры:\n${captions}` : ''
  ].filter(Boolean).join('\n\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Ты анализируешь YouTube видео и находишь рекламные интеграции (спонсоров).

Проанализируй текст ниже и найди все рекламные интеграции. Для каждой верни JSON объект.

Верни ТОЛЬКО валидный JSON массив без пояснений, в формате:
[
  {
    "company": "Название компании",
    "website": "официальный сайт (домен)",
    "timestamp": "временная метка из субтитров или null",
    "category": "категория (VPN / Игры / Финансы / Одежда / Еда / Образование / Другое)",
    "description": "краткое описание интеграции (1 предложение)"
  }
]

Если рекламных интеграций нет — верни пустой массив [].

Текст для анализа:
${text}`
      }
    ]
  });

  const raw = message.content[0].text.trim();
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
}

module.exports = { analyzeAds };
