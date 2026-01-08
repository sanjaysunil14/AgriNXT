import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Farmer's Invoices
export const getFarmerInvoices = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get pagination parameters from query string
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset) : 0;

        // Build query options
        const queryOptions = {
            where: { farmer_id: userId },
            include: {
                buyer: {
                    select: {
                        id: true,
                        full_name: true,
                        business_name: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        };

        // Add pagination if limit is specified
        if (limit !== undefined) {
            queryOptions.skip = offset;
            queryOptions.take = limit;
        }

        const invoices = await prisma.invoice.findMany(queryOptions);

        // Check if there are more invoices (only if pagination is used)
        let hasMore = false;
        if (limit !== undefined) {
            const totalCount = await prisma.invoice.count({
                where: { farmer_id: userId }
            });
            hasMore = (offset + limit) < totalCount;
        }

        res.json({
            success: true,
            data: {
                invoices,
                hasMore
            }
        });
    } catch (error) {
        console.error('Error getting farmer invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invoices'
        });
    }
};

// Get Buyer's Invoices
export const getBuyerInvoices = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get pagination parameters from query string
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset) : 0;
        const status = req.query.status && req.query.status !== 'ALL' ? req.query.status : undefined;

        // Get filter parameters
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const farmerName = req.query.farmerName;
        const invoiceNumber = req.query.invoiceNumber;

        // Build where clause with filters
        const whereClause = {
            buyer_id: userId,
            ...(status && { status }),
            ...(invoiceNumber && { invoice_number: { contains: invoiceNumber, mode: 'insensitive' } }),
            ...(startDate && endDate && {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            }),
            ...(startDate && !endDate && { date: { gte: new Date(startDate) } }),
            ...(!startDate && endDate && { date: { lte: new Date(endDate) } }),
            ...(farmerName && {
                farmer: {
                    full_name: { contains: farmerName, mode: 'insensitive' }
                }
            })
        };

        // Build query options
        const queryOptions = {
            where: whereClause,
            include: {
                farmer: {
                    select: {
                        id: true,
                        full_name: true,
                        phone_number: true,
                        zone: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        };

        // Add pagination if limit is specified
        if (limit !== undefined) {
            queryOptions.skip = offset;
            queryOptions.take = limit;
        }

        const invoices = await prisma.invoice.findMany(queryOptions);

        // Check if there are more invoices (only if pagination is used)
        let hasMore = false;
        if (limit !== undefined) {
            const totalCount = await prisma.invoice.count({
                where: whereClause
            });
            hasMore = (offset + limit) < totalCount;
        }

        console.log(`✅ Found ${invoices.length} invoices for buyer ${userId}`);

        res.json({
            success: true,
            data: {
                invoices,
                hasMore
            }
        });
    } catch (error) {
        console.error('❌ Error getting buyer invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invoices'
        });
    }
};
