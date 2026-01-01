import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Award, AlertTriangle, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import api from '../../utils/api';

export default function PerformanceSummary() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const fetchPerformance = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/performance-summary', {
                params: {
                    start_date: dateRange.start,
                    end_date: dateRange.end
                }
            });
            setData(response.data.data);
        } catch (err) {
            console.error('Error fetching performance:', err);
            setError(err.response?.data?.message || 'Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, []);

    const getZoneColor = (zone) => {
        const colors = {
            NORTH: 'blue',
            SOUTH: 'green',
            EAST: 'purple',
            WEST: 'orange'
        };
        return colors[zone] || 'gray';
    };

    const getEfficiencyBadge = (efficiency) => {
        const value = parseFloat(efficiency);
        if (value >= 15) return { label: 'Excellent', color: 'green' };
        if (value >= 10) return { label: 'Good', color: 'blue' };
        return { label: 'Needs Improvement', color: 'red' };
    };

    const getAdherenceBadge = (adherence) => {
        const value = parseFloat(adherence);
        if (value >= 95) return { label: 'Excellent', color: 'green' };
        if (value >= 85) return { label: 'Good', color: 'blue' };
        return { label: 'Needs Improvement', color: 'red' };
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading AI Performance Summary...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                        <h3 className="font-semibold text-red-900">Error Loading Performance Data</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
                <button
                    onClick={fetchPerformance}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!data || !data.stats || Object.keys(data.stats).length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700">No Performance Data Available</h3>
                <p className="text-sm text-gray-500 mt-2">No routes or collections found for the selected period.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Date Range Selector */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Performance Summary</h2>
                            <p className="text-sm text-gray-500">Powered by Google Gemini</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchPerformance}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Date Range Selector */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">From:</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">To:</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <button
                        onClick={fetchPerformance}
                        className="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* AI Generated Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-semibold text-purple-900 mb-2">AI Insights</h3>
                        <p className="text-gray-700 leading-relaxed">{data.summary}</p>
                    </div>
                </div>
            </div>

            {/* Zone Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(data.stats).map(([zoneName, stats]) => {
                    const zone = stats.zone;
                    const color = getZoneColor(zone);
                    const efficiencyBadge = getEfficiencyBadge(stats.collection_efficiency);
                    const adherenceBadge = getAdherenceBadge(stats.route_adherence);

                    return (
                        <div key={zoneName} className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${color}-500`}>
                            {/* Zone Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{zone} Zone</h3>
                                    <p className="text-sm text-gray-500">{stats.buyer_name}</p>
                                </div>
                                <div className={`px-3 py-1 bg-${color}-100 text-${color}-700 rounded-full text-xs font-semibold`}>
                                    {stats.total_routes} Routes
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="space-y-3">
                                {/* Collection Efficiency */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Efficiency</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900">{stats.collection_efficiency}</span>
                                        <span className={`px-2 py-0.5 bg-${efficiencyBadge.color}-100 text-${efficiencyBadge.color}-700 rounded text-xs font-medium`}>
                                            {efficiencyBadge.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Route Adherence */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Route Adherence</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900">{stats.route_adherence}</span>
                                        <span className={`px-2 py-0.5 bg-${adherenceBadge.color}-100 text-${adherenceBadge.color}-700 rounded text-xs font-medium`}>
                                            {adherenceBadge.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Collection Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Total Collection</p>
                                        <p className="font-bold text-gray-900">{stats.total_kg} kg</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Distance</p>
                                        <p className="font-bold text-gray-900">{stats.distance}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Stops</p>
                                        <p className="font-bold text-gray-900">{stats.stops_visited}/{stats.stops_planned}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Avg Stop Time</p>
                                        <p className="font-bold text-gray-900">{stats.avg_stop_time}</p>
                                    </div>
                                </div>

                                {/* Revenue */}
                                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <p className="text-xs text-green-700 mb-1">Total Revenue</p>
                                    <p className="text-xl font-bold text-green-900">₹{parseFloat(stats.total_revenue).toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-green-600 mt-1">{stats.invoices_generated} invoices generated</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fleet Insights */}
            {data.insights && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Fleet Comparison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 mb-2">Fleet Average Efficiency</p>
                            <p className="text-2xl font-bold text-blue-900">{data.insights.fleet_averages.efficiency} kg/km</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-700 mb-2">Fleet Average Adherence</p>
                            <p className="text-2xl font-bold text-purple-900">{data.insights.fleet_averages.adherence}%</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
