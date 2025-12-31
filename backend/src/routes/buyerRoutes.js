import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
    getRoute,
    collectProduce,
    getUnpricedCollections,
    getDailyPrices,
    getDues,
    recordPayment,
    createPlannedRoute
} from '../controllers/buyerController.js';
import { getBuyerInvoices } from '../controllers/invoiceController.js';

const router = express.Router();

// All buyer routes require authentication and BUYER role
router.use(verifyToken, requireRole('BUYER'));

// Field Operations
router.get('/route', getRoute);
router.post('/route/plan', createPlannedRoute);
router.post('/collect', collectProduce);

// Office Operations
router.get('/unpriced-collections', getUnpricedCollections);
router.get('/daily-prices', getDailyPrices); // Read-only price viewing
router.get('/dues', getDues);
router.post('/pay', recordPayment);

// Invoices
router.get('/invoices', getBuyerInvoices);

export default router;
