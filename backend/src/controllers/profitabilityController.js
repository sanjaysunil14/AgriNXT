import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get or create system config
const getSystemConfig = async () => {
    let config = await prisma.systemConfig.findFirst();
    if (!config) {
        config = await prisma.systemConfig.create({
            data: {
                delivery_rate_per_km: 15.0,
                farmer_commission_rate: 0.01
            }
        });
    }
    return config;
};

// GET /api/admin/profit-summary
export const getProfitSummary = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const tomorrow = new Date(targetDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get system config
        const config = await getSystemConfig();

        // Get all routes for the day to calculate total distance
        const routes = await prisma.route.findMany({
            where: {
                date: {
                    gte: targetDate,
                    lt: tomorrow
                }
            }
        });

        const totalDistance = routes.reduce((sum, route) => sum + route.total_distance, 0);
        const totalDeliveryCost = totalDistance * config.delivery_rate_per_km;

        // Get all collection items for the day
        const collectionChits = await prisma.collectionChit.findMany({
            where: {
                collection_date: {
                    gte: targetDate,
                    lt: tomorrow
                }
            },
            include: {
                collection_items: true
            }
        });

        // Calculate total weight collected
        let totalWeight = 0;
        const vegetableData = {};

        collectionChits.forEach(chit => {
            chit.collection_items.forEach(item => {
                totalWeight += item.weight;

                if (!vegetableData[item.vegetable_name]) {
                    vegetableData[item.vegetable_name] = {
                        name: item.vegetable_name,
                        weight_kg: 0
                    };
                }
                vegetableData[item.vegetable_name].weight_kg += item.weight;
            });
        });

        // Get farmer purchase prices (DailyPrice)
        const farmerPrices = await prisma.dailyPrice.findMany({
            where: { date: targetDate }
        });

        const farmerPriceMap = {};
        farmerPrices.forEach(p => {
            farmerPriceMap[p.vegetable_name] = p.price_per_kg;
        });

        // Get admin selling prices
        const sellingPrices = await prisma.sellingPrice.findMany({
            where: { date: targetDate }
        });

        const sellingPriceMap = {};
        sellingPrices.forEach(p => {
            sellingPriceMap[p.vegetable_name] = p.selling_price_per_kg;
        });

        // Calculate profit for each vegetable
        const vegetables = [];
        let totalRevenue = 0;
        let totalGrossFarmerPayout = 0;
        let totalCommissionEarned = 0;

        Object.values(vegetableData).forEach(veg => {
            const farmerPricePerKg = farmerPriceMap[veg.name] || 0;
            const sellingPricePerKg = sellingPriceMap[veg.name] || 0;

            const revenue = veg.weight_kg * sellingPricePerKg;
            const grossFarmerPayout = veg.weight_kg * farmerPricePerKg;
            const commissionEarned = grossFarmerPayout * config.farmer_commission_rate;
            const netFarmerPayout = grossFarmerPayout - commissionEarned;

            // Calculate logistics cost for this vegetable
            const logisticsCost = totalWeight > 0
                ? (veg.weight_kg / totalWeight) * totalDeliveryCost
                : 0;

            const netProfit = revenue - netFarmerPayout - logisticsCost;
            const profitMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

            vegetables.push({
                name: veg.name,
                weight_kg: veg.weight_kg,
                farmer_price_per_kg: farmerPricePerKg,
                selling_price_per_kg: sellingPricePerKg,
                revenue: revenue,
                gross_farmer_payout: grossFarmerPayout,
                commission_earned: commissionEarned,
                net_farmer_payout: netFarmerPayout,
                logistics_cost: logisticsCost,
                net_profit: netProfit,
                profit_margin_percent: profitMarginPercent
            });

            totalRevenue += revenue;
            totalGrossFarmerPayout += grossFarmerPayout;
            totalCommissionEarned += commissionEarned;
        });

        const totalNetFarmerPayout = totalGrossFarmerPayout - totalCommissionEarned;
        const totalNetProfit = totalRevenue - totalNetFarmerPayout - totalDeliveryCost;
        const profitMarginPercent = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

        res.json({
            success: true,
            data: {
                date: targetDate.toISOString().split('T')[0],
                summary: {
                    total_revenue: totalRevenue,
                    total_gross_farmer_payout: totalGrossFarmerPayout,
                    total_commission_earned: totalCommissionEarned,
                    total_net_farmer_payout: totalNetFarmerPayout,
                    total_logistics_cost: totalDeliveryCost,
                    net_profit: totalNetProfit,
                    profit_margin_percent: profitMarginPercent
                },
                vegetables: vegetables,
                logistics: {
                    total_distance_km: totalDistance,
                    delivery_rate_per_km: config.delivery_rate_per_km,
                    total_delivery_cost: totalDeliveryCost
                },
                config: {
                    delivery_rate_per_km: config.delivery_rate_per_km,
                    farmer_commission_rate: config.farmer_commission_rate
                }
            }
        });
    } catch (error) {
        console.error('Error getting profit summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profit summary'
        });
    }
};

