import { NavLink, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Wallet, FileText, LogOut, X, LayoutDashboard, CreditCard } from 'lucide-react';
import api from '../../utils/api';

export default function BuyerSidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            sessionStorage.removeItem('accessToken');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            sessionStorage.removeItem('accessToken');
            navigate('/');
        }
    };

    const navItems = [
        { to: '/buyer', icon: LayoutDashboard, label: 'Field Route', end: true },
        { to: '/buyer/pricing', icon: DollarSign, label: 'View Prices' },
        { to: '/buyer/payments', icon: CreditCard, label: 'Payments' },
        { to: '/buyer/invoices', icon: FileText, label: 'Invoices' }
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <div>
                            <h2 className="text-xl font-bold text-white">Buyer Portal</h2>
                            <p className="text-xs text-gray-400">Procurement System</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={() => onClose()}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${isActive
                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-lg before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-green-400 before:rounded-l-lg'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all duration-200 font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
