import { PrismaClient } from '@prisma/client';
import whatsAppService from '../services/WhatsAppService.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { getZoneHub } from '../config/zoneConfig.js';

const prisma = new PrismaClient();

// Get today's route (pending/open bookings)
export const getRoute = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get buyer's zone
        const buyer = await prisma.user.findUnique({
            where: { id: userId },
            select: { zone: true, full_name: true }
        });

        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: 'Buyer not found'
            });
        }

        if (!buyer.zone) {
            return res.status(400).json({
                success: false,
                message: 'Your zone is not assigned. Please contact admin.'
            });
        }


        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get bookings for today with zone filtering
        const bookings = await prisma.booking.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                },
                status: {
                    in: ['PENDING', 'OPEN', 'ROUTED']
                },
                farmer: {
                    user: {
                        zone: buyer.zone
                    }
                }
            },
            include: {
                booking_items: true,
                farmer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                full_name: true,
                                phone_number: true,
                                latitude: true,
                                longitude: true,
                                zone: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        });



        // Transform data for frontend
        const routeData = bookings.map(booking => ({
            id: booking.id,
            date: booking.date,
            vegetables_summary: booking.vegetables_summary,
            booking_items: booking.booking_items || [],
            // Keep old fields for backward compatibility
            vegetable_type: booking.vegetable_type,
            quantity_kg: booking.quantity_kg,
            status: booking.status,
            farmer: {
                id: booking.farmer.user.id,
                name: booking.farmer.user.full_name,
                phone: booking.farmer.user.phone_number,
                latitude: booking.farmer.user.latitude,
                longitude: booking.farmer.user.longitude,
                zone: booking.farmer.user.zone
            }
        }));

        // Get hub location for buyer's zone
        const zoneHub = getZoneHub(buyer.zone);
        const hubLocation = zoneHub ? {
            lat: zoneHub.latitude,
            lng: zoneHub.longitude,
            name: zoneHub.name,
            city: zoneHub.city
        } : null;

        res.json({
            success: true,
            data: {
                bookings: routeData,
                hubLocation: hubLocation
            }
        });
    } catch (error) {
        console.error('❌ Error getting route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get route'
        });
    }
};

// Collect produce from a booking
export const collectProduce = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { booking_id, items, location } = req.body;

        // Validation
        if (!booking_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and items are required'
            });
        }

        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                message: 'GPS location is required'
            });
        }

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(booking_id) },
            include: {
                farmer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                full_name: true,
                                phone_number: true,
                                zone: true
                            }
                        }
                    }
                }
            }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Get buyer's zone
        const buyer = await prisma.user.findUnique({
            where: { id: userId },
            select: { zone: true, full_name: true }
        });


        if (!buyer.zone) {
            console.warn(` Buyer ${userId} (${buyer.full_name}) has no zone assigned`);
            return res.status(400).json({
                message: 'Your zone is not assigned. Please contact admin.'
            });
        }

        if (!booking.farmer.user.zone) {
            console.warn(`⚠️ Farmer ${booking.farmer.user.id} (${booking.farmer.user.full_name}) has no zone assigned`);
            return res.status(400).json({
                success: false,
                message: 'Farmer zone is not assigned. Cannot collect.'
            });
        }

        if (buyer.zone !== booking.farmer.user.zone) {
            console.error(`🚫 Zone mismatch: Buyer ${buyer.full_name} (${buyer.zone}) tried to collect from Farmer ${booking.farmer.user.full_name} (${booking.farmer.user.zone})`);
            return res.status(403).json({
                success: false,
                message: `Cannot collect from farmer in different zone. Your zone: ${buyer.zone}, Farmer zone: ${booking.farmer.user.zone}`
            });
        }

        console.log(`✅ Zone validation passed: ${buyer.zone}`);

        if (!['PENDING', 'OPEN', 'ROUTED'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'This booking has already been collected or cancelled'
            });
        }

        // Calculate total weight
        const totalWeight = items.reduce((sum, item) => sum + parseFloat(item.weight), 0);

        // Generate unique chit code
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

        // Create separate date objects to avoid mutation
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const count = await prisma.collectionChit.count({
            where: {
                collection_date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        // Add milliseconds for better uniqueness to avoid race conditions
        const timeStr = now.getTime().toString().slice(-4);
        const chitCode = `CH-${dateStr}-${String(count + 1).padStart(3, '0')}-${timeStr}`;

        // Create route and route stop first (required for collection chit)
        const route = await prisma.route.create({
            data: {
                buyer_id: userId,
                date: new Date(),
                total_distance: req.body.route_metrics?.distance || 0,
                // estimated_duration: req.body.route_metrics?.duration || null, // TODO: Apply migration first
                status: 'IN_PROGRESS'
            }
        });

        const routeStop = await prisma.routeStop.create({
            data: {
                route_id: route.id,
                booking_id: booking.id,
                sequence_order: 1
            }
        });

        // Create collection chit
        const chit = await prisma.collectionChit.create({
            data: {
                chit_code: chitCode,
                route_stop_id: routeStop.id,
                buyer_id: userId,
                farmer_id: booking.farmer.user_id,
                total_weight: totalWeight,
                collection_date: new Date(),
                location_lat: parseFloat(location.lat),
                location_lng: parseFloat(location.lng),
                is_priced: false
            }
        });

        // Create collection items
        await prisma.collectionItem.createMany({
            data: items.map(item => ({
                chit_id: chit.id,
                vegetable_name: item.vegetable,
                weight: parseFloat(item.weight)
            }))
        });

        // Update booking status
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'COMPLETED' }
        });

        // Send WhatsApp notification to farmer (non-blocking)
        whatsAppService.sendCollectionChit(
            {
                name: booking.farmer.user.full_name,
                phone: booking.farmer.user.phone_number
            },
            {
                chitId: chitCode,
                collectionDate: new Date().toLocaleDateString('en-IN'),
                buyerName: req.user.fullName || 'Buyer',
                vegetables: items.map(item => ({
                    name: item.vegetable,
                    quantity: item.weight,
                    unit: 'kg'
                }))
            }
        ).catch(error => {
            // Log error but don't fail the request
            console.error('WhatsApp notification failed:', error.message);
        });

        // Log audit action
        await logAuditAction(
            userId,
            'BUYER',
            'COLLECTION_RECORDED',
            booking.farmer.user_id,
            `Buyer collected ${totalWeight}kg from Farmer ${booking.farmer.user.full_name}`,
            req.ip
        );

        res.status(201).json({
            success: true,
            message: 'Collection recorded successfully',
            data: {
                chit_code: chitCode,
                total_weight: totalWeight
            }
        });
    } catch (error) {
        console.error('Error collecting produce:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record collection'
        });
    }
};

