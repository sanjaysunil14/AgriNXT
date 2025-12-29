import express from 'express';
import {
    getPendingUsers,
    approveUser,
    rejectUser
} from '../controllers/approvalController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();


router.use(verifyToken, requireRole('ADMIN'));


router.get('/pending', getPendingUsers);


router.put('/:id/approve', approveUser);


router.put('/:id/reject', rejectUser);

export default router;
