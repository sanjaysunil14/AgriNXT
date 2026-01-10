// Environment configuration
const config = {
    // In production (Docker), use the container's backend URL
    // In development, use localhost:5000
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
};

export default config;
