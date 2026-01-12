import express from 'express';
import { register, login } from '../controllers/authController.js';
import { refreshAccessToken, logout } from '../controllers/refreshTokenController.js';
import { getCurrentUser } from '../controllers/userController.js';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register, getCurrentUser);

// POST /api/auth/login - Login user
router.post('/login', login, getCurrentUser);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshAccessToken);

// POST /api/auth/logout - Logout and clear refresh token
router.post('/logout', logout);

export default router;
