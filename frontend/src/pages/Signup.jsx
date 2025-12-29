import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Phone, Mail, MapPin, Lock, Loader2, Building } from 'lucide-react';
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

        // Validation
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
        if (formData.role === 'FARMER') {
            if (!formData.latitude || !formData.longitude) {
                setError('Please select your location on the map');
                return;
            }
        }

        if (formData.role === 'BUYER') {
            if (!formData.business_name) {
                setError('Business name is required for buyers');
                return;
            }
        }

        setLoading(true);

        try {
            const payload = {
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                email: formData.email || null,
                password: formData.password,
                role: formData.role
            };

            // Add role-specific fields
            if (formData.role === 'FARMER') {
                payload.latitude = formData.latitude;
                payload.longitude = formData.longitude;
            } else if (formData.role === 'BUYER') {
                payload.business_name = formData.business_name;
                payload.address = formData.address;
            }

            const response = await api.post('/auth/register', payload);

            if (response.data.success) {
                // Show success message and redirect to login
                alert('Account created successfully! Please wait for admin approval before logging in.');
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600">
                        Join the Farmer-to-Buyer Platform
                    </p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Sign Up
                    </h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am a *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'FARMER' })}
                                    className={`p-4 border-2 rounded-lg transition-all ${formData.role === 'FARMER'
                                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    disabled={loading}
                                >
                                    <div className="text-center">
                                        <p className="font-semibold">Farmer</p>
                                        <p className="text-xs text-gray-500 mt-1">Sell produce</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                                    className={`p-4 border-2 rounded-lg transition-all ${formData.role === 'BUYER'
                                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    disabled={loading}
                                >
                                    <div className="text-center">
                                        <p className="font-semibold">Buyer</p>
                                        <p className="text-xs text-gray-500 mt-1">Buy produce</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Common Fields */}
                        <Input
                            label="Full Name *"
                            icon={User}
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            disabled={loading}
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

                        {/* Farmer-specific: Map Picker */}
                        {formData.role === 'FARMER' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Location * (Click on map to select)
                                </label>
                                <MapPicker
                                    latitude={formData.latitude}
                                    longitude={formData.longitude}
                                    onChange={handleLocationChange}
                                />
                            </div>
                        )}

                        {/* Buyer-specific: Business Fields */}
                        {formData.role === 'BUYER' && (
                            <>
                                <Input
                                    label="Business Name *"
                                    icon={Building}
                                    type="text"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    placeholder="ABC Traders"
                                    disabled={loading}
                                    required
                                />

                                <Input
                                    label="Business Address"
                                    icon={MapPin}
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="123, Market Street, City"
                                    disabled={loading}
                                />
                            </>
                        )}

                        {/* Password */}
                        <Input
                            label="Password *"
                            icon={Lock}
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
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
                            placeholder="Re-enter password"
                            disabled={loading}
                            required
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            icon={UserPlus}
                            className="w-full"
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Your account will be activated after admin approval
                </p>
            </div>
        </div>
    );
}
