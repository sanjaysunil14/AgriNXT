import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
    getDashboardStats,
    createBooking,
    getMyBookings,
    cancelBooking,
    getHistory,
    updatePaymentDetails,
    getProfile,
    getTodaysRoute
} from '../controllers/farmerController.js';
import { getFarmerInvoices } from '../controllers/invoiceController.js';

const router = express.Router();

// All farmer routes require authentication and FARMER role
router.use(verifyToken, requireRole('FARMER'));

// Dashboard
router.get('/stats', getDashboardStats);

// Bookings
router.post('/bookings', createBooking);
router.get('/bookings', getMyBookings);
router.get('/todays-route', getTodaysRoute);
router.put('/bookings/:id/cancel', cancelBooking);

// History
router.get('/history', getHistory);

// Invoices
router.get('/invoices', getFarmerInvoices);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updatePaymentDetails);

export default router;
