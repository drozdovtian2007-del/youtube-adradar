import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await register(email, password);
      if (res.data.needsVerification) {
        navigate('/verify', { state: { email: res.data.email } });
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="glass p-8 w-full max-w-md fade-up tilt">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Регистрация</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="input-glass" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input-glass" type="password" placeholder="Пароль (минимум 6 символов)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button className="btn-primary mt-2" type="submit" disabled={loading}>{loading ? 'Регистрируем...' : 'Зарегистрироваться'}</button>
        </form>
        <p className="text-white/50 text-sm text-center mt-4">
          Уже есть аккаунт? <Link to="/login" className="text-purple-400 hover:text-purple-300">Войти</Link>
        </p>
      </div>
    </div>
  );
}
