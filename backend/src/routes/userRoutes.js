import express from 'express';
import { getCurrentUser } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/me - Get current user profile
router.get('/me', verifyToken, getCurrentUser);

export default router;
