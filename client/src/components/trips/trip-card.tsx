import React from 'react';
import { navigate } from 'wouter/use-browser-location';
import { Trip, TripWeather } from '@shared/schema';
import ProgressCircle from '../packing/progress-circle';

interface TripCardProps {
  trip: Trip;
  weather?: TripWeather[];
  progress: number;
  isPast?: boolean;
  daysUntilDeparture?: number;
}

const TripCard: React.FC<TripCardProps> = ({ 
  trip, 
  weather, 
  progress, 
  isPast = false,
  daysUntilDeparture
}) => {
  // Use imported navigate function
  
  // Format dates for display
  const formatDateRange = (startDate: Date, endDate: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(startDate)) + ' - ' + 
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(endDate));
  };
  
  const handleClick = () => {
    navigate(`/trip/${trip.id}`);
  };
  
  return (
    <div 
      className="rounded-xl bg-white shadow-md border border-border overflow-hidden mb-5 cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{trip.destination}</h3>
            <p className="text-text-secondary text-sm">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          
          {/* Progress Circle or Completed Icon */}
          {isPast ? (
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <span className="material-icons text-success">check</span>
              </div>
              <span className="text-xs text-text-secondary mt-1">Complete</span>
            </div>
          ) : (
            <ProgressCircle progress={progress} size={48} label="Packed" />
          )}
        </div>
        
        {/* Trip Details (only for upcoming trips) */}
        {!isPast && daysUntilDeparture !== undefined && (
          <div className="mt-3 flex items-center">
            <span className="material-icons text-text-secondary text-sm mr-1">schedule</span>
            <span className="text-sm text-text-secondary">
              {daysUntilDeparture === 0 
                ? 'Departure today' 
                : daysUntilDeparture === 1 
                  ? '1 day until departure' 
                  : `${daysUntilDeparture} days until departure`}
            </span>
          </div>
        )}
      </div>
      
      {/* Weather Preview (only for upcoming trips with weather data) */}
      {!isPast && weather && weather.length > 0 && (
        <div className="bg-gray-50 p-3 border-t border-border flex items-center overflow-x-auto weather-scroll">
          {weather.slice(0, 3).map((day, index) => (
            <div key={index} className="flex flex-col items-center mr-4 last:mr-0">
              <p className="text-xs text-text-secondary">
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(day.date))}
              </p>
              <span className={`material-icons ${
                day.condition === 'Clear' ? 'text-warning' :
                day.condition === 'Cloudy' ? 'text-primary' : 'text-text-secondary'
              }`}>{day.icon}</span>
              <p className="text-sm font-medium">{day.temperature}°C</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripCard;
