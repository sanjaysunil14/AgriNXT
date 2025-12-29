import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Wallet } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function FarmerProfile() {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        payment_method: '',
        payment_value: ''
    });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/farmer/profile');
            const user = response.data.data.user;
            setProfile(user);
            setFormData({
                payment_method: user.payment_method || '',
                payment_value: user.payment_value || ''
            });
        } catch (error) {
            addToast('Failed to fetch profile', 'error');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.payment_method || !formData.payment_value) {
            addToast('Please fill in all payment details', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.put('/farmer/profile', formData);
            addToast('Payment details updated successfully', 'success');
            fetchProfile();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to update payment details', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <div className="p-6">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
                <p className="text-gray-600">Manage your account information and payment details</p>
            </div>

            {/* Profile Information (Read-only) */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p className="font-medium text-gray-900">{profile.full_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-xs text-gray-500">Phone Number</p>
                            <p className="font-medium text-gray-900">{profile.phone_number}</p>
                        </div>
                    </div>

                    {profile.email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{profile.email}</p>
                            </div>
                        </div>
                    )}

                    {profile.latitude && profile.longitude && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="w-5 h-5 text-gray-600" />
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-medium text-gray-900 text-sm">
                                    {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Payment Details (Editable) */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Payment Method
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Payment Method Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, payment_method: 'UPI' })}
                                className={`p-4 border-2 rounded-lg transition-all ${formData.payment_method === 'UPI'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <p className="font-semibold">UPI</p>
                                <p className="text-xs text-gray-500 mt-1">Google Pay, PhonePe, Paytm</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, payment_method: 'BANK' })}
                                className={`p-4 border-2 rounded-lg transition-all ${formData.payment_method === 'BANK'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <p className="font-semibold">Bank Transfer</p>
                                <p className="text-xs text-gray-500 mt-1">Direct to bank account</p>
                            </button>
                        </div>
                    </div>

                    {/* Payment Value Input */}
                    {formData.payment_method && (
                        <Input
                            label={formData.payment_method === 'UPI' ? 'UPI ID *' : 'Bank Account Number *'}
                            type="text"
                            name="payment_value"
                            value={formData.payment_value}
                            onChange={handleChange}
                            placeholder={
                                formData.payment_method === 'UPI'
                                    ? 'yourname@paytm'
                                    : 'Enter account number'
                            }
                            required
                        />
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={!formData.payment_method || !formData.payment_value}
                    >
                        Save Payment Details
                    </Button>

                    {!profile.payment_method && (
                        <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                            ⚠️ Payment method is required to receive payments for your produce
                        </p>
                    )}
                </form>
            </Card>
        </div>
    );
}
