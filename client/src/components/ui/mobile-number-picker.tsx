
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MobileNumberPickerProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const MobileNumberPicker: React.FC<MobileNumberPickerProps> = ({
  value,
  min = 0,
  max = 10,
  onChange,
  isOpen,
  onClose,
  title = 'Select quantity'
}) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 48; // высота каждого элемента в пикселях  
  
  // Создаем массив чисел от min до max
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // Обновляем позицию скролла при открытии пикера
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      const index = value - min; // Используем переданное значение
      const scrollTop = index * itemHeight;
      scrollRef.current.scrollTop = scrollTop;
      setSelectedValue(value); // Устанавливаем начальное значение
    }
  }, [isOpen, value, min]);

  // Обработчик скролла для определения выбранного значения
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollTop = scrollRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const newValue = Math.max(min, Math.min(max, min + index));
      
      if (newValue !== selectedValue) {
        setSelectedValue(newValue);
        onChange(newValue);
      }
    }
  };

  // Обработчик клика по элементу
  const handleItemClick = (number: number) => {
    setSelectedValue(number);
    onChange(number);
    
    if (scrollRef.current) {
      const index = number - min;
      scrollRef.current.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Picker Modal */}
      <div className="relative w-full bg-white rounded-t-3xl px-6 py-4 max-h-80">
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        
        {/* Title */}
        <h3 className="text-lg font-medium text-center mb-4">{title}</h3>
        
        {/* Picker Container */}
        <div className="relative h-48 overflow-hidden">
          {/* Scrollable numbers */}
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto scrollbar-hide"
            onScroll={handleScroll}
            style={{ 
              scrollSnapType: 'y mandatory',
              paddingTop: '96px', // (container height - item height) / 2
              paddingBottom: '96px'
            }}
          >
            {/* Selected item indicator */}
            <div 
              className="absolute left-0 right-0 h-12 bg-amber-100 bg-opacity-60 border-y-2 border-amber-400 pointer-events-none z-10 rounded-lg mx-4"
              style={{ top: '65%', transform: 'translateY(0)' }}
            />
            {numbers.map((number) => (
              <div
                key={number}
                className={cn(
                  "flex items-center justify-center h-12 cursor-pointer transition-all duration-200",
                  selectedValue === number 
                    ? "text-amber-600 font-bold text-2xl" 
                    : "text-gray-400 font-normal text-lg"
                )}
                style={{ scrollSnapAlign: 'center' }}
                onClick={() => handleItemClick(number)}
              >
                {number}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNumberPicker;
