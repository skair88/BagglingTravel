
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placeholder?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  placeholder = 'Select date'
}) => {
  // Состояние компонента
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selected);
  
  // Текущие значения даты (год, месяц, день)
  const [selectedDay, setSelectedDay] = useState(selected ? selected.getDate() : new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(selected ? selected.getMonth() : new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(selected ? selected.getFullYear() : new Date().getFullYear());
  
  // Ссылки на DOM-элементы
  const modalRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  // Состояние для свайпов
  const [touchState, setTouchState] = useState<{
    startY: number | null;
    startTime: number;
    isScrolling: boolean;
    activeWheel: 'day' | 'month' | 'year' | null;
  }>({
    startY: null,
    startTime: 0,
    isScrolling: false,
    activeWheel: null
  });

  // Синхронизация внутреннего состояния с внешним пропсом
  useEffect(() => {
    if (selected) {
      setSelectedDate(selected);
      setSelectedDay(selected.getDate());
      setSelectedMonth(selected.getMonth());
      setSelectedYear(selected.getFullYear());
    }
  }, [selected]);

  // Данные для колес выбора
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                     'August', 'September', 'October', 'November', 'December'];
  
  const years = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - 50 + i);
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  // Обработчик клика вне модального окна
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden'; // Блокируем скролл
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = ''; // Восстанавливаем скролл
    };
  }, [isOpen]);
  
  // Прокручиваем колеса до выбранной даты при открытии
  useEffect(() => {
    if (isOpen && dayRef.current && monthRef.current && yearRef.current) {
      const itemHeight = 40;
      const centerOffset = 70; // отступ для центрирования
      
      // Центрируем скролл для дня
      const dayIndex = days.indexOf(selectedDay);
      if (dayIndex !== -1) {
        dayRef.current.scrollTop = dayIndex * itemHeight;
      }
      
      // Центрируем скролл для месяца
      monthRef.current.scrollTop = selectedMonth * itemHeight;
      
      // Центрируем скролл для года
      const yearIndex = years.indexOf(selectedYear);
      if (yearIndex !== -1) {
        yearRef.current.scrollTop = yearIndex * itemHeight;
      }
    }
  }, [isOpen, selectedDay, selectedMonth, selectedYear, days, years]);

  // Функция для обновления значения на основе скролла
  const updateValueFromScroll = (
    scrollElement: HTMLDivElement, 
    items: any[], 
    setValue: (value: any) => void,
    isMonthIndex: boolean = false
  ) => {
    const itemHeight = 40;
    const centerOffset = 70;
    const scrollTop = scrollElement.scrollTop;
    
    let index = Math.round((scrollTop - centerOffset + itemHeight / 2) / itemHeight);
    index = Math.max(0, Math.min(index, items.length - 1));
    
    const value = isMonthIndex ? index : items[index];
    setValue(value);
    
    // Плавная прокрутка к выбранному элементу
    const targetScroll = index * itemHeight + centerOffset;
    scrollElement.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  // Обработчики тач-событий
  const handleTouchStart = (e: React.TouchEvent, wheelType: 'day' | 'month' | 'year') => {
    e.preventDefault();
    setTouchState({
      startY: e.touches[0].clientY,
      startTime: Date.now(),
      isScrolling: true,
      activeWheel: wheelType
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchState.isScrolling || !touchState.startY || !touchState.activeWheel) return;
    
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    const deltaY = touchState.startY - currentY;
    
    let scrollElement: HTMLDivElement | null = null;
    switch (touchState.activeWheel) {
      case 'day':
        scrollElement = dayRef.current;
        break;
      case 'month':
        scrollElement = monthRef.current;
        break;
      case 'year':
        scrollElement = yearRef.current;
        break;
    }
    
    if (scrollElement) {
      scrollElement.scrollTop += deltaY * 1.5; // Увеличиваем чувствительность
    }
    
    setTouchState(prev => ({
      ...prev,
      startY: currentY
    }));
  };

  const handleTouchEnd = () => {
    if (!touchState.activeWheel) return;
    
    let scrollElement: HTMLDivElement | null = null;
    let items: any[] = [];
    let setValue: (value: any) => void = () => {};
    let isMonthIndex = false;
    
    switch (touchState.activeWheel) {
      case 'day':
        scrollElement = dayRef.current;
        items = days;
        setValue = setSelectedDay;
        break;
      case 'month':
        scrollElement = monthRef.current;
        items = monthNames;
        setValue = setSelectedMonth;
        isMonthIndex = true;
        break;
      case 'year':
        scrollElement = yearRef.current;
        items = years;
        setValue = setSelectedYear;
        break;
    }
    
    if (scrollElement) {
      setTimeout(() => {
        updateValueFromScroll(scrollElement!, items, setValue, isMonthIndex);
      }, 100);
    }
    
    setTouchState({
      startY: null,
      startTime: 0,
      isScrolling: false,
      activeWheel: null
    });
  };

  // Применение выбора даты
  const applyDate = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    setSelectedDate(date);
    onSelect(date);
    setIsOpen(false);
  };
  
  // Отмена выбора
  const cancelSelection = () => {
    if (selected) {
      setSelectedDay(selected.getDate());
      setSelectedMonth(selected.getMonth());
      setSelectedYear(selected.getFullYear());
    }
    setIsOpen(false);
  };

  // Компонент колеса выбора
  const WheelPicker = ({ 
    items, 
    selectedValue, 
    onValueChange, 
    wheelRef, 
    wheelType,
    formatter 
  }: { 
    items: any[], 
    selectedValue: any, 
    onValueChange: (value: any) => void, 
    wheelRef: React.RefObject<HTMLDivElement>,
    wheelType: 'day' | 'month' | 'year',
    formatter?: (item: any, index?: number) => string 
  }) => (
    <div className="relative flex-1 overflow-hidden h-[180px] mx-1">
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-white via-transparent to-white"></div>
      <div 
        ref={wheelRef}
        className="h-full overflow-auto scrollbar-none touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onTouchStart={(e) => handleTouchStart(e, wheelType)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onScroll={() => {
          if (!touchState.isScrolling && wheelRef.current) {
            const isMonthIndex = wheelType === 'month';
            updateValueFromScroll(wheelRef.current, items, onValueChange, isMonthIndex);
          }
        }}
      >
        <div className="h-[70px]"></div>
        {items.map((item, index) => {
          const value = wheelType === 'month' ? index : item;
          const isSelected = selectedValue === value;
          const displayText = formatter ? formatter(item, index) : item.toString();
          
          return (
            <div 
              key={`${wheelType}-${index}`}
              className={cn(
                "h-[40px] flex items-center justify-center text-lg font-medium cursor-pointer transition-all",
                isSelected ? "text-primary scale-110" : "text-gray-500"
              )}
              onClick={() => {
                onValueChange(value);
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
        <div className="h-[70px]"></div>
      </div>
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
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
          {/* Затемнение фона */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          
          {/* Модальное окно */}
          <div
            ref={modalRef}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl animate-slide-up"
            style={{ maxHeight: '90vh' }}
          >
            <div className="p-4">
              {/* Кнопка закрытия */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
                type="button"
              >
                <X size={20} className="text-gray-500" />
              </button>
              
              {/* Заголовок */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-center w-full">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </h3>
              </div>
              
              {/* Содержимое модального окна */}
              <div className="flex relative mb-6">
                {/* Подсветка выбранного элемента */}
                <div className="absolute left-0 right-0 top-[70px] h-[40px] bg-gray-100 rounded-lg pointer-events-none z-20"></div>
                
                {/* Колесо выбора дня */}
                <WheelPicker
                  items={days}
                  selectedValue={selectedDay}
                  onValueChange={setSelectedDay}
                  wheelRef={dayRef}
                  wheelType="day"
                />
                
                {/* Колесо выбора месяца */}
                <WheelPicker
                  items={monthNames}
                  selectedValue={selectedMonth}
                  onValueChange={setSelectedMonth}
                  wheelRef={monthRef}
                  wheelType="month"
                  formatter={(month: string) => month.substring(0, 3)}
                />
                
                {/* Колесо выбора года */}
                <WheelPicker
                  items={years}
                  selectedValue={selectedYear}
                  onValueChange={setSelectedYear}
                  wheelRef={yearRef}
                  wheelType="year"
                />
              </div>
              
              {/* Кнопки действий */}
              <div className="flex space-x-3">
                <button
                  className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-800 font-medium"
                  onClick={cancelSelection}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3 rounded-lg bg-primary text-white font-medium"
                  onClick={applyDate}
                  type="button"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateSelector;
