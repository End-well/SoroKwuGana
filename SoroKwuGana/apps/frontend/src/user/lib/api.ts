import axios from 'axios';

// Always use a relative base so the Vite dev-server proxy handles /api → localhost:4000
// In production, set VITE_API_URL to your deployed backend URL
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default api;
