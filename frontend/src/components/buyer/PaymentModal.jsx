import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../utils/api';

export default function PaymentModal({ isOpen, onClose, farmer, onSuccess }) {
    const [formData, setFormData] = useState({
        amount: farmer?.balance?.toFixed(2) || '',
        mode: 'CASH',
        transaction_ref: ''
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
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (parseFloat(formData.amount) > farmer.balance) {
            setError('Amount cannot exceed outstanding balance');
            return;
        }

        setLoading(true);

        try {
            await api.post('/buyer/pay', {
                farmer_id: farmer.farmer_id,
                amount: parseFloat(formData.amount),
                mode: formData.mode,
                transaction_ref: formData.transaction_ref || null
            });

            // Reset form
            setFormData({
                amount: '',
                mode: 'CASH',
                transaction_ref: ''
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    if (!farmer) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Record Payment"
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
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Farmer:</span>
                        <span className="text-sm text-gray-900">{farmer.farmer_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Outstanding Balance:</span>
                        <span className="text-sm font-bold text-red-600">₹{farmer.balance.toFixed(2)}</span>
                    </div>
                    {farmer.payment_method && (
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                            <span className="text-sm text-gray-900">
                                {farmer.payment_method} - {farmer.payment_value}
                            </span>
                        </div>
                    )}
                </div>

                {/* Amount */}
                <Input
                    label="Payment Amount *"
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    required
                />

                {/* Payment Mode */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Mode *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {['CASH', 'UPI', 'BANK_TRANSFER'].map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setFormData({ ...formData, mode })}
                                className={`p-3 border-2 rounded-lg transition-all text-sm font-medium ${formData.mode === mode
                                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                    }`}
                            >
                                {mode === 'BANK_TRANSFER' ? 'Bank' : mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transaction Reference */}
                {(formData.mode === 'UPI' || formData.mode === 'BANK_TRANSFER') && (
                    <Input
                        label="Transaction Reference"
                        type="text"
                        name="transaction_ref"
                        value={formData.transaction_ref}
                        onChange={handleChange}
                        placeholder="Enter transaction ID/reference"
                    />
                )}

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
                        className="flex-1"
                    >
                        Record Payment
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
