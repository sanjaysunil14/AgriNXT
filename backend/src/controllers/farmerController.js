import { PrismaClient } from '@prisma/client';
import { logAuditAction } from '../utils/auditLogger.js';

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
            console.log(user)
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
            .reduce((sum, inv) => sum + inv.grand_total, 0);

        const pendingDues = invoices
            .filter(inv => inv.status === 'PENDING')
            .reduce((sum, inv) => sum + inv.grand_total, 0);

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
        if (!collection_date || !vegetable_type) {
            return res.status(400).json({
                success: false,
                message: 'Collection date and vegetable type are required'
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

        // Log audit action
        await logAuditAction(
            userId,
            'FARMER',
            'BOOKING_CREATED',
            null,
            `Farmer ${user.full_name} created a booking for ${collectionDate.toLocaleDateString()}`,
            req.ip
        );

        res.status(201).json({
            success: true,
            message: 'Booking created successfully. Actual quantity will be recorded during collection.',
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

        // Check departure time window (2 hours before departure)
        const departureHour = parseInt(process.env.DEPARTURE_TIME_HOUR || '12');
        const bookingDate = new Date(booking.date);
        const departureTime = new Date(bookingDate);
        departureTime.setHours(departureHour, 0, 0, 0);

        // Calculate cutoff time (2 hours before departure)
        const cutoffTime = new Date(departureTime);
        cutoffTime.setHours(departureTime.getHours() - 2);

        const now = new Date();

        // Only check time window if booking is for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDateOnly = new Date(bookingDate);
        bookingDateOnly.setHours(0, 0, 0, 0);

        if (bookingDateOnly.getTime() === today.getTime() && now >= cutoffTime) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel booking within 2 hours of departure time (${departureHour}:00). Cancellation deadline was ${cutoffTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`
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

        // Get completed/cancelled bookings with collection chit data
        const history = await prisma.booking.findMany({
            where: {
                farmer_id: farmerId,
                status: {
                    in: ['COMPLETED', 'CANCELLED']
                }
            },
            include: {
                route_stops: {
                    include: {
                        collection_chit: {
                            include: {
                                collection_items: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updated_at: 'desc'
            }
        });

        // Transform the data to include actual collected weights
        const transformedHistory = history.map(booking => {
            const routeStop = booking.route_stops[0]; // Get first route stop
            const collectionChit = routeStop?.collection_chit;

            // If there's a collection chit, use its data
            if (collectionChit && collectionChit.collection_items.length > 0) {
                // Get total weight and vegetable summary from collection items
                const totalWeight = collectionChit.total_weight;
                const vegetables = collectionChit.collection_items
                    .map(item => `${item.vegetable_name} (${item.weight.toFixed(2)} kg)`)
                    .join(', ');

                return {
                    id: booking.id,
                    date: booking.date,
                    vegetable_type: booking.vegetable_type,
                    vegetables_summary: vegetables,
                    quantity_kg: totalWeight, // Use actual collected weight
                    estimated_weight: booking.estimated_weight,
                    status: booking.status,
                    created_at: booking.created_at,
                    updated_at: booking.updated_at
                };
            }

            // If no collection chit (cancelled bookings), return original booking data
            return {
                id: booking.id,
                date: booking.date,
                vegetable_type: booking.vegetable_type,
                vegetables_summary: booking.vegetables_summary,
                quantity_kg: booking.quantity_kg,
                estimated_weight: booking.estimated_weight,
                status: booking.status,
                created_at: booking.created_at,
                updated_at: booking.updated_at
            };
        });

        res.json({
            success: true,
            data: { history: transformedHistory }
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

// Get today's route for farmer to track buyer
export const getTodaysRoute = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get farmer's info
        const farmer = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                latitude: true,
                longitude: true
            }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all bookings for today (to show the buyer's route)
        const allBookings = await prisma.booking.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                },
                status: {
                    in: ['PENDING', 'OPEN', 'ROUTED']
                }
            },
            include: {
                farmer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                full_name: true,
                                phone_number: true,
                                latitude: true,
                                longitude: true,
                                business_name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        if (allBookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bookings scheduled for today'
            });
        }

        // Get buyer info from first booking
        const firstBooking = allBookings[0];
        const buyerId = firstBooking.farmer.user.id; // This is actually wrong, need to get buyer differently

        // Actually, we need to find who the buyer is - let's get from a different approach
        // For now, use a placeholder hub location (you can update this)
        const buyerHub = {
            lat: 12.9716,
            lng: 77.5946,
            name: 'Collection Hub'
        };

        // Build response
        const routeData = {
            farmer: {
                id: farmer.id,
                name: farmer.full_name,
                phone: farmer.phone_number,
                location: {
                    lat: farmer.latitude,
                    lng: farmer.longitude
                }
            },
            buyer_hub: buyerHub,
            all_stops: allBookings.map((booking, index) => ({
                sequence: index + 1,
                farmer_id: booking.farmer.user.id,
                farmer_name: booking.farmer.user.full_name,
                farmer_phone: booking.farmer.user.phone_number,
                location: {
                    lat: booking.farmer.user.latitude,
                    lng: booking.farmer.user.longitude
                },
                vegetable_type: booking.vegetable_type,
                quantity_kg: booking.quantity_kg,
                is_current_farmer: booking.farmer.user.id === userId
            })),
            total_stops: allBookings.length
        };

        res.json({
            success: true,
            data: routeData
        });
    } catch (error) {
        console.error('Error getting today route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get route data'
        });
    }
};

// Get vegetable list (default + approved custom)
export const getVegetableList = async (req, res) => {
    try {
        const { DEFAULT_VEGETABLES } = await import('../utils/vegetableConfig.js');

        // Get approved custom vegetables
        const approvedVegetables = await prisma.vegetableRequest.findMany({
            where: { status: 'APPROVED' },
            select: { vegetable_name: true },
            distinct: ['vegetable_name']
        });

        const customVegetables = approvedVegetables.map(v => v.vegetable_name);
        const allVegetables = [...DEFAULT_VEGETABLES, ...customVegetables].sort();

        res.json({
            success: true,
            data: { vegetables: allVegetables }
        });
    } catch (error) {
        console.error('Error getting vegetables:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vegetable list'
        });
    }
};

// Request new vegetable
export const requestNewVegetable = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { vegetable_name } = req.body;
        const { DEFAULT_VEGETABLES } = await import('../utils/vegetableConfig.js');

        if (!vegetable_name || vegetable_name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vegetable name is required'
            });
        }

        const trimmedName = vegetable_name.trim();

        // Check if already exists in default list
        if (DEFAULT_VEGETABLES.includes(trimmedName)) {
            return res.status(400).json({
                success: false,
                message: 'This vegetable is already available'
            });
        }

        // Check if already approved
        const existingApproved = await prisma.vegetableRequest.findFirst({
            where: {
                vegetable_name: trimmedName,
                status: 'APPROVED'
            }
        });

        if (existingApproved) {
            return res.status(400).json({
                success: false,
                message: 'This vegetable is already available'
            });
        }

        // Check if already pending
        const existingPending = await prisma.vegetableRequest.findFirst({
            where: {
                vegetable_name: trimmedName,
                requested_by: userId,
                status: 'PENDING'
            }
        });

        if (existingPending) {
            return res.status(400).json({
                success: false,
                message: 'You have already requested this vegetable. Please wait for admin approval.'
            });
        }

        // Create request
        const request = await prisma.vegetableRequest.create({
            data: {
                vegetable_name: trimmedName,
                requested_by: userId,
                status: 'PENDING'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Vegetable request submitted. Admin will review it shortly.',
            data: { request }
        });
    } catch (error) {
        console.error('Error requesting vegetable:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit vegetable request'
        });
    }
};

// Get my vegetable requests
export const getMyVegetableRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        const requests = await prisma.vegetableRequest.findMany({
            where: { requested_by: userId },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            success: true,
            data: { requests }
        });
    } catch (error) {
        console.error('Error getting requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vegetable requests'
        });
    }
};

