/**
 * API Configuration and Axios instance
 * Centralized HTTP client for all API calls
 */
import axios from 'axios';

// API base URL from environment or default
const API_URL = import.meta.env.VITE_API_URL || 'https://everyaio-production.up.railway.app';

// Create axios instance with defaults
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
    (config) => {
        // Could add auth token here in the future
        // const token = localStorage.getItem('token');
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
export { API_URL };
