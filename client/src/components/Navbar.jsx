import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const token = localStorage.getItem('token');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/');
    window.location.reload();
  }

  return (
    <div className="fade-up fixed top-0 left-0 right-0 z-50 flex items-center justify-between mx-4 mt-4 pointer-events-none">
      <div className="glass px-5 py-3 pointer-events-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="logo-3d">📡</span>
          <span className="font-bold text-xl tracking-tight">
            <span className="brand-title">AdsRadar</span>
          </span>
        </Link>
      </div>

      <div className="glass px-4 py-2 pointer-events-auto flex items-center gap-3 text-sm">
        {token ? (
          <>
            <span className="text-white/70 hidden sm:inline">{email}</span>
            <button onClick={logout} className="text-purple-400 hover:text-purple-300">Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white/80 hover:text-white">Войти</Link>
            <span className="text-white/30">·</span>
            <Link to="/register" className="text-purple-400 hover:text-purple-300">Регистрация</Link>
          </>
        )}
      </div>
    </div>
  );
}
