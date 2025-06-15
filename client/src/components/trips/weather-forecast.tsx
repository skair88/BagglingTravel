import React, { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isOnline } from '@/lib/weather';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Проверяем возможность скролла при изменении размера окна или контента
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px - небольшой запас
    }
  };
  
  // Проверяем возможность скролла при монтировании и изменении прогноза
  useEffect(() => {
    checkScrollability();
    
    // Добавляем обработчик события прокрутки
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      }
    };
  }, [forecast]);
  
  // Прокручиваем влево
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  // Прокручиваем вправо
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  // Если нет подключения к интернету, не показываем прогноз
  if (!isOnline()) {
    return null;
  }
  
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Weather information</h2>
        <div className="flex space-x-1">
          <button 
            className={`p-1 rounded-full ${canScrollLeft ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            className={`p-1 rounded-full ${canScrollRight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide"
      >
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