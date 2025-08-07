import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add artificial delay in development mode
const addArtificialDelay = async () => {
  const delay = import.meta.env.VITE_API_DELAY;
  if (delay) {
    await new Promise(resolve => setTimeout(resolve, parseInt(delay)));
  }
};

// Request interceptor to add auth token and artificial delay
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    await addArtificialDelay();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/auth';
    }
    
    const errorMessage = error.response?.data?.message || '요청 처리 중 오류가 발생했습니다.';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;