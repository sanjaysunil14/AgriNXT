import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
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
            header: 'Applicant',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                        {user.full_name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.phone_number}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Location Data',
            render: (user) => (
                <button
                    onClick={() => setLocationModal({ isOpen: true, farmer: user })}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                    <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">
                        {user.latitude?.toFixed(4)}, {user.longitude?.toFixed(4)}
                    </span>
                </button>
            )
        },
        {
            header: 'Requested',
            render: (user) => (
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Clock className="w-3 h-3" />
                    {new Date(user.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Decision',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleApprove(user.id)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        title="Approve"
                    >
                        <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleReject(user.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Reject"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ];

    const buyerColumns = [
        {
            header: 'Business Profile',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {user.full_name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{user.business_name || user.full_name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Business Entity</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact',
            render: (user) => (
                <div>
                    <p className="text-sm font-medium text-gray-900">{user.email || '-'}</p>
                    <p className="text-xs text-gray-500">{user.phone_number}</p>
                </div>
            )
        },
        {
            header: 'Address',
            render: (user) => <span className="text-sm text-gray-600 max-w-xs truncate block">{user.address || '-'}</span>
        },
        {
            header: 'Requested',
            render: (user) => (
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Clock className="w-3 h-3" />
                    {new Date(user.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Decision',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleApprove(user.id)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        title="Approve"
                    >
                        <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleReject(user.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Reject"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Registration Requests</h1>
                    <p className="text-gray-500 mt-1">Review and verify new account applications</p>
                </div>
                
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
                {/* Custom Tab Switcher */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex p-1 bg-gray-200/50 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('FARMER')}
                            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'FARMER'
                                    ? 'bg-white text-emerald-700 shadow-md transform scale-105'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Farmer Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('BUYER')}
                            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'BUYER'
                                    ? 'bg-white text-blue-700 shadow-md transform scale-105'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Buyer Requests
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="">
                    <Table
                        columns={activeTab === 'FARMER' ? farmerColumns : buyerColumns}
                        data={users}
                        loading={loading}
                        emptyMessage={
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <p className="text-gray-900 font-bold text-lg">All Caught Up!</p>
                                <p className="text-gray-500">No pending {activeTab.toLowerCase()} requests at the moment.</p>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Location View Modal */}
            <LocationViewModal
                isOpen={locationModal.isOpen}
                onClose={() => setLocationModal({ isOpen: false, farmer: null })}
                farmer={locationModal.farmer}
            />
        </div>
    );
}