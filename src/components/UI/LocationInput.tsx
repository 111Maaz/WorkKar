import React, { useState, Suspense } from 'react';
import { MapPin, Navigation, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const MapPicker = React.lazy(() => import('./MapPicker'));

interface LocationInputProps {
  onLocationSelect: (location: { address: string; coordinates: [number, number]; city: string }) => void;
  placeholder?: string;
  className?: string;
  showInput?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ 
  onLocationSelect, 
  placeholder = "Enter your location...",
  className,
  showInput = true
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [city, setCity] = useState('');
  const [geoError, setGeoError] = useState('');

  // Mock geocoding function - in real app, use a service like Mapbox or Google Places
  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    // Mock suggestions - replace with actual geocoding service
    const mockSuggestions = [
      { 
        id: 1, 
        address: `${searchQuery}, New York, NY`,
        coordinates: [-74.006, 40.7128] as [number, number]
      },
      { 
        id: 2, 
        address: `${searchQuery}, Los Angeles, CA`,
        coordinates: [-118.2437, 34.0522] as [number, number]
      },
      { 
        id: 3, 
        address: `${searchQuery}, Chicago, IL`,
        coordinates: [-87.6298, 41.8781] as [number, number]
      },
    ];

    setTimeout(() => {
      setSuggestions(mockSuggestions);
      setLoading(false);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchLocations(value);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.address);
    setSuggestions([]);
    onLocationSelect({
      address: suggestion.address,
      coordinates: suggestion.coordinates,
      city: ''
    });
  };

  const handleUseMyLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
      navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          const address = `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
        let city = '';
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
          const data = await response.json();
          city = data.address.city || data.address.town || data.address.village || data.address.hamlet || '';
        } catch (e) {
          city = '';
        }
          setQuery(address);
        onLocationSelect({ address, coordinates: coords, city });
        },
        (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Please allow location access in your browser settings.');
        } else {
          setGeoError('Unable to get your location.');
        }
        }
      );
  };

  const handlePickOnMap = () => {
    setShowMap(true);
  };

  const handleMapSelect = (coords: [number, number]) => {
    const address = `Selected Location (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`;
    setQuery(address);
    onLocationSelect({ address, coordinates: coords, city: '' });
    setShowMap(false); // Close modal on selection
  };

  return (
    <div className={`relative ${className}`}>
      {showInput && (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className="pl-10 w-full"
        />
      </div>
      )}
      {showInput && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <MapPin size={16} className="text-gray-400" />
              <span>{suggestion.address}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseMyLocation}
          className="flex items-center gap-2"
        >
          <Navigation size={16} />
          Use My Location
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePickOnMap}
          className="flex items-center gap-2"
        >
          <Map size={16} />
          Pick on Map
        </Button>
      </div>
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowMap(false)}>
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black z-10" onClick={() => setShowMap(false)}>✕</button>
            <h3 className="text-lg font-semibold mb-2">Select Location</h3>
            <Suspense fallback={<div className="flex items-center justify-center h-[300px]">Loading map...</div>}>
              <MapPicker onSelect={handleMapSelect} />
            </Suspense>
          </div>
        </div>
      )}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
      {geoError && (
        <div className="text-sm text-red-500 mt-2">{geoError}</div>
      )}
    </div>
  );
};

export default LocationInput;
