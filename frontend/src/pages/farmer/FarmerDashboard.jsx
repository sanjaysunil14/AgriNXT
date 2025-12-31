import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Plus, X, AlertCircle, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import BookingModal from '../../components/farmer/BookingModal';
import TrackBuyerModal from '../../components/farmer/TrackBuyerModal';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function FarmerDashboard() {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [trackModalOpen, setTrackModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
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

    const handleTrackBuyer = (booking) => {
        setSelectedBookingId(booking.id);
        setTrackModalOpen(true);
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '-';
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
            OPEN: 'bg-blue-100 text-blue-800 border border-blue-300',
            ROUTED: 'bg-purple-100 text-purple-800 border border-purple-300',
            COMPLETED: 'bg-green-100 text-green-800 border border-green-300',
            CANCELLED: 'bg-red-100 text-red-800 border border-red-300'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
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
            render: (booking) => {
                const qty = booking.quantity_kg || booking.estimated_weight;
                return qty ? qty.toFixed(2) : <span className="text-gray-400">To be determined</span>;
            }
        },
        {
            header: 'Status',
            render: (booking) => getStatusBadge(booking.status)
        },
        {
            header: 'Actions',
            render: (booking) => (
                <div className="flex gap-2">
                    {booking.status === 'PENDING' && (
                        <Button
                            size="sm"
                            variant="danger"
                            icon={X}
                            onClick={() => handleCancelBooking(booking.id)}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="primary"
                        icon={MapPin}
                        onClick={() => handleTrackBuyer(booking)}
                    >
                        Track
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your bookings and track earnings</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setBookingModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                >
                    Book Collection Slot
                </Button>
            </div>

            {/* Payment Warning */}
            {profile && !profile.payment_method && (
                <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-orange-900">
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
                <div className="bg-white rounded-xl p-6 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                                Total Earnings
                            </p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                ₹{stats?.total_revenue?.toFixed(2) || '0.00'}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-2">
                                Pending Dues
                            </p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                ₹{stats?.pending_dues?.toFixed(2) || '0.00'}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                                Active Bookings
                            </p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                {stats?.active_bookings_count || 0}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-bold text-gray-900">Active Bookings</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your upcoming collection slots</p>
                </div>

                <Table
                    columns={bookingColumns}
                    data={bookings}
                    loading={loading}
                    emptyMessage="No active bookings. Click 'Book Collection Slot' to create one."
                />
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={bookingModalOpen}
                onClose={() => setBookingModalOpen(false)}
                onSuccess={handleCreateBooking}
            />

            {/* Track Buyer Modal */}
            <TrackBuyerModal
                isOpen={trackModalOpen}
                onClose={() => {
                    setTrackModalOpen(false);
                    setSelectedBookingId(null);
                }}
                bookingId={selectedBookingId}
            />
        </div>
    );
}
