import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
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

// Add token to requests automatically
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
                    'http://localhost:5000/api/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    const newAccessToken = response.data.data.accessToken;

                    // Store new access token
                    sessionStorage.setItem('accessToken', newAccessToken);

                    // Update authorization header
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    // Process queued requests
                    processQueue(null, newAccessToken);
                    isRefreshing = false;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed - logout user
                processQueue(refreshError, null);
                isRefreshing = false;

                sessionStorage.removeItem('accessToken');
                window.location.href = '/';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
