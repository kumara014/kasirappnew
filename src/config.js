// Set this to your public ngrok URL when testing on a REAL DEVICE or EMULATOR
const PUBLIC_API_URL = 'https://nonpestilential-nonexpediential-arya.ngrok-free.dev/api';

// Check if running in Capacitor on Android
const isAndroid = window.Capacitor && window.Capacitor.getPlatform() === 'android';
const host = isAndroid ? '10.0.2.2' : window.location.hostname;

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// We prefer the Public API URL (Ngrok) for Android to avoid local network issues,
// unless it's not set, then try 10.0.2.2 for emulator
const API_BASE_URL = isAndroid
    ? (PUBLIC_API_URL || `http://10.0.2.2:8000/api`)
    : (isLocal ? `http://127.0.0.1:8000/api` : (PUBLIC_API_URL || `http://${host}:8000/api`));

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

    const defaultHeaders = {
        'Accept': 'application/json'
    };

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
