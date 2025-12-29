import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';

export default function FarmerGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [isFarmer, setIsFarmer] = useState(false);

    useEffect(() => {
        checkFarmerRole();
    }, []);

    const checkFarmerRole = () => {
        try {
            const token = sessionStorage.getItem('accessToken');

            if (!token) {
                setIsFarmer(false);
                setLoading(false);
                return;
            }

            // Decode JWT token to get user role
            const payload = JSON.parse(atob(token.split('.')[1]));

            if (payload.role === 'FARMER') {
                setIsFarmer(true);
            } else {
                setIsFarmer(false);
            }
        } catch (error) {
            console.error('Farmer check failed:', error);
            setIsFarmer(false);
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

    if (!isFarmer) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
