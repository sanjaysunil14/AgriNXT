import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get today's route (pending/open bookings)
export const getRoute = async (req, res) => {
    try {
        const userId = req.user.userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get bookings for today with status PENDING or OPEN
        const bookings = await prisma.booking.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                },
                status: {
                    in: ['PENDING', 'OPEN']
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
                                longitude: true
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
            vegetable_type: booking.vegetable_type,
            quantity_kg: booking.quantity_kg,
            status: booking.status,
            farmer: {
                id: booking.farmer.user.id,
                name: booking.farmer.user.full_name,
                phone: booking.farmer.user.phone_number,
                latitude: booking.farmer.user.latitude,
                longitude: booking.farmer.user.longitude
            }
        }));

        res.json({
            success: true,
            data: { bookings: routeData }
        });
    } catch (error) {
        console.error('Error getting route:', error);
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
                        user: true
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

        if (!['PENDING', 'OPEN', 'ROUTED'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'This booking has already been collected or cancelled'
            });
        }

        // Calculate total weight
        const totalWeight = items.reduce((sum, item) => sum + parseFloat(item.weight), 0);

        // Generate unique chit code
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await prisma.collectionChit.count({
            where: {
                collection_date: {
                    gte: new Date(today.setHours(0, 0, 0, 0)),
                    lt: new Date(today.setHours(23, 59, 59, 999))
                }
            }
        });
        const chitCode = `CH-${dateStr}-${String(count + 1).padStart(3, '0')}`;

        // Create route and route stop first (required for collection chit)
        const route = await prisma.route.create({
            data: {
                buyer_id: userId,
                date: new Date(),
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

// Set daily prices and generate invoices
export const setDailyPrices = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { prices, date } = req.body;

        // Validation
        if (!prices || typeof prices !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Prices object is required'
            });
        }

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Insert/Update daily prices
        for (const [vegetable, price] of Object.entries(prices)) {
            await prisma.dailyPrice.upsert({
                where: {
                    date_vegetable_name: {
                        date: targetDate,
                        vegetable_name: vegetable
                    }
                },
                update: {
                    price_per_kg: parseFloat(price)
                },
                create: {
                    date: targetDate,
                    vegetable_name: vegetable,
                    price_per_kg: parseFloat(price)
                }
            });
        }

        // Find unpriced collection chits for the target date
        const unpricedChits = await prisma.collectionChit.findMany({
            where: {
                collection_date: {
                    gte: targetDate,
                    lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
                },
                is_priced: false
            },
            include: {
                collection_items: true,
                farmer: {
                    select: {
                        id: true,
                        full_name: true
                    }
                }
            }
        });

        let invoicesGenerated = 0;
        let totalAmount = 0;

        // Group chits by farmer
        const chitsByFarmer = {};
        for (const chit of unpricedChits) {
            if (!chitsByFarmer[chit.farmer_id]) {
                chitsByFarmer[chit.farmer_id] = [];
            }
            chitsByFarmer[chit.farmer_id].push(chit);
        }

        // Generate invoices for each farmer
        for (const [farmerId, chits] of Object.entries(chitsByFarmer)) {
            const lineItems = [];
            let grandTotal = 0;

            for (const chit of chits) {
                for (const item of chit.collection_items) {
                    const pricePerKg = prices[item.vegetable_name] || 0;
                    const itemTotal = item.weight * pricePerKg;
                    grandTotal += itemTotal;

                    lineItems.push({
                        vegetable: item.vegetable_name,
                        weight: item.weight,
                        price_per_kg: pricePerKg,
                        total: itemTotal,
                        chit_code: chit.chit_code
                    });
                }

                // Mark chit as priced
                await prisma.collectionChit.update({
                    where: { id: chit.id },
                    data: { is_priced: true }
                });
            }

            // Generate invoice number
            const invoiceCount = await prisma.invoice.count();
            const invoiceNumber = `INV-${targetDate.getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

            // Create invoice
            await prisma.invoice.create({
                data: {
                    invoice_number: invoiceNumber,
                    buyer_id: userId,
                    farmer_id: parseInt(farmerId),
                    date: targetDate,
                    line_items: lineItems,
                    grand_total: grandTotal,
                    status: 'PENDING'
                }
            });

            invoicesGenerated++;
            totalAmount += grandTotal;
        }

        res.json({
            success: true,
            message: `Generated ${invoicesGenerated} invoice(s)`,
            data: {
                invoices_generated: invoicesGenerated,
                total_amount: totalAmount
            }
        });
    } catch (error) {
        console.error('Error setting daily prices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set prices and generate invoices'
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

        // Create payment record
        await prisma.payment.create({
            data: {
                buyer_id: userId,
                farmer_id: parseInt(farmer_id),
                amount: parseFloat(amount),
                mode: mode,
                transaction_ref: transaction_ref || null,
                payment_date: new Date()
            }
        });

        // Calculate remaining balance
        const invoices = await prisma.invoice.findMany({
            where: {
                farmer_id: parseInt(farmer_id),
                status: 'PENDING'
            },
            include: {
                payments: true
            }
        });

        let remainingBalance = 0;
        for (const invoice of invoices) {
            const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
            remainingBalance += (invoice.grand_total - totalPaid);
        }

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
