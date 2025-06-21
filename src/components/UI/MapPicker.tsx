import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


interface MapPickerProps {
  onSelect: (coords: [number, number]) => void;
}

const MapEventsHandler = ({ onSelect }: { onSelect: (coords: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ onSelect }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  const handleMapSelect = (coords: [number, number]) => {
    setMarkerPosition(coords);
    onSelect(coords);
  };

  return (
    // @ts-ignore - for the center prop type issue
    <MapContainer center={[17.385044, 78.486671]} zoom={12} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markerPosition && <Marker position={markerPosition} />}
      <MapEventsHandler onSelect={handleMapSelect} />
    </MapContainer>
  );
};

export default MapPicker; 