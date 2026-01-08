import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, X, Sparkles, Leaf, CheckCircle, ArrowRight } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

// Confirmation Modal Component
function ConfirmationModal({ isOpen, onClose, onConfirm, vegetables, prices, loading }) {
    if (!isOpen) return null;

    const calculateTotal = () => {
        return vegetables.reduce((sum, veg) => {
            const price = parseFloat(prices[veg.vegetable]) || 0;
            return sum + (veg.totalWeight * price);
        }, 0);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                            <AlertCircle className="w-9 h-9 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">Confirm Price Settings</h2>
                            <p className="text-emerald-50 text-sm">
                                Review all prices before generating invoices
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)] bg-gradient-to-b from-gray-50 to-white">
                    <div className="space-y-3">
                        {vegetables.map((veg, index) => {
                            const price = parseFloat(prices[veg.vegetable]) || 0;
                            const total = veg.totalWeight * price;

                            return (
                                <div
                                    key={veg.vegetable}
                                    className="group relative bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                                    <div className="relative flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                                                <Leaf className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900">
                                                    {veg.vegetable}
                                                </h3>
                                                <p className="text-xs text-gray-500">Fresh Produce</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-xl border border-emerald-200">
                                                <p className="text-xs text-emerald-700 font-medium mb-0.5">Price/KG</p>
                                                <p className="text-2xl font-bold text-emerald-900">₹{price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative grid grid-cols-2 gap-3">
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                                            <p className="text-xs text-blue-700 font-semibold mb-1">Total Weight</p>
                                            <p className="text-xl font-bold text-blue-900">
                                                {veg.totalWeight.toFixed(2)} <span className="text-sm font-normal">KG</span>
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                                            <p className="text-xs text-purple-700 font-semibold mb-1">Total Value</p>
                                            <p className="text-xl font-bold text-purple-900">
                                                ₹{total.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Enhanced Summary */}
                    <div className="mt-6 relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 rounded-2xl shadow-xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

                        <div className="relative grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-emerald-100 text-sm mb-3 font-medium flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Summary
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/80 text-sm">Total Vegetables:</span>
                                        <span className="text-white font-bold text-lg">{vegetables.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/80 text-sm">Total Weight:</span>
                                        <span className="text-white font-bold text-lg">
                                            {vegetables.reduce((sum, v) => sum + v.totalWeight, 0).toFixed(2)} KG
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-emerald-100 text-sm mb-2 font-medium">Estimated Revenue</p>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                                    <p className="text-4xl font-bold text-white">
                                        ₹{calculateTotal().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warning Notice */}
                    <div className="mt-6 relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-full -mr-12 -mt-12"></div>
                        <div className="relative flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-900 mb-1">
                                    This action will generate invoices automatically
                                </p>
                                <p className="text-sm text-amber-700 leading-relaxed">
                                    Once confirmed, invoices will be generated for all buyers and collection chits will be permanently marked as priced. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t-2 border-gray-100 p-6 flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Confirm & Generate Invoices
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SetDailyPrices() {
    const [vegetables, setVegetables] = useState([]);
    const [prices, setPrices] = useState({});
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchUnpricedVegetables();
    }, []);

    const fetchUnpricedVegetables = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/unpriced-collections');
            const vegetables = response.data.data.vegetables;

            setVegetables(vegetables);

            // Initialize prices object
            const initialPrices = {};

            // Try to fetch existing daily prices for today
            try {
                const pricesResponse = await api.get('/admin/daily-prices');
                const existingPrices = pricesResponse.data.data.prices;

                // Store price history for display
                setPriceHistory(existingPrices);

                // Create a map of existing prices
                const existingPriceMap = {};
                existingPrices.forEach(price => {
                    existingPriceMap[price.vegetable_name] = price.price_per_kg.toString();
                });

                // Initialize prices with existing values or empty strings
                vegetables.forEach(veg => {
                    const existingPrice = existingPriceMap[veg.vegetable] || '';
                    initialPrices[veg.vegetable] = existingPrice;
                });
            } catch (priceError) {
                console.error('Error fetching existing prices:', priceError);
                // If price fetch fails, initialize with empty strings
                vegetables.forEach(veg => {
                    initialPrices[veg.vegetable] = '';
                });
            }

            setPrices(initialPrices);
        } catch (error) {
            addToast('Failed to fetch collected vegetables', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (vegetable, value) => {
        setPrices({
            ...prices,
            [vegetable]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const emptyPrices = Object.entries(prices).filter(([_, price]) => !price || parseFloat(price) <= 0);
        if (emptyPrices.length > 0) {
            addToast('Please enter valid prices for all vegetables', 'error');
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmGenerate = async () => {
        setGenerating(true);
        setResult(null);

        try {
            const response = await api.post('/admin/set-daily-prices', {
                prices: Object.fromEntries(
                    Object.entries(prices).map(([veg, price]) => [veg, parseFloat(price)])
                ),
                date: new Date().toISOString().split('T')[0]
            });

            setResult(response.data.data);
            addToast(response.data.message, 'success');
            setShowConfirmModal(false);
            fetchUnpricedVegetables();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to generate invoices', 'error');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 space-y-6">
            {/* Premium Header with Company Branding */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-2xl p-8 mb-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>

                <div className="relative">


                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold text-white">Daily Price Management</h2>
                        <p className="text-emerald-100 text-lg">Set vegetable prices and auto-generate invoices with precision</p>
                    </div>
                </div>
            </div>

            {/* Today's Price History */}
            {priceHistory.length > 0 && (
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border-2 border-gray-100">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-32 -mt-32"></div>

                    <div className="relative p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Today's Price History</h2>
                                <p className="text-gray-500 text-sm">Prices set for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {priceHistory.map((priceItem, index) => (
                                <div
                                    key={priceItem.id}
                                    className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                                                <Leaf className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-900">{priceItem.vegetable_name}</h3>
                                                <p className="text-xs text-gray-500">
                                                    Set at {new Date(priceItem.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-xl border border-blue-200">
                                            <p className="text-xs text-blue-700 font-semibold mb-1">Price per KG</p>
                                            <p className="text-2xl font-bold text-blue-900">₹{priceItem.price_per_kg.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Form with Premium Design */}
            <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border-2 border-gray-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-full -mr-32 -mt-32"></div>

                <div className="relative p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Today's Vegetable Prices</h2>
                            <p className="text-gray-500 text-sm">Configure pricing for collected produce</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading vegetables...</p>
                        </div>
                    ) : vegetables.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Leaf className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium mb-2">No unpriced collections for today</p>
                            <p className="text-gray-400 text-sm">Buyers need to complete collections first</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {vegetables.map((vegData, index) => (
                                    <div
                                        key={vegData.vegetable}
                                        className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>

                                        <div className="relative">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                                                    <Leaf className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-gray-900">{vegData.vegetable}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-semibold text-emerald-600">{vegData.totalWeight.toFixed(2)} KG</span> collected
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-end gap-3">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={prices[vegData.vegetable] || ''}
                                                    onChange={(e) => handlePriceChange(vegData.vegetable, e.target.value)}
                                                    required
                                                    className="flex-1 text-lg font-semibold"
                                                />
                                                <div className="px-4 py-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl border border-emerald-200">
                                                    <span className="text-emerald-900 font-bold">₹/KG</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t-2 border-gray-100">
                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-2xl hover:from-emerald-600 hover:to-teal-600 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 group"
                                >
                                    <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    Set Prices & Generate Invoices
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Enhanced Result Summary */}
            {result && (
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 animate-slideUp">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-transparent rounded-full -mr-32 -mt-32"></div>

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Generation Complete!</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl shadow-xl group hover:shadow-2xl transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                                <p className="relative text-green-100 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Invoices Generated
                                </p>
                                <p className="relative text-5xl font-bold text-white mb-1">{result.invoices_generated}</p>
                                <p className="relative text-green-100 text-sm">Successfully created</p>
                            </div>
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-xl group hover:shadow-2xl transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                                <p className="relative text-blue-100 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Total Revenue
                                </p>
                                <p className="relative text-5xl font-bold text-white mb-1">₹{result.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                <p className="relative text-blue-100 text-sm">Estimated earnings</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => !generating && setShowConfirmModal(false)}
                onConfirm={handleConfirmGenerate}
                vegetables={vegetables}
                prices={prices}
                loading={generating}
            />
        </div>
    );
}