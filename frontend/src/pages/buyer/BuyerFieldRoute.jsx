import { useState, useEffect } from 'react';
import { MapPin, Phone, Package } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import CollectionModal from '../../components/buyer/CollectionModal';
import BuyerRouteMap from '../../components/buyer/BuyerRouteMap';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';



export default function BuyerFieldRoute() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [collectionModalOpen, setCollectionModalOpen] = useState(false);
    const [routeMetrics, setRouteMetrics] = useState(null);
    const [hubLocation, setHubLocation] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchRoute();
    }, []);

    const fetchRoute = async () => {
        setLoading(true);
        try {
            const response = await api.get('/buyer/route');
            setBookings(response.data.data.bookings);
            setHubLocation(response.data.data.hubLocation);
        } catch (error) {
            addToast('Failed to fetch route', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCollect = (booking) => {
        setSelectedBooking(booking);
        setCollectionModalOpen(true);
    };

    const handleCollectionSuccess = async () => {
        addToast('Collection recorded successfully!', 'success');
        setCollectionModalOpen(false);
        setSelectedBooking(null);
        fetchRoute();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const bookingColumns = [
        {
            header: 'Farmer',
            render: (booking) => (
                <div>
                    <p className="font-medium text-gray-900">{booking.farmer.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {booking.farmer.phone}
                    </p>
                </div>
            )
        },
        {
            header: 'Location',
            render: (booking) => (
                <div className="text-sm text-gray-700">
                    <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.farmer.latitude?.toFixed(4)}, {booking.farmer.longitude?.toFixed(4)}
                    </p>
                </div>
            )
        },
        {
            header: 'Vegetables',
            render: (booking) => (
                <div className="flex items-center gap-1 text-gray-700">
                    <Package className="w-4 h-4" />
                    {booking.vegetable_type || '-'}
                </div>
            )
        },
        {
            header: 'Quantity (KG)',
            render: (booking) => booking.quantity_kg?.toFixed(2) || '-'
        },
        {
            header: 'Actions',
            render: (booking) => (
                <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleCollect(booking)}
                >
                    Collect
                </Button>
            )
        }
    ];

    // Transform bookings to farmer bookings format for BuyerRouteMap
    const farmerBookings = bookings.map(booking => ({
        id: booking.id,
        farmerName: booking.farmer.name,
        farmerPhone: booking.farmer.phone,
        village: booking.farmer.village || `${booking.farmer.latitude}, ${booking.farmer.longitude}`,
        lat: booking.farmer.latitude,
        lng: booking.farmer.longitude,
        bookingId: booking.id,
        estimatedWeight: booking.quantity_kg,
        vegetableType: booking.vegetable_type
    }));

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Procurement Management</h1>
                <p className="text-gray-600 mt-1">Today's Bookings & Optimized Route</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Bookings - Left Column */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Today's Bookings</h2>
                            <p className="text-sm text-gray-600">Pending collections for {formatDate(new Date())}</p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No pending bookings for today</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                        {/* Farmer Info */}
                                        <div className="flex items-start gap-3 mb-3">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                {booking.farmer.name.charAt(0).toUpperCase()}
                                            </div>
                                            {/* Name & Phone */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {booking.farmer.name}
                                                </p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {booking.farmer.phone}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="mb-2 flex items-start gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">
                                                {booking.farmer.latitude?.toFixed(4)}, {booking.farmer.longitude?.toFixed(4)}
                                            </span>
                                        </div>

                                        {/* Vegetables */}
                                        <div className="mb-3 flex items-center gap-2 text-sm">
                                            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-700 font-medium">
                                                {booking.vegetable_type || '-'} ({booking.quantity_kg?.toFixed(2) || '-'} KG)
                                            </span>
                                        </div>

                                        {/* Collect Button */}
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => handleCollect(booking)}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                                        >
                                            Collect
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Field Route - Right Column */}
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Summary</h2>
                        {farmerBookings.length > 0 ? (
                            <BuyerRouteMap
                                hubLocation={hubLocation}
                                farmerBookings={farmerBookings}
                                onRouteOptimized={(metrics) => setRouteMetrics(metrics)}
                            />
                        ) : (
                            <div className="h-96 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                                <div className="text-center text-gray-500">
                                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No bookings to display on map</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Collection Modal */}
            {selectedBooking && (
                <CollectionModal
                    isOpen={collectionModalOpen}
                    onClose={() => {
                        setCollectionModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    booking={selectedBooking}
                    routeMetrics={routeMetrics}
                    onSuccess={handleCollectionSuccess}
                />
            )}
        </div>
    );
}
