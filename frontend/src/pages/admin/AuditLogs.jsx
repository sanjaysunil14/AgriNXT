import { useState, useEffect } from 'react';
import { Clock, User, Target, Search, Filter } from 'lucide-react';
import Table from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { addToast } = useToast();

    // Filter states
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        user: '',
        action: 'ALL'
    });

    useEffect(() => {
        fetchLogs();
    }, [currentPage]);

    const fetchLogs = async (customFilters = null) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 20,
                ...(customFilters || filters)
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === 'ALL') {
                    delete params[key];
                }
            });

            const response = await api.get('/admin/audit-logs', { params });
            setLogs(response.data.data.logs);
            setPagination(response.data.data.pagination);
        } catch (error) {
            addToast('Failed to fetch audit logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page
        fetchLogs();
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            startDate: '',
            endDate: '',
            user: '',
            action: 'ALL'
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        fetchLogs(clearedFilters);
    };

    const getActionBadge = (action) => {
        const colors = {
            UPDATE_USER: 'bg-blue-100 text-blue-700',
            BAN_USER: 'bg-red-100 text-red-700',
            UNBAN_USER: 'bg-green-100 text-green-700',
            DELETE_USER: 'bg-red-100 text-red-700',
            SET_DAILY_PRICES: 'bg-purple-100 text-purple-700',
            BOOKING_CREATED: 'bg-green-100 text-green-700',
            COLLECTION_RECORDED: 'bg-blue-100 text-blue-700',
            PAYMENT_RECORDED: 'bg-yellow-100 text-yellow-700'
        };
        return colors[action] || 'bg-gray-100 text-gray-700';
    };

    const getRoleBadge = (role) => {
        const colors = {
            ADMIN: 'bg-red-100 text-red-700',
            BUYER: 'bg-blue-100 text-blue-700',
            FARMER: 'bg-green-100 text-green-700'
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    const columns = [
        {
            header: 'Timestamp',
            render: (log) => (
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="font-medium text-gray-900">
                            {new Date(log.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'User',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                        <span className="text-sm font-medium text-gray-900">
                            {log.user?.full_name || 'System'}
                        </span>
                        {log.user_role && (
                            <span className={`ml-2 inline-flex px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(log.user_role)}`}>
                                {log.user_role}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Action',
            render: (log) => (
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            header: 'Target User',
            render: (log) => (
                <div className="flex items-center gap-2">
                    {log.target_user ? (
                        <>
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{log.target_user.full_name}</span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500">-</span>
                    )}
                </div>
            )
        },
        {
            header: 'Details',
            render: (log) => (
                <p className="text-sm text-gray-600 max-w-md truncate">
                    {log.details || '-'}
                </p>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-gray-600">Track all system actions from Admin, Buyer, and Farmer users</p>
            </div>

            {/* Search & Filter Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* User Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User Name
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={filters.user}
                            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Action Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Action Type
                        </label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Actions</option>
                            <option value="BOOKING">Booking</option>
                            <option value="COLLECTION">Collection</option>
                            <option value="PAYMENT">Payment</option>
                            <option value="UPDATE">Update</option>
                            <option value="BAN">Ban/Unban</option>
                            <option value="DELETE">Delete</option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        Search
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <Table
                    columns={columns}
                    data={logs}
                    loading={loading}
                    emptyMessage="No audit logs found"
                    pagination={pagination}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
