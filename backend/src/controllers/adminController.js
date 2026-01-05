import { PrismaClient } from '@prisma/client';
import { logAuditAction } from '../utils/auditLogger.js';
import { generateBuyerStats } from '../services/buyerPerformanceService.js';
import { generatePerformanceSummary, generateComparativeInsights } from '../services/aiSummaryService.js';

const prisma = new PrismaClient();

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, activeUsers, newSignupsThisWeek] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { is_active: true } }),
            prisma.user.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: true
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                newSignupsThisWeek,
                usersByRole: usersByRole.reduce((acc, item) => {
                    acc[item.role] = item._count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all users with pagination, search, and filter
export const getUsers = async (req, res) => {
    try {
        const { page, limit = 10, offset, search = '', role = '' } = req.query;

        // Support both page-based and offset-based pagination
        const skip = offset !== undefined
            ? parseInt(offset)
            : (parseInt(page || 1) - 1) * parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { full_name: { contains: search, mode: 'insensitive' } },
                { phone_number: { contains: search } }
            ];
        }

        if (role) {
            where.role = role;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    full_name: true,
                    phone_number: true,
                    role: true,
                    is_active: true,
                    created_at: true
                },
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        // Calculate hasMore for lazy loading
        const hasMore = (skip + parseInt(limit)) < total;

        res.status(200).json({
            success: true,
            data: {
                users,
                hasMore,
                total,
                pagination: {
                    total,
                    currentPage: page ? parseInt(page) : Math.floor(skip / parseInt(limit)) + 1,
                    totalPages: Math.ceil(total / parseInt(limit)),
                    from: skip + 1,
                    to: Math.min(skip + parseInt(limit), total)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, role } = req.body;
        const adminId = req.user.userId;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                full_name,
                role
            },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                role: true,
                is_active: true
            }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            'ADMIN',
            'UPDATE_USER',
            parseInt(id),
            `Updated user: ${full_name}, role: ${role}`,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Toggle ban user
export const toggleBanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { is_active: !user.is_active },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                role: true,
                is_active: true
            }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            'ADMIN',
            updatedUser.is_active ? 'UNBAN_USER' : 'BAN_USER',
            parseInt(id),
            `${updatedUser.is_active ? 'Unbanned' : 'Banned'} user: ${user.full_name}`,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: `User ${updatedUser.is_active ? 'unbanned' : 'banned'} successfully`,
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error('Toggle ban user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            'ADMIN',
            'DELETE_USER',
            parseInt(id),
            `Deleted user: ${user.full_name}`,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            startDate,
            endDate,
            user,
            action
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter conditions
        const where = {};

        // Date range filter
        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) {
                where.created_at.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.created_at.lte = end;
            }
        }

        // User search filter (partial match on name)
        if (user) {
            where.user = {
                full_name: {
                    contains: user,
                    mode: 'insensitive'
                }
            };
        }

        // Action filter
        if (action && action !== 'ALL') {
            where.action = {
                contains: action,
                mode: 'insensitive'
            };
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            full_name: true,
                            role: true
                        }
                    },
                    target_user: {
                        select: {
                            id: true,
                            full_name: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' }
            }),
            prisma.auditLog.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    from: skip + 1,
                    to: Math.min(skip + parseInt(limit), total)
                }
            }
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all unpriced collections (from all buyers) for Admin to set prices
export const getUnpricedCollections = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all unpriced collection chits for today (from all buyers)
        const unpricedChits = await prisma.collectionChit.findMany({
            where: {
                collection_date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                },
                is_priced: false
            },
            include: {
                collection_items: true
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

// Set daily prices and generate invoices (Admin only)
export const setDailyPrices = async (req, res) => {
    try {
        const adminId = req.user.userId;
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
                },
                buyer: {
                    select: {
                        id: true
                    }
                }
            }
        });

        let invoicesGenerated = 0;
        let totalAmount = 0;

        // Group chits by buyer and farmer
        const chitsByBuyerFarmer = {};
        for (const chit of unpricedChits) {
            const key = `${chit.buyer_id}-${chit.farmer_id}`;
            if (!chitsByBuyerFarmer[key]) {
                chitsByBuyerFarmer[key] = {
                    buyer_id: chit.buyer_id,
                    farmer_id: chit.farmer_id,
                    chits: []
                };
            }
            chitsByBuyerFarmer[key].chits.push(chit);
        }

        // Generate invoices for each buyer-farmer combination
        for (const [key, group] of Object.entries(chitsByBuyerFarmer)) {
            const lineItems = [];
            let grandTotal = 0;

            for (const chit of group.chits) {
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
                    buyer_id: group.buyer_id,
                    farmer_id: group.farmer_id,
                    date: targetDate,
                    line_items: lineItems,
                    grand_total: grandTotal,
                    status: 'PENDING'
                }
            });

            invoicesGenerated++;
            totalAmount += grandTotal;
        }

        // Log audit action
        await logAuditAction(
            adminId,
            'ADMIN',
            'SET_DAILY_PRICES',
            null,
            `Set prices for ${Object.keys(prices).length} vegetables, generated ${invoicesGenerated} invoices`,
            req.ip
        );

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

