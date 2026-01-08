import { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';
import { History, Calendar, CheckCircle, XCircle, Search } from 'lucide-react';

export default function FarmerHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [filteredHistory, setFilteredHistory] = useState([]);
    const { addToast } = useToast();

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        let filtered = [...history];

        // Filter by vegetable name
        if (searchTerm) {
            filtered = filtered.filter(item => {
                const vegetableName = item.vegetable_type || item.vegetables_summary || '';
                return vegetableName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        // Filter by date
        if (dateFilter) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date).toISOString().split('T')[0];
                return itemDate === dateFilter;
            });
        }

        setFilteredHistory(filtered);
    }, [history, searchTerm, dateFilter]);

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

            {/* Filters */}
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search by Vegetable Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                            Search Vegetable
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by vegetable name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-gray-900 font-medium"
                            />
                        </div>
                    </div>

                    {/* Filter by Date */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                            Filter by Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-gray-900 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Summary & Clear */}
                {(searchTerm || dateFilter) && (
                    <div className="mt-4 flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <p className="text-sm text-purple-700 font-medium">
                            Showing {filteredHistory.length} of {history.length} records
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setDateFilter('');
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700 font-bold hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <Table
                    columns={historyColumns}
                    data={filteredHistory.length > 0 || searchTerm || dateFilter ? filteredHistory : history}
                    loading={loading}
                    emptyMessage="No historical records found"
                />
            </div>
        </div>
    );
}