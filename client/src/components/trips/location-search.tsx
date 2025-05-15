import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface Location {
  placeName: string;
  lat: number;
  lng: number;
}

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  value, 
  onChange,
  onLocationSelect
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length > 2) {
      fetchLocations(newValue);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };
  
  const fetchLocations = async (query: string) => {
    if (!query) return;
    
    setIsLoading(true);
    
    // Simulate a delay and return some dummy data for now
    // In a real app, you would call an API like Mapbox Geocoding
    setTimeout(() => {
      if (query === 'london' || query === 'London') {
        setSuggestions([
          { placeName: 'London, UK', lat: 51.5074, lng: -0.1278 },
          { placeName: 'London, Ontario, Canada', lat: 42.9849, lng: -81.2453 }
        ]);
      } else if (query === 'new' || query === 'New') {
        setSuggestions([
          { placeName: 'New York, NY, USA', lat: 40.7128, lng: -74.0060 },
          { placeName: 'New Orleans, LA, USA', lat: 29.9511, lng: -90.0715 },
          { placeName: 'New Delhi, India', lat: 28.6139, lng: 77.2090 }
        ]);
      } else {
        setSuggestions([]);
      }
      setIsLoading(false);
    }, 300);
  };
  
  const handleSelectLocation = (location: Location) => {
    onChange(location.placeName);
    onLocationSelect(location);
    setIsOpen(false);
  };
  
  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center">
        <div className="absolute left-3 text-gray-500">
          <MapPin size={18} />
        </div>
        <Input
          value={value}
          onChange={handleChange}
          placeholder="Enter destination"
          className="pl-10"
          onFocus={() => value.length > 2 && setIsOpen(true)}
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((location, index) => (
                <li 
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    <span>{location.placeName}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;