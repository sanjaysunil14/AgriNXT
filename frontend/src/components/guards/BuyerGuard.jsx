import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';

export default function BuyerGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [isBuyer, setIsBuyer] = useState(false);

    useEffect(() => {
        checkBuyerRole();
    }, []);

    const checkBuyerRole = () => {
        try {
            const token = sessionStorage.getItem('accessToken');

            if (!token) {
                setIsBuyer(false);
                setLoading(false);
                return;
            }

            // Decode JWT token to get user role
            const payload = JSON.parse(atob(token.split('.')[1]));

            if (payload.role === 'BUYER') {
                setIsBuyer(true);
            } else {
                setIsBuyer(false);
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
