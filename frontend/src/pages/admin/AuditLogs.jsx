import { useState, useEffect } from 'react';
import { Clock, User, Target } from 'lucide-react';
import Table from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { addToast } = useToast();

    useEffect(() => {
        fetchLogs();
    }, [currentPage]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/audit-logs', {
                params: { page: currentPage, limit: 20 }
            });
            setLogs(response.data.data.logs);
            setPagination(response.data.data.pagination);
        } catch (error) {
            addToast('Failed to fetch audit logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action) => {
        const colors = {
            UPDATE_USER: 'bg-blue-100 text-blue-700',
            BAN_USER: 'bg-red-100 text-red-700',
            UNBAN_USER: 'bg-green-100 text-green-700',
            DELETE_USER: 'bg-red-100 text-red-700'
        };
        return colors[action] || 'bg-gray-100 text-gray-700';
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
            header: 'Admin',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                        {log.admin.full_name}
                    </span>
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
                <p className="text-gray-600">Track all admin actions in the system</p>
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