// Get unpriced collections for pricing
export const getUnpricedCollections = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get buyer's zone
        const buyer = await prisma.user.findUnique({
            where: { id: userId },
            select: { zone: true, full_name: true }
        });

        if (!buyer.zone) {
            console.warn(`⚠️ Buyer ${userId} (${buyer.full_name}) has no zone assigned`);
            return res.status(400).json({
                success: false,
                message: 'Your zone is not assigned. Please contact admin.'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all unpriced collection chits for today with zone filter
        const unpricedChits = await prisma.collectionChit.findMany({
            where: {
                buyer_id: userId,
                collection_date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                },
                is_priced: false,
                farmer: {
                    zone: buyer.zone  // ✅ Zone filter added
                }
            },
            include: {
                collection_items: true,
                farmer: {
                    select: {
                        zone: true
                    }
                }
            }
        });


        // Aggregate vegetables and their total weights
        const vegetableSummary = {};

        unpricedChits.forEach(chit => {
            chit.collection_items.forEach(item => {
                if (!vegetableSummary[item.vegetable_name]) {
                    vegetableSummary[item.vegetable_name] = {
                        vegetable: item.vegetable_name,
                        totalWeight: 0,
                        count: 0
                    };
                }
                vegetableSummary[item.vegetable_name].totalWeight += item.weight;
                vegetableSummary[item.vegetable_name].count += 1;
            });
        });

        const vegetables = Object.values(vegetableSummary);

        res.json({
            success: true,
            data: {
                vegetables,
                totalChits: unpricedChits.length
            }
        });
    } catch (error) {
        console.error('Error fetching unpriced collections:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unpriced collections'
        });
    }
};

// Get daily prices (read-only for Buyer)
export const getDailyPrices = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's prices
        const prices = await prisma.dailyPrice.findMany({
            where: {
                date: today
            },
            orderBy: {
                vegetable_name: 'asc'
            }
        });

        res.json({
            success: true,
            data: { prices }
        });
    } catch (error) {
        console.error('Error fetching daily prices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch daily prices'
        });
    }
};



// Get farmers with outstanding dues
export const getDues = async (req, res) => {
    try {
        // Get all invoices with their payments
        const invoices = await prisma.invoice.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        full_name: true,
                        payment_method: true,
                        payment_value: true
                    }
                },
                payments: true
            }
        });

        // Calculate dues per farmer
        const duesMap = {};
        for (const invoice of invoices) {
            const farmerId = invoice.farmer_id;
            const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
            const balance = invoice.grand_total - totalPaid;

            if (balance > 0) {
                if (!duesMap[farmerId]) {
                    duesMap[farmerId] = {
                        farmer_id: farmerId,
                        farmer_name: invoice.farmer.full_name,
                        payment_method: invoice.farmer.payment_method,
                        payment_value: invoice.farmer.payment_value,
                        balance: 0
                    };
                }
                duesMap[farmerId].balance += balance;
            }
        }

        const dues = Object.values(duesMap);

        res.json({
            success: true,
            data: { dues }
        });
    } catch (error) {
        console.error('Error getting dues:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dues'
        });
    }
};

