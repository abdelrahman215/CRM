import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('avenue_crm_auth');
  if (stored) {
    const { accessToken } = JSON.parse(stored);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('avenue_crm_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

