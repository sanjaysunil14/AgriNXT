import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Truck, Package, Settings } from 'lucide-react';
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const summary = profitData?.summary || {};
    const vegetables = profitData?.vegetables || [];
    const logistics = profitData?.logistics || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profitability Analysis</h1>
                    <p className="text-gray-600 mt-1">Track profit margins and manage pricing</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Delivery Rate Form */}
                        <form onSubmit={handleUpdateDeliveryRate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Delivery Rate (₹/km)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={deliveryRate}
                                    onChange={(e) => setDeliveryRate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Update Delivery Rate
                            </button>
                        </form>

                        {/* Selling Price Form */}
                        <form onSubmit={handleUpdateSellingPrice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Vegetable Name
                                </label>
                                <input
                                    type="text"
                                    value={sellingPriceForm.vegetable_name}
                                    onChange={(e) => setSellingPriceForm({ ...sellingPriceForm, vegetable_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., Tomatoes"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Selling Price (₹/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={sellingPriceForm.selling_price_per_kg}
                                    onChange={(e) => setSellingPriceForm({ ...sellingPriceForm, selling_price_per_kg: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            >
                                Update Selling Price
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-8 h-8 opacity-80" />
                        <span className="text-sm font-semibold opacity-90">Revenue</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">₹{summary.total_revenue?.toFixed(2) || '0.00'}</div>
                    <p className="text-sm opacity-80">Total selling amount</p>
                </div>

                {/* Farmer Payout */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Package className="w-8 h-8 opacity-80" />
                        <span className="text-sm font-semibold opacity-90">Farmer Payout</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">₹{summary.total_net_farmer_payout?.toFixed(2) || '0.00'}</div>
                    <p className="text-sm opacity-80">After 1% commission</p>
                </div>

                {/* Logistics Cost */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Truck className="w-8 h-8 opacity-80" />
                        <span className="text-sm font-semibold opacity-90">Logistics</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">₹{summary.total_logistics_cost?.toFixed(2) || '0.00'}</div>
                    <p className="text-sm opacity-80">{logistics.total_distance_km?.toFixed(1) || '0'} km @ ₹{logistics.delivery_rate_per_km || '0'}/km</p>
                </div>

                {/* Net Profit */}
                <div className={`rounded-xl shadow-lg p-6 text-white ${summary.net_profit >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
                    <div className="flex items-center justify-between mb-4">
                        {summary.net_profit >= 0 ? <TrendingUp className="w-8 h-8 opacity-80" /> : <TrendingDown className="w-8 h-8 opacity-80" />}
                        <span className="text-sm font-semibold opacity-90">Net Profit</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">₹{summary.net_profit?.toFixed(2) || '0.00'}</div>
                    <p className="text-sm opacity-80">{summary.profit_margin_percent?.toFixed(2) || '0'}% margin</p>
                </div>
            </div>

            {/* Commission Info */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="text-yellow-800 font-semibold">
                        Commission Earned: ₹{summary.total_commission_earned?.toFixed(2) || '0.00'}
                    </div>
                    <span className="text-yellow-600 text-sm">(1% of farmer payouts)</span>
                </div>
            </div>

            {/* Vegetable Breakdown Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Per-Vegetable Analysis</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Vegetable</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Weight (kg)</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Buy Price</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Sell Price</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Costs</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Net Profit</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Margin %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {vegetables.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No data available for this date
                                    </td>
                                </tr>
                            ) : (
                                vegetables.map((veg, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{veg.name}</td>
                                        <td className="px-6 py-4 text-right text-gray-700">{veg.weight_kg?.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-gray-700">₹{veg.farmer_price_per_kg?.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-gray-700">₹{veg.selling_price_per_kg?.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-blue-600">₹{veg.revenue?.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-gray-700">₹{(veg.net_farmer_payout + veg.logistics_cost)?.toFixed(2)}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${veg.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₹{veg.net_profit?.toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-semibold ${veg.profit_margin_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
