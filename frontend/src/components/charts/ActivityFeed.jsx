import { Activity, FileText, DollarSign, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ACTIVITY_ICONS = {
    BOOKING: FileText,
    INVOICE: FileText,
    PAYMENT: DollarSign,
    APPROVAL: CheckCircle,
    ROUTE: TrendingUp,
    OTHER: Activity
};

const ACTIVITY_COLORS = {
    BOOKING: 'bg-blue-100 text-blue-600',
    INVOICE: 'bg-green-100 text-green-600',
    PAYMENT: 'bg-emerald-100 text-emerald-600',
    APPROVAL: 'bg-purple-100 text-purple-600',
    ROUTE: 'bg-orange-100 text-orange-600',
    OTHER: 'bg-gray-100 text-gray-600'
};

export default function ActivityFeed() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await api.get('/admin/analytics/recent-activity?limit=20');
            setActivities(response.data.data.activities);
        } catch (error) {
            console.error('Failed to fetch activity feed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="h-96 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                        <p className="text-xs text-gray-500">Live system updates</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {activities.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                        <Activity className="w-16 h-16 mb-3" />
                        <p>No recent activity</p>
                    </div>
                ) : (
                    activities.map((activity, index) => {
                        const Icon = ACTIVITY_ICONS[activity.type] || Activity;
                        const colorClass = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.OTHER;

                        return (
                            <div
                                key={activity.id}
                                className="group flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={`flex-shrink-0 w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center shadow-sm`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="font-medium">{activity.user}</span>
                                        <span>•</span>
                                        <span>{getRelativeTime(activity.timestamp)}</span>
                                        {activity.role && (
                                            <>
                                                <span>•</span>
                                                <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs font-semibold">
                                                    {activity.role}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
