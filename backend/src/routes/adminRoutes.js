import express from 'express';
import {
    getDashboardStats,
    getUsers,
    updateUser,
    toggleBanUser,
    deleteUser,
    getAuditLogs,
    getUnpricedCollections,
    setDailyPrices,
    getAllInvoices,
    downloadInvoicePDF
} from '../controllers/adminController.js';
import {
    getProfitSummary,
    updateDeliveryRate,
    updateSellingPrice,
    getSellingPrices,
    getDailyPrices,
    getConfig
} from '../controllers/profitabilityController.js';
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

// Pricing & Invoices (Admin only)
router.get('/unpriced-collections', getUnpricedCollections);
router.post('/set-daily-prices', setDailyPrices);
router.get('/invoices', getAllInvoices);
router.get('/invoices/:id/download', downloadInvoicePDF);

// Profitability Analysis
router.get('/profit-summary', getProfitSummary);
router.post('/update-delivery-rate', updateDeliveryRate);
router.post('/update-selling-price', updateSellingPrice);
router.get('/selling-prices', getSellingPrices);
router.get('/daily-prices', getDailyPrices);
router.get('/system-config', getConfig);

export default router;
