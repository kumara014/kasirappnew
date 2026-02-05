// Set this to your public ngrok URL when testing remotely (e.g., 'https://random-id.ngrok-free.app/api')
// Leave it as null or empty string to use local development addresses
const PUBLIC_API_URL = 'https://nonpestilential-nonexpediential-arya.ngrok-free.dev/api';

const isAndroid = window.location.hostname === 'localhost' && window.origin.includes('capacitor');
const host = isAndroid ? '10.0.2.2' : window.location.hostname;

const API_BASE_URL = PUBLIC_API_URL || `http://${host}:8000/api`;

// Helper to handle fetch with default ngrok headers
export const apiFetch = (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    };

    return fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
};

export default API_BASE_URL;
