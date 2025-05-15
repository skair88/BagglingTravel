import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WeatherCard from '@/components/ui/weather-card';
import { Checkbox } from '@/components/ui/checkbox';
import * as mapbox from '@/lib/mapbox';
import { getWeatherForecast } from '@/lib/weather';
import Header from '@/components/layout/header';

// Type definitions for the trip wizard data
interface TripWizardData {
  destination: string;
  location: { lat: number; lng: number };
  startDate: Date;
  endDate: Date;
  purpose: string;
  activities: string[];
}

// Default trip data
const defaultTripData: TripWizardData = {
  destination: '',
  location: { lat: 0, lng: 0 },
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  purpose: 'Vacation',
  activities: []
};


interface WeatherForecast {
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

interface TripWizardProps {
  onComplete: (tripData: TripWizardData) => void;
}

const TripWizard: React.FC<TripWizardProps> = ({ onComplete }) => {
  const { step = '1' } = useParams<{ step: string }>();
  const [location] = useLocation();
  const [tripData, setTripData] = useState<TripWizardData>(defaultTripData);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle search location
  const handleSearch = async () => {
    if (searchQuery.trim().length === 0) return;
    
    setIsLoading(true);
    try {
    const locationDataArray = await mapbox.getLocation(searchQuery);
      if (locationDataArray && locationDataArray.length > 0) {
        const locationData = locationDataArray[0]; 
        setTripData(prev => ({
          ...prev,
          destination: locationData.placeName, 
          location: { lat: locationData.lat, lng: locationData.lng }
        }));
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch weather forecast when location and dates are set
  useEffect(() => {
    const fetchWeather = async () => {
      if (tripData.location.lat !== 0 && tripData.location.lng !== 0) {
        try {
          const forecast = await getWeatherForecast(
            tripData.location.lat,
            tripData.location.lng,
            tripData.startDate,
            tripData.endDate
          );
          setWeatherForecast(forecast);
        } catch (error) {
          console.error('Error fetching weather:', error);
        }
      }
    };
    
    fetchWeather();
  }, [tripData.location, tripData.startDate, tripData.endDate]);
  
  // Handle destination selection
  const handleDestinationNext = () => {
    if (tripData.destination) {
      navigate('/trip-creator/step/2');
    }
  };
  
  // Handle date selection
  const handleDateNext = () => {
    navigate('/trip-creator/step/3');
  };
  
  // Handle activity selection
  const toggleActivity = (activity: string) => {
    setTripData(prev => {
      const activities = prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity];
      
      return { ...prev, activities };
    });
  };
  
  // Handle purpose selection
  const selectPurpose = (purpose: string) => {
    setTripData(prev => ({ ...prev, purpose }));
  };
  
  // Complete the wizard
  const handleComplete = () => {
    onComplete(tripData);
  };
  
  // Navigate back or to home
  const handleBack = () => {
    if (step === '1') {
      navigate('/');
    } else {
      const prevStep = parseInt(step) - 1;
      navigate(`/trip-creator/step/${prevStep}`);
    }
  };
  
  return (
    <>
      <Header 
        title="New Trip" 
        showBackButton 
        onBackClick={handleBack}
      />
      
      {/* Wizard Progress */}
      <div className="flex justify-center mt-4 px-5">
        <div className="flex items-center space-x-2">
          <div className={`progress-dot w-3 h-3 rounded-full ${parseInt(step) >= 1 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`progress-dot w-3 h-3 rounded-full ${parseInt(step) >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`progress-dot w-3 h-3 rounded-full ${parseInt(step) >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
        </div>
      </div>
      
      {/* Step 1: Destination Selection */}
      {step === '1' && (
        <div className="px-5 mt-6">
          <h2 className="text-lg font-medium mb-4">Where are you going?</h2>
          
          {/* Search Input */}
          <div className="relative mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 material-icons text-text-secondary">search</span>
                <Input
                  type="text"
                  placeholder="Search for a destination"
                  className="w-full pl-10 pr-4 py-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
          
          {/* Map Preview */}
          <div className="rounded-xl overflow-hidden mb-6 border border-border shadow-sm">
            <div className="h-60 bg-gray-100 relative">
              {tripData.location.lat !== 0 && tripData.location.lng !== 0 ? (
                <iframe
                  title="Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+3B82F6(${tripData.location.lng},${tripData.location.lat})/${tripData.location.lng},${tripData.location.lat},10,0/600x240?access_token=${process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'}`}
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="material-icons text-text-secondary mb-2">map</span>
                  <p className="text-text-secondary">Search for a destination to view map</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Selected Destination */}
          {tripData.destination && (
            <div className="bg-white p-4 rounded-lg border border-border mb-6">
              <h3 className="font-medium">Selected Destination</h3>
              <div className="flex items-center mt-2">
                <span className="material-icons text-primary mr-2">place</span>
                <span className="text-text-primary">{tripData.destination}</span>
              </div>
            </div>
          )}
          
          {/* Next Button */}
          <Button 
            className="w-full" 
            onClick={handleDestinationNext}
            disabled={!tripData.destination}
          >
            Continue
          </Button>
        </div>
      )}
      
      {/* Step 2: Date Selection */}
      {step === '2' && (
        <div className="px-5 mt-6">
          <h2 className="text-lg font-medium mb-2">When are you traveling?</h2>
          <p className="text-text-secondary text-sm mb-4">Select your departure and return dates</p>
          
          {/* Date inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="block text-sm font-medium text-text-secondary mb-1">Departure</Label>
              <Input
                type="date"
                value={format(tripData.startDate, 'yyyy-MM-dd')}
                onChange={(e) => setTripData(prev => ({
                  ...prev,
                  startDate: new Date(e.target.value)
                }))}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-text-secondary mb-1">Return</Label>
              <Input
                type="date"
                value={format(tripData.endDate, 'yyyy-MM-dd')}
                onChange={(e) => setTripData(prev => ({
                  ...prev,
                  endDate: new Date(e.target.value)
                }))}
                min={format(tripData.startDate, 'yyyy-MM-dd')}
              />
            </div>
          </div>
          
          {/* Weather Forecast */}
          <h3 className="font-medium mb-3">Weather Forecast</h3>
          
          <div className="flex overflow-x-auto weather-scroll pb-2 mb-6">
            {weatherForecast.length > 0 ? (
              weatherForecast.map((day, index) => (
                <WeatherCard
                  key={index}
                  date={day.date}
                  temperature={day.temperature}
                  condition={day.condition}
                  icon={day.icon}
                />
              ))
            ) : (
              <div className="w-full py-6 text-center text-text-secondary">
                {tripData.location.lat !== 0 
                  ? 'Loading weather forecast...' 
                  : 'Weather data will appear after selecting a destination'}
              </div>
            )}
          </div>
          
          {/* Next Button */}
          <Button className="w-full" onClick={handleDateNext}>
            Continue
          </Button>
        </div>
      )}
      
      {/* Step 3: Trip Purpose and Activities */}
      {step === '3' && (
        <div className="px-5 mt-6">
          <h2 className="text-lg font-medium mb-4">Trip Purpose</h2>
          
          {/* Trip Type Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {tripPurposes.map(purpose => (
              <div 
                key={purpose.id}
                className={`bg-white rounded-lg border p-4 flex flex-col items-center cursor-pointer hover:border-primary transition-colors ${tripData.purpose === purpose.label ? 'border-primary' : 'border-border'}`}
                onClick={() => selectPurpose(purpose.label)}
              >
                <span className={`material-icons text-2xl mb-2 ${tripData.purpose === purpose.label ? 'text-primary' : 'text-text-secondary'}`}>
                  {purpose.icon}
                </span>
                <p className="text-center font-medium">{purpose.label}</p>
              </div>
            ))}
          </div>
          
          {/* Activities Section */}
          <h2 className="text-lg font-medium mb-4">Activities</h2>
          <p className="text-text-secondary text-sm mb-4">Select activities you plan to do</p>
          
          <div className="space-y-3 mb-6">
            {availableActivities.map(activity => (
              <div key={activity} className="flex items-center bg-white rounded-lg border border-border p-3">
                <Checkbox 
                  id={`activity-${activity}`}
                  checked={tripData.activities.includes(activity)}
                  onCheckedChange={() => toggleActivity(activity)}
                />
                <label 
                  htmlFor={`activity-${activity}`}
                  className="ml-3 font-medium cursor-pointer"
                >
                  {activity}
                </label>
              </div>
            ))}
          </div>
          
          {/* Finish Button */}
          <Button className="w-full mb-3" onClick={handleComplete}>
            Generate Packing List
          </Button>
          
          <p className="text-xs text-text-secondary text-center">
            We'll create your personalized packing list based on your destination, trip dates, weather, and activities.
          </p>
        </div>
      )}
    </>
  );
};

export default TripWizard;
