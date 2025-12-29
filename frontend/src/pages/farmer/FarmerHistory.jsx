import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function FarmerHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/farmer/history');
            setHistory(response.data.data.history);
        } catch (error) {
            addToast('Failed to fetch history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const historyColumns = [
        {
            header: 'Collection Date',
            render: (item) => formatDate(item.date)
        },
        {
            header: 'Vegetable',
            render: (item) => item.vegetable_type || item.vegetables_summary || '-'
        },
        {
            header: 'Quantity (KG)',
            render: (item) => item.quantity_kg?.toFixed(2) || item.estimated_weight?.toFixed(2) || '-'
        },
        {
            header: 'Status',
            render: (item) => getStatusBadge(item.status)
        },
        {
            header: 'Last Updated',
            render: (item) => formatDate(item.updated_at)
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
                <p className="text-gray-600">View your completed and cancelled bookings</p>
            </div>

            {/* History Table */}
            <Card>
                <Table
                    columns={historyColumns}
                    data={history}
                    loading={loading}
                    emptyMessage="No booking history yet"
                />
            </Card>
        </div>
    );
}
