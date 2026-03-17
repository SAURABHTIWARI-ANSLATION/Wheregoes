import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
