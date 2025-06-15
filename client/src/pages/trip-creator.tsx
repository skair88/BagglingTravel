import React, { useState, useEffect } from 'react';
import { navigate } from 'wouter/use-browser-location';
import { TripButton } from '@/components/ui/trip-button';
import Header from '@/components/layout/header';
import ProgressBar from '@/components/trips/progress-bar';
import LocationSearch from '@/components/trips/location-search';
import WeatherForecast from '@/components/trips/weather-forecast';
import { getWeatherForecast } from '@/lib/weather';
import { useTrips } from '@/hooks/use-trips';
import DateSelector from '@/components/ui/date-selector';
import BottomNav from '@/components/layout/bottom-nav';
import TravelersSelector from '@/components/trips/travelers-selector';
import ActivitiesSelector from '@/components/trips/activities-selector';

// WeatherForecast interface
interface WeatherForecast {
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

// Interfaces for travelers
interface TravelerType {
  id: string;
  type: 'adult' | 'kid';
  subtype: string;
  label: string;
  description?: string;
  count: number;
}

// TripWizardData interface for tracking form state
interface TripWizardData {
  destination: string;
  location: { lat: number; lng: number };
  startDate: Date;
  endDate: Date;
  purpose: string; // Keeping for backward compatibility
  activities: string[]; // Activities selected by user
  travelers: TravelerType[];
}

// Default travelers data
const defaultTravelers: TravelerType[] = [
  // Взрослые
  { id: 'men', type: 'adult', subtype: 'men', label: 'Men', count: 1 },
  { id: 'women', type: 'adult', subtype: 'women', label: 'Women', count: 1 },
  
  // Дети
  { id: 'baby', type: 'kid', subtype: 'baby', label: 'Baby', description: 'during pregnancy, at birth and up to 1 year', count: 0 },
  { id: 'toddler', type: 'kid', subtype: 'toddler', label: 'Toddler', description: '1 to 3 years', count: 0 },
  { id: 'child', type: 'kid', subtype: 'child', label: 'Child', description: '4 to 12 years', count: 0 },
  { id: 'teenager', type: 'kid', subtype: 'teenager', label: 'Teenager', description: '13 to 18 years', count: 0 },
];

// Default trip data
const defaultTripData: TripWizardData = {
  destination: '',
  location: { lat: 0, lng: 0 },
  startDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
  purpose: 'vacation', // Default purpose
  activities: [],
  travelers: defaultTravelers
};

export default function TripCreator() {
  const { createTrip } = useTrips();
  
  // Form state
  const [formData, setFormData] = useState<TripWizardData>(defaultTripData);
  const [locationInput, setLocationInput] = useState('');
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDateError, setIsDateError] = useState(false);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<'trip-details' | 'travelers' | 'activities'>('trip-details');
  
