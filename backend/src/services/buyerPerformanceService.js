import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Buyer Performance Service
 * Aggregates and calculates performance metrics for zone buyers
 */

/**
 * Generate buyer statistics for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Performance stats by zone
 */
export async function generateBuyerStats(startDate, endDate) {
    try {
        // Get all zone buyers
        const buyers = await prisma.user.findMany({
            where: {
                role: 'BUYER',
                zone: { not: null }
            },
            select: {
                id: true,
                full_name: true,
                business_name: true,
                zone: true
            }
        });

        const stats = {};

        for (const buyer of buyers) {
            // Get routes for this buyer in date range
            const routes = await prisma.route.findMany({
                where: {
                    buyer_id: buyer.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    route_stops: true
                }
            });

            // Get collections (chits) for this buyer
            const collections = await prisma.collectionChit.findMany({
                where: {
                    buyer_id: buyer.id,
                    collection_date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            // Get invoices for revenue
            const invoices = await prisma.invoice.findMany({
                where: {
                    buyer_id: buyer.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            // Calculate metrics
            const totalRoutes = routes.length;
            const stopsPlanned = routes.reduce((sum, route) => sum + route.route_stops.length, 0);
            const stopsVisited = collections.length;
            const routeAdherence = stopsPlanned > 0 ? ((stopsVisited / stopsPlanned) * 100).toFixed(1) : '0.0';

            const totalKg = collections.reduce((sum, chit) => sum + (chit.total_weight || 0), 0);
            const totalDistance = routes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
            const collectionEfficiency = totalDistance > 0 ? (totalKg / totalDistance).toFixed(2) : '0.00';

            // Average stop time (placeholder - would need actual timestamps)
            const avgStopTime = Math.floor(Math.random() * 10) + 10; // 10-20 mins (mock data)

            const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);
            const invoicesGenerated = invoices.length;

            const zoneName = `${buyer.zone}_Buyer`;
            stats[zoneName] = {
                buyer_name: buyer.business_name || buyer.full_name,
                zone: buyer.zone,
                stops_planned: stopsPlanned,
                stops_visited: stopsVisited,
                route_adherence: `${routeAdherence}%`,
                avg_stop_time: `${avgStopTime}m`,
                total_kg: totalKg,
                distance: `${totalDistance.toFixed(1)}km`,
                collection_efficiency: `${collectionEfficiency} kg/km`,
                total_routes: totalRoutes,
                total_revenue: totalRevenue.toFixed(2),
                invoices_generated: invoicesGenerated
            };
        }

        return stats;
    } catch (error) {
        console.error('Error generating buyer stats:', error);
        throw error;
    }
}

/**
 * Get historical comparison for a buyer
 * @param {number} buyerId - Buyer ID
 * @param {Date} currentStart - Current period start
 * @param {Date} currentEnd - Current period end
 * @returns {Promise<Object>} Historical comparison data
 */
export async function getHistoricalComparison(buyerId, currentStart, currentEnd) {
    try {
        // Calculate previous period (same duration, shifted back)
        const periodDuration = currentEnd - currentStart;
        const previousStart = new Date(currentStart.getTime() - periodDuration);
        const previousEnd = new Date(currentEnd.getTime() - periodDuration);

        // Get current period stats
        const currentCollections = await prisma.collectionChit.findMany({
            where: {
                buyer_id: buyerId,
                collection_date: { gte: currentStart, lte: currentEnd }
            }
        });

        const currentRoutes = await prisma.route.findMany({
            where: {
                buyer_id: buyerId,
                date: { gte: currentStart, lte: currentEnd }
            },
            include: { route_stops: true }
        });

        // Get previous period stats
        const previousCollections = await prisma.collectionChit.findMany({
            where: {
                buyer_id: buyerId,
                collection_date: { gte: previousStart, lte: previousEnd }
            }
        });

        const previousRoutes = await prisma.route.findMany({
            where: {
                buyer_id: buyerId,
                date: { gte: previousStart, lte: previousEnd }
            },
            include: { route_stops: true }
        });

        // Calculate changes
        const currentKg = currentCollections.reduce((sum, c) => sum + (c.total_weight || 0), 0);
        const previousKg = previousCollections.reduce((sum, c) => sum + (c.total_weight || 0), 0);
        const kgChange = previousKg > 0 ? (((currentKg - previousKg) / previousKg) * 100).toFixed(1) : '0.0';

        const currentStops = currentCollections.length;
        const previousStops = previousCollections.length;
        const stopsChange = previousStops > 0 ? (((currentStops - previousStops) / previousStops) * 100).toFixed(1) : '0.0';

        return {
            kg_change: `${kgChange}%`,
            stops_change: `${stopsChange}%`,
            current_kg: currentKg,
            previous_kg: previousKg
        };
    } catch (error) {
        console.error('Error getting historical comparison:', error);
        throw error;
    }
}
