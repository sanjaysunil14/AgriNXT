import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get farmer profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { farmer_profile: true }
        });

        if (!user || !user.farmer_profile) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        const farmerId = user.farmer_profile.id;

        // Get total revenue from invoices
        const invoices = await prisma.invoice.findMany({
            where: { farmer_id: userId }
        });

        const totalRevenue = invoices
            .filter(inv => inv.status === 'PAID')
            .reduce((sum, inv) => sum + inv.total_amount, 0);

        const pendingDues = invoices
            .filter(inv => inv.status === 'PENDING')
            .reduce((sum, inv) => sum + inv.total_amount, 0);

        // Get active bookings count
        const activeBookingsCount = await prisma.booking.count({
            where: {
                farmer_id: farmerId,
                status: {
                    in: ['PENDING', 'OPEN', 'ROUTED']
                }
            }
        });

        res.json({
            success: true,
            data: {
                total_revenue: totalRevenue,
                pending_dues: pendingDues,
                active_bookings_count: activeBookingsCount
            }
        });
    } catch (error) {
        console.error('Error getting farmer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard stats'
        });
    }
};

// Create Booking
export const createBooking = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { collection_date, vegetable_type, quantity_kg } = req.body;

        // Validation
        if (!collection_date || !vegetable_type || !quantity_kg) {
            return res.status(400).json({
                success: false,
                message: 'Collection date, vegetable type, and quantity are required'
            });
        }

        if (quantity_kg <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        // Check if date is in the past
        const collectionDate = new Date(collection_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (collectionDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Collection date cannot be in the past'
            });
        }

        // Get farmer profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { farmer_profile: true }
        });

        if (!user || !user.farmer_profile) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                farmer_id: user.farmer_profile.id,
                date: collectionDate,
                vegetable_type,
                quantity_kg: parseFloat(quantity_kg),
                status: 'PENDING'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: { booking }
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
};

// Get Farmer's Bookings
export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get farmer profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { farmer_profile: true }
        });

        if (!user || !user.farmer_profile) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        const farmerId = user.farmer_profile.id;

        // Get active bookings (not completed or cancelled)
        const bookings = await prisma.booking.findMany({
            where: {
                farmer_id: farmerId,
                status: {
                    in: ['PENDING', 'OPEN', 'ROUTED']
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        res.json({
            success: true,
            data: { bookings }
        });
    } catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookings'
        });
    }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        // Get farmer profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { farmer_profile: true }
        });

        if (!user || !user.farmer_profile) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        const farmerId = user.farmer_profile.id;

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check ownership
        if (booking.farmer_id !== farmerId) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own bookings'
            });
        }

        // Check if cancellable
        if (booking.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Only pending bookings can be cancelled. This booking has already been scheduled or completed.'
            });
        }

        // Cancel booking
        const cancelled = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status: 'CANCELLED' }
        });

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: { booking: cancelled }
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });
    }
};

// Get Booking History (Completed bookings)
export const getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get farmer profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { farmer_profile: true }
        });

        if (!user || !user.farmer_profile) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found'
            });
        }

        const farmerId = user.farmer_profile.id;

        // Get completed/cancelled bookings
        const history = await prisma.booking.findMany({
            where: {
                farmer_id: farmerId,
                status: {
                    in: ['COMPLETED', 'CANCELLED']
                }
            },
            orderBy: {
                updated_at: 'desc'
            }
        });

        res.json({
            success: true,
            data: { history }
        });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get booking history'
        });
    }
};

// Update Payment Details
export const updatePaymentDetails = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { payment_method, payment_value } = req.body;

        // Validation
        if (!payment_method || !payment_value) {
            return res.status(400).json({
                success: false,
                message: 'Payment method and value are required'
            });
        }

        if (!['UPI', 'BANK'].includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Payment method must be either UPI or BANK'
            });
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                payment_method,
                payment_value
            },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                email: true,
                payment_method: true,
                payment_value: true
            }
        });

        res.json({
            success: true,
            message: 'Payment details updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Error updating payment details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment details'
        });
    }
};

// Get Profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                email: true,
                latitude: true,
                longitude: true,
                payment_method: true,
                payment_value: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
};
