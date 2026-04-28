import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const analyzeVideo = (url) => api.post('/analyze', { url });
export const getLimits = () => api.get('/analyze/limits');

export const register = (email, password) => api.post('/auth/register', { email, password });
export const login = (email, password) => api.post('/auth/login', { email, password });
export const verifyEmail = (email, code) => api.post('/auth/verify', { email, code });
export const resendCode = (email) => api.post('/auth/resend', { email });
