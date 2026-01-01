import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Phone, Mail, MapPin, Lock, Building, Sprout, Tractor, ShoppingBag } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import MapPicker from '../components/ui/MapPicker';
import api from '../utils/api';

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'FARMER',
        // Farmer-specific
        latitude: null,
        longitude: null,
        // Buyer-specific
        business_name: '',
        address: ''
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

    const handleLocationChange = (lat, lng) => {
        setFormData({
            ...formData,
            latitude: lat,
            longitude: lng
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation Logic
        if (!formData.full_name || !formData.phone_number || !formData.password || !formData.role) {
            setError('Please fill in all required fields');
            return;
        }
        if (formData.phone_number.length !== 10) {
            setError('Phone number must be 10 digits');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        // Role-specific validation
        if (formData.role === 'FARMER' && (!formData.latitude || !formData.longitude)) {
            setError('Please select your location on the map');
            return;
        }
        if (formData.role === 'BUYER' && !formData.business_name) {
            setError('Business name is required for buyers');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                email: formData.email || null,
                password: formData.password,
                role: formData.role,
                // Add role-specific fields
                ...(formData.role === 'FARMER' ? {
                    latitude: formData.latitude,
                    longitude: formData.longitude
                } : {
                    business_name: formData.business_name,
                    address: formData.address
                })
            };

            const response = await api.post('/auth/register', payload);

            if (response.data.success) {
                alert('Account created successfully! Please wait for admin approval.');
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] translate-y-1/2"></div>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Sprout className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">AgriNXT</h1>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-slate-400">Join the future of agricultural commerce</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                                    I am a
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'FARMER' })}
                                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${formData.role === 'FARMER'
                                                ? 'border-emerald-500 bg-emerald-50/50'
                                                : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                                            }`}
                                        disabled={loading}
                                    >
                                        <div className={`p-3 rounded-full transition-colors ${formData.role === 'FARMER' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                                            }`}>
                                            <Tractor className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-bold ${formData.role === 'FARMER' ? 'text-emerald-900' : 'text-gray-700'}`}>Farmer</p>
                                            <p className="text-xs text-gray-500 mt-1">Selling Produce</p>
                                        </div>
                                        {formData.role === 'FARMER' && (
                                            <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-500 rounded-full"></div>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${formData.role === 'BUYER'
                                                ? 'border-blue-500 bg-blue-50/50'
                                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                            }`}
                                        disabled={loading}
                                    >
                                        <div className={`p-3 rounded-full transition-colors ${formData.role === 'BUYER' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                            }`}>
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-bold ${formData.role === 'BUYER' ? 'text-blue-900' : 'text-gray-700'}`}>Buyer</p>
                                            <p className="text-xs text-gray-500 mt-1">Purchasing</p>
                                        </div>
                                        {formData.role === 'BUYER' && (
                                            <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full"></div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-4"></div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label="Full Name *"
                                    icon={User}
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    disabled={loading}
                                    containerClassName="md:col-span-2"
                                    required
                                />

                                <Input
                                    label="WhatsApp Number *"
                                    icon={Phone}
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="9999999999"
                                    maxLength="10"
                                    disabled={loading}
                                    required
                                />

                                <Input
                                    label="Email (Optional)"
                                    icon={Mail}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    disabled={loading}
                                />

                                {formData.role === 'BUYER' && (
                                    <>
                                        <Input
                                            label="Business Name *"
                                            icon={Building}
                                            type="text"
                                            name="business_name"
                                            value={formData.business_name}
                                            onChange={handleChange}
                                            placeholder="Agri Traders Ltd"
                                            disabled={loading}
                                            containerClassName="md:col-span-2"
                                            required
                                        />
                                        <Input
                                            label="Business Address"
                                            icon={MapPin}
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="123 Market St"
                                            disabled={loading}
                                            containerClassName="md:col-span-2"
                                        />
                                    </>
                                )}

                                {formData.role === 'FARMER' && (
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                                            Farm Location *
                                        </label>
                                        <MapPicker
                                            latitude={formData.latitude}
                                            longitude={formData.longitude}
                                            onChange={handleLocationChange}
                                        />
                                    </div>
                                )}

                                <Input
                                    label="Password *"
                                    icon={Lock}
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min 6 chars"
                                    disabled={loading}
                                    required
                                />

                                <Input
                                    label="Confirm Password *"
                                    icon={Lock}
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                loading={loading}
                                icon={UserPlus}
                                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xl shadow-emerald-500/20"
                            >
                                Create Account
                            </Button>
                        </form>
                    </div>

                    <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
                        <p className="text-gray-600 text-sm mb-4">
                            Already have an account?{' '}
                            <Link to="/" className="text-emerald-700 font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                        <p className="text-xs text-gray-400">
                            By creating an account, you agree to our Terms of Service.
                            <br />Account activation subject to admin approval.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}