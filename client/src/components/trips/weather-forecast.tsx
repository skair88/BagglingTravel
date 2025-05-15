import React from 'react';
import { format } from 'date-fns';

interface ForecastDay {
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

interface WeatherForecastProps {
  forecast: ForecastDay[];
  isLoading?: boolean;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-3">Weather information</h2>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="min-w-[100px] h-[140px] bg-gray-100 rounded-md animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (!forecast || forecast.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-3">Weather information</h2>
      
      <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
        {forecast.map((day, index) => (
          <div 
            key={index} 
            className="min-w-[100px] border border-gray-300 rounded-md p-2 flex-shrink-0"
          >
            <div className="text-center text-sm">
              {format(day.date, 'dd.MM')}
            </div>
            
            <div className="text-center text-2xl font-semibold mt-1">
              {Math.round(day.temperature)}°C
            </div>
            
            <div className="flex justify-center my-1">
              <img 
                src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
                alt={day.condition}
                className="w-12 h-12"
              />
            </div>
            
            <div className="text-center text-xs text-gray-500">
              {day.condition}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherForecast;