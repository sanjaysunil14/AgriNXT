import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Plus, X, AlertCircle, MapPin, ArrowUpRight, Leaf } from 'lucide-react';
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
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
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

    const handleCancelBooking = (bookingId) => {
        setBookingToCancel(bookingId);
        setCancelModalOpen(true);
    };

    const confirmCancelBooking = async () => {
        if (!bookingToCancel) return;

        try {
            await api.put(`/farmer/bookings/${bookingToCancel}/cancel`);
            addToast('Booking cancelled', 'warning');
            setCancelModalOpen(false);
            setBookingToCancel(null);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to cancel booking', 'error');
            setCancelModalOpen(false);
            setBookingToCancel(null);
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

    // Check if track button should be visible (only at/after 12 PM on collection date)
    const shouldShowTrackButton = (booking) => {
        // Show for PENDING, OPEN, or ROUTED bookings (assigned to buyer or awaiting assignment)
        // Note: PENDING bookings can be tracked after 12 PM even if buyer hasn't planned route yet
        if (!['PENDING', 'OPEN', 'ROUTED'].includes(booking.status)) {
            return false;
        }

        const departureHour = 12; // 12:00 PM (noon)
        const now = new Date();

        // Parse the booking date
        const bookingDate = new Date(booking.date);

        // Create a date object for today at 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create a date object for the booking date at 00:00:00
        const bookingDateOnly = new Date(bookingDate);
        bookingDateOnly.setHours(0, 0, 0, 0);

        // Create departure time (booking date at 12:00 PM)
        const departureTime = new Date(bookingDate);
        departureTime.setHours(departureHour, 0, 0, 0);

        // Show track button only if:
        // 1. The booking date is today or in the past
        // 2. Current time is >= 12:00 PM on the booking date
        // 3. If booking is for today, current time must be >= 12:00 PM
        // 4. If booking is from a past date, always show (buyer should have departed)

        if (bookingDateOnly.getTime() === today.getTime()) {
            // Booking is for today - check if current time >= 12:00 PM
            return now >= departureTime;
        } else if (bookingDateOnly < today) {
            // Booking is from a past date - always show
            return true;
        } else {
            // Booking is for a future date - never show
            return false;
        }
    };

    // Check if booking can be cancelled (before 2-hour cutoff)
    const canCancelBooking = (booking) => {
        if (booking.status !== 'PENDING') return false;

        const departureHour = 12;
        const bookingDate = new Date(booking.date);
        const departureTime = new Date(bookingDate);
        departureTime.setHours(departureHour, 0, 0, 0);

        // Calculate cutoff time (2 hours before departure)
        const cutoffTime = new Date(departureTime);
        cutoffTime.setHours(departureTime.getHours() - 2);

        const now = new Date();

        // Only check time window if booking is for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDateOnly = new Date(bookingDate);
        bookingDateOnly.setHours(0, 0, 0, 0);

        // If booking is for today, check if we're before cutoff
        if (bookingDateOnly.getTime() === today.getTime()) {
            return now < cutoffTime;
        }

        // Future bookings can always be cancelled
        return bookingDateOnly > today;
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
            ROUTED: 'bg-purple-50 text-purple-700 border-purple-200',
            COMPLETED: 'bg-green-50 text-green-700 border-green-200',
            CANCELLED: 'bg-red-50 text-red-700 border-red-200'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const bookingColumns = [
        {
            header: 'Collection Date',
            render: (booking) => (
                <div className="flex items-center gap-2 font-medium text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(booking.date)}
                </div>
            )
        },
        {
            header: 'Vegetables',
            render: (booking) => {
                // Show booking_items if available, otherwise fall back to old fields
                if (booking.booking_items && booking.booking_items.length > 0) {
                    return (
                        <div className="flex flex-wrap gap-2">
                            {booking.booking_items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                                    <Leaf className="w-3 h-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-800">{item.vegetable_type}</span>
                                </div>
                            ))}
                        </div>
                    );
                }
                // Fallback for old bookings
                return (
                    <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <span className="text-gray-900">{booking.vegetable_type || booking.vegetables_summary || '-'}</span>
                    </div>
                );
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
                    {canCancelBooking(booking) && (
                        <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Cancel Booking"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {!canCancelBooking(booking) && booking.status === 'PENDING' && (
                        <button
                            disabled
                            className="p-2 text-gray-300 cursor-not-allowed rounded-lg"
                            title="Cannot cancel within 2 hours of departure (12:00 PM)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {shouldShowTrackButton(booking) && (
                        <button
                            onClick={() => handleTrackBuyer(booking)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm border border-blue-200"
                        >
                            <MapPin className="w-4 h-4" />
                            Track
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Farmer Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your harvest and track your earnings</p>
                </div>
                <button
                    onClick={() => setBookingModalOpen(true)}
                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Book Collection Slot</span>
                </button>
            </div>

            {/* Payment Warning */}
            {profile && !profile.payment_method && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-fadeIn">
                    <div className="p-2 bg-orange-100 rounded-full shrink-0">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-orange-900">Payment Method Missing</h3>
                        <p className="text-orange-700 mt-1">
                            You haven't set up a payment method yet. Go to your <span className="font-bold cursor-pointer underline" onClick={() => window.location.href = '/farmer/profile'}>Profile</span> to add bank or UPI details to receive payments.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        title: 'Total Earnings',
                        value: `₹${stats?.total_revenue?.toFixed(2) || '0.00'}`,
                        icon: TrendingUp,
                        gradient: 'from-emerald-500 to-teal-600',
                        shadow: 'shadow-emerald-200'
                    },
                    {
                        title: 'Pending Dues',
                        value: `₹${stats?.pending_dues?.toFixed(2) || '0.00'}`,
                        icon: DollarSign,
                        gradient: 'from-amber-400 to-orange-500',
                        shadow: 'shadow-orange-200'
                    },
                    {
                        title: 'Active Bookings',
                        value: stats?.active_bookings_count || 0,
                        icon: Calendar,
                        gradient: 'from-blue-500 to-indigo-600',
                        shadow: 'shadow-blue-200'
                    }
                ].map((stat, i) => (
                    <div key={i} className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl ${stat.shadow} bg-gradient-to-br ${stat.gradient} group`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="p-1 bg-white/20 rounded-full">
                                    <ArrowUpRight className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1 opacity-90">{stat.title}</p>
                                <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Bookings Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Active Bookings</h2>
                        <p className="text-sm text-gray-500 mt-1">Upcoming collection slots</p>
                    </div>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 border border-gray-200 shadow-sm">
                        {bookings.length} Pending
                    </span>
                </div>

                <div className="p-0">
                    <Table
                        columns={bookingColumns}
                        data={bookings}
                        loading={loading}
                        emptyMessage={
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No Active Bookings</h3>
                                <p className="text-gray-500 mb-6">You don't have any scheduled collections.</p>
                                <button
                                    onClick={() => setBookingModalOpen(true)}
                                    className="text-emerald-600 font-bold hover:underline"
                                >
                                    Book a slot now
                                </button>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Modals */}
            <BookingModal
                isOpen={bookingModalOpen}
                onClose={() => setBookingModalOpen(false)}
                onSuccess={handleCreateBooking}
            />

            <TrackBuyerModal
                isOpen={trackModalOpen}
                onClose={() => {
                    setTrackModalOpen(false);
                    setSelectedBookingId(null);
                }}
                bookingId={selectedBookingId}
            />

            {/* Cancel Confirmation Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Cancel Booking?</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to cancel this booking? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setCancelModalOpen(false);
                                        setBookingToCancel(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    No, Keep It
                                </button>
                                <button
                                    onClick={confirmCancelBooking}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}