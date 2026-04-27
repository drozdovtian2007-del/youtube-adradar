import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/');
    window.location.reload();
  }

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

      {/* right pill — links */}
      <div className="glass px-5 py-3 flex items-center gap-4 pointer-events-auto">
        {email ? (
          <>
            <Link to="/history" className="nav-link">История</Link>
            <span className="text-white/40 text-sm tracking-wide">{email}</span>
            <button onClick={logout} className="nav-link">Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Войти</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">Регистрация</Link>
          </>
        )}
      </div>
    </div>
  );
}
