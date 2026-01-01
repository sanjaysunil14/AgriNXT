import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function VegetableRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const { addToast } = useToast();

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/vegetable-requests', {
                params: { status: filter }
            });
            setRequests(response.data.data.requests);
        } catch (error) {
            addToast('Failed to fetch vegetable requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/vegetable-requests/${id}`, {
                status: 'APPROVED'
            });
            addToast('Vegetable request approved successfully', 'success');
            fetchRequests();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to approve request', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/admin/vegetable-requests/${id}`, {
                status: 'REJECTED'
            });
            addToast('Vegetable request rejected', 'success');
            fetchRequests();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to reject request', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            APPROVED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const columns = [
        {
            header: 'Vegetable Name',
            render: (request) => (
                <span className="font-medium text-gray-900">{request.vegetable_name}</span>
            )
        },
        {
            header: 'Requested By',
            render: (request) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {request.farmer.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {request.farmer.phone_number}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            render: (request) => (
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                    {request.status}
                </span>
            )
        },
        {
            header: 'Requested On',
            render: (request) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {new Date(request.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Actions',
            render: (request) => (
                <div className="flex gap-2">
                    {request.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handleApprove(request.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                            </button>
                            <button
                                onClick={() => handleReject(request.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                        </>
                    )}
                    {request.status !== 'PENDING' && (
                        <span className="text-sm text-gray-500">No actions available</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Vegetable Requests</h1>
                <p className="text-gray-600">Review and approve farmer vegetable requests</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
                <button
                    onClick={() => setFilter('PENDING')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'PENDING'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('APPROVED')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'APPROVED'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setFilter('REJECTED')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'REJECTED'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Rejected
                </button>
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'ALL'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <Table
                    columns={columns}
                    data={requests}
                    loading={loading}
                    emptyMessage="No vegetable requests found"
                />
            </div>
        </div>
    );
}
