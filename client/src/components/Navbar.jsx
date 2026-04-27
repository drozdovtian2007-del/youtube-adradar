import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className="fade-up fixed top-0 left-0 right-0 z-50 flex items-center justify-between mx-4 mt-4 pointer-events-none">
      {/* left pill — logo */}
      <div className="glass px-5 py-3 pointer-events-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="logo-3d">📡</span>
          <span className="font-bold text-xl tracking-tight">
            <span className="brand-title">AdsRadar</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
