import { Menu, LogOut, ChevronRight, Home, User, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';

export default function TopBar({ onMenuClick }) {
    const navigate = useNavigate();
    const location = useLocation();

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

    // Generate breadcrumbs from path
    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        return paths.map((path, index) => ({
            label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
            path: '/' + paths.slice(0, index + 1).join('/')
        }));
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 transition-all">
            {/* Left side - Menu button and breadcrumbs */}
            <div className="flex items-center gap-6">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2.5 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-emerald-100"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Breadcrumbs */}
                <nav className="hidden sm:flex items-center gap-2 text-sm bg-gray-50/80 px-4 py-2 rounded-full border border-gray-100">
                    <Home className="w-4 h-4 text-gray-400" />
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.path} className="flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-gray-300" />
                            <span
                                className={
                                    index === breadcrumbs.length - 1
                                        ? 'text-emerald-700 font-bold bg-emerald-100/50 px-2 py-0.5 rounded-md'
                                        : 'text-gray-500 font-medium hover:text-gray-700 transition-colors'
                                }
                            >
                                {crumb.label}
                            </span>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right side - Profile & Logout */}
            <div className="flex items-center gap-6">

                {/* Admin Profile Info */}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">Administrator</p>
                        <p className="text-xs text-gray-500 font-medium">System Access</p>
                    </div>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-md ring-4 ring-gray-50">
                            AD
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
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
                    <span className="hidden lg:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}