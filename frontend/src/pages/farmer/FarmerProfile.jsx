import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Wallet, CreditCard, Building, Save } from 'lucide-react';
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
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
                <p className="text-gray-500">Manage your account information and payout preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Personal Info (Read-only) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-lg">
                                {profile.full_name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                            <p className="text-emerald-600 font-medium">Registered Farmer</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                                    <p className="text-gray-900 font-medium">{profile.phone_number}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                                    <p className="text-gray-900 font-medium">{profile.email || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Location</p>
                                    <p className="text-gray-900 font-medium">
                                        {profile.latitude?.toFixed(4)}, {profile.longitude?.toFixed(4)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Settings */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-emerald-600" />
                            Payout Settings
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                                    Select Payment Method
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, payment_method: 'UPI' })}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${formData.payment_method === 'UPI'
                                            ? 'border-emerald-500 bg-emerald-50/50'
                                            : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full ${formData.payment_method === 'UPI' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className={`font-bold ${formData.payment_method === 'UPI' ? 'text-emerald-900' : 'text-gray-700'}`}>UPI Transfer</p>
                                            <p className="text-xs text-gray-500 mt-1">Google Pay, PhonePe, Paytm</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, payment_method: 'BANK' })}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${formData.payment_method === 'BANK'
                                            ? 'border-emerald-500 bg-emerald-50/50'
                                            : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full ${formData.payment_method === 'BANK' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            <Building className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className={`font-bold ${formData.payment_method === 'BANK' ? 'text-emerald-900' : 'text-gray-700'}`}>Bank Transfer</p>
                                            <p className="text-xs text-gray-500 mt-1">Direct to Bank Account</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Payment Value Input */}
                            <div className={`transition-all duration-300 ${formData.payment_method ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                                <Input
                                    label={formData.payment_method === 'UPI' ? 'UPI ID *' : formData.payment_method === 'BANK' ? 'Account Number *' : 'Payment Details'}
                                    type="text"
                                    name="payment_value"
                                    value={formData.payment_value}
                                    onChange={handleChange}
                                    placeholder={
                                        formData.payment_method === 'UPI'
                                            ? 'e.g. 9999999999@upi'
                                            : formData.payment_method === 'BANK' ? 'Enter full account number' : 'Select a method first'
                                    }
                                    disabled={!formData.payment_method}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                disabled={!formData.payment_method || !formData.payment_value}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 font-bold flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Save Payment Details
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}