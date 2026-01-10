import axios from 'axios';
import config from '../config.js';

// Create axios instance
const api = axios.create({
    baseURL: `${config.API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Enable sending cookies
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - cookies are sent automatically
api.interceptors.request.use(
    (config) => {
        // Token will be sent automatically via cookie with withCredentials: true
        // No need to manually add Authorization header
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the access token
                const response = await axios.post(
                    `${config.API_URL}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    // Cookie is set automatically by backend via Set-Cookie header
                    // No need to store in sessionStorage or update headers manually

                    // Process queued requests
                    processQueue(null, null);
                    isRefreshing = false;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed - logout user
                processQueue(refreshError, null);
                isRefreshing = false;

                // Only redirect if not already on login page to prevent infinite loop
                if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
                    window.location.href = '/';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
