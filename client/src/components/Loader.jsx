import React from 'react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center gap-6 py-14 fade-up">
      <div className="radar-3d">
        <div className="ring" />
        <div className="ring" />
        <div className="ring" />
        <div className="sweep" />
        <div className="dot" />
      </div>
      <p className="text-white/70 text-sm tracking-wide">Сканируем видео радаром AdsRadar...</p>
    </div>
  );
}
