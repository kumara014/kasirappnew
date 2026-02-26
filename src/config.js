// Set your production/staging API URL in .env as: VITE_API_URL=https://your-domain.com/api
// For local development it defaults to http://127.0.0.1:8000/api
const PUBLIC_API_URL = import.meta.env.VITE_API_URL || '';

// Check if running in Capacitor on Android
const isAndroid = window.Capacitor && window.Capacitor.getPlatform() === 'android';
const host = isAndroid ? '10.0.2.2' : window.location.hostname;

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Priority: env var > android fallback > local > domain
const API_BASE_URL = PUBLIC_API_URL
    ? PUBLIC_API_URL
    : isAndroid
        ? `http://10.0.2.2:8000/api`
        : isLocal
            ? `http://127.0.0.1:8000/api`
            : `http://${host}:8000/api`;

// Helper to handle fetch with default ngrok headers
export const apiFetch = (endpoint, options = {}) => {
    // If endpoint is just a path (starts with /), prepend API_BASE_URL
    // If it's a full URL, use it as is
    const isFullUrl = endpoint.startsWith('http');
    const url = isFullUrl
        ? endpoint
        : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    // Auto-detect FormData to omit Content-Type (Fetch will set it with boundary)
    const isFormData = options.body instanceof FormData;

    const token = localStorage.getItem('pos_token');
    const defaultHeaders = {
        'Accept': 'application/json'
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // ALWAYS send the ngrok bypass header if the target URL is an ngrok URL
    // irrespective of whether we are 'local' or not.
    if (url.includes('ngrok') || url.includes('ngrok-free.app')) {
        defaultHeaders['ngrok-skip-browser-warning'] = 'true';
    }

    if (!isFormData) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    return fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
};

export default API_BASE_URL;
