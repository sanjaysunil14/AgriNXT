import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import Modal from '../ui/Modal';
import L from 'leaflet';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LocationViewModal({ isOpen, onClose, farmer }) {
    if (!farmer || !farmer.latitude || !farmer.longitude) return null;

    const position = [farmer.latitude, farmer.longitude];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${farmer.full_name}'s Location`}
            size="lg"
        >
            <div className="space-y-4">
                <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300">
                    <MapContainer
                        center={position}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position} />
                    </MapContainer>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Coordinates:</span>{' '}
                        {farmer.latitude.toFixed(6)}, {farmer.longitude.toFixed(6)}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                        <span className="font-semibold">Phone:</span> {farmer.phone_number}
                    </p>
                </div>
            </div>
        </Modal>
    );
}
