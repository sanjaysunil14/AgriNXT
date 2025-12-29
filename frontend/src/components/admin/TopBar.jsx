import { Menu, LogOut, ChevronRight } from 'lucide-react';
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            {/* Left side - Menu button and breadcrumbs */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.path} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <span
                                className={
                                    index === breadcrumbs.length - 1
                                        ? 'text-gray-900 font-medium'
                                        : 'text-gray-500'
                                }
                            >
                                {crumb.label}
                            </span>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right side - Logout button */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
            </button>
        </header>
    );
}
