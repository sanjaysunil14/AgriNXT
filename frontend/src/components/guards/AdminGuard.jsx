import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../ui/Spinner';

export default function AdminGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const response = await api.get('/users/me');
            const user = response.data.data.user;

            if (user.role === 'ADMIN') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
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
