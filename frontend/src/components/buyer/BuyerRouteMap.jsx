import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { Warehouse, MapPin, Package } from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';
import api from '../../utils/api';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});



// Warehouse/Hub Icon
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


function MapBoundsAdjuster({ bounds }) {
    const map = useMap();

    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);

    return null;
}


export default function BuyerRouteMap({ hubLocation, farmerBookings, onRouteOptimized }) {
    const [route, setRoute] = useState([]);
    const [optimizedOrder, setOptimizedOrder] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Animation states
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const animationRef = useRef(null);

    /* ===============================
       FETCH OPTIMIZED ROUTE
    ================================ */
    const fetchOptimizedRoute = async () => {
        if (!hubLocation || !farmerBookings || farmerBookings.length === 0) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Build coordinates string: hub + all farmers
            // Add small random offset to duplicate coordinates to make them visible
            const seenCoords = new Map();
            const allPoints = [
                hubLocation,
                ...farmerBookings.map(f => {
                    const coordKey = `${f.lat.toFixed(4)},${f.lng.toFixed(4)}`;
                    let lat = f.lat;
                    let lng = f.lng;

                    // If we've seen this coordinate before, add tiny offset
                    if (seenCoords.has(coordKey)) {
                        const count = seenCoords.get(coordKey);
                        lat += count * 0.0001; // ~11 meters offset
                        lng += count * 0.0001;
                        seenCoords.set(coordKey, count + 1);
                    } else {
                        seenCoords.set(coordKey, 1);
                    }

                    return { lat, lng };
                })
            ];

            const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');

            // OSRM Trip API - optimizes the route
            const url = `https://router.project-osrm.org/trip/v1/driving/${coords}?roundtrip=true&source=first&geometries=geojson`;

            const response = await axios.get(url);
            const trip = response.data.trips[0];

            // Extract route geometry (polyline)
            const polyline = trip.geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
            );
            setRoute(polyline);

            // Get optimized waypoint order from OSRM
            const waypoints = response.data.waypoints;

            console.log('=== OSRM WAYPOINT DEBUG ===');
            console.log('Total bookings:', farmerBookings.length);
            console.log('Farmer names:', farmerBookings.map(f => f.farmerName));
            console.log('Total waypoints from OSRM:', waypoints.length);
            console.log('All waypoints:', waypoints.map((w, i) => ({
                index: i,
                waypoint_index: w.waypoint_index,
                trips_index: w.trips_index,
                location: w.location
            })));

            // Filter out hub waypoints and sort by trip order
            // waypoint_index 0 is always the hub, so we filter it out
            const farmerWaypoints = waypoints
                .filter(w => w.waypoint_index > 0) // Keep only farmers (exclude hub at index 0)
                .sort((a, b) => a.trips_index - b.trips_index);

            console.log('Farmer waypoints after filtering (waypoint_index > 0):', farmerWaypoints.length);
            console.log('Farmer waypoints:', farmerWaypoints.map(w => ({
                waypoint_index: w.waypoint_index,
                trips_index: w.trips_index
            })));

            // Map waypoints to farmers in optimized order
            const orderedFarmersWithETA = farmerWaypoints.map((waypoint, index) => {
                // waypoint_index tells us which farmer from the original array
                // We subtract 1 because the first waypoint (index 0) is the hub
                const farmerIndex = waypoint.waypoint_index - 1;
                const farmer = farmerBookings[farmerIndex];

                console.log(`Stop ${index + 1}: waypoint_index=${waypoint.waypoint_index}, farmerIndex=${farmerIndex}, farmer=${farmer?.farmerName}`);

                // Calculate cumulative time to reach this farmer
                let cumulativeTime = 0;
                for (let i = 0; i <= index; i++) {
                    if (trip.legs[i]) {
                        cumulativeTime += trip.legs[i].duration;
                    }
                }

                return {
                    ...farmer,
                    estimatedTimeToReach: Math.round(cumulativeTime / 60) // Convert to minutes
                };
            });

            console.log('Final optimized order:', orderedFarmersWithETA.map(f => f.farmerName));
            console.log('=== END DEBUG ===');

            setOptimizedOrder(orderedFarmersWithETA);

            // Extract distance (meters to km) and duration (seconds to minutes)
            const distanceKm = (trip.distance / 1000).toFixed(2);
            const durationMin = Math.round(trip.duration / 60);

            setTotalDistance(distanceKm);
            setTotalDuration(durationMin);

            // Notify parent component of route metrics
            if (onRouteOptimized) {
                onRouteOptimized({
                    distance: parseFloat(distanceKm),
                    duration: durationMin
                });
            }

        } catch (err) {
            console.error('Error fetching route:', err);
            setError('Failed to optimize route. Showing markers without route.');
            // Fallback: show farmers in original order
            setOptimizedOrder(farmerBookings);
        } finally {
            setLoading(false);
        }
    };

    // Track if we've already optimized for this data
    const lastOptimizedRef = useRef(null);

    useEffect(() => {
        // Create a unique key based on hub location and actual booking IDs
        const bookingIds = farmerBookings?.map(b => b.id).sort().join('-') || '';
        const currentKey = `${hubLocation?.lat}-${hubLocation?.lng}-${bookingIds}`;

        // Only fetch if data has actually changed
        if (lastOptimizedRef.current !== currentKey && farmerBookings?.length > 0) {
            lastOptimizedRef.current = currentKey;
            fetchOptimizedRoute();
        }
    }, [hubLocation, farmerBookings]);
    const mapBounds = () => {
        const bounds = [];
        if (hubLocation) {
            bounds.push([hubLocation.lat, hubLocation.lng]);
        }
        farmerBookings.forEach(f => {
            if (f.lat && f.lng) {
                bounds.push([f.lat, f.lng]);
            }
        });
        return bounds;
    };

    /* ===============================
       ANIMATION CONTROLS
    ================================ */
    const startAnimation = () => {
        setIsAnimating(true);
        setAnimationProgress(0);
        setCurrentStopIndex(0);
    };

    const pauseAnimation = () => {
        setIsAnimating(false);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const resetAnimation = () => {
        setIsAnimating(false);
        setAnimationProgress(0);
        setCurrentStopIndex(0);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    // Animation loop
    useEffect(() => {
        if (!isAnimating || route.length === 0) return;

        const animate = () => {
            setAnimationProgress(prev => {
                const newProgress = prev + 0.003; // Faster, smoother animation

                if (newProgress >= 1) {
                    setIsAnimating(false);
                    setCurrentStopIndex(optimizedOrder.length + 1); // Back at hub
                    return 1;
                }

                return newProgress;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating, route.length]);

    // Calculate current stop based on position
    useEffect(() => {
        if (!isAnimating || route.length === 0) return;

        const currentPos = getCurrentPosition();
        if (!currentPos) {
            setCurrentStopIndex(0);
            return;
        }

        // Check if at hub
        if (hubLocation) {
            const distToHub = Math.sqrt(
                Math.pow(currentPos[0] - hubLocation.lat, 2) +
                Math.pow(currentPos[1] - hubLocation.lng, 2)
            );
            if (distToHub < 0.01) {
                setCurrentStopIndex(animationProgress < 0.1 ? 0 : optimizedOrder.length + 1);
                return;
            }
        }

        // Check distance to each farmer
        let closestStop = 0;
        let minDistance = Infinity;

        optimizedOrder.forEach((farmer, index) => {
            const dist = Math.sqrt(
                Math.pow(currentPos[0] - farmer.lat, 2) +
                Math.pow(currentPos[1] - farmer.lng, 2)
            );
            if (dist < minDistance) {
                minDistance = dist;
                closestStop = index + 1; // +1 because 0 is hub
            }
        });

        // Only update if close enough to a stop
        if (minDistance < 0.05) {
            setCurrentStopIndex(closestStop);
        }
    }, [animationProgress, isAnimating, route.length, optimizedOrder, hubLocation]);

    // Get current position along route based on animation progress
    const getCurrentPosition = () => {
        if (route.length === 0 || animationProgress === 0) {
            return hubLocation ? [hubLocation.lat, hubLocation.lng] : null;
        }

        const index = Math.floor(animationProgress * (route.length - 1));
        return route[Math.min(index, route.length - 1)];
    };

    const currentPosition = getCurrentPosition();

    /* ===============================
       START NAVIGATION
    ================================ */
    const startNavigation = () => {
        if (optimizedOrder.length === 0) {
            alert('No route available to navigate');
            return;
        }

        // Get first farmer location
        const firstStop = optimizedOrder[0];

        // Open Google Maps with turn-by-turn navigation
        // Using directions mode with waypoints for the full route
        const origin = `${hubLocation.lat},${hubLocation.lng}`;
        const destination = `${hubLocation.lat},${hubLocation.lng}`; // Return to hub

        // Build waypoints string (all farmers in order)
        const waypoints = optimizedOrder
            .map(f => `${f.lat},${f.lng}`)
            .join('|');

        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;

        window.open(url, '_blank');
    };

    /* ===============================
       FORMAT DURATION
    ================================ */
    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} minutes`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    };

    /* ===============================
       RENDER
    ================================ */
    const mapCenter = hubLocation
        ? [hubLocation.lat, hubLocation.lng]
        : farmerBookings.length > 0
            ? [farmerBookings[0].lat, farmerBookings[0].lng]
            : [20.5937, 78.9629]; // Default India center

    return (
        <div className="space-y-4">
            {/* ROUTE SUMMARY HEADER WITH STATS AND BUTTONS */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-sm p-5 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Route Summary
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* Animation Controls */}
                        {optimizedOrder.length > 0 && route.length > 0 && (
                            <div className="flex items-center gap-2">
                                {!isAnimating ? (
                                    <button
                                        onClick={startAnimation}
                                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                                        title="Play journey animation"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        Play Journey
                                    </button>
                                ) : (
                                    <button
                                        onClick={pauseAnimation}
                                        className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                        </svg>
                                        Pause
                                    </button>
                                )}
                                {animationProgress > 0 && (
                                    <button
                                        onClick={resetAnimation}
                                        className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                        </svg>
                                        Reset
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Start Navigation */}
                        {optimizedOrder.length > 0 && (
                            <button
                                onClick={startNavigation}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Start Navigation
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid - Colorful Cards */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Distance</p>
                        <p className="text-2xl font-bold text-blue-900">{totalDistance} km</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">Est. Time</p>
                        <p className="text-2xl font-bold text-green-900">{formatDuration(totalDuration)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wide">Stops</p>
                        <p className="text-2xl font-bold text-purple-900">{optimizedOrder.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-orange-600 mb-1 uppercase tracking-wide">Status</p>
                        <p className="text-xl font-bold text-orange-900">Ready</p>
                    </div>
                </div>

                {/* Route Sequence - Vertical Timeline */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <p className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wide border-b pb-2">Route Sequence</p>
                    <div className="relative pl-2">
                        {/* Vertical Line */}
                        <div className="absolute top-2 bottom-8 left-[19px] w-0.5 bg-gray-200"></div>

                        {/* Hub Start */}
                        <div className="relative flex gap-6 pb-8">
                            {/* Icon */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center text-lg
                                    ${currentStopIndex > 0 ? 'bg-green-500 text-white' : 'bg-blue-600 text-white animate-pulse'}`}>
                                    {currentStopIndex > 0 ? '✓' : 'Base'}
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 pt-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-gray-900 text-lg">Warehouse (Hub)</h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${currentStopIndex === 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {currentStopIndex === 0 ? 'Current Location' : 'Departed'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Starting Point</p>
                            </div>
                        </div>

                        {/* Farmers */}
                        {optimizedOrder.map((farmer, index) => {
                            // Step Index: 1-based index (0 is Hub)
                            const stepIndex = index + 1;

                            // Determine State: Visited, Current, Upcoming
                            const isVisited = currentStopIndex > stepIndex;
                            const isCurrent = currentStopIndex === stepIndex;
                            const isUpcoming = currentStopIndex < stepIndex;

                            return (
                                <div key={farmer.id} className="relative flex gap-6 pb-8 group">
                                    {/* Line Color Update based on progress - Overlays the grey line */}
                                    {isVisited && (
                                        <div className="absolute top-[-30px] bottom-8 left-[19px] w-0.5 bg-green-500 z-0"></div>
                                    )}

                                    {/* Icon */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center font-bold text-sm transition-all duration-300
                                            ${isVisited ? 'bg-green-500 text-white' :
                                                isCurrent ? 'bg-blue-600 text-white scale-110 shadow-blue-200 ring-4 ring-blue-50' :
                                                    'bg-white border-gray-300 text-gray-400'}`}>
                                            {isVisited ? '✓' : stepIndex}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 p-4 rounded-xl border transition-all duration-300
                                        ${isCurrent ? 'bg-blue-50 border-blue-200 shadow-sm' :
                                            isVisited ? 'bg-gray-50 border-gray-100' :
                                                'bg-white border-gray-200 opacity-80'}`}>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <h4 className={`text-lg font-bold ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {farmer.farmerName}
                                            </h4>
                                            {farmer.estimatedTimeToReach !== undefined && (
                                                <div className={`flex items-center gap-1 text-sm font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
                                                    <span>⏱</span>
                                                    <span>ETA: {formatDuration(farmer.estimatedTimeToReach)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            {farmer.farmerPhone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <span>📞</span>
                                                    <a href={`tel:${farmer.farmerPhone}`} className="hover:text-blue-600 underline-offset-2 hover:underline">
                                                        {farmer.farmerPhone}
                                                    </a>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span>📍</span>
                                                <span className="truncate max-w-[200px]" title={farmer.village || `${farmer.lat}, ${farmer.lng}`}>
                                                    {farmer.village || `${farmer.lat.toFixed(4)}, ${farmer.lng.toFixed(4)}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 col-span-1 sm:col-span-2">
                                                <span>📦</span>
                                                <span className="font-medium text-gray-800">
                                                    {farmer.vegetableType}
                                                </span>
                                                <span className="text-gray-400">|</span>
                                                <span>
                                                    {farmer.estimatedWeight ? `${farmer.estimatedWeight} KG` : 'Quantity TBD'}
                                                </span>
                                            </div>
                                        </div>

                                        {isCurrent && (
                                            <div className="mt-3 pt-3 border-t border-blue-200 flex items-center gap-2 text-blue-700 text-sm font-medium animate-pulse">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                Current Destination
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Hub Return */}
                        <div className="relative flex gap-6">
                            {/* Line Color Update based on progress (Final Leg) */}
                            {currentStopIndex > optimizedOrder.length && (
                                <div className="absolute top-[-30px] bottom-4 left-[19px] w-0.5 bg-green-500 z-0"></div>
                            )}

                            {/* Icon */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center text-lg
                                    ${currentStopIndex > optimizedOrder.length ? 'bg-green-500 text-white' :
                                        'bg-white border-gray-300 text-gray-400'}`}>
                                    🏁
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 pt-1 opacity-90">
                                <h4 className="font-bold text-gray-900 text-lg">Return to Warehouse</h4>
                                <p className="text-sm text-gray-500 mt-1">Route Completion</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAP SECTION BELOW */}
            <div className="relative h-[500px] rounded-xl overflow-hidden shadow-md border border-gray-200">
                {loading && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                        Optimizing route...
                    </div>
                )}

                {error && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
                        {error}
                    </div>
                )}

                <MapContainer
                    center={mapCenter}
                    zoom={10}
                    className="h-full w-full"
                    zoomControl={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Adjust bounds when route changes */}
                    {route.length > 0 && <MapBoundsAdjuster />}

                    {/* Hub Marker */}
                    {hubLocation && (
                        <Marker
                            position={[hubLocation.lat, hubLocation.lng]}
                            icon={createHubIcon()}
                        >
                            <Popup>
                                <div className="p-2">
                                    <p className="font-bold text-gray-900">Warehouse (Hub)</p>
                                    <p className="text-xs text-gray-600">Collection Start/End Point</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Farmer Markers */}
                    {optimizedOrder.map((farmer, index) => (
                        <Marker
                            key={farmer.id}
                            position={[farmer.lat, farmer.lng]}
                            icon={createNumberedIcon(index + 1)}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <p className="font-bold text-gray-900 mb-2">
                                        {farmer.farmerName}
                                    </p>
                                    <div className="space-y-1 text-sm text-gray-600 mb-2">
                                        <p className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {farmer.village || `${farmer.lat.toFixed(4)}, ${farmer.lng.toFixed(4)}`}
                                        </p>
                                        {farmer.farmerPhone && (
                                            <p className="flex items-center gap-1">
                                                <span className="w-3 h-3">📞</span>
                                                <a href={`tel:${farmer.farmerPhone}`} className="text-blue-600 hover:underline">
                                                    {farmer.farmerPhone}
                                                </a>
                                            </p>
                                        )}
                                        <p className="flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            {farmer.vegetableType} - {farmer.estimatedWeight ? `${farmer.estimatedWeight} KG` : 'Quantity TBD'}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 italic">
                                        Follow the blue route line on the map
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Animated Vehicle Marker */}
                    {isAnimating && currentPosition && (
                        <Marker
                            position={currentPosition}
                            icon={L.divIcon({
                                className: 'custom-vehicle-marker',
                                html: `
                                    <div style="position: relative;">
                                        <div style="
                                            width: 40px;
                                            height: 40px;
                                            background: #ef4444;
                                            border: 4px solid white;
                                            border-radius: 50%;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                            animation: pulse 1.5s ease-in-out infinite;
                                        ">
                                            <span style="font-size: 20px;">🚚</span>
                                        </div>
                                        <div style="
                                            position: absolute;
                                            bottom: -25px;
                                            left: 50%;
                                            transform: translateX(-50%);
                                            background: #1e40af;
                                            color: white;
                                            padding: 2px 8px;
                                            border-radius: 4px;
                                            font-size: 10px;
                                            font-weight: bold;
                                            white-space: nowrap;
                                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                        ">
                                            ${currentStopIndex === 0 ? 'Starting from Hub' :
                                        currentStopIndex > optimizedOrder.length ? 'Returning to Hub' :
                                            `At Stop ${currentStopIndex}/${optimizedOrder.length}`}
                                        </div>
                                    </div>
                                    <style>
                                        @keyframes pulse {
                                            0%, 100% { transform: scale(1); }
                                            50% { transform: scale(1.1); }
                                        }
                                    </style>
                                `,
                                iconSize: [40, 40],
                                iconAnchor: [20, 20]
                            })}
                        />
                    )}

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
        </div>
    );
}
