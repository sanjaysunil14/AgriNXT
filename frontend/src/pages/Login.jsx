import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Loader2, Eye, EyeOff, Sprout, ArrowRight } from 'lucide-react';
import api from '../utils/api';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phone_number: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true); // New state for auth check
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const hasChecked = useRef(false);

    // Check if already logged in on component mount - only once
    useEffect(() => {
        if (!hasChecked.current) {
            hasChecked.current = true;
            checkExistingAuth();
        }
    }, []);

    const checkExistingAuth = async () => {
        try {
            // Call /users/me to check if cookie exists and is valid
            const response = await api.get('/users/me');

            if (response.data.success) {
                const userRole = response.data.data.user.role;

                // Redirect based on role
                if (userRole === 'ADMIN') {
                    navigate('/admin', { replace: true });
                } else if (userRole === 'BUYER') {
                    navigate('/buyer', { replace: true });
                } else if (userRole === 'FARMER') {
                    navigate('/farmer', { replace: true });
                }
            }
        } catch (error) {
            // Not authenticated, stay on login page
            console.log('No active session');
        } finally {
            // Always set checkingAuth to false after the check completes
            setCheckingAuth(false);
        }
    };

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

        // Validation Logic
        if (!formData.phone_number || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.phone_number.length !== 10) {
            setError('Phone number must be 10 digits');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);

            if (response.data.success) {
                const accessToken = response.data.data.accessToken;

                // Cookie is set automatically by backend
                // No need to store in sessionStorage

                // Decode JWT to get user role for navigation
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const userRole = payload.role;

                // Redirect based on role
                if (userRole === 'ADMIN') {
                    navigate('/admin');
                } else if (userRole === 'BUYER') {
                    navigate('/buyer');
                } else if (userRole === 'FARMER') {
                    navigate('/farmer');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading spinner while checking for existing auth
    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] translate-y-1/2"></div>
                </div>

                {/* Brand Header */}
                <div className="text-center relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Sprout className="w-9 h-9 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">AgriNXT</h1>
                    </div>

                    {/* Loading Spinner */}
                    <div className="relative flex justify-center">
                        <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Loader2 className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-6">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] translate-y-1/2"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Sprout className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">AgriNXT</h1>
                    </div>
                    <p className="text-slate-400 text-sm">Next Generation Agricultural Management</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/10 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6 relative">Welcome Back</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-fadeIn">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Phone Number Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                                Phone Number
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="9999999999"
                                    maxLength="10"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">
                            New to AgriNXT?{' '}
                            <Link
                                to="/signup"
                                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}