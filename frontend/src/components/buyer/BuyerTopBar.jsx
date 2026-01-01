import { Menu, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function BuyerTopBar({ onMenuClick }) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data.data.user);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            sessionStorage.removeItem('accessToken');
            navigate('/');
        }
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 transition-all">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2.5 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-emerald-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="hidden lg:block">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                            Procurement <span className="text-emerald-600">Console</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Profile Info */}
                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                                {user?.full_name || 'Loading...'}
                            </p>
                            <p className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                                BUYER
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-4 ring-gray-50">
                            {user?.full_name?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm"
                        title="Sign Out"
                    >
                        <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}