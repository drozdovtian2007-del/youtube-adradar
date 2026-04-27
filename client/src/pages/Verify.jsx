import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyEmail, resendCode } from '../api';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || new URLSearchParams(location.search).get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await verifyEmail(email, code);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка подтверждения');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    setInfo('');
    try {
      await resendCode(email);
      setInfo('Новый код отправлен на почту');
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось отправить код');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="glass p-8 w-full max-w-md fade-up tilt">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">Подтверждение почты</h2>
        <p className="text-white/60 text-sm text-center mb-6">
          Мы отправили 6-значный код на <span className="text-white">{email || 'вашу почту'}</span>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!initialEmail && (
            <input className="input-glass" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          )}
          <input
            className="input-glass text-center tracking-[0.5em] text-xl"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            required
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {info && <p className="text-green-400 text-sm text-center">{info}</p>}
          <button className="btn-primary mt-2" type="submit" disabled={loading || code.length !== 6}>
            {loading ? 'Проверяем...' : 'Подтвердить'}
          </button>
        </form>
        <div className="flex justify-between text-sm mt-4">
          <button onClick={handleResend} disabled={resending || !email} className="text-purple-400 hover:text-purple-300 disabled:opacity-50">
            {resending ? 'Отправка...' : 'Отправить код снова'}
          </button>
          <Link to="/login" className="text-white/50 hover:text-white">Войти</Link>
        </div>
      </div>
    </div>
  );
}
