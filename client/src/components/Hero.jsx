import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeVideo } from '../api';
import Loader from './Loader';
import ResultCard from './ResultCard';
import { useToast } from './Toast';

export default function Hero() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!url.trim()) return;
    if (!localStorage.getItem('token')) {
      navigate('/register');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeVideo(url.trim());
      setResult(res.data);
      const count = res.data.ads.length;
      toast.show(
        count > 0 ? `Найдено ${count} рекламн${count === 1 ? 'ая интеграция' : count < 5 ? 'ые интеграции' : 'ых интеграций'}` : 'Реклама не найдена',
        count > 0 ? 'success' : 'info'
      );
    } catch (err) {
      toast.show(err.response?.data?.error || 'Ошибка анализа. Попробуйте снова.', 'error');
    } finally {
      setLoading(false);
    }
  }

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
        <div className="glass p-6 mb-8 fade-up tilt">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
            <input
              className="input-glass flex-1"
              placeholder="Вставь ссылку на YouTube видео..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <button className="btn-primary whitespace-nowrap" type="submit" disabled={loading || !url.trim()}>
              Анализировать
            </button>
          </form>
        </div>

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
