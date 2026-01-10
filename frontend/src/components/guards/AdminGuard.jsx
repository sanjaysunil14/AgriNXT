import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import api from '../../utils/api';

export default function AdminGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            // API call will include cookie automatically
            const response = await api.get('/users/me');

            if (response.data.success) {
                const userRole = response.data.data.user.role;

                if (userRole === 'ADMIN') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            }
        } catch (error) {
            console.error('Admin check failed:', error);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
