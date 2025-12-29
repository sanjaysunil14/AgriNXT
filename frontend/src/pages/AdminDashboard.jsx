import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Phone, Shield, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch user data from backend
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me');
                setUser(response.data.data.user);
            } catch (error) {
                console.error('Failed to fetch user:', error);
                navigate('/');
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            // Call logout API to clear refresh token cookie
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear sessionStorage and redirect
            sessionStorage.removeItem('accessToken');
            navigate('/');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-500">Farmer-to-Buyer System</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-8 h-8" />
                        <h2 className="text-2xl font-bold">Welcome, {user.full_name}!</h2>
                    </div>
                    <p className="text-primary-100">
                        You are successfully logged in to the Farmer-to-Buyer Procurement Management System.
                    </p>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <User className="w-5 h-5 text-primary-600" />
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-semibold text-gray-900">{user.full_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Phone className="w-5 h-5 text-primary-600" />
                            <div>
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="font-semibold text-gray-900">{user.phone_number}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Shield className="w-5 h-5 text-primary-600" />
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="font-semibold text-gray-900">{user.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-semibold text-green-600">
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Placeholder for Future Features */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
                            <p className="text-gray-500 font-medium">Manage Farmers</p>
                            <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                        </button>
                        <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
                            <p className="text-gray-500 font-medium">View Routes</p>
                            <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                        </button>
                        <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
                            <p className="text-gray-500 font-medium">Reports</p>
                            <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