// Record payment to farmer
export const recordPayment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { farmer_id, amount, mode, transaction_ref } = req.body;

        // Validation
        if (!farmer_id || !amount || !mode) {
            return res.status(400).json({
                success: false,
                message: 'Farmer ID, amount, and payment mode are required'
            });
        }

        if (parseFloat(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        if (!['CASH', 'UPI', 'BANK_TRANSFER'].includes(mode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment mode'
            });
        }

        // Check if farmer exists
        const farmer = await prisma.user.findUnique({
            where: { id: parseInt(farmer_id) }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        // Get pending invoices for this farmer (oldest first)
        const invoices = await prisma.invoice.findMany({
            where: {
                farmer_id: parseInt(farmer_id),
                status: 'PENDING'
            },
            include: {
                payments: true
            },
            orderBy: {
                date: 'asc' // Pay oldest invoices first
            }
        });

        if (invoices.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No pending invoices found for this farmer'
            });
        }

        // Allocate payment to invoices (oldest first)
        let remainingPayment = parseFloat(amount);
        let remainingBalance = 0;

        for (const invoice of invoices) {
            if (remainingPayment <= 0) {
                // No more payment to allocate, just calculate remaining balance
                const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
                remainingBalance += (invoice.grand_total - totalPaid);
                continue;
            }

            // Calculate current balance for this invoice
            const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
            const invoiceBalance = invoice.grand_total - totalPaid;

            if (invoiceBalance > 0) {
                // Determine how much to pay towards this invoice
                const paymentForThisInvoice = Math.min(remainingPayment, invoiceBalance);

                // Create payment record linked to this invoice
                await prisma.payment.create({
                    data: {
                        invoice_id: invoice.id,
                        buyer_id: userId,
                        farmer_id: parseInt(farmer_id),
                        amount: paymentForThisInvoice,
                        mode: mode,
                        transaction_ref: transaction_ref || null,
                        payment_date: new Date()
                    }
                });

                remainingPayment -= paymentForThisInvoice;

                // Check if invoice is now fully paid
                const newTotalPaid = totalPaid + paymentForThisInvoice;
                if (newTotalPaid >= invoice.grand_total) {
                    // Mark invoice as PAID
                    await prisma.invoice.update({
                        where: { id: invoice.id },
                        data: { status: 'PAID' }
                    });
                } else {
                    // Still has balance
                    remainingBalance += (invoice.grand_total - newTotalPaid);
                }
            }
        }

        // Get buyer information for WhatsApp message
        const buyer = await prisma.user.findUnique({
            where: { id: userId },
            select: { full_name: true, business_name: true }
        });

        const buyerName = buyer?.business_name || buyer?.full_name || 'Buyer';

        // Send WhatsApp notification to farmer (non-blocking)
        const totalPaidToFarmer = parseFloat(amount);
        whatsAppService.sendCustomMessage(
            {
                name: farmer.full_name,
                phone: farmer.phone_number
            },
            ` Payment Send!

Dear ${farmer.full_name},

${buyerName} has sent you a payment:

Amount Received: ₹${totalPaidToFarmer.toFixed(2)}
Payment Mode: ${mode === 'BANK_TRANSFER' ? 'Bank Transfer' : mode}
${transaction_ref ? `Transaction Ref: ${transaction_ref}\n` : ''}Date: ${new Date().toLocaleDateString('en-IN')}

${remainingBalance > 0
                ? `Remaining Balance: ₹${remainingBalance.toFixed(2)}`
                : '✅ All dues cleared! Thank you!'}

Thank you for your produce! 🙏`
        ).catch(error => {
            console.error('WhatsApp notification failed:', error.message);
        });

        // Log audit action
        await logAuditAction(
            userId,
            'BUYER',
            'PAYMENT_RECORDED',
            parseInt(farmer_id),
            `Buyer recorded a payment of ₹${amount} to Farmer ${farmer.full_name}`,
            req.ip
        );

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: {
                remaining_balance: Math.max(0, remainingBalance)
            }
        });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record payment'
        });
    }
};



// Create or update planned route
export const createPlannedRoute = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { bookingIds, routeMetrics } = req.body;

        if (!bookingIds || bookingIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one booking is required'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if route already exists for today
        let route = await prisma.route.findFirst({
            where: {
                buyer_id: userId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                },
                status: 'PLANNED'
            }
        });

        if (!route) {
            // Create new route
            route = await prisma.route.create({
                data: {
                    buyer_id: userId,
                    date: today,
                    total_distance: routeMetrics?.distance || 0,
                    status: 'PLANNED'
                }
            });
        } else {
            // Update existing route
            route = await prisma.route.update({
                where: { id: route.id },
                data: {
                    total_distance: routeMetrics?.distance || 0
                }
            });

            // Delete existing route stops
            await prisma.routeStop.deleteMany({
                where: { route_id: route.id }
            });
        }

        // Create route stops and update booking statuses
        for (let i = 0; i < bookingIds.length; i++) {
            const bookingId = bookingIds[i];

            // Create route stop
            await prisma.routeStop.create({
                data: {
                    route_id: route.id,
                    booking_id: bookingId,
                    sequence_order: i + 1
                }
            });

            // Update booking status to ROUTED
            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'ROUTED' }
            });
        }

        res.json({
            success: true,
            message: 'Route planned successfully',
            data: { route }
        });
    } catch (error) {
        console.error('Error creating planned route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create planned route'
        });
    }
};

