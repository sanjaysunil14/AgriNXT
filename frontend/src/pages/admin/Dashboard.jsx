import { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, TrendingUp, ArrowUpRight, BarChart3, PieChart } from 'lucide-react';
import Card from '../../components/ui/Card'; // Assuming you update Card or use div
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
        },
        {
            title: 'System Status',
            value: 'Healthy',
            icon: TrendingUp,
            gradient: 'from-orange-400 to-pink-500',
            iconColor: 'text-orange-50',
            bg: 'bg-orange-50',
            isText: true
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Distribution */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <PieChart className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">User Roles</h3>
                    </div>

                    <div className="space-y-6">
                        {stats?.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                            <div key={role} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600 font-semibold capitalize text-sm">{role.toLowerCase()}</span>
                                    <span className="text-gray-900 font-bold bg-gray-50 px-2 py-0.5 rounded-md text-sm">{count}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2.5 rounded-full transition-all duration-1000 group-hover:scale-x-105 origin-left"
                                        style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Placeholder Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">User Growth Analytics</h3>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-gray-200 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium z-10">Growth chart visualization</p>
                        <p className="text-gray-400 text-sm z-10 mt-1">Data collection in progress</p>
                    </div>
                </div>
            </div>
        </div>
    );
}