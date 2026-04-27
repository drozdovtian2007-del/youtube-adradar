import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const analyzeVideo = (url) => api.post('/analyze', { url });
export const getLimits = () => api.get('/analyze/limits');
