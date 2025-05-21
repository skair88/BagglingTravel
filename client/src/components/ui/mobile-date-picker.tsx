import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, isBefore, isAfter, addDays, getMonth, getYear, setMonth, setYear, parse } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileDatePickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placeholder?: string;
  defaultMonth?: Date; // Месяц, который будет показан по умолчанию
}

const MobileDatePicker: React.FC<MobileDatePickerProps> = ({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  placeholder = 'Select date',
  defaultMonth
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'days' | 'months' | 'years' | 'wheel'>('wheel');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selected);
  const [currentMonth, setCurrentMonth] = useState(selected || defaultMonth || new Date());
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Данные для выбора дня, месяца, года в стиле iOS колеса
  const generateYears = (startYear: number, count: number) => {
    return Array.from({ length: count }, (_, i) => startYear + i);
  };

  const currentYear = getYear(new Date());
  const years = generateYears(currentYear - 50, 101); // 50 лет назад до 50 лет вперед
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const generateDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };
  
  const [wheelDay, setWheelDay] = useState(selected ? selected.getDate() : new Date().getDate());
  const [wheelMonth, setWheelMonth] = useState(selected ? selected.getMonth() : new Date().getMonth());
  const [wheelYear, setWheelYear] = useState(selected ? selected.getFullYear() : new Date().getFullYear());
  const [wheelDays, setWheelDays] = useState(generateDays(wheelYear, wheelMonth));
  
  // При изменении месяца/года обновляем количество дней
  useEffect(() => {
    const days = generateDays(wheelYear, wheelMonth);
    setWheelDays(days);
    
    // Если выбранный день больше максимально возможного, корректируем
    if (wheelDay > days.length) {
      setWheelDay(days.length);
    }
  }, [wheelMonth, wheelYear]);
  
  // Клик вне модального окна закрывает его
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Предотвращаем скролл страницы при открытом пикере на мобильном
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const applyDate = () => {
    const date = new Date(wheelYear, wheelMonth, wheelDay);
    setSelectedDate(date);
    onSelect(date);
    setIsOpen(false);
  };
  
  const cancelSelection = () => {
    // Возвращаем предыдущие значения
    if (selected) {
      setWheelDay(selected.getDate());
      setWheelMonth(selected.getMonth());
      setWheelYear(selected.getFullYear());
    }
    setIsOpen(false);
  };
  
  // Рендер iOS-like wheel picker с поддержкой свайпов
  const renderWheel = () => {
    const renderWheelItems = (items: number[] | string[], selectedItem: number, onChange: (value: number) => void, formatter?: (item: any) => string) => {
      const wheelRef = useRef<HTMLDivElement>(null);
      const [startY, setStartY] = useState<number | null>(null);
      const [scrolling, setScrolling] = useState(false);
      
      // Устанавливаем начальное положение скролла для выбранного элемента при монтировании
      useEffect(() => {
        if (wheelRef.current) {
          const itemHeight = 40; // высота элемента в пикселях
          const paddingTop = 70; // верхний отступ
          const scrollToPosition = (typeof selectedItem === 'number' ? selectedItem : 0) * itemHeight + paddingTop;
          
          wheelRef.current.scrollTop = scrollToPosition;
        }
      }, [selectedItem, items]);
      
      // Обработчики событий для свайпов
      const handleTouchStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY);
        setScrolling(true);
      };
      
      const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === null || !wheelRef.current || !scrolling) return;
        
        const currentY = e.touches[0].clientY;
        const diff = startY - currentY;
        
        wheelRef.current.scrollTop += diff;
        setStartY(currentY);
      };
      
      const handleTouchEnd = () => {
        setStartY(null);
        setScrolling(false);
        
        // После окончания скролла определяем, какой элемент теперь в центре
        if (wheelRef.current) {
          const itemHeight = 40;
          const paddingTop = 70;
          const scrollTop = wheelRef.current.scrollTop;
          
          // Вычисляем индекс элемента на основе текущей позиции скролла
          const index = Math.round((scrollTop - paddingTop) / itemHeight);
          
          // Проверяем, находится ли индекс в допустимом диапазоне
          if (index >= 0 && index < items.length) {
            onChange(typeof items[index] === 'number' ? items[index] as number : index);
            
            // Плавно прокручиваем к выбранному элементу
            wheelRef.current.scrollTo({
              top: index * itemHeight + paddingTop,
              behavior: 'smooth'
            });
          }
        }
      };
      
      // Обработчик скролла колесом мыши
      const handleWheel = (e: React.WheelEvent) => {
        // После окончания скролла определяем выбранный элемент
        if (wheelRef.current) {
          setTimeout(() => {
            const itemHeight = 40;
            const paddingTop = 70;
            const scrollTop = wheelRef.current.scrollTop;
            const index = Math.round((scrollTop - paddingTop) / itemHeight);
            
            if (index >= 0 && index < items.length) {
              onChange(typeof items[index] === 'number' ? items[index] as number : index);
            }
          }, 100);
        }
      };
      
      return (
        <div className="relative flex-1 overflow-hidden h-[180px] mx-1">
          <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-white via-transparent to-white"></div>
          <div 
            ref={wheelRef}
            className="h-full overflow-auto scrollbar-none" 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <div className="h-[70px]"></div> {/* Padding top */}
            {items.map((item, index) => {
              const value = typeof item === 'number' ? item : index;
              const isSelected = selectedItem === value;
              const displayText = formatter ? formatter(item) : item.toString();
              
              return (
                <div 
                  key={index} 
                  className={cn(
                    "h-[40px] flex items-center justify-center text-lg font-medium cursor-pointer transition-all",
                    isSelected ? "text-primary scale-110" : "text-gray-500"
                  )}
                  onClick={() => {
                    onChange(value);
                    // Прокручиваем к выбранному элементу при клике
                    if (wheelRef.current) {
                      wheelRef.current.scrollTo({
                        top: index * 40 + 70,
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  {displayText}
                </div>
              );
            })}
            <div className="h-[70px]"></div> {/* Padding bottom */}
          </div>
        </div>
      );
    };
    
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-center w-full">
            {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
          </h3>
        </div>
        
        <div className="flex relative mb-6">
          {/* Highlighting selected item */}
          <div className="absolute left-0 right-0 top-[70px] h-[40px] bg-gray-100 rounded-lg pointer-events-none"></div>
          
          {/* Day wheel */}
          {renderWheelItems(
            wheelDays, 
            wheelDay, 
            (value) => setWheelDay(value),
            (day) => `${day}`
          )}
          
          {/* Month wheel */}
          {renderWheelItems(
            monthNames, 
            wheelMonth, 
            (value) => setWheelMonth(value),
            (month) => month.toString().substring(0, 3)
          )}
          
          {/* Year wheel */}
          {renderWheelItems(
            years, 
            wheelYear, 
            (value) => setWheelYear(value)
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-800 font-medium"
            onClick={cancelSelection}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 rounded-lg bg-primary text-white font-medium"
            onClick={applyDate}
          >
            Done
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className={cn("relative", className)}>
      <button
        className={cn(
          "w-full flex items-center justify-between px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-left",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "transition-colors"
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center">
          <CalendarIcon className="mr-3 h-5 w-5 text-gray-500" />
          <span className={cn("text-base", !selectedDate && "text-gray-500")}>
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          
          {/* Modal */}
          <div
            ref={modalRef}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl animate-slide-up"
            style={{ maxHeight: '90vh' }}
          >
            <div className="p-1">
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
              
              {renderWheel()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileDatePicker;