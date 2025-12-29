import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Phone, Package } from 'lucide-react';
import L from 'leaflet';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import CollectionModal from '../../components/buyer/CollectionModal';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function BuyerFieldRoute() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [collectionModalOpen, setCollectionModalOpen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchRoute();
    }, []);

    const fetchRoute = async () => {
        setLoading(true);
        try {
            const response = await api.get('/buyer/route');
            setBookings(response.data.data.bookings);
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

    // Calculate map center
    const mapCenter = bookings.length > 0 && bookings[0].farmer.latitude
        ? [bookings[0].farmer.latitude, bookings[0].farmer.longitude]
        : [20.5937, 78.9629]; // Default to India center

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Field Route</h1>
                <p className="text-gray-600">Today's collection route and bookings</p>
            </div>

            {/* Map */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Map</h2>
                <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300">
                    <MapContainer
                        center={mapCenter}
                        zoom={bookings.length > 0 ? 10 : 5}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {bookings.map((booking) => (
                            booking.farmer.latitude && booking.farmer.longitude && (
                                <Marker
                                    key={booking.id}
                                    position={[booking.farmer.latitude, booking.farmer.longitude]}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-semibold">{booking.farmer.name}</p>
                                            <p className="text-sm text-gray-600">{booking.vegetable_type}</p>
                                            <p className="text-sm text-gray-600">{booking.quantity_kg} KG</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
            </Card>

            {/* Bookings Table */}
            <Card>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Today's Bookings</h2>
                    <p className="text-sm text-gray-600">Pending collections for {formatDate(new Date())}</p>
                </div>

                <Table
                    columns={bookingColumns}
                    data={bookings}
                    loading={loading}
                    emptyMessage="No pending bookings for today"
                />
            </Card>

            {/* Collection Modal */}
            {selectedBooking && (
                <CollectionModal
                    isOpen={collectionModalOpen}
                    onClose={() => {
                        setCollectionModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    booking={selectedBooking}
                    onSuccess={handleCollectionSuccess}
                />
            )}
        </div>
    );
}
