import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import api from '../../utils/api';

export default function FarmerGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [isFarmer, setIsFarmer] = useState(false);

    useEffect(() => {
        checkFarmerRole();
    }, []);

    const checkFarmerRole = async () => {
        try {
            // API call will include cookie automatically
            const response = await api.get('/users/me');

            if (response.data.success) {
                const userRole = response.data.data.user.role;

                if (userRole === 'FARMER') {
                    setIsFarmer(true);
                } else {
                    setIsFarmer(false);
                }
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
