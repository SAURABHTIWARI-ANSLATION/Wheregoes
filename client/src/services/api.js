import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost 
  ? 'http://localhost:5001/api' 
  : (import.meta.env.VITE_API_URL || 'https://wheregoes.onrender.com/api');

console.log('🌐 Connected to Backend at:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkUrl(url) {
  try {
    const response = await api.post('/check', { url });
    return { data: response.data, error: null };
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return { data: null, error: 'Request timed out. Please try again.' };
    }
    if (!err.response) {
      return { data: null, error: 'Cannot connect to server. Make sure the backend is running.' };
    }
    const message = err.response?.data?.error || 'An unknown error occurred.';
    return { data: null, error: message };
  }
}

export default api;
