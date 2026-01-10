import { useState, useEffect } from 'react';
import { DollarSign, Eye, Info, TrendingUp, Calendar } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function BuyerPricing() {
    const [prices, setPrices] = useState([]);
    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const pricesResponse = await api.get('/buyer/daily-prices');
            setPrices(pricesResponse.data.data.prices);

            const veggiesResponse = await api.get('/buyer/unpriced-collections');
            setVegetables(veggiesResponse.data.data.vegetables);
        } catch (error) {
            addToast('Failed to fetch pricing data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Daily Prices</h1>
                    <p className="text-gray-500">View today's rates and your collected inventory</p>
                </div>
            </div>

            {/* Price Cards */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Today's Market Rates
                    </h2>
                    {prices.length > 0 && (
                        <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {formatDate(prices[0]?.date)}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="h-40 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    </div>
                ) : prices.length === 0 ? (
                    <div className="bg-gray-100 rounded-2xl p-8 text-center border border-gray-200 border-dashed">
                        <p className="text-gray-500 font-medium">Prices haven't been set by Admin for today yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {prices.map((price, i) => (
                            <div
                                key={price.vegetable_name}
                                className="group relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                                        {price.vegetable_name}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-gray-900">₹{price.price_per_kg.toFixed(2)}</span>
                                        <span className="text-gray-400 font-medium text-sm">/kg</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Unpriced Collections */}
            {vegetables.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full -mr-32 -mt-32"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Pending Valuation</h2>
                                <p className="text-sm text-gray-500">Inventory waiting for price updates</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {vegetables.map((veg) => (
                                <div
                                    key={veg.vegetable}
                                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold text-gray-900">{veg.vegetable}</p>
                                        <p className="text-xs text-gray-500 mt-1">{veg.count} batches</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-emerald-600">{veg.totalWeight.toFixed(2)}</p>
                                        <p className="text-xs text-emerald-400 font-bold uppercase">KG</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-xs text-yellow-700 font-medium bg-yellow-50 px-4 py-2 rounded-lg inline-block border border-yellow-100">
                            * Invoices will be auto-generated once Admin sets prices for these items.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}