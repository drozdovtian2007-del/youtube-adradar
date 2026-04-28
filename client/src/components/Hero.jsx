import React, { useState, useEffect, useRef } from 'react';
import { analyzeVideo, getLimits } from '../api';
import Loader from './Loader';
import ResultCard from './ResultCard';
import { useToast } from './Toast';

const SWEEP_S = 3; // sweep rotation duration (must match portal-sweep animation)

// Blips in the donut zone (r=36..48 % of portal radius, % coords from center)
const RADAR_BLIPS = [
  { angle: 18,  r: 42 }, { angle: 52,  r: 38 }, { angle: 83,  r: 45 },
  { angle: 118, r: 40 }, { angle: 147, r: 46 }, { angle: 173, r: 37 },
  { angle: 211, r: 43 }, { angle: 248, r: 41 }, { angle: 279, r: 47 },
  { angle: 312, r: 39 }, { angle: 341, r: 44 }, { angle: 65,  r: 36 },
  { angle: 195, r: 48 }, { angle: 298, r: 37 },
];

function blipStyle(angle, r) {
  const rad = (angle - 90) * (Math.PI / 180);
  const x = 50 + r * Math.cos(rad);
  const y = 50 + r * Math.sin(rad);
  const delay = -((angle / 360) * SWEEP_S);
  return {
    position: 'absolute',
    left: `${x}%`, top: `${y}%`,
    width: 6, height: 6,
    borderRadius: '50%',
    background: '#a78bfa',
    boxShadow: '0 0 8px #a78bfa',
    transform: 'translate(-50%, -50%)',
    animation: `radarBlip ${SWEEP_S}s linear infinite`,
    animationDelay: `${delay}s`,
    pointerEvents: 'none',
    zIndex: 8,
  };
}

export default function Hero() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [limit, setLimit] = useState(10);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    getLimits().then(r => {
      setRemaining(r.data.remaining);
      setLimit(r.data.limit);
    }).catch(() => {});
  }, []);

  async function handleAnalyze(e) {
    e?.preventDefault();
    if (!url.trim() || loading || remaining === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeVideo(url.trim());
      setResult(res.data);
      if (res.data.remaining !== undefined) setRemaining(res.data.remaining);
      const count = res.data.ads.length;
      toast.show(
        count > 0
          ? `Найдено ${count} рекламн${count === 1 ? 'ая интеграция' : count < 5 ? 'ые интеграции' : 'ых интеграций'}`
          : 'Реклама не найдена',
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
  const isLow = remaining !== null && remaining <= 2 && remaining > 0;
  const isEmpty = remaining === 0;
  const barColor = isEmpty ? 'bg-red-500' : isLow ? 'bg-red-400' : remaining <= 4 ? 'bg-yellow-400' : 'bg-purple-500';
  const isActive = inputFocused || url.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">

        {/* Title */}
        <div className="text-center mb-8 fade-up">
          <h1 className="text-6xl sm:text-7xl font-black mb-3 tracking-tight brand-heading">
            <span className="brand-title">AdsRadar</span>
          </h1>
          <p className="text-white/45 text-lg">Найди рекламные интеграции в любом YouTube видео</p>
        </div>

        {/* Portal wrapper — breathing room for outer rings */}
        <div className="fade-up" style={{ padding: '56px', marginBottom: '28px' }}>
          <div className="portal-wrap">

            {/* Outermost faint ring */}
            <div className="portal-ring-4" />

            {/* Ring 3 — pink, slow */}
            <div className="portal-ring-3" />
            {[0,1,2,3,4].map(i => (
              <div key={`p3-${i}`} style={{
                position:'absolute', inset:'-28px', borderRadius:'50%',
                animation:'portalSpin 22s linear infinite',
                animationDelay:`${-(i/5)*22}s`,
                pointerEvents:'none'
              }}>
                <div style={{
                  position:'absolute', width:5, height:5, borderRadius:'50%',
                  background:'#f472b6', top:-2.5, left:'calc(50% - 2.5px)',
                  boxShadow:'0 0 8px #f472b6, 0 0 3px rgba(255,255,255,0.6)'
                }}/>
              </div>
            ))}

            {/* Ring 2 — blue dashed, medium */}
            <div className={`portal-ring-2 ${isActive ? 'portal-ring-2-active' : ''}`} />
            {[0,1,2].map(i => (
              <div key={`p2-${i}`} style={{
                position:'absolute', inset:'-14px', borderRadius:'50%',
                animation:'portalSpin 12s linear infinite reverse',
                animationDelay:`${-(i/3)*12}s`,
                pointerEvents:'none'
              }}>
                <div style={{
                  position:'absolute', width:8, height:8, borderRadius:'50%',
                  background:'#60a5fa', top:-4, left:'calc(50% - 4px)',
                  boxShadow:'0 0 14px #60a5fa, 0 0 5px rgba(255,255,255,0.8)'
                }}/>
              </div>
            ))}

            {/* Main portal circle */}
            <div
              className={`portal-main${isActive ? ' portal-main-active' : ''}${loading ? ' portal-main-loading' : ''}`}
              onClick={() => inputRef.current?.focus()}
            >
              {/* Radar sweep */}
              <div className={`portal-sweep${loading ? ' portal-sweep-fast' : ''}`} />

              {/* Subtle inner rings */}
              <div className="portal-inner-ring-1" />
              <div className="portal-inner-ring-2" />

              {/* Radar blips — animate in sync with sweep */}
              {RADAR_BLIPS.map((b, i) => (
                <div key={`blip-${i}`} style={blipStyle(b.angle, b.r)} />
              ))}

              {/* Tick marks at 0/90/180/270° */}
              {[0,90,180,270].map(deg => (
                <div key={deg} style={{
                  position:'absolute', inset:0, pointerEvents:'none',
                  transform:`rotate(${deg}deg)`
                }}>
                  <div style={{
                    position:'absolute', top:6, left:'calc(50% - 1px)',
                    width:2, height:12,
                    background:'rgba(124,58,237,0.4)',
                    borderRadius:2
                  }}/>
                </div>
              ))}

              {/* Center content */}
              <div className="portal-content">
                <input
                  ref={inputRef}
                  className="portal-input"
                  placeholder="Вставь ссылку..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                  disabled={loading}
                />
                <button
                  className="portal-scan-btn"
                  onClick={handleAnalyze}
                  disabled={loading || !url.trim() || remaining === 0}
                >
                  {loading ? '...' : 'Анализировать'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Limit bar */}
        {remaining !== null && (
          <div className={`glass px-6 py-4 mb-6 w-full fade-up ${isLow || isEmpty ? 'limit-danger' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-base">Запросов сегодня</span>
                {(isLow || isEmpty) && (
                  <span className="limit-warn-badge">
                    {isEmpty ? '🚫 Лимит исчерпан' : '⚠️ Почти закончились'}
                  </span>
                )}
              </div>
              <span className={`limit-counter ${isEmpty ? 'text-red-400 limit-pulse' : isLow ? 'text-red-400 limit-pulse' : 'text-white'}`}>
                <span className="limit-num">{remaining}</span>
                <span className="text-white/30 text-xl"> / {limit}</span>
              </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor} ${(isLow || isEmpty) ? 'limit-bar-glow' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {isEmpty && (
              <p className="text-red-400/80 text-sm mt-2 text-center">Сброс произойдёт в полночь по UTC</p>
            )}
          </div>
        )}

        {loading && <Loader />}

        {/* Results */}
        {result && (
          <div className="glass p-6 fade-up w-full">
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
