import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_URL is not defined in environment variables');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const response = await api.get('/');
  return response.data;
};

export const executeQuery = async (query) => {
  const response = await api.post('/api/query', { query });
  return response.data;
};

export const getAllTables = async () => {
  const response = await api.get('/api/tables');
  return response.data;
};

export const getTableDetails = async (tableName) => {
  const response = await api.get(`/api/tables/${tableName}`);
  return response.data;
};

export default api;
