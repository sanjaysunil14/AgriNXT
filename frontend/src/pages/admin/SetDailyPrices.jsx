import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function SetDailyPrices() {
    const [vegetables, setVegetables] = useState([]);
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
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
            vegetables.forEach(veg => {
                initialPrices[veg.vegetable] = '';
            });
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

    const handleGenerateInvoices = async (e) => {
        e.preventDefault();

        // Validation
        const emptyPrices = Object.entries(prices).filter(([_, price]) => !price || parseFloat(price) <= 0);
        if (emptyPrices.length > 0) {
            addToast('Please enter valid prices for all vegetables', 'error');
            return;
        }

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

            // Refresh vegetables list
            fetchUnpricedVegetables();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to generate invoices', 'error');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Set Daily Prices</h1>
                <p className="text-gray-600 mt-1">Set vegetable prices and auto-generate invoices</p>
            </div>

            {/* Pricing Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Today's Vegetable Prices
                </h2>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading vegetables...</div>
                ) : vegetables.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No unpriced collections for today. Buyers need to complete collections first.
                    </div>
                ) : (
                    <form onSubmit={handleGenerateInvoices} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vegetables.map((vegData) => (
                                <div key={vegData.vegetable} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <Input
                                            label={`${vegData.vegetable} (${vegData.totalWeight.toFixed(2)} KG collected)`}
                                            type="number"
                                            step="0.01"
                                            placeholder="Price per KG"
                                            value={prices[vegData.vegetable] || ''}
                                            onChange={(e) => handlePriceChange(vegData.vegetable, e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="text-sm text-gray-500 mt-6">₹/KG</div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                loading={generating}
                                icon={TrendingUp}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 w-full md:w-auto"
                            >
                                Set Prices & Generate Invoices
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Result Summary */}
            {result && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Generation Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-5 rounded-xl border-l-4 border-green-500">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Invoices Generated</p>
                            <p className="text-3xl font-bold text-green-900">{result.invoices_generated}</p>
                        </div>
                        <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Total Amount</p>
                            <p className="text-3xl font-bold text-blue-900">₹{result.total_amount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
