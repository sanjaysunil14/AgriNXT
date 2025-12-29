import { Menu, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function BuyerTopBar({ onMenuClick }) {
    const [user, setUser] = useState(null);

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

    return (
        <header className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="hidden lg:block">
                        <h1 className="text-lg font-semibold text-gray-900">
                            Procurement Management
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <div className="text-sm">
                        <p className="font-medium text-gray-900">
                            {user?.full_name || 'Loading...'}
                        </p>
                        <p className="text-xs text-gray-500">Buyer</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
