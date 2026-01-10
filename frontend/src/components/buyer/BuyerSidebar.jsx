import { NavLink, useNavigate } from 'react-router-dom';
import { DollarSign, FileText, LogOut, X, LayoutDashboard, CreditCard, Sprout, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

export default function BuyerSidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Cookies cleared by backend, just redirect
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
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-all duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="p-8 pb-4 flex-shrink-0">
                        <div className="flex items-center justify-between mb-6">
                            <div
                                onClick={() => navigate('/buyer')}
                                className="flex items-center gap-3 cursor-pointer group select-none transition-transform hover:scale-[1.02]"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
                                    <Sprout className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">AgriNXT</h1>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-2">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Buyer Portal</p>
                            <p className="text-xs text-slate-400">Procurement System</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-6">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Menu</p>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={() => onClose()}
                                className={({ isActive }) =>
                                    `group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/20 translate-x-1'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout (Mobile) */}
                    <div className="p-4 mt-auto lg:hidden">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-white/5 rounded-xl transition-all duration-300 font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}