// POST /api/admin/update-delivery-rate
export const updateDeliveryRate = async (req, res) => {
    try {
        const { delivery_rate_per_km } = req.body;

        if (!delivery_rate_per_km || delivery_rate_per_km <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid delivery rate is required'
            });
        }

        let config = await prisma.systemConfig.findFirst();

        if (config) {
            config = await prisma.systemConfig.update({
                where: { id: config.id },
                data: { delivery_rate_per_km: parseFloat(delivery_rate_per_km) }
            });
        } else {
            config = await prisma.systemConfig.create({
                data: {
                    delivery_rate_per_km: parseFloat(delivery_rate_per_km),
                    farmer_commission_rate: 0.01
                }
            });
        }

        res.json({
            success: true,
            message: 'Delivery rate updated successfully',
            data: { config }
        });
    } catch (error) {
        console.error('Error updating delivery rate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update delivery rate'
        });
    }
};

// POST /api/admin/update-selling-price
export const updateSellingPrice = async (req, res) => {
    try {
        const { date, vegetable_name, selling_price_per_kg } = req.body;

        if (!date || !vegetable_name || !selling_price_per_kg) {
            return res.status(400).json({
                success: false,
                message: 'Date, vegetable name, and selling price are required'
            });
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const sellingPrice = await prisma.sellingPrice.upsert({
            where: {
                date_vegetable_name: {
                    date: targetDate,
                    vegetable_name: vegetable_name
                }
            },
            update: {
                selling_price_per_kg: parseFloat(selling_price_per_kg)
            },
            create: {
                date: targetDate,
                vegetable_name: vegetable_name,
                selling_price_per_kg: parseFloat(selling_price_per_kg)
            }
        });

        res.json({
            success: true,
            message: 'Selling price updated successfully',
            data: { sellingPrice }
        });
    } catch (error) {
        console.error('Error updating selling price:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update selling price'
        });
    }
};

// GET /api/admin/selling-prices
export const getSellingPrices = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const sellingPrices = await prisma.sellingPrice.findMany({
            where: { date: targetDate },
            orderBy: { vegetable_name: 'asc' }
        });

        res.json({
            success: true,
            data: { prices: sellingPrices }
        });
    } catch (error) {
        console.error('Error getting selling prices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get selling prices'
        });
    }
};

// GET /api/admin/daily-prices (farmer purchase prices)
export const getDailyPrices = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const dailyPrices = await prisma.dailyPrice.findMany({
            where: { date: targetDate },
            orderBy: { vegetable_name: 'asc' }
        });

        res.json({
            success: true,
            data: { prices: dailyPrices }
        });
    } catch (error) {
        console.error('Error getting daily prices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get daily prices'
        });
    }
};

// GET /api/admin/system-config
export const getConfig = async (req, res) => {
    try {
        const config = await getSystemConfig();
        res.json({
            success: true,
            data: { config }
        });
    } catch (error) {
        console.error('Error getting system config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get system config'
        });
    }
};
