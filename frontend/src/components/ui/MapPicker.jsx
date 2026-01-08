import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from './Toast';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPicker({ latitude, longitude, onChange }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState(
        latitude && longitude ? { lat: latitude, lng: longitude } : null
    );
    const [gettingLocation, setGettingLocation] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (isModalOpen && mapRef.current && !mapInstanceRef.current) {
            // Initialize map
            const defaultCenter = selectedCoords
                ? [selectedCoords.lat, selectedCoords.lng]
                : [20.5937, 78.9629]; // India center

            const map = L.map(mapRef.current).setView(defaultCenter, selectedCoords ? 15 : 5);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Add marker if coords exist
            if (selectedCoords) {
                markerRef.current = L.marker([selectedCoords.lat, selectedCoords.lng], {
                    draggable: true
                }).addTo(map);

                markerRef.current.on('dragend', function (e) {
                    const position = e.target.getLatLng();
                    setSelectedCoords({ lat: position.lat, lng: position.lng });
                });
            }

            // Click to add/move marker
            map.on('click', function (e) {
                const { lat, lng } = e.latlng;
                setSelectedCoords({ lat, lng });

                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                } else {
                    markerRef.current = L.marker([lat, lng], {
                        draggable: true
                    }).addTo(map);

                    markerRef.current.on('dragend', function (e) {
                        const position = e.target.getLatLng();
                        setSelectedCoords({ lat: position.lat, lng: position.lng });
                    });
                }
            });

            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isModalOpen]);

    const handleUseMyLocation = () => {
        if ("geolocation" in navigator) {
            setGettingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setSelectedCoords({ lat, lng });
                    setGettingLocation(false);
                    // Automatically open map centered on user's location
                    setIsModalOpen(true);
                },
                (error) => {
                    setGettingLocation(false);
                    alert("Unable to get your location. Please select manually on the map.");
                    setIsModalOpen(true);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            setIsModalOpen(true);
        }
    };

    const handleConfirm = () => {
        if (selectedCoords) {
            onChange(selectedCoords.lat, selectedCoords.lng);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Farm Location</h3>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Use My Location Button */}
                    <button
                        type="button"
                        onClick={handleUseMyLocation}
                        disabled={gettingLocation}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Navigation className={`w-5 h-5 ${gettingLocation ? 'animate-pulse' : ''}`} />
                        {gettingLocation ? 'Getting Location...' : 'Use My Current Location'}
                    </button>

                    {/* Or Select Manually */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-blue-50 text-gray-500">or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <MapPin className="w-5 h-5" />
                        {selectedCoords ? 'Change Location on Map' : 'Select Location Manually'}
                    </button>
                </div>

                {selectedCoords && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-900 font-medium">
                            ✓ Location selected: {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                        </p>
                    </div>
                )}

                <p className="text-xs text-blue-700 mt-3">
                    💡 Use GPS for accurate location or select manually on the map
                </p>
            </div>

            {/* Map Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Select Your Farm Location</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Click on the map or drag the marker to set your location
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Map Container */}
                        <div className="flex-1 p-4">
                            <div ref={mapRef} className="w-full h-[500px] rounded-lg border-2 border-gray-300" />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t bg-gray-50 flex items-center justify-between rounded-b-2xl">
                            <div className="text-sm text-gray-600">
                                {selectedCoords ? (
                                    <span className="font-medium text-gray-900">
                                        📍 {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                                    </span>
                                ) : (
                                    <span>Click on the map to select a location</span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={!selectedCoords}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
