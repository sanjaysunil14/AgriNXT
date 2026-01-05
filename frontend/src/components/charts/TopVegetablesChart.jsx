import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1'];

export default function TopVegetablesChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/admin/analytics/top-vegetables?days=7');
            setData(response.data.data.vegetables);
        } catch (error) {
            console.error('Failed to fetch top vegetables:', error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-emerald-200">
                    <p className="font-bold text-gray-900 mb-2">{data.name}</p>
                    <p className="text-sm text-gray-600">Revenue: <span className="font-bold text-emerald-600">₹{data.totalRevenue.toFixed(2)}</span></p>
                    <p className="text-sm text-gray-600">Weight: <span className="font-bold">{data.totalWeight.toFixed(2)} KG</span></p>
                    <p className="text-sm text-gray-600">Avg Price: <span className="font-bold">₹{data.avgPrice.toFixed(2)}/KG</span></p>
                    <p className="text-sm text-gray-600">Collections: <span className="font-bold">{data.collections}</span></p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Top Performing Vegetables</h3>
                </div>
                <div className="h-80 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Top Performing Vegetables</h3>
                </div>
                <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                    <Leaf className="w-16 h-16 mb-3" />
                    <p>No data available for the last 7 days</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Top Performing Vegetables</h3>
                        <p className="text-xs text-gray-500">Last 7 days by revenue</p>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                    <Bar dataKey="totalRevenue" radius={[0, 8, 8, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-5 gap-2">
                {data.map((veg, index) => (
                    <div key={index} className="text-center">
                        <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[index] }}></div>
                        <p className="text-xs text-gray-600 font-medium truncate">{veg.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
