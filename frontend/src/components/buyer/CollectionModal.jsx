import { useState, useEffect } from 'react';
import { X, MapPin, Plus, Package } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../utils/api';

export default function CollectionModal({ isOpen, onClose, booking, routeMetrics, onSuccess }) {
    const [items, setItems] = useState([{ vegetable: '', weight: '' }]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);

    useEffect(() => {
        if (isOpen && booking) {
            if (booking.vegetable_type) {
                setItems([{ vegetable: booking.vegetable_type, weight: '' }]);
            }
            getCurrentLocation();
        }
    }, [isOpen, booking]);

    const getCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setGettingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setError('Failed to get GPS location. Please enable location services.');
                    setGettingLocation(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
            setGettingLocation(false);
        }
    };

    const handleAddItem = () => setItems([...items, { vegetable: '', weight: '' }]);
    const handleRemoveItem = (index) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (items.some(item => !item.vegetable || !item.weight)) {
            setError('Please fill in all vegetable and weight fields');
            return;
        }
        if (!location) {
            setError('GPS location is required. Please allow location access.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/buyer/collect', {
                booking_id: booking.id,
                items: items.map(item => ({
                    vegetable: item.vegetable,
                    weight: parseFloat(item.weight)
                })),
                location,
                route_metrics: routeMetrics
            });
            setItems([{ vegetable: '', weight: '' }]);
            setLocation(null);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record collection');
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Collection" size="md">
            <div className="bg-emerald-50 p-4 -mx-6 -mt-2 mb-6 border-b border-emerald-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-emerald-900">{booking.farmer.name}</p>
                        <p className="text-xs text-emerald-700">{booking.farmer.phone}</p>
                    </div>
                    <div className="bg-white px-2 py-1 rounded-lg border border-emerald-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-500">BOOKING ID</p>
                        <p className="text-sm font-mono font-bold text-gray-900">#{booking.id}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Collection Items</label>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Item
                        </button>
                    </div>

                    {items.map((item, index) => (
                        <div key={index} className="flex gap-3 items-start animate-fadeIn">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Item name"
                                    value={item.vegetable}
                                    onChange={(e) => handleItemChange(index, 'vegetable', e.target.value)}
                                    className="bg-gray-50 border-gray-200"
                                    containerClassName="m-0"
                                />
                            </div>
                            <div className="w-28">
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="KG"
                                    value={item.weight}
                                    onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                    className="bg-gray-50 border-gray-200"
                                    containerClassName="m-0"
                                />
                            </div>
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-0.5"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 rounded-xl p-4 flex justify-between items-center text-white shadow-lg">
                    <span className="text-sm font-medium text-gray-300">Total Measured Weight</span>
                    <span className="text-2xl font-bold">{items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0).toFixed(2)} <span className="text-sm font-normal text-gray-400">KG</span></span>
                </div>

                <div className="flex items-center gap-2 text-sm justify-center bg-gray-50 py-2 rounded-lg border border-gray-200">
                    <MapPin className={`w-4 h-4 ${location ? 'text-green-500 animate-bounce' : 'text-gray-400'}`} />
                    {gettingLocation ? (
                        <span className="text-gray-500 italic">Triangulating GPS...</span>
                    ) : location ? (
                        <span className="text-green-700 font-bold">Location Verified</span>
                    ) : (
                        <button type="button" onClick={getCurrentLocation} className="text-blue-600 font-bold hover:underline">
                            Retry GPS
                        </button>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl" disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        disabled={!location || gettingLocation}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200"
                    >
                        Confirm Collection
                    </Button>
                </div>
            </form>
        </Modal>
    );
}