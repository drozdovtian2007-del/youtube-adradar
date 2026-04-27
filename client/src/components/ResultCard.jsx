import React from 'react';

const categoryColors = {
  VPN: 'bg-blue-500/20 text-blue-300',
  Игры: 'bg-green-500/20 text-green-300',
  Финансы: 'bg-yellow-500/20 text-yellow-300',
  Одежда: 'bg-pink-500/20 text-pink-300',
  Еда: 'bg-orange-500/20 text-orange-300',
  Образование: 'bg-cyan-500/20 text-cyan-300',
  Другое: 'bg-gray-500/20 text-gray-300',
};

export default function ResultCard({ ad }) {
  const domain = ad.website?.replace(/^https?:\/\//, '').replace(/\/.*/, '');
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
  const badgeClass = categoryColors[ad.category] || categoryColors['Другое'];

  return (
    <div className="glass-dark tilt fade-up p-5 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {faviconUrl
          ? <img src={faviconUrl} alt={ad.company} className="w-8 h-8" onError={e => e.target.style.display='none'} />
          : <span className="text-2xl">🏢</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-white font-semibold text-lg">{ad.company}</h3>
          <span className={`badge ${badgeClass}`}>{ad.category}</span>
          {ad.timestamp && (
            <span className="badge bg-purple-500/20 text-purple-300">{ad.timestamp}</span>
          )}
        </div>
        {ad.website && (
          <a
            href={ad.website.startsWith('http') ? ad.website : `https://${ad.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 text-sm mt-1 inline-block transition-colors"
          >
            {domain}
          </a>
        )}
        {ad.description && (
          <p className="text-white/50 text-sm mt-1">{ad.description}</p>
        )}
      </div>
    </div>
  );
}
