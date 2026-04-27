import React, { useState, useEffect } from 'react';
import { analyzeVideo, getLimits } from '../api';
import Loader from './Loader';
import ResultCard from './ResultCard';
import { useToast } from './Toast';

export default function Hero() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [limit, setLimit] = useState(10);
  const toast = useToast();

  useEffect(() => {
    getLimits().then(r => {
      setRemaining(r.data.remaining);
      setLimit(r.data.limit);
    }).catch(() => {});
  }, []);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeVideo(url.trim());
      setResult(res.data);
      if (res.data.remaining !== undefined) setRemaining(res.data.remaining);
      const count = res.data.ads.length;
      toast.show(
        count > 0 ? `Найдено ${count} рекламн${count === 1 ? 'ая интеграция' : count < 5 ? 'ые интеграции' : 'ых интеграций'}` : 'Реклама не найдена',
        count > 0 ? 'success' : 'info'
      );
    } catch (err) {
      const data = err.response?.data;
      if (data?.remaining !== undefined) setRemaining(data.remaining);
      toast.show(data?.error || 'Ошибка анализа. Попробуйте снова.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const pct = remaining !== null ? Math.round((remaining / limit) * 100) : null;
  const barColor = remaining === 0 ? 'bg-red-500' : remaining <= 3 ? 'bg-yellow-400' : 'bg-purple-500';

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <div className="text-7xl mb-4 float-y inline-block logo-3d">📡</div>
          <h1 className="text-6xl font-bold mb-4 tracking-tight">
            <span className="brand-title">AdsRadar</span>
          </h1>
          <p className="text-white/70 text-xl">Найди все рекламные интеграции в любом YouTube видео</p>
        </div>

        {/* Input */}
        <div className="glass p-6 mb-4 fade-up tilt">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
            <input
              className="input-glass flex-1"
              placeholder="Вставь ссылку на YouTube видео..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <button className="btn-primary whitespace-nowrap" type="submit" disabled={loading || !url.trim() || remaining === 0}>
              Анализировать
            </button>
          </form>
        </div>

        {/* Limit bar */}
        {remaining !== null && (
          <div className="glass px-5 py-3 mb-8 fade-up flex items-center gap-4">
            <span className="text-white/50 text-sm whitespace-nowrap">
              Запросов сегодня: <span className={remaining === 0 ? 'text-red-400' : 'text-white'}>{remaining}</span> / {limit}
            </span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {remaining === 0 && (
              <span className="text-red-400 text-xs whitespace-nowrap">Сброс в полночь UTC</span>
            )}
          </div>
        )}

        {loading && <Loader />}

        {/* Results */}
        {result && (
          <div className="glass p-6 fade-up">
            <div className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-white font-semibold text-lg">{result.videoTitle}</h2>
                  <p className="text-white/50 text-sm">{result.channelName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {result.fromCache && (
                    <span className="badge bg-green-500/20 text-green-300">из кеша</span>
                  )}
                  <span className="badge bg-purple-500/20 text-purple-300">
                    {result.ads.length} реклам{result.ads.length === 1 ? 'а' : result.ads.length < 5 ? 'ы' : ''}
                  </span>
                </div>
              </div>
            </div>

            {result.ads.length === 0 ? (
              <div className="text-center text-white/40 py-8">
                <div className="text-4xl mb-3">🔍</div>
                <p>Рекламные интеграции не найдены</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {result.ads.map((ad, i) => <ResultCard key={i} ad={ad} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
