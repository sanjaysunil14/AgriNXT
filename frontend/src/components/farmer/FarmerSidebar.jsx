import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, User, X } from 'lucide-react';

export default function FarmerSidebar({ isOpen, onClose }) {
    const navItems = [
        { to: '/farmer', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/farmer/history', icon: History, label: 'History' },
        { to: '/farmer/profile', icon: User, label: 'Profile & Settings' }
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo/Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">Farmer Portal</h1>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-50 text-primary-700 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            Farmer Module v1.0
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
