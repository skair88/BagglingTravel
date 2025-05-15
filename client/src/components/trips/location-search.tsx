import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { searchLocations, getCoordinates } from '@/lib/mapbox';

// Интерфейс для представления локации
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
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
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
      // Clear any pending timeout when component unmounts
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (newValue.length > 2) {
      // Add small delay to avoid making too many requests while typing
      searchTimeout.current = setTimeout(() => {
        fetchLocations(newValue);
      }, 300);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };
  
  const fetchLocations = async (query: string) => {
    if (!query) return;
    
    setIsLoading(true);
    
    try {
      // Try using our API endpoint which wraps Mapbox API
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      } else {
        console.error('Server API route failed, no fallback available');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
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