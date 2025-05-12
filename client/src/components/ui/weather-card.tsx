import React from 'react';

interface WeatherCardProps {
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ date, temperature, condition, icon }) => {
  // Format date to show only the month and day
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
  
  // Determine icon color based on weather condition
  const getIconColor = (condition: string) => {
    switch(condition.toLowerCase()) {
      case 'clear':
        return 'text-warning';
      case 'rain':
        return 'text-text-secondary';
      case 'cloudy':
        return 'text-primary';
      default:
        return 'text-text-secondary';
    }
  };
  
  return (
    <div className="weather-card flex-shrink-0 bg-white rounded-lg border border-border p-3 mr-3 flex flex-col items-center">
      <p className="text-xs text-text-secondary mb-1">{formattedDate}</p>
      <span className={`material-icons text-2xl mb-1 ${getIconColor(condition)}`}>{icon}</span>
      <p className="text-sm font-medium">{temperature}°C</p>
      <p className="text-xs text-text-secondary">{condition}</p>
    </div>
  );
};

export default WeatherCard;
