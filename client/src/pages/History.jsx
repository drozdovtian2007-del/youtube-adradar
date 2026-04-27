import React, { useEffect, useState } from 'react';
import { getHistory } from '../api';
import ResultCard from '../components/ResultCard';
import { Link } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getHistory().then(r => setHistory(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = history.filter(item =>
    item.video_title?.toLowerCase().includes(search.toLowerCase()) ||
    item.channel_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/60 pt-20">Загрузка...</div>;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-3xl font-bold">История запросов</h1>
          <Link to="/" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">← Назад</Link>
        </div>

        {history.length > 0 && (
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">🔍</span>
            <input
              className="input-glass pl-10"
              placeholder="Поиск по названию или каналу..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {filtered.length === 0 && history.length > 0 ? (
          <div className="glass p-12 text-center text-white/40">
            <div className="text-5xl mb-4">🔍</div>
            <p>Ничего не найдено по запросу «{search}»</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass p-12 text-center text-white/40">
            <div className="text-5xl mb-4">📋</div>
            <p>История пуста. Проанализируйте первое видео!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map((item, i) => (
              <div key={i} className="glass p-6">
                <div className="mb-4">
                  <a
                    href={`https://www.youtube.com/watch?v=${item.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-white font-semibold hover:text-purple-300 transition-colors"
                  >
                    <span className="group-hover:underline underline-offset-2">{item.video_title}</span>
                    <span className="text-white/30 text-xs group-hover:text-purple-400 transition-colors">↗</span>
                  </a>
                  <p className="text-white/40 text-sm mt-1">{item.channel_name} · {new Date(item.requested_at).toLocaleDateString('ru')}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {item.ads.map((ad, j) => <ResultCard key={j} ad={ad} />)}
                  {item.ads.length === 0 && <p className="text-white/30 text-sm">Реклама не найдена</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
