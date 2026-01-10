import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Summary Service using Google Gemini API
 * Generates performance summaries for buyer analytics
 */

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI-powered performance summary from daily stats
 * @param {Object} dailyStats - Performance metrics for all zone buyers
 * @returns {Promise<string>} Generated summary text
 */
export async function generatePerformanceSummary(dailyStats) {
    try {
        // Validate API key
        if (!process.env.GEMINI_API_KEY) {
            console.error(' GEMINI_API_KEY is not configured');
            return generateFallbackSummary(dailyStats);
        }

        // Get the model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        // Construct the prompt
        const prompt = `
You are an expert Logistics Analyst for an Agri-Supply chain operating in Tamil Nadu, India.
Your role is to analyze daily performance data for 4 Zonal Buyers (North, South, East, West zones).

Guidelines:
- Identify the "Star Performer" (highest collection efficiency, best route adherence, or lowest stop time)
- Identify the "Concern Area" (delays, missed stops, or low efficiency)
- Provide actionable insights in a professional tone
- Keep the summary concise: Maximum 3-4 sentences
- Use specific metrics and percentages when highlighting performance
- Focus on operational improvements

**Daily Performance Data:**

${JSON.stringify(dailyStats, null, 2)}

**Task:** Analyze the above data and provide a concise performance summary identifying the star performer and any concern areas.
`;

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        console.error(' Error generating AI summary:', error.message);
        return generateFallbackSummary(dailyStats);
    }
}

/**
 * Generate a basic fallback summary if AI service fails
 * @param {Object} dailyStats - Performance metrics
 * @returns {string} Basic summary text
 */
function generateFallbackSummary(dailyStats) {
    const zones = Object.keys(dailyStats);

    if (zones.length === 0) {
        return 'No performance data available for the selected period.';
    }

    // Find best performer by efficiency
    let bestZone = null;
    let bestEfficiency = 0;
    let worstAdherence = 100;
    let concernZone = null;

    zones.forEach(zone => {
        const stats = dailyStats[zone];
        if (!stats) return; // Skip if stats is undefined

        const efficiency = parseFloat(stats.collection_efficiency) || 0;
        const adherence = parseFloat(stats.route_adherence) || 0;

        if (efficiency > bestEfficiency) {
            bestEfficiency = efficiency;
            bestZone = zone;
        }

        if (adherence < worstAdherence) {
            worstAdherence = adherence;
            concernZone = zone;
        }
    });

    // If no valid zones found
    if (!bestZone || !concernZone) {
        return 'No performance data available for analysis.';
    }

    const totalKg = zones.reduce((sum, zone) => sum + (dailyStats[zone]?.total_kg || 0), 0);

    return `Performance Summary: ${dailyStats[bestZone]?.zone || bestZone} leads with ${dailyStats[bestZone]?.collection_efficiency || 'N/A'} collection efficiency and ${dailyStats[bestZone]?.route_adherence || 'N/A'} route adherence. ${dailyStats[concernZone]?.zone || concernZone} shows ${dailyStats[concernZone]?.route_adherence || 'N/A'} route adherence, suggesting potential optimization opportunities. Overall, ${totalKg.toFixed(1)} kg collected across all zones.`;
}

/**
 * Generate comparative insights between zones
 * @param {Object} dailyStats - Performance metrics for all zones
 * @returns {Object} Comparative analysis
 */
export function generateComparativeInsights(dailyStats) {
    const zones = Object.keys(dailyStats);

    if (zones.length === 0) {
        return null;
    }

    // Calculate fleet averages
    let totalEfficiency = 0;
    let totalAdherence = 0;
    let count = 0;

    zones.forEach(zone => {
        const stats = dailyStats[zone];
        totalEfficiency += parseFloat(stats.collection_efficiency);
        totalAdherence += parseFloat(stats.route_adherence);
        count++;
    });

    const avgEfficiency = (totalEfficiency / count).toFixed(2);
    const avgAdherence = (totalAdherence / count).toFixed(2);

    // Compare each zone to fleet average
    const comparisons = {};
    zones.forEach(zone => {
        const stats = dailyStats[zone];
        const efficiency = parseFloat(stats.collection_efficiency);
        const adherence = parseFloat(stats.route_adherence);

        comparisons[zone] = {
            efficiency_vs_fleet: efficiency > avgEfficiency ? 'above' : 'below',
            efficiency_diff: ((efficiency - avgEfficiency) / avgEfficiency * 100).toFixed(1),
            adherence_vs_fleet: adherence > avgAdherence ? 'above' : 'below',
            adherence_diff: ((adherence - avgAdherence) / avgAdherence * 100).toFixed(1)
        };
    });

    return {
        fleet_averages: {
            efficiency: avgEfficiency,
            adherence: avgAdherence
        },
        zone_comparisons: comparisons
    };
}
