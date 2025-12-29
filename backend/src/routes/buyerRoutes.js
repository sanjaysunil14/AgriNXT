import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
    getRoute,
    collectProduce,
    setDailyPrices,
    getDues,
    recordPayment
} from '../controllers/buyerController.js';

const router = express.Router();

// All buyer routes require authentication and BUYER role
router.use(verifyToken, requireRole('BUYER'));

// Field Operations
router.get('/route', getRoute);
router.post('/collect', collectProduce);

// Office Operations
router.post('/set-daily-prices', setDailyPrices);
router.get('/dues', getDues);
router.post('/pay', recordPayment);

export default router;
