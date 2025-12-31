import { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import api from '../../utils/api';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'bg-blue-500',
            change: '+12%'
        },
        {
            title: 'New Signups',
            value: stats?.newSignupsThisWeek || 0,
            subtitle: 'This Week',
            icon: UserPlus,
            color: 'bg-green-500',
            change: '+23%'
        },
        {
            title: 'Active Users',
            value: stats?.activeUsers || 0,
            icon: Activity,
            color: 'bg-purple-500',
            change: '+5%'
        },
        {
            title: 'System Status',
            value: 'Healthy',
            icon: TrendingUp,
            color: 'bg-orange-500',
            isText: true
        }
    ];

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome to the admin panel</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-5 border-l-4 shadow-sm hover:shadow-md transition-shadow"
                        style={{ borderLeftColor: stat.color.replace('bg-', '#').replace('blue-500', '#3B82F6').replace('green-500', '#10B981').replace('purple-500', '#A855F7').replace('orange-500', '#F97316') }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                    {stat.title}
                                </p>
                                <p className={`text-3xl font-bold ${stat.isText ? 'text-green-600' : 'text-gray-900'}`}>
                                    {stat.value}
                                </p>
                                {stat.subtitle && (
                                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                                )}
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        {stat.change && (
                            <div className="pt-3 border-t border-gray-100">
                                <span className="text-sm text-green-600 font-semibold">{stat.change}</span>
                                <span className="text-sm text-gray-500"> from last week</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* User Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">User Distribution by Role</h3>
                <div className="space-y-4">
                    {stats?.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                            <span className="text-gray-700 font-semibold capitalize">{role}</span>
                            <div className="flex items-center gap-3">
                                <div className="w-48 bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                                    />
                                </div>
                                <span className="text-gray-900 font-bold w-12 text-right">{count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Placeholder Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Chart placeholder - User growth over time</p>
                </div>
            </div>
        </div>
    );
}
