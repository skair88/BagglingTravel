import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/header';
import ProgressBar from '@/components/trips/progress-bar';
import LocationSearch from '@/components/trips/location-search';
import WeatherForecast from '@/components/trips/weather-forecast';
import { getWeatherForecast } from '@/lib/weather';
import { useTrips } from '@/hooks/use-trips';

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
  activities: string[];
}

// Default trip data
const defaultTripData: TripWizardData = {
  destination: '',
  location: { lat: 0, lng: 0 },
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  activities: [],
};

export default function TripCreator() {
  const [location, navigate] = useLocation();
  const { createTrip } = useTrips();
  
  // Form state
  const [formData, setFormData] = useState<TripWizardData>(defaultTripData);
  const [locationInput, setLocationInput] = useState('');
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
        try {
          const forecast = await getWeatherForecast(
            formData.location.lat,
            formData.location.lng,
            formData.startDate,
            formData.endDate
          );
          setWeatherForecast(forecast);
        } catch (error) {
          console.error('Failed to fetch weather:', error);
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
  const handleNextStep = async () => {
    // Validate form
    if (!formData.destination || isDateError) {
      return;
    }
    
    if (currentStep === 1) {
      // Move to next step in wizard
      setCurrentStep(2);
      return;
    }
    
    // Create trip
    try {
      setIsLoading(true);
      
      const tripData: TripCreationData = {
        destination: formData.destination,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        purpose: 'vacation', // Default purpose
        activities: formData.activities,
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
      
      <div className="p-4">
        <ProgressBar currentStep={currentStep} totalSteps={2} />
        
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Direction</h2>
          <LocationSearch
            value={locationInput}
            onChange={setLocationInput}
            onLocationSelect={handleLocationSelect}
          />
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Dates</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      isDateError ? 'border-red-500' : ''
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, 'dd.MM.yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => 
                      setFormData({ ...formData, startDate: date || new Date() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      isDateError ? 'border-red-500' : ''
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, 'dd.MM.yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => 
                      setFormData({ ...formData, endDate: date || new Date() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {isDateError && (
            <p className="text-sm text-red-500 mt-1">
              End date must be after or equal to start date
            </p>
          )}
        </div>
        
        {/* Weather Forecast */}
        <WeatherForecast forecast={weatherForecast} isLoading={isLoading} />
        
        {/* Next Button */}
        <div className="mt-8">
          <Button 
            className="w-full"
            onClick={handleNextStep}
            disabled={!formData.destination || isDateError || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}