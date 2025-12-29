import { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            {/* Left: Menu button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Page title visible on desktop */}
            <div className="hidden lg:block">
                <h2 className="text-lg font-semibold text-gray-900">Welcome back!</h2>
            </div>

            {/* Right: User menu */}
            <div className="flex items-center gap-4">
                {user && (
                    <>
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <Avatar seed={user.full_name} size="md" />
                    </>
                )}

                <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
