import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../utils/api';

export default function CollectionModal({ isOpen, onClose, booking, onSuccess }) {
    const [items, setItems] = useState([{ vegetable: '', weight: '' }]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);

    useEffect(() => {
        if (isOpen && booking) {
            // Initialize with booking vegetable if available
            if (booking.vegetable_type) {
                setItems([{ vegetable: booking.vegetable_type, weight: '' }]);
            }
            // Get current location
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

    const handleAddItem = () => {
        setItems([...items, { vegetable: '', weight: '' }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
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
                location
            });

            // Reset form
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Record Collection"
            size="md"
            closeOnBackdrop={false}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Farmer Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Farmer: {booking.farmer.name}</p>
                    <p className="text-sm text-gray-600">Phone: {booking.farmer.phone}</p>
                </div>

                {/* GPS Location Status */}
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className={`w-4 h-4 ${location ? 'text-green-600' : 'text-gray-400'}`} />
                    {gettingLocation ? (
                        <span className="text-gray-600">Getting location...</span>
                    ) : location ? (
                        <span className="text-green-600">
                            Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="text-primary-600 hover:underline"
                        >
                            Get GPS Location
                        </button>
                    )}
                </div>

                {/* Collection Items */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Collection Items *
                    </label>
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Vegetable name"
                                value={item.vegetable}
                                onChange={(e) => handleItemChange(index, 'vegetable', e.target.value)}
                                className="flex-1"
                                required
                            />
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="Weight (KG)"
                                value={item.weight}
                                onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                className="w-32"
                                required
                            />
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddItem}
                        size="sm"
                    >
                        + Add Another Item
                    </Button>
                </div>

                {/* Total Weight */}
                <div className="bg-primary-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-primary-900">
                        Total Weight: {items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0).toFixed(2)} KG
                    </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={!location || gettingLocation}
                        className="flex-1"
                    >
                        Record Collection
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
