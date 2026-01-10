import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import api from '../../utils/api';

export default function BuyerGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [isBuyer, setIsBuyer] = useState(false);

    useEffect(() => {
        checkBuyerRole();
    }, []);

    const checkBuyerRole = async () => {
        try {
            // API call will include cookie automatically
            const response = await api.get('/users/me');

            if (response.data.success) {
                const userRole = response.data.data.user.role;

                if (userRole === 'BUYER') {
                    setIsBuyer(true);
                } else {
                    setIsBuyer(false);
                }
            }
        } catch (error) {
            console.error('Buyer check failed:', error);
            setIsBuyer(false);
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

    if (!isBuyer) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
