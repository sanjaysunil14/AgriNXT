import { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';
import { History, Calendar, CheckCircle, XCircle } from 'lucide-react';

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
            COMPLETED: 'bg-green-100 text-green-700 border-green-200',
            CANCELLED: 'bg-red-50 text-red-600 border-red-100'
        };
        const icons = {
            COMPLETED: <CheckCircle className="w-3 h-3" />,
            CANCELLED: <XCircle className="w-3 h-3" />
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    const historyColumns = [
        {
            header: 'Collection Date',
            render: (item) => (
                <div className="flex items-center gap-2 font-medium text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(item.date)}
                </div>
            )
        },
        {
            header: 'Vegetable',
            render: (item) => <span className="font-bold text-gray-900">{item.vegetable_type || item.vegetables_summary || '-'}</span>
        },
        {
            header: 'Quantity',
            render: (item) => (
                <span className="font-mono text-gray-700">
                    {item.quantity_kg?.toFixed(2) || item.estimated_weight?.toFixed(2) || '-'} <span className="text-xs text-gray-400 font-sans">KG</span>
                </span>
            )
        },
        {
            header: 'Status',
            render: (item) => getStatusBadge(item.status)
        },
        {
            header: 'Last Updated',
            render: (item) => <span className="text-xs text-gray-500">{formatDate(item.updated_at)}</span>
        }
    ];

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl">
                    <History className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
                    <p className="text-gray-500">Archive of your completed and cancelled collections</p>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <Table
                    columns={historyColumns}
                    data={history}
                    loading={loading}
                    emptyMessage="No historical records found"
                />
            </div>
        </div>
    );
}