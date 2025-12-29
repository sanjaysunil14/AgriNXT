import express from 'express';
import {
    getDashboardStats,
    getUsers,
    updateUser,
    toggleBanUser,
    deleteUser,
    getAuditLogs
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(verifyToken, requireRole('ADMIN'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.patch('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUser);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

export default router;
