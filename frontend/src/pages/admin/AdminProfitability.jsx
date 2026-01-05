import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Truck, Package, Settings, ChevronDown, Save } from 'lucide-react';
import api from '../../utils/api';

export default function AdminProfitability() {
    const [profitData, setProfitData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [config, setConfig] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Form states
    const [deliveryRate, setDeliveryRate] = useState('');
    const [sellingPriceForm, setSellingPriceForm] = useState({
        vegetable_name: '',
        selling_price_per_kg: ''
    });

    useEffect(() => {
        fetchProfitData();
        fetchConfig();
    }, [selectedDate]);

    const fetchProfitData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/profit-summary?date=${selectedDate}`);
            setProfitData(response.data.data);
        } catch (error) {
            console.error('Error fetching profit data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const response = await api.get('/admin/system-config');
            setConfig(response.data.data.config);
            setDeliveryRate(response.data.data.config.delivery_rate_per_km);
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    const handleUpdateDeliveryRate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/update-delivery-rate', {
                delivery_rate_per_km: parseFloat(deliveryRate)
            });
            alert('Delivery rate updated successfully!');
            fetchConfig();
            fetchProfitData();
        } catch (error) {
            console.error('Error updating delivery rate:', error);
            alert('Failed to update delivery rate');
        }
    };

    const handleUpdateSellingPrice = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/update-selling-price', {
                date: selectedDate,
                vegetable_name: sellingPriceForm.vegetable_name,
                selling_price_per_kg: parseFloat(sellingPriceForm.selling_price_per_kg)
            });
            alert('Selling price updated successfully!');
            setSellingPriceForm({ vegetable_name: '', selling_price_per_kg: '' });
            fetchProfitData();
        } catch (error) {
            console.error('Error updating selling price:', error);
            alert('Failed to update selling price');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const summary = profitData?.summary || {};
    const vegetables = profitData?.vegetables || [];
    const logistics = profitData?.logistics || {};

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profitability Analysis</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        Financial health tracker & margin optimization
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border-none bg-gray-50 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="h-8 w-px bg-gray-200"></div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showSettings ? 'bg-emerald-100 text-emerald-700' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
                    >
                        <Settings className={`w-5 h-5 ${showSettings ? 'rotate-90' : ''} transition-transform duration-300`} />
                        <span>Config</span>
                    </button>
                </div>
            </div>

            {/* Settings Panel (Collapsible) */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showSettings ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 z-0"></div>

                    <h2 className="text-xl font-bold text-gray-900 mb-6 relative z-10">System Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {/* Delivery Rate Form */}
                        <form onSubmit={handleUpdateDeliveryRate} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-blue-500" /> Logistics Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                        Delivery Rate (₹/km)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={deliveryRate}
                                        onChange={(e) => setDeliveryRate(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-semibold text-gray-800"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-200"
                                >
                                    Update Rate
                                </button>
                            </div>
                        </form>

                        {/* Selling Price Form */}
                        <form onSubmit={handleUpdateSellingPrice} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-500" /> Set Selling Price
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Vegetable
                                        </label>
                                        <input
                                            type="text"
                                            value={sellingPriceForm.vegetable_name}
                                            onChange={(e) => setSellingPriceForm({ ...sellingPriceForm, vegetable_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Price (₹/kg)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={sellingPriceForm.selling_price_per_kg}
                                            onChange={(e) => setSellingPriceForm({ ...sellingPriceForm, selling_price_per_kg: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Revenue',
                        value: summary.total_revenue,
                        sub: 'Total selling amount',
                        icon: DollarSign,
                        color: 'from-blue-500 to-indigo-600',
                        shadow: 'shadow-blue-200'
                    },
                    {
                        title: 'Farmer Payout',
                        value: summary.total_net_farmer_payout,
                        sub: 'After 1% commission',
                        icon: Package,
                        color: 'from-orange-400 to-orange-600',
                        shadow: 'shadow-orange-200'
                    },
                    {
                        title: 'Logistics',
                        value: summary.total_logistics_cost,
                        sub: `${logistics.total_distance_km?.toFixed(1) || '0'} km @ ₹${logistics.delivery_rate_per_km || '0'}/km`,
                        icon: Truck,
                        color: 'from-purple-500 to-purple-600',
                        shadow: 'shadow-purple-200'
                    },
                    {
                        title: 'Net Profit',
                        value: summary.net_profit,
                        sub: `${summary.profit_margin_percent?.toFixed(2) || '0'}% margin`,
                        icon: summary.net_profit >= 0 ? TrendingUp : TrendingDown,
                        color: summary.net_profit >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-red-600',
                        shadow: summary.net_profit >= 0 ? 'shadow-emerald-200' : 'shadow-red-200'
                    }
                ].map((item, i) => (
                    <div key={i} className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl ${item.shadow} bg-gradient-to-br ${item.color} group`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-lg">{item.title}</span>
                            </div>
                            <div className="text-3xl font-bold mb-1">₹{item.value?.toFixed(2) || '0.00'}</div>
                            <p className="text-sm text-white/80 font-medium">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Commission Info */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-amber-900 font-bold">Commission Earned</p>
                        <p className="text-amber-700 text-sm">Platform fee based on 1% of farmer payouts</p>
                    </div>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                    ₹{summary.total_commission_earned?.toFixed(2) || '0.00'}
                </div>
            </div>

            {/* Vegetable Breakdown Table */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Per-Vegetable Analysis</h2>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                        {vegetables.length} Items
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                {['Vegetable', 'Weight (kg)', 'Buy Price', 'Sell Price', 'Revenue', 'Costs', 'Net Profit', 'Margin %'].map((header, i) => (
                                    <th key={i} className={`px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${i > 0 ? 'text-right' : ''}`}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vegetables.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                        No data available for this date
                                    </td>
                                </tr>
                            ) : (
                                vegetables.map((veg, index) => (
                                    <tr key={index} className="hover:bg-emerald-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{veg.name}</div>
                                        </td>
                                        <td className="px-8 py-5 text-right text-gray-700">{veg.weight_kg?.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-right text-gray-600">₹{veg.farmer_price_per_kg?.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-right text-gray-600">₹{veg.selling_price_per_kg?.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-right font-bold text-blue-600">₹{veg.revenue?.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-right text-gray-500">₹{(veg.net_farmer_payout + veg.logistics_cost)?.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${veg.net_profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                ₹{veg.net_profit?.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className={`px-8 py-5 text-right font-bold ${veg.profit_margin_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {veg.profit_margin_percent?.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}