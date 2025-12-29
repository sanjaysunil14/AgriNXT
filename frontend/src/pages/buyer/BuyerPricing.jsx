import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function BuyerPricing() {
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
            // This would ideally be a separate endpoint, but we'll use the route endpoint
            // and extract unique vegetables from unpriced collections
            const response = await api.get('/buyer/route');
            const bookings = response.data.data.bookings;

            // Extract unique vegetables
            const uniqueVegetables = [...new Set(
                bookings
                    .map(b => b.vegetable_type)
                    .filter(v => v)
            )];

            setVegetables(uniqueVegetables);

            // Initialize prices object
            const initialPrices = {};
            uniqueVegetables.forEach(veg => {
                initialPrices[veg] = '';
            });
            setPrices(initialPrices);
        } catch (error) {
            addToast('Failed to fetch vegetables', 'error');
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
            const response = await api.post('/buyer/set-daily-prices', {
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Daily Pricing</h1>
                <p className="text-gray-600">Set vegetable prices and generate invoices</p>
            </div>

            {/* Pricing Form */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Today's Vegetable Prices
                </h2>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading vegetables...</div>
                ) : vegetables.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No unpriced collections for today. Complete some collections first.
                    </div>
                ) : (
                    <form onSubmit={handleGenerateInvoices} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vegetables.map((vegetable) => (
                                <div key={vegetable} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <Input
                                            label={vegetable}
                                            type="number"
                                            step="0.01"
                                            placeholder="Price per KG"
                                            value={prices[vegetable] || ''}
                                            onChange={(e) => handlePriceChange(vegetable, e.target.value)}
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
                                className="w-full md:w-auto"
                            >
                                Generate Invoices
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            {/* Result Summary */}
            {result && (
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Generation Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">Invoices Generated</p>
                            <p className="text-2xl font-bold text-green-900">{result.invoices_generated}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Total Amount</p>
                            <p className="text-2xl font-bold text-blue-900">₹{result.total_amount.toFixed(2)}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