// Get all invoices (Admin only)
export const getAllInvoices = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        const where = {};

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0); // Start of day
                where.date.gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // End of day
                where.date.lte = end;
            }
        }

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                buyer: {
                    select: {
                        id: true,
                        full_name: true,
                        business_name: true
                    }
                },
                farmer: {
                    select: {
                        id: true,
                        full_name: true,
                        phone_number: true
                    }
                },
                payments: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        res.json({
            success: true,
            data: { invoices }
        });
    } catch (error) {
        console.error('Error getting all invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invoices'
        });
    }
};

// Download invoice PDF (Admin only)
export const downloadInvoicePDF = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                buyer: {
                    select: {
                        full_name: true,
                        business_name: true,
                        address: true
                    }
                },
                farmer: {
                    select: {
                        full_name: true,
                        phone_number: true,
                        location: true
                    }
                }
            }
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // For now, return invoice data as JSON
        // TODO: Implement PDF generation using jsPDF or similar library
        res.json({
            success: true,
            data: { invoice },
            message: 'PDF generation to be implemented'
        });
    } catch (error) {
        console.error('Error downloading invoice PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download invoice'
        });
    }
};

/**
 * Get AI-powered buyer performance summary
 * @route GET /api/admin/performance-summary
 */
export const getPerformanceSummary = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        // Default to today if no dates provided
        const startDate = start_date ? new Date(start_date) : new Date();
        const endDate = end_date ? new Date(end_date) : new Date();

        // Set time ranges
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Generate buyer statistics
        const dailyStats = await generateBuyerStats(startDate, endDate);

        // Check if we have data
        if (Object.keys(dailyStats).length === 0) {
            return res.json({
                success: true,
                data: {
                    summary: 'No performance data available for the selected period.',
                    stats: {},
                    insights: null
                }
            });
        }

        // Generate AI summary
        const aiSummary = await generatePerformanceSummary(dailyStats);

        // Generate comparative insights
        const insights = generateComparativeInsights(dailyStats);

        res.json({
            success: true,
            data: {
                summary: aiSummary,
                stats: dailyStats,
                insights: insights,
                period: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Error getting performance summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate performance summary',
            error: error.message
        });
    }
};

/**
 * Get detailed zone performance comparison
 * @route GET /api/admin/zone-comparison
 */
export const getZoneComparison = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const startDate = start_date ? new Date(start_date) : new Date();
        const endDate = end_date ? new Date(end_date) : new Date();

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Generate buyer statistics
        const dailyStats = await generateBuyerStats(startDate, endDate);

        // Generate comparative insights
        const insights = generateComparativeInsights(dailyStats);

        res.json({
            success: true,
            data: {
                zones: dailyStats,
                insights: insights,
                period: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Error getting zone comparison:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get zone comparison',
            error: error.message
        });
    }
};

// Get vegetable requests
export const getVegetableRequests = async (req, res) => {
    try {
        const { status = 'PENDING' } = req.query;

        const requests = await prisma.vegetableRequest.findMany({
            where: status !== 'ALL' ? { status } : {},
            include: {
                farmer: {
                    select: {
                        id: true,
                        full_name: true,
                        phone_number: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            success: true,
            data: { requests }
        });
    } catch (error) {
        console.error('Error getting vegetable requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vegetable requests'
        });
    }
};

// Approve/Reject vegetable request
export const updateVegetableRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;
        const adminId = req.user.userId;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const request = await prisma.vegetableRequest.update({
            where: { id: parseInt(id) },
            data: {
                status,
                admin_notes: admin_notes || null
            },
            include: {
                farmer: {
                    select: {
                        full_name: true
                    }
                }
            }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            'ADMIN',
            status === 'APPROVED' ? 'APPROVE_VEGETABLE' : 'REJECT_VEGETABLE',
            request.requested_by,
            `${status === 'APPROVED' ? 'Approved' : 'Rejected'} vegetable request: ${request.vegetable_name}`,
            req.ip
        );

        res.json({
            success: true,
            message: `Vegetable request ${status.toLowerCase()} successfully`,
            data: { request }
        });
    } catch (error) {
        console.error('Error updating vegetable request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vegetable request'
        });
    }
};

