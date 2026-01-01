import { useState, useEffect } from 'react';
import { Leaf, Calendar, ArrowLeft } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../utils/api';
import { useToast } from '../ui/Toast';

export default function BookingModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        collection_date: '',
        vegetable_type: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [vegetables, setVegetables] = useState([]);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customVegetable, setCustomVegetable] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchVegetables();
        }
    }, [isOpen]);

    const fetchVegetables = async () => {
        try {
            const response = await api.get('/farmer/vegetables');
            setVegetables(response.data.data.vegetables);
        } catch (error) {
            console.error('Failed to fetch vegetables:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleVegetableChange = (e) => {
        if (e.target.value === '__ADD_NEW__') {
            setShowCustomInput(true);
            setFormData({ ...formData, vegetable_type: '' });
        } else {
            handleChange(e);
            setShowCustomInput(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (showCustomInput && customVegetable.trim()) {
            setLoading(true);
            try {
                await api.post('/farmer/vegetables/request', {
                    vegetable_name: customVegetable.trim()
                });
                addToast('Vegetable request submitted for admin approval', 'success');
                setShowCustomInput(false);
                setCustomVegetable('');
                onClose();
                return;
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to submit request');
                return;
            } finally {
                setLoading(false);
            }
        }

        if (!formData.collection_date || !formData.vegetable_type) {
            setError('All fields are required');
            return;
        }

        const selectedDate = new Date(formData.collection_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError('Collection date cannot be in the past');
            return;
        }

        setLoading(true);

        try {
            await onSuccess(formData);
            setFormData({
                collection_date: '',
                vegetable_type: ''
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Book Collection Slot"
            size="md"
        >
            <div className="bg-emerald-50 p-4 -mx-6 -mt-2 mb-6 border-b border-emerald-100 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm text-emerald-800">
                    Schedule a pickup for your fresh produce.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                        {error}
                    </div>
                )}

                <Input
                    label="Collection Date *"
                    type="date"
                    name="collection_date"
                    value={formData.collection_date}
                    onChange={handleChange}
                    required
                    className="cursor-pointer"
                />

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Vegetable Type *
                    </label>
                    <div className="relative">
                        <select
                            name="vegetable_type"
                            value={formData.vegetable_type}
                            onChange={handleVegetableChange}
                            required={!showCustomInput}
                            className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white transition-colors appearance-none cursor-pointer font-medium"
                        >
                            <option value="">Select a vegetable</option>
                            {vegetables.map((veg) => (
                                <option key={veg} value={veg}>{veg}</option>
                            ))}
                            <option value="__ADD_NEW__" className="text-blue-600 font-bold">
                                + Request New Vegetable
                            </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <Leaf className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {showCustomInput && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3 animate-fadeIn">
                        <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide">
                            New Vegetable Name *
                        </label>
                        <input
                            type="text"
                            value={customVegetable}
                            onChange={(e) => setCustomVegetable(e.target.value)}
                            placeholder="Enter name (e.g. Broccoli)"
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setShowCustomInput(false);
                                setCustomVegetable('');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to list
                        </button>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-xl"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200"
                    >
                        {showCustomInput ? 'Submit Request' : 'Confirm Booking'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}