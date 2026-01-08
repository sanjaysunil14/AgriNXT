import { useState, useEffect } from 'react';
import { Menu, LogOut, Bell, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import api from '../../utils/api';

export default function FarmerTopBar({ onMenuClick }) {
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

    const handleLogout = () => {
        sessionStorage.removeItem('accessToken');
        document.cookie = 'refreshToken=; Max-Age=0; path=/;';
        navigate('/');
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 transition-all">
            {/* Left: Menu button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2.5 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-emerald-100"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Page title visible on desktop */}
                <div className="hidden lg:block">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                        <span className="text-gray-400 font-normal">Welcome back,</span> {user?.full_name}!
                    </h2>
                </div>
            </div>

            {/* Right: User menu */}
            <div className="flex items-center gap-6">

                {/* Profile Section */}
                {user && (
                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.full_name}</p>
                            <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">FARMER</p>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="ring-2 ring-gray-100 rounded-full p-0.5 transition-all group-hover:ring-emerald-200"
                                onClick={() => navigate('/farmer/profile')}
                            >
                                <Avatar seed={user.full_name} size="md" />


                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm"
                    title="Sign Out"
                >
                    <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </div>
                    <span className="hidden lg:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}