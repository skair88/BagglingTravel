import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Search, X, Loader2 } from 'lucide-react';
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
  language?: string; // Добавляем поддержку языка
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  value, 
  onChange,
  onLocationSelect,
  language = 'en' // По умолчанию английский
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);
  
  // Обработка ввода в поле поиска
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (newValue.length > 2) {
      searchTimeout.current = setTimeout(() => {
        fetchLocations(newValue);
      }, 300);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };
  
  // Получение локаций через API
  const fetchLocations = async (query: string) => {
    if (!query) return;
    
    setIsLoading(true);
    console.log('Fetching locations for query:', query, 'language:', language);
    
    try {
      // Сначала пробуем использовать прокси-АПИ на сервере с поддержкой языка
      try {
        const timestamp = new Date().getTime();
        const apiUrl = `/api/geocode?query=${encodeURIComponent(query)}&language=${language}&_=${timestamp}`;
        console.log('Requesting server proxy API:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Server proxy API found locations:', data);
          if (data && data.length > 0) {
            setSuggestions(data);
            setIsLoading(false);
            return;
          }
        } else {
          const errorData = await response.text();
          console.error('Server API error:', response.status, errorData);
        }
      } catch (apiError) {
        console.error('Server proxy API request failed:', apiError);
      }

      // Пробуем прямое обращение к Mapbox API
      try {
        console.log('Using direct mapbox API connection');
        console.log('VITE_MAPBOX_API_KEY available:', !!import.meta.env.VITE_MAPBOX_API_KEY);
        const suggestions = await searchLocations(query, 5, language);
        
        if (suggestions && suggestions.length > 0) {
          console.log('Mapbox API found locations:', suggestions);
          
          // Получаем координаты для каждой локации
          const locationsWithCoords = await Promise.all(
            suggestions.map(async (suggestion) => {
              try {
                const coordinates = await getCoordinates(suggestion.name, language);
                return {
                  placeName: suggestion.fullName,
                  lat: coordinates[1], // latitude
                  lng: coordinates[0]  // longitude
                };
              } catch (error) {
                console.error('Error getting coordinates for:', suggestion.name, error);
                return {
                  placeName: suggestion.fullName,
                  lat: 0,
                  lng: 0
                };
              }
            })
          );
          
          setSuggestions(locationsWithCoords);
          setIsLoading(false);
          return;
        }
      } catch (directApiError) {
        console.error('Direct Mapbox API request failed:', directApiError);
      }
      
      // Если не удалось получить данные из Mapbox, показываем пустой результат
      console.log('No locations found from Mapbox API');
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  
  
  // Выбор локации из предложенных
  const handleSelectLocation = (location: Location) => {
    onChange(location.placeName);
    onLocationSelect(location);
    setIsOpen(false);
    setFocused(false);
    
    // Убираем фокус с input
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };
  
  // Очистка поля ввода
  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    
    // Возвращаем фокус на input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Обработчик фокуса на поле ввода
  const handleFocus = () => {
    setFocused(true);
    if (value.length > 2) {
      // Загружаем подсказки при фокусе, если введено больше 2 символов
      fetchLocations(value);
      setIsOpen(true);
    }
  };
  
  return (
    <div ref={containerRef} className="relative w-full">
      {/* Поле ввода с иконками */}
      <div className={`flex items-center overflow-hidden bg-white rounded-lg border
        ${focused ? 'border-primary ring-2 ring-primary/10' : 'border-gray-300'}`}>
        <div className="flex items-center justify-center w-10 text-gray-500">
          <MapPin size={18} />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={language === 'ru' ? "Куда направляетесь?" : "Where are you going?"}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 px-0"
        />
        
        {/* Кнопка поиска или очистки */}
        <div className="flex items-center pr-3">
          {value ? (
            <button 
              onClick={handleClear}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              type="button"
              aria-label="Clear search"
            >
              <X size={18} className="text-gray-500" />
            </button>
          ) : (
            <Search size={18} className="text-gray-500" />
          )}
        </div>
      </div>
      
      {/* Панель с подсказками */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg 
          max-h-64 overflow-auto divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span>{language === 'ru' ? 'Поиск локаций...' : 'Searching locations...'}</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((location, index) => (
                <li 
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                      <MapPin size={16} className="text-primary" />
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-gray-900 mb-0.5">{location.placeName.split(',')[0]}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {location.placeName.includes(',') 
                          ? location.placeName.substring(location.placeName.indexOf(',') + 1).trim() 
                          : ''}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="mb-1">{language === 'ru' ? 'Локации не найдены' : 'No locations found'}</p>
              <p className="text-sm">{language === 'ru' ? 'Попробуйте другой поисковый запрос' : 'Try a different search term'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;