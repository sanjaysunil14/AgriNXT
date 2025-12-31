import { useState, useEffect } from 'react';
import { DollarSign, Eye, Info } from 'lucide-react';
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
            // Fetch today's prices (set by Admin)
            const pricesResponse = await api.get('/buyer/daily-prices');
            setPrices(pricesResponse.data.data.prices);

            // Fetch collected vegetables for reference
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
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">View Daily Prices</h1>
                <p className="text-gray-600 mt-1">View today's vegetable prices (set by Admin)</p>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 flex items-start gap-3 shadow-sm">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-blue-900">
                        Prices are set by Admin
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        You can view today's prices below. Invoices are automatically generated when Admin sets the prices.
                    </p>
                </div>
            </div>

            {/* Today's Prices */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    Today's Prices ({prices.length > 0 ? formatDate(prices[0]?.date) : 'Not Set'})
                </h2>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading prices...</div>
                ) : prices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No prices set for today yet. Admin will set prices soon.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {prices.map((price) => (
                            <div
                                key={price.vegetable_name}
                                className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">
                                            {price.vegetable_name}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            ₹{price.price_per_kg.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">per KG</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Collected Vegetables Summary */}
            {vegetables.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Your Collected Vegetables (Unpriced)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vegetables.map((veg) => (
                            <div
                                key={veg.vegetable}
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                            >
                                <p className="font-semibold text-gray-900">{veg.vegetable}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Total Weight: <span className="font-bold">{veg.totalWeight.toFixed(2)} KG</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {veg.count} collection(s)
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Invoices will be automatically generated once Admin sets the prices for these vegetables.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
