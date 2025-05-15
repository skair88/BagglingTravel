import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import ProgressBar from '@/components/trips/progress-bar';
import LocationSearch from '@/components/trips/location-search';
import WeatherForecast from '@/components/trips/weather-forecast';
import { getWeatherForecast } from '@/lib/weather';
import { useTrips } from '@/hooks/use-trips';
import MobileDatePicker from '@/components/ui/mobile-date-picker';
import BottomNav from '@/components/layout/bottom-nav';

// WeatherForecast interface
interface WeatherForecast {
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

// TripWizardData interface for tracking form state
interface TripWizardData {
  destination: string;
  location: { lat: number; lng: number };
  startDate: Date;
  endDate: Date;
  purpose: string; // Keeping for backward compatibility
  activities: string[]; // Keeping for backward compatibility
}

// Default trip data
const defaultTripData: TripWizardData = {
  destination: '',
  location: { lat: 0, lng: 0 },
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  purpose: 'vacation', // Default purpose
  activities: [],
};

export default function TripCreator() {
  const location = useLocation();
  const { createTrip } = useTrips();
  
  // Form state
  const [formData, setFormData] = useState<TripWizardData>(defaultTripData);
  const [locationInput, setLocationInput] = useState('');
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDateError, setIsDateError] = useState(false);
  
  // Fetch weather forecast when location and dates are set
  useEffect(() => {
    const fetchWeather = async () => {
      if (
        formData.location.lat !== 0 &&
        formData.location.lng !== 0 &&
        formData.startDate &&
        formData.endDate
      ) {
        setIsLoading(true);
        
        // Создаем ключ для кэширования прогноза погоды
        const cacheKey = `weather_${formData.location.lat}_${formData.location.lng}_${formData.startDate.getTime()}_${formData.endDate.getTime()}`;
        
        // Проверяем наличие кэшированных данных
        const cachedData = localStorage.getItem(cacheKey);
        
        try {
          if (cachedData && !navigator.onLine) {
            // Если есть кэшированные данные и нет подключения к интернету, используем их
            console.log('Using cached weather forecast (offline)');
            const parsed = JSON.parse(cachedData);
            // Конвертируем строки дат в объекты Date
            setWeatherForecast(parsed.map((d: any) => ({
              ...d,
              date: new Date(d.date)
            })));
          } else {
            // Пытаемся получить свежий прогноз
            const forecast = await getWeatherForecast(
              formData.location.lat,
              formData.location.lng,
              formData.startDate,
              formData.endDate
            );
            
            setWeatherForecast(forecast);
            
            // Кэшируем полученный прогноз
            if (forecast.length > 0) {
              try {
                localStorage.setItem(cacheKey, JSON.stringify(forecast.map(d => ({
                  ...d,
                  date: d.date.toISOString() // Преобразуем дату в строку для хранения
                }))));
                console.log('Weather forecast cached successfully');
              } catch (cacheError) {
                console.warn('Failed to cache weather forecast:', cacheError);
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch weather:', error);
          
          // При ошибке проверяем наличие кэшированного прогноза
          if (cachedData) {
            console.log('Using cached weather forecast (after error)');
            try {
              const parsed = JSON.parse(cachedData);
              // Конвертируем строки дат в объекты Date
              setWeatherForecast(parsed.map((d: any) => ({
                ...d,
                date: new Date(d.date)
              })));
            } catch (parseError) {
              console.error('Failed to parse cached weather data:', parseError);
            }
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchWeather();
  }, [formData.location, formData.startDate, formData.endDate]);
  
  // Validate dates
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      if (formData.endDate < formData.startDate) {
        setIsDateError(true);
      } else {
        setIsDateError(false);
      }
    }
  }, [formData.startDate, formData.endDate]);
  
  // Handle location selection
  const handleLocationSelect = (location: { placeName: string; lat: number; lng: number }) => {
    setFormData({
      ...formData,
      destination: location.placeName,
      location: { lat: location.lat, lng: location.lng },
    });
  };
  
  // Handle form submission
  const handleSaveTrip = async () => {
    // Validate form
    if (!formData.destination || isDateError) {
      return;
    }
    
    // Create trip
    try {
      setIsLoading(true);
      
      const tripData = {
        destination: formData.destination,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        purpose: 'vacation', // Default value
        activities: [], // Empty array
      };
      
      await createTrip(tripData);
      navigate('/');
    } catch (error) {
      console.error('Failed to create trip:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Baggle" showBackButton onBackClick={() => navigate('/')} />
      
      <div className="p-4 flex-1">
        <ProgressBar currentStep={1} totalSteps={1} />
        
        <div className="mt-6">
          <h2 className="text-center text-lg font-medium mb-3">Direction</h2>
          <LocationSearch
            value={locationInput}
            onChange={setLocationInput}
            onLocationSelect={handleLocationSelect}
          />
        </div>
        
        <div className="mt-6">
          <h2 className="text-center text-lg font-medium mb-3">Dates</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <MobileDatePicker
                selected={formData.startDate}
                onSelect={(date) => {
                  // When from date changes, set both dates in same month
                  const newEndDate = new Date(formData.endDate);
                  newEndDate.setFullYear(date.getFullYear());
                  newEndDate.setMonth(date.getMonth());
                  
                  // If end date becomes before start date, adjust it
                  if (newEndDate < date) {
                    newEndDate.setDate(date.getDate() + 7);
                  }
                  
                  setFormData({
                    ...formData,
                    startDate: date,
                    endDate: newEndDate
                  });
                }}
                className={isDateError ? 'border-red-500' : ''}
                placeholder="Pick a date"
              />
            </div>
            
            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <MobileDatePicker
                selected={formData.endDate}
                onSelect={(date) => {
                  setFormData({ ...formData, endDate: date });
                }}
                minDate={formData.startDate} // Prevent dates before start date
                className={isDateError ? 'border-red-500' : ''}
                placeholder="Pick a date"
              />
            </div>
          </div>
          
          {isDateError && (
            <p className="text-sm text-red-500 mt-1">
              End date must be after or equal to start date
            </p>
          )}
        </div>
        
        {/* Weather Forecast */}
        <div className="mt-6">
          <h2 className="text-center text-lg font-medium mb-3">Weather information</h2>
          <WeatherForecast forecast={weatherForecast} isLoading={isLoading} />
        </div>
        
        {/* Next Button */}
        <div className="mt-8">
          <Button 
            className="w-full"
            onClick={handleSaveTrip}
            disabled={!formData.destination || isDateError || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}