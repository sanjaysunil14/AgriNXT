import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Plus, X, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import BookingModal from '../../components/farmer/BookingModal';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function FarmerDashboard() {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, bookingsRes, profileRes] = await Promise.all([
                api.get('/farmer/stats'),
                api.get('/farmer/bookings'),
                api.get('/farmer/profile')
            ]);

            setStats(statsRes.data.data);
            setBookings(bookingsRes.data.data.bookings);
            setProfile(profileRes.data.data.user);
        } catch (error) {
            addToast('Failed to fetch dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBooking = async (formData) => {
        const response = await api.post('/farmer/bookings', formData);
        addToast('Booking created successfully!', 'success');
        fetchData();
        return response.data;
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await api.put(`/farmer/bookings/${bookingId}/cancel`);
            addToast('Booking cancelled', 'warning');
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to cancel booking', 'error');
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
            PENDING: 'bg-yellow-100 text-yellow-800',
            OPEN: 'bg-blue-100 text-blue-800',
            ROUTED: 'bg-purple-100 text-purple-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const bookingColumns = [
        {
            header: 'Collection Date',
            render: (booking) => formatDate(booking.date)
        },
        {
            header: 'Vegetable',
            render: (booking) => booking.vegetable_type || booking.vegetables_summary || '-'
        },
        {
            header: 'Quantity (KG)',
            render: (booking) => booking.quantity_kg?.toFixed(2) || booking.estimated_weight?.toFixed(2) || '-'
        },
        {
            header: 'Status',
            render: (booking) => getStatusBadge(booking.status)
        },
        {
            header: 'Actions',
            render: (booking) => (
                booking.status === 'PENDING' ? (
                    <Button
                        size="sm"
                        variant="danger"
                        icon={X}
                        onClick={() => handleCancelBooking(booking.id)}
                    >
                        Cancel
                    </Button>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                )
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Manage your bookings and track earnings</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setBookingModalOpen(true)}
                >
                    Book Collection Slot
                </Button>
            </div>

            {/* Payment Warning */}
            {profile && !profile.payment_method && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-orange-900">
                            Payment Method Not Set
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                            Please set up your payment details in the Profile page to receive payments.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                ₹{stats?.total_revenue?.toFixed(2) || '0.00'}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Dues</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                ₹{stats?.pending_dues?.toFixed(2) || '0.00'}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                {stats?.active_bookings_count || 0}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Active Bookings Table */}
            <Card>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Active Bookings</h2>
                    <p className="text-sm text-gray-600">Manage your upcoming collection slots</p>
                </div>

                <Table
                    columns={bookingColumns}
                    data={bookings}
                    loading={loading}
                    emptyMessage="No active bookings. Click 'Book Collection Slot' to create one."
                />
            </Card>

            {/* Booking Modal */}
            <BookingModal
                isOpen={bookingModalOpen}
                onClose={() => setBookingModalOpen(false)}
                onSuccess={handleCreateBooking}
            />
        </div>
    );
}