  // Fetch weather forecast when location is set (load first 7 days)
  useEffect(() => {
    const fetchWeather = async () => {
      if (formData.location.lat !== 0 && formData.location.lng !== 0) {
        setIsLoading(true);
        
        // Создаем ключ для кэширования прогноза погоды (координаты + даты поездки)
        const today = new Date().toDateString();
        const tripDatesKey = `${formData.startDate.toDateString()}_${formData.endDate.toDateString()}`;
        const cacheKey = `weather_trip_${formData.location.lat}_${formData.location.lng}_${tripDatesKey}_${today}`;
        
        // Проверяем наличие кэшированных данных за сегодня
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
            // Загружаем первые 7 дней прогноза
            const { getInitialWeatherForecast } = await import('@/lib/weather');
            const forecast = await getInitialWeatherForecast(
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
                console.log('Initial weather forecast cached successfully');
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
    
    // Асинхронно загружаем погоду через небольшую задержку
    const timeoutId = setTimeout(fetchWeather, 300);
    
    return () => clearTimeout(timeoutId);
  }, [formData.location, formData.startDate, formData.endDate]); // Добавляем зависимость от дат

  // Handle weather forecast updates from pagination
  const handleWeatherForecastUpdate = (newForecast: WeatherForecast[]) => {
    setWeatherForecast(newForecast);
    
    // Update cache with new forecast
    const today = new Date().toDateString();
    const tripDatesKey = `${formData.startDate.toDateString()}_${formData.endDate.toDateString()}`;
    const cacheKey = `weather_trip_${formData.location.lat}_${formData.location.lng}_${tripDatesKey}_${today}`;
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(newForecast.map(d => ({
        ...d,
        date: d.date.toISOString()
      }))));
    } catch (cacheError) {
      console.warn('Failed to update cached weather forecast:', cacheError);
    }
  };
  
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
  
  // Обработчик для перехода на экран выбора путешественников
  const handleGoToTravelers = () => {
    // Валидация формы
    if (!formData.destination || isDateError) {
      return;
    }
    
    setCurrentStep('travelers');
  };
  
  // Обработчик для возврата к предыдущему экрану
  const handleGoBack = () => {
    if (currentStep === 'travelers') {
      setCurrentStep('trip-details');
    } else if (currentStep === 'activities') {
      setCurrentStep('travelers');
    }
  };
  
  // Обработчик для перехода от путешественников к активностям
  const handleGoToActivities = () => {
    setCurrentStep('activities');
  };
  
  // Обработчик для сохранения информации о путешественниках
  const handleSaveTravelers = (travelers: TravelerType[]) => {
    setFormData({
      ...formData,
      travelers
    });
  };
  
  // Обработчик для сохранения выбранных активностей
  const handleSaveActivities = (activities: string[]) => {
    setFormData({
      ...formData,
      activities
    });
  };
  
  // Handle form submission
  const handleSaveTrip = async () => {
    // Валидация формы
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
        purpose: 'vacation', // Используем стандартное значение
        activities: formData.activities, // Включаем выбранные активности
      };
      
      // Создаем поездку и получаем id
      const createdTrip = await createTrip(tripData);
      
      // Проверяем, была ли нажата кнопка Generate List
      // Если да, переходим на страницу списка вещей
      // Если нет, возвращаемся на главную
      if (createdTrip && formData.activities.length > 0) {
        navigate(`/trip/${createdTrip.id}/items`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to create trip:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Рендер экрана с деталями поездки
  const renderTripDetails = () => (
    <div className="flex flex-col bg-gray-50">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 pb-16">
        <ProgressBar currentStep={1} totalSteps={2} />
        
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
              <DateSelector
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
              <DateSelector
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
          <WeatherForecast 
            forecast={weatherForecast} 
            isLoading={isLoading}
            location={formData.location.lat !== 0 ? formData.location : undefined}
            tripStartDate={formData.startDate}
            tripEndDate={formData.endDate}
            onForecastUpdate={handleWeatherForecastUpdate}
          />
        </div>
      </div>
      
      {/* Fixed Next Button */}
      <div className="fixed bottom-16 left-0 right-0 px-6 py-2 bg-gray-50 pb-4">
        <TripButton 
          className="w-full py-2 text-base"
          onClick={handleGoToTravelers}
          disabled={!formData.destination || isDateError || isLoading}
        >
          Next
        </TripButton>
      </div>
    </div>
  );

  // Рендер экрана выбора путешественников
  const renderTravelersSelector = () => (
    <div className="flex-1 flex flex-col">
      <TravelersSelector 
        onBack={handleGoBack}
        onNext={handleGoToActivities}
        onSaveTravelers={handleSaveTravelers}
        initialTravelers={formData.travelers}
      />
    </div>
  );
  
  // Рендер экрана выбора активностей
  const renderActivitiesSelector = () => (
    <div className="flex-1 flex flex-col">
      <ActivitiesSelector 
        onBack={handleGoBack}
        onSaveActivities={(activities) => {
          handleSaveActivities(activities);
          handleSaveTrip();
        }}
        initialActivities={formData.activities}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {currentStep === 'trip-details' ? (
        <>
          <Header title="Baggle" showBackButton onBackClick={() => navigate('/')} />
          {renderTripDetails()}
          <BottomNav />
        </>
      ) : currentStep === 'travelers' ? (
        <TravelersSelector 
          onBack={handleGoBack}
          onNext={handleGoToActivities}
          onSaveTravelers={handleSaveTravelers}
          initialTravelers={formData.travelers}
        />
      ) : (
        <ActivitiesSelector 
          onBack={handleGoBack}
          onSaveActivities={(activities) => {
            handleSaveActivities(activities);
            handleSaveTrip();
          }}
          initialActivities={formData.activities}
        />
      )}
    </div>
  );
}