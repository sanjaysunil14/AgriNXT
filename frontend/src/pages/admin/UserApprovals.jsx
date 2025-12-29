import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LocationViewModal from '../../components/admin/LocationViewModal';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function UserApprovals() {
    const [activeTab, setActiveTab] = useState('FARMER');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationModal, setLocationModal] = useState({ isOpen: false, farmer: null });
    const { addToast } = useToast();

    useEffect(() => {
        fetchPendingUsers();
    }, [activeTab]);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/approvals/pending', {
                params: { role: activeTab }
            });
            setUsers(response.data.data.users);
        } catch (error) {
            addToast('Failed to fetch pending users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await api.put(`/admin/approvals/${userId}/approve`);
            addToast('User approved successfully', 'success');
            fetchPendingUsers();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to approve user', 'error');
        }
    };

    const handleReject = async (userId) => {
        if (!confirm('Are you sure you want to reject this user?')) return;

        try {
            await api.put(`/admin/approvals/${userId}/reject`);
            addToast('User rejected', 'warning');
            fetchPendingUsers();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to reject user', 'error');
        }
    };

    const farmerColumns = [
        {
            header: 'Name',
            render: (user) => (
                <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.phone_number}</p>
                </div>
            )
        },
        {
            header: 'Email',
            render: (user) => user.email || '-'
        },
        {
            header: 'Location',
            render: (user) => (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                        {user.latitude?.toFixed(4)}, {user.longitude?.toFixed(4)}
                    </span>
                    <button
                        onClick={() => setLocationModal({ isOpen: true, farmer: user })}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                    >
                        <MapPin className="w-4 h-4" />
                        View
                    </button>
                </div>
            )
        },
        {
            header: 'Signup Date',
            render: (user) => new Date(user.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            render: (user) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="primary"
                        icon={CheckCircle}
                        onClick={() => handleApprove(user.id)}
                    >
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        icon={XCircle}
                        onClick={() => handleReject(user.id)}
                    >
                        Reject
                    </Button>
                </div>
            )
        }
    ];

    const buyerColumns = [
        {
            header: 'Name',
            render: (user) => (
                <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.phone_number}</p>
                </div>
            )
        },
        {
            header: 'Business Name',
            accessor: 'business_name'
        },
        {
            header: 'Address',
            render: (user) => user.address || '-'
        },
        {
            header: 'Email',
            render: (user) => user.email || '-'
        },
        {
            header: 'Signup Date',
            render: (user) => new Date(user.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            render: (user) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="primary"
                        icon={CheckCircle}
                        onClick={() => handleApprove(user.id)}
                    >
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        icon={XCircle}
                        onClick={() => handleReject(user.id)}
                    >
                        Reject
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">User Approvals</h1>
                <p className="text-gray-600">Review and approve pending user registrations</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('FARMER')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'FARMER'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Farmers
                </button>
                <button
                    onClick={() => setActiveTab('BUYER')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'BUYER'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Buyers
                </button>
            </div>

            {/* Table */}
            <Card>
                <Table
                    columns={activeTab === 'FARMER' ? farmerColumns : buyerColumns}
                    data={users}
                    loading={loading}
                    emptyMessage={`No pending ${activeTab.toLowerCase()}s`}
                />
            </Card>

            {/* Location View Modal */}
            <LocationViewModal
                isOpen={locationModal.isOpen}
                onClose={() => setLocationModal({ isOpen: false, farmer: null })}
                farmer={locationModal.farmer}
            />
        </div>
    );
}
