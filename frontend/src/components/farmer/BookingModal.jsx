import { useState } from 'react';
import { X } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function BookingModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        collection_date: '',
        vegetable_type: '',
        quantity_kg: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.collection_date || !formData.vegetable_type || !formData.quantity_kg) {
            setError('All fields are required');
            return;
        }

        if (parseFloat(formData.quantity_kg) <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        // Check if date is in past
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
            // Reset form
            setFormData({
                collection_date: '',
                vegetable_type: '',
                quantity_kg: ''
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
            closeOnBackdrop={false}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <Input
                    label="Collection Date *"
                    type="date"
                    name="collection_date"
                    value={formData.collection_date}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Vegetable Type *"
                    type="text"
                    name="vegetable_type"
                    value={formData.vegetable_type}
                    onChange={handleChange}
                    placeholder="e.g., Tomatoes, Potatoes"
                    required
                />

                <Input
                    label="Quantity (in KG) *"
                    type="number"
                    step="0.1"
                    name="quantity_kg"
                    value={formData.quantity_kg}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    required
                />

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
                        className="flex-1"
                    >
                        Create Booking
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
