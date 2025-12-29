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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to the admin panel</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className={`text-2xl font-bold ${stat.isText ? 'text-green-600' : 'text-gray-900'}`}>
                                    {stat.value}
                                </p>
                                {stat.subtitle && (
                                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                                )}
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        {stat.change && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                                <span className="text-sm text-gray-500"> from last week</span>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* User Distribution */}
            <Card header={<h3 className="text-lg font-semibold">User Distribution by Role</h3>}>
                <div className="space-y-4">
                    {stats?.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">{role}</span>
                            <div className="flex items-center gap-3">
                                <div className="w-48 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full"
                                        style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                                    />
                                </div>
                                <span className="text-gray-900 font-semibold w-12 text-right">{count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Placeholder Chart */}
            <Card header={<h3 className="text-lg font-semibold">User Growth</h3>}>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart placeholder - User growth over time</p>
                </div>
            </Card>
        </div>
    );
}
