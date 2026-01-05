import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/analytics/top-vegetables
export const getTopVegetables = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;

        // Calculate date range
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Get all collection items in date range
        const collectionChits = await prisma.collectionChit.findMany({
            where: {
                collection_date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                collection_items: true
            }
        });

        // Aggregate by vegetable
        const vegetableMap = {};

        for (const chit of collectionChits) {
            for (const item of chit.collection_items) {
                if (!vegetableMap[item.vegetable_name]) {
                    vegetableMap[item.vegetable_name] = {
                        name: item.vegetable_name,
                        totalWeight: 0,
                        collections: 0
                    };
                }
                vegetableMap[item.vegetable_name].totalWeight += item.weight;
                vegetableMap[item.vegetable_name].collections += 1;
            }
        }

        // Get prices for revenue calculation
        const vegetables = Object.values(vegetableMap);

        for (const veg of vegetables) {
            // Get average price for this vegetable in the period
            const prices = await prisma.dailyPrice.findMany({
                where: {
                    vegetable_name: veg.name,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            const avgPrice = prices.length > 0
                ? prices.reduce((sum, p) => sum + p.price_per_kg, 0) / prices.length
                : 0;

            veg.avgPrice = avgPrice;
            veg.totalRevenue = veg.totalWeight * avgPrice;
        }

        // Sort by revenue and get top 5
        vegetables.sort((a, b) => b.totalRevenue - a.totalRevenue);
        const topVegetables = vegetables.slice(0, 5);

        res.json({
            success: true,
            data: {
                vegetables: topVegetables,
                period: `Last ${days} days`
            }
        });
    } catch (error) {
        console.error('Error getting top vegetables:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get top vegetables'
        });
    }
};

// GET /api/admin/analytics/farmer-leaderboard
export const getFarmerLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Get all farmers with their bookings
        const farmers = await prisma.user.findMany({
            where: {
                role: 'FARMER',
                status: 'APPROVED'
            },
            include: {
                farmer_profile: {
                    include: {
                        bookings: {
                            where: {
                                status: {
                                    in: ['COMPLETED', 'ROUTED']
                                }
                            }
                        }
                    }
                }
            }
        });

        // Calculate metrics for each farmer
        const leaderboard = farmers.map(farmer => {
            const bookings = farmer.farmer_profile?.bookings || [];
            const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

            // Calculate total supply from completed bookings
            const totalSupply = completedBookings.reduce((sum, b) => {
                return sum + (b.estimated_weight || b.quantity_kg || 0);
            }, 0);

            const totalBookings = bookings.length;
            const reliabilityScore = totalBookings > 0
                ? Math.round((completedBookings.length / totalBookings) * 100)
                : 0;

            return {
                id: farmer.id,
                name: farmer.full_name,
                zone: farmer.zone,
                totalSupply: totalSupply,
                bookingsCount: totalBookings,
                completedBookings: completedBookings.length,
                reliabilityScore: reliabilityScore
            };
        });

        // Sort by total supply and get top N
        leaderboard.sort((a, b) => b.totalSupply - a.totalSupply);
        const topFarmers = leaderboard.slice(0, limit);

        res.json({
            success: true,
            data: {
                farmers: topFarmers
            }
        });
    } catch (error) {
        console.error('Error getting farmer leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get farmer leaderboard'
        });
    }
};

// GET /api/admin/analytics/recent-activity
export const getRecentActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        // Get recent audit logs
        const activities = await prisma.auditLog.findMany({
            take: limit,
            orderBy: {
                created_at: 'desc'
            },
            include: {
                user: {
                    select: {
                        full_name: true,
                        role: true
                    }
                }
            }
        });

        // Format activities
        const formattedActivities = activities.map(activity => {
            let type = 'OTHER';
            let description = activity.action;

            // Categorize activity types
            if (activity.action.includes('booking')) {
                type = 'BOOKING';
            } else if (activity.action.includes('invoice')) {
                type = 'INVOICE';
            } else if (activity.action.includes('payment')) {
                type = 'PAYMENT';
            } else if (activity.action.includes('approved') || activity.action.includes('rejected')) {
                type = 'APPROVAL';
            } else if (activity.action.includes('route')) {
                type = 'ROUTE';
            }

            return {
                id: activity.id,
                type: type,
                description: activity.action,
                user: activity.user?.full_name || 'System',
                role: activity.user?.role || 'SYSTEM',
                timestamp: activity.created_at,
                details: activity.details
            };
        });

        res.json({
            success: true,
            data: {
                activities: formattedActivities
            }
        });
    } catch (error) {
        console.error('Error getting recent activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recent activity'
        });
    }
};

// GET /api/admin/analytics/price-trends
export const getPriceTrends = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;

        // Calculate date range
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Get all prices in range
        const prices = await prisma.dailyPrice.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Find top vegetables by frequency
        const vegetableFrequency = {};
        prices.forEach(price => {
            vegetableFrequency[price.vegetable_name] =
                (vegetableFrequency[price.vegetable_name] || 0) + 1;
        });

        const topVegetables = Object.entries(vegetableFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name]) => name);

        // Group by date and pivot
        const dateMap = {};
        prices.forEach(price => {
            if (topVegetables.includes(price.vegetable_name)) {
                const dateKey = price.date.toISOString().split('T')[0];
                if (!dateMap[dateKey]) {
                    dateMap[dateKey] = { date: dateKey };
                }
                dateMap[dateKey][price.vegetable_name] = price.price_per_kg;
            }
        });

        const trends = Object.values(dateMap).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        res.json({
            success: true,
            data: {
                trends: trends,
                vegetables: topVegetables
            }
        });
    } catch (error) {
        console.error('Error getting price trends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get price trends'
        });
    }
};
