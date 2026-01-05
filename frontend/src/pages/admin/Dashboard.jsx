import { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, ArrowUpRight } from 'lucide-react';
import api from '../../utils/api';
import TopVegetablesChart from '../../components/charts/TopVegetablesChart';
import FarmerLeaderboard from '../../components/charts/FarmerLeaderboard';
import ActivityFeed from '../../components/charts/ActivityFeed';
import PriceTrendsChart from '../../components/charts/PriceTrendsChart';

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
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-500">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            gradient: 'from-blue-500 to-indigo-600',
            iconColor: 'text-blue-50',
            bg: 'bg-blue-50',
            change: '+12%'
        },
        {
            title: 'New Signups',
            value: stats?.newSignupsThisWeek || 0,
            subtitle: 'This Week',
            icon: UserPlus,
            gradient: 'from-emerald-500 to-teal-600',
            iconColor: 'text-emerald-50',
            bg: 'bg-emerald-50',
            change: '+23%'
        },
        {
            title: 'Active Users',
            value: stats?.activeUsers || 0,
            icon: Activity,
            gradient: 'from-violet-500 to-purple-600',
            iconColor: 'text-violet-50',
            bg: 'bg-violet-50',
            change: '+5%'
        }
    ];

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-8 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/20 rounded-full -ml-10 -mb-10 blur-xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-emerald-100 text-lg">Welcome back to AgriNXT. Here's what's happening today.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>

                        <div className="relative flex flex-col justify-between h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                                {stat.change && (
                                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-bold text-green-700">{stat.change}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    {stat.title}
                                </p>
                                <p className={`text-3xl font-bold tracking-tight ${stat.isText ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600' : 'text-gray-900'}`}>
                                    {stat.value}
                                </p>
                                {stat.subtitle && (
                                    <p className="text-xs text-gray-400 mt-1 font-medium">{stat.subtitle}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TopVegetablesChart />
                <PriceTrendsChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FarmerLeaderboard />
                <ActivityFeed />
            </div>
        </div>
    );
}