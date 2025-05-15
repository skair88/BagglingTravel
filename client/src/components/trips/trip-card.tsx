import React from 'react';
import { navigate } from 'wouter/use-browser-location';
import { Trip, TripWeather } from '@shared/schema';
import ProgressCircle from '../packing/progress-circle';
import { MdLuggage } from 'react-icons/md';

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
  // Format dates for display
  const formatDateRange = (startDate: Date, endDate: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).formatRange(new Date(startDate), new Date(endDate));
  };

  const handleClick = () => {
    navigate(`/trip/${trip.id}/packing`);
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{trip.destination}</h3>
            <p className="text-sm text-gray-500">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          <ProgressCircle progress={progress} />
        </div>
        
        {/* Weather preview */}
        {!isPast && weather && Array.isArray(weather) && weather.length > 0 && (
          <div className="mt-3 flex overflow-x-auto no-scrollbar py-1">
            {weather.slice(0, 3).map((day) => (
              <div key={day.id} className="flex flex-col items-center mr-3 min-w-[50px]">
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon || '01d'}.png`}
                  alt={day.condition || 'Weather'}
                  className="w-8 h-8"
                />
                <span className="text-xs">{Math.round(day.temperature)}°</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with status information */}
      <div className="bg-gray-50 py-2 px-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-600">
          <MdLuggage className="mr-1" />
          {isPast ? (
            <span>Trip completed</span>
          ) : daysUntilDeparture && daysUntilDeparture > 0 ? (
            <span>{daysUntilDeparture} days until departure</span>
          ) : (
            <span>Trip in progress</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;