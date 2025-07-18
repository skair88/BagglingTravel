
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

  // Touch события для свайпов
  const [touchStart, setTouchStart] = useState<{ y: number; scrollTop: number; element: HTMLDivElement | null }>({ y: 0, scrollTop: 0, element: null });
  const [isDragging, setIsDragging] = useState(false);

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
      // Центрируем скролл для дня
      const dayIndex = days.indexOf(selectedDay);
      if (dayIndex !== -1) {
        dayRef.current.scrollTop = dayIndex * 40;
      }
      
      // Центрируем скролл для месяца
      monthRef.current.scrollTop = selectedMonth * 40;
      
      // Центрируем скролл для года
      const yearIndex = years.indexOf(selectedYear);
      if (yearIndex !== -1) {
        yearRef.current.scrollTop = yearIndex * 40;
      }
    }
  }, [isOpen, selectedDay, selectedMonth, selectedYear, days, years]);

  // Функция для обновления выбранного значения на основе скролла
  const updateSelectedValue = (element: HTMLDivElement, values: any[], setter: (value: any) => void) => {
    const index = Math.round(element.scrollTop / 40);
    if (index >= 0 && index < values.length) {
      setter(values[index]);
    }
  };

  // Touch события для свайпов
  const handleTouchStart = (e: React.TouchEvent, element: HTMLDivElement) => {
    const touch = e.touches[0];
    setTouchStart({
      y: touch.clientY,
      scrollTop: element.scrollTop,
      element: element
    });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !touchStart.element) return;
    
    const touch = e.touches[0];
    const deltaY = touchStart.y - touch.clientY;
    const newScrollTop = touchStart.scrollTop + deltaY;
    
    touchStart.element.scrollTop = newScrollTop;
    
    // Обновляем выбранное значение во время свайпа
    if (touchStart.element === dayRef.current) {
      updateSelectedValue(touchStart.element, days, setSelectedDay);
    } else if (touchStart.element === monthRef.current) {
      updateSelectedValue(touchStart.element, monthNames, (_, index) => setSelectedMonth(index));
    } else if (touchStart.element === yearRef.current) {
      updateSelectedValue(touchStart.element, years, setSelectedYear);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !touchStart.element) return;
    
    // Плавное выравнивание к ближайшему элементу
    const element = touchStart.element;
    const index = Math.round(element.scrollTop / 40);
    const targetScrollTop = index * 40;
    
    element.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
    
    setIsDragging(false);
    setTouchStart({ y: 0, scrollTop: 0, element: null });
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
              <div 
                className="flex relative mb-6"
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Подсветка выбранного элемента */}
                <div className="absolute left-0 right-0 top-[70px] h-[40px] bg-gray-100 rounded-lg pointer-events-none"></div>
                
                {/* Колесо выбора дня */}
                <div className="relative flex-1 overflow-hidden h-[180px] mx-1">
                  <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-white via-transparent to-white"></div>
                  <div 
                    ref={dayRef}
                    className="h-full overflow-auto scrollbar-none"
                    onScroll={() => {
                      if (dayRef.current && !isDragging) {
                        updateSelectedValue(dayRef.current, days, setSelectedDay);
                      }
                    }}
                    onTouchStart={(e) => dayRef.current && handleTouchStart(e, dayRef.current)}
                  >
                    <div className="h-[70px]"></div>
                    {days.map((day) => (
                      <div 
                        key={`day-${day}`}
                        className={cn(
                          "h-[40px] flex items-center justify-center text-lg font-medium cursor-pointer transition-all",
                          selectedDay === day ? "text-primary scale-110" : "text-gray-500"
                        )}
                        onClick={() => {
                          setSelectedDay(day);
                          if (dayRef.current) {
                            const index = days.indexOf(day);
                            dayRef.current.scrollTo({
                              top: index * 40,
                              behavior: 'smooth'
                            });
                          }
                        }}
                      >
                        {day}
                      </div>
                    ))}
                    <div className="h-[70px]"></div>
                  </div>
                </div>
                
                {/* Колесо выбора месяца */}
                <div className="relative flex-1 overflow-hidden h-[180px] mx-1">
                  <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-white via-transparent to-white"></div>
                  <div 
                    ref={monthRef}
                    className="h-full overflow-auto scrollbar-none"
                    onScroll={() => {
                      if (monthRef.current && !isDragging) {
                        const index = Math.round(monthRef.current.scrollTop / 40);
                        if (index >= 0 && index < monthNames.length) {
                          setSelectedMonth(index);
                        }
                      }
                    }}
                    onTouchStart={(e) => monthRef.current && handleTouchStart(e, monthRef.current)}
                  >
                    <div className="h-[70px]"></div>
                    {monthNames.map((month, index) => (
                      <div 
                        key={`month-${index}`}
                        className={cn(
                          "h-[40px] flex items-center justify-center text-lg font-medium cursor-pointer transition-all",
                          selectedMonth === index ? "text-primary scale-110" : "text-gray-500"
                        )}
                        onClick={() => {
                          setSelectedMonth(index);
                          if (monthRef.current) {
                            monthRef.current.scrollTo({
                              top: index * 40,
                              behavior: 'smooth'
                            });
                          }
                        }}
                      >
                        {month.substring(0, 3)}
                      </div>
                    ))}
                    <div className="h-[70px]"></div>
                  </div>
                </div>
                
                {/* Колесо выбора года */}
                <div className="relative flex-1 overflow-hidden h-[180px] mx-1">
                  <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-white via-transparent to-white"></div>
                  <div 
                    ref={yearRef}
                    className="h-full overflow-auto scrollbar-none"
                    onScroll={() => {
                      if (yearRef.current && !isDragging) {
                        updateSelectedValue(yearRef.current, years, setSelectedYear);
                      }
                    }}
                    onTouchStart={(e) => yearRef.current && handleTouchStart(e, yearRef.current)}
                  >
                    <div className="h-[70px]"></div>
                    {years.map((year) => (
                      <div 
                        key={`year-${year}`}
                        className={cn(
                          "h-[40px] flex items-center justify-center text-lg font-medium cursor-pointer transition-all",
                          selectedYear === year ? "text-primary scale-110" : "text-gray-500"
                        )}
                        onClick={() => {
                          setSelectedYear(year);
                          if (yearRef.current) {
                            const index = years.indexOf(year);
                            yearRef.current.scrollTo({
                              top: index * 40,
                              behavior: 'smooth'
                            });
                          }
                        }}
                      >
                        {year}
                      </div>
                    ))}
                    <div className="h-[70px]"></div>
                  </div>
                </div>
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
