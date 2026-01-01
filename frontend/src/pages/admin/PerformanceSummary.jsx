import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Award, AlertTriangle, RefreshCw, Calendar, Sparkles, BrainCircuit, Zap } from 'lucide-react';
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
            SOUTH: 'emerald',
            EAST: 'purple',
            WEST: 'orange'
        };
        return colors[zone] || 'gray';
    };

    const getEfficiencyBadge = (efficiency) => {
        const value = parseFloat(efficiency);
        if (value >= 15) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        if (value >= 10) return { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        return { label: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
    };

    const getAdherenceBadge = (adherence) => {
        const value = parseFloat(adherence);
        if (value >= 95) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        if (value >= 85) return { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        return { label: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="mt-4 text-purple-800 font-medium">Generating AI Analysis...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 shadow-sm m-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900 text-lg">Analysis Failed</h3>
                        <p className="text-red-700 mt-1">{error}</p>
                    </div>
                </div>
                <button
                    onClick={fetchPerformance}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200 font-medium"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    if (!data || !data.stats || Object.keys(data.stats).length === 0) {
        return (
            <div className="m-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BrainCircuit className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700">No Data for Analysis</h3>
                <p className="text-gray-500 mt-2">Modify the date range to generate performance insights.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            {/* Header with Date Range Selector */}
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">AI Performance Core</h2>
                            <p className="text-sm font-medium text-purple-600 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Powered by Gemini Neural Engine
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 px-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="bg-transparent text-sm font-medium text-gray-700 outline-none"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="bg-transparent text-sm font-medium text-gray-700 outline-none"
                            />
                        </div>
                        <button
                            onClick={fetchPerformance}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md shadow-purple-200 text-sm font-bold"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Analyze
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Generated Summary */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                <div className="relative z-10 flex items-start gap-5">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                        <BrainCircuit className="w-8 h-8 text-purple-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-3">Neural Insights</h3>
                        <p className="text-purple-100 leading-relaxed text-lg font-light">{data.summary}</p>
                    </div>
                </div>
            </div>

            {/* Fleet Insights */}
            {data.insights && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-5">
                            <TrendingUp className="w-32 h-32 text-blue-600" />
                        </div>
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">Fleet Efficiency</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold text-gray-900">{data.insights.fleet_averages.efficiency}</p>
                            <span className="text-gray-500 font-medium">kg/km</span>
                        </div>
                        <div className="w-full bg-blue-100 h-1.5 rounded-full mt-4">
                            <div className="bg-blue-600 h-1.5 rounded-full w-3/4"></div>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-3xl border border-purple-100 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-5">
                            <Award className="w-32 h-32 text-purple-600" />
                        </div>
                        <p className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-2">Adherence Score</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold text-gray-900">{data.insights.fleet_averages.adherence}</p>
                            <span className="text-gray-500 font-medium">%</span>
                        </div>
                        <div className="w-full bg-purple-100 h-1.5 rounded-full mt-4">
                            <div className="bg-purple-600 h-1.5 rounded-full w-[95%]"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Zone Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(data.stats).map(([zoneName, stats]) => {
                    const zone = stats.zone;
                    const colorBase = getZoneColor(zone);
                    const efficiencyBadge = getEfficiencyBadge(stats.collection_efficiency);
                    const adherenceBadge = getAdherenceBadge(stats.route_adherence);

                    return (
                        <div key={zoneName} className={`bg-white rounded-3xl shadow-xl shadow-gray-200/40 overflow-hidden border-t-8 border-${colorBase}-500 hover:transform hover:-translate-y-1 transition-all duration-300`}>
                            {/* Zone Header */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full bg-${colorBase}-500`}></div>
                                        {zone} Zone
                                    </h3>
                                    <div className={`px-3 py-1 bg-${colorBase}-100 text-${colorBase}-700 rounded-full text-xs font-bold uppercase tracking-wide`}>
                                        {stats.total_routes} Routes
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 pl-5">{stats.buyer_name}</p>
                            </div>

                            {/* Key Metrics */}
                            <div className="p-6 space-y-4">
                                {/* Collection Efficiency */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm font-medium">Efficiency</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900 text-lg">{stats.collection_efficiency}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${efficiencyBadge.color}`}>
                                            {efficiencyBadge.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Route Adherence */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Award className="w-4 h-4" />
                                        <span className="text-sm font-medium">Route Adherence</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900 text-lg">{stats.route_adherence}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${adherenceBadge.color}`}>
                                            {adherenceBadge.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 my-4"></div>

                                {/* Collection Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Collection', value: `${stats.total_kg} kg` },
                                        { label: 'Distance', value: `${stats.distance} km` },
                                        { label: 'Stops', value: `${stats.stops_visited}/${stats.stops_planned}` },
                                        { label: 'Avg Stop', value: stats.avg_stop_time }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{item.label}</p>
                                            <p className="font-bold text-gray-900">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Revenue */}
                                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-200">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-emerald-100 text-xs font-semibold uppercase">Total Revenue</p>
                                            <p className="text-2xl font-bold">₹{parseFloat(stats.total_revenue).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-100 text-xs">{stats.invoices_generated} invoices</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}