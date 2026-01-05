import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Farmer's Invoices
export const getFarmerInvoices = async (req, res) => {
    try {
        const userId = req.user.userId;

        const invoices = await prisma.invoice.findMany({
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
        });

        res.json({
            success: true,
            data: { invoices }
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

        console.log(`🔍 Fetching invoices for buyer ID: ${userId}`);
        console.log(`🔍 Full user object:`, req.user);

        const invoices = await prisma.invoice.findMany({
            where: { buyer_id: userId },
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
        });

        console.log(`✅ Found ${invoices.length} invoices for buyer ${userId}`);
        if (invoices.length > 0) {
            console.log(`📄 Sample invoice:`, {
                invoice_number: invoices[0].invoice_number,
                farmer: invoices[0].farmer.full_name,
                farmer_zone: invoices[0].farmer.zone,
                grand_total: invoices[0].grand_total
            });
        }

        res.json({
            success: true,
            data: { invoices }
        });
    } catch (error) {
        console.error('❌ Error getting buyer invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invoices'
        });
    }
};
