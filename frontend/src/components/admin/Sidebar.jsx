import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, FileText, X, UserCheck, DollarSign, TrendingUp, Sparkles, Carrot, Sprout, ChevronRight } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    const navItems = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/approvals', icon: UserCheck, label: 'User Approvals' },
        { to: '/admin/vegetable-requests', icon: Carrot, label: 'Vegetable Requests' },
        { to: '/admin/set-prices', icon: DollarSign, label: 'Set Daily Prices' },
        { to: '/admin/profitability', icon: TrendingUp, label: 'Profitability Analysis' },
        { to: '/admin/performance', icon: Sparkles, label: 'AI Performance Summary' },
        { to: '/admin/invoices', icon: FileText, label: 'Invoice Management' },
        { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 lg:hidden"
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
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Logo/Header - Now Clickable */}
                <div className="relative z-10 p-8 pb-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <div
                            onClick={() => navigate('/admin')}
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
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                </div>

                {/* Navigation */}
                <nav className="relative z-10 flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-6">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
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
            </aside>
        </>
    );
}