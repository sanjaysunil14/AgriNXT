import express from 'express';
import {
    getPendingUsers,
    approveUser,
    rejectUser
} from '../controllers/approvalController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All approval routes require authentication and ADMIN role
router.use(verifyToken, requireRole('ADMIN'));

// Get pending users
router.get('/pending', getPendingUsers);

// Approve user
router.put('/:id/approve', approveUser);

// Reject user
router.put('/:id/reject', rejectUser);

export default router;
