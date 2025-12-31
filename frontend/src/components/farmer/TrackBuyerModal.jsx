import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { X, MapPin, Clock, Navigation } from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';
import Modal from '../ui/Modal';
import api from '../../utils/api';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hub Icon
const createHubIcon = () => L.divIcon({
    html: `
        <div style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            font-size: 20px;
        ">🏭</div>
    `,
    className: 'custom-hub-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

// Numbered Farmer Marker
const createNumberedIcon = (number) => L.divIcon({
    html: `
        <div style="
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            color: white;
            font-weight: bold;
            font-size: 16px;
        ">${number}</div>
    `,
    className: 'custom-numbered-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Current Farmer's Home Marker (Pulsing)
const createFarmerHomeIcon = () => L.divIcon({
    html: `
        <div style="position: relative;">
            <div style="
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 4px solid white;
                box-shadow: 0 6px 12px rgba(0,0,0,0.4);
                font-size: 24px;
                animation: pulse 2s ease-in-out infinite;
            ">🏠</div>
        </div>
        <style>
            @keyframes pulse {
                0%, 100% { transform: scale(1); box-shadow: 0 6px 12px rgba(0,0,0,0.4); }
                50% { transform: scale(1.15); box-shadow: 0 8px 16px rgba(245,158,11,0.6); }
            }
        </style>
    `,
    className: 'custom-farmer-home-marker',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
});

export default function TrackBuyerModal({ isOpen, onClose, bookingId }) {
    const [trackingData, setTrackingData] = useState(null);
    const [route, setRoute] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eta, setEta] = useState(null);

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchTrackingData();
        }
    }, [isOpen, bookingId]);

    const fetchTrackingData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get today's route data from backend
            const response = await api.get('/farmer/todays-route');
            const data = response.data.data;
            setTrackingData(data);

            // Fetch optimized route from OSRM
            await fetchOptimizedRoute(data);
        } catch (err) {
            console.error('Error fetching tracking data:', err);
            setError(err.response?.data?.message || 'Failed to load tracking data. Make sure there are bookings scheduled for today.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptimizedRoute = async (data) => {
        try {
            // Build coordinates: hub + all farmers
            const allPoints = [
                data.buyer_hub,
                ...data.all_stops.map(stop => stop.location)
            ];

            const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');

            // OSRM Trip API
            const url = `https://router.project-osrm.org/trip/v1/driving/${coords}?roundtrip=true&source=first&geometries=geojson`;
            const response = await axios.get(url);
            const trip = response.data.trips[0];

            // Extract route geometry
            const polyline = trip.geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
            );
            setRoute(polyline);

            // Calculate ETA to farmer's location
            const farmerStopIndex = data.all_stops.findIndex(stop => stop.is_current_farmer);
            let cumulativeTime = 0;
            for (let i = 0; i <= farmerStopIndex; i++) {
                if (trip.legs[i]) {
                    cumulativeTime += trip.legs[i].duration;
                }
            }

            const etaMinutes = Math.round(cumulativeTime / 60);
            setEta(etaMinutes);
        } catch (err) {
            console.error('Error fetching route:', err);
            // Don't fail completely, just show without route line
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '-';
        if (minutes < 60) {
            return `${minutes} minutes`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    };

    const mapBounds = () => {
        if (!trackingData) return [];
        const bounds = [];
        if (trackingData.buyer_hub) {
            bounds.push([trackingData.buyer_hub.lat, trackingData.buyer_hub.lng]);
        }
        trackingData.all_stops.forEach(stop => {
            bounds.push([stop.location.lat, stop.location.lng]);
        });
        return bounds;
    };

    const mapCenter = trackingData?.farmer.location
        ? [trackingData.farmer.location.lat, trackingData.farmer.location.lng]
        : [20.5937, 78.9629];

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Track Buyer"
            size="xl"
            closeOnBackdrop={true}
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading tracking data...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">{error}</p>
                    <button
                        onClick={onClose}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Close
                    </button>
                </div>
            ) : trackingData ? (
                <div className="space-y-4">
                    {/* Header Info - Enhanced Design */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 shadow-xl">
                        {/* Decorative Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Title */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Navigation className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Buyer's Route for Today</h3>
                                    <p className="text-blue-100 text-sm mt-0.5">Live tracking and estimated arrival</p>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Total Stops Card */}
                                <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Stops</p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900 mb-1">
                                            {trackingData.total_stops}
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">farmers on route</p>
                                    </div>
                                </div>

                                {/* Estimated Arrival Card */}
                                <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Clock className="w-5 h-5 text-green-600" />
                                                </div>
                                                <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Estimated Arrival</p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900 mb-1">
                                            ~{formatDuration(eta)}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500 font-semibold">±15 min</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="relative h-[300px] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                        <MapContainer
                            center={mapCenter}
                            zoom={12}
                            className="h-full w-full"
                            zoomControl={true}
                            bounds={mapBounds().length > 0 ? mapBounds() : undefined}
                            boundsOptions={{ padding: [50, 50] }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Hub Marker */}
                            {trackingData.buyer_hub && (
                                <Marker
                                    position={[trackingData.buyer_hub.lat, trackingData.buyer_hub.lng]}
                                    icon={createHubIcon()}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-bold text-gray-900">{trackingData.buyer_hub.name}</p>
                                            <p className="text-xs text-gray-600">Collection Hub</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* All Farmer Markers */}
                            {trackingData.all_stops.map((stop, index) => (
                                <Marker
                                    key={index}
                                    position={[stop.location.lat, stop.location.lng]}
                                    icon={stop.is_current_farmer ? createFarmerHomeIcon() : createNumberedIcon(stop.sequence)}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[180px]">
                                            <p className="font-bold text-gray-900 mb-1">
                                                {stop.farmer_name}
                                                {stop.is_current_farmer && (
                                                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                Stop #{stop.sequence}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {stop.vegetable_type}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* Route Polyline */}
                            {route.length > 0 && (
                                <Polyline
                                    positions={route}
                                    color="#3b82f6"
                                    weight={4}
                                    opacity={0.7}
                                />
                            )}
                        </MapContainer>
                    </div>

                    {/* Legend */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Map Legend:</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🏭</span>
                                <span>Buyer's Hub</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🏠</span>
                                <span>Your Location (Pulsing)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center text-xs font-bold">1</div>
                                <span>Other Farmers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-1 bg-blue-600"></div>
                                <span>Planned Route</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}
