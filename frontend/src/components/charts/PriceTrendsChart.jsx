import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const VEGETABLE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function PriceTrendsChart() {
    const [data, setData] = useState([]);
    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/admin/analytics/price-trends?days=30');
            setData(response.data.data.trends);
            setVegetables(response.data.data.vegetables);
        } catch (error) {
            console.error('Failed to fetch price trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-blue-200">
                    <p className="font-bold text-gray-900 mb-2">{new Date(label).toLocaleDateString('en-IN')}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-bold">₹{entry.value?.toFixed(2)}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Vegetable Price Trends</h3>
                </div>
                <div className="h-80 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (data.length === 0 || vegetables.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Vegetable Price Trends</h3>
                </div>
                <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                    <TrendingUp className="w-16 h-16 mb-3" />
                    <p>No price data available for the last 30 days</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Vegetable Price Trends</h3>
                    <p className="text-xs text-gray-500">Last 30 days price movement</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />
                    {vegetables.map((veg, index) => (
                        <Line
                            key={veg}
                            type="monotone"
                            dataKey={veg}
                            name={veg}
                            stroke={VEGETABLE_COLORS[index % VEGETABLE_COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {vegetables.map((veg, index) => (
                    <div key={veg} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: VEGETABLE_COLORS[index % VEGETABLE_COLORS.length] }}
                        ></div>
                        <span className="text-xs text-gray-600 font-medium">{veg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
