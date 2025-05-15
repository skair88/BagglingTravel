import React, { useState } from 'react';
import { format, addMonths, isBefore, isAfter } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileDatePickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placeholder?: string;
}

const MobileDatePicker = ({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  placeholder = 'Выберите дату'
}: MobileDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  
  // Получаем дни текущего месяца
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    const daysFromPrevMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Добавляем дни из предыдущего месяца
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = new Date(year, month - 1, prevMonthDays - i + 1);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }
    
    // Добавляем дни следующего месяца для заполнения сетки
    const totalDays = days.length;
    const remainingDays = 42 - totalDays; // 6 рядов по 7 дней
    
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthName = format(currentMonth, 'LLLL yyyy');
  
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const handleDateSelect = (date: Date) => {
    onSelect(date);
    setIsOpen(false);
  };
  
  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) {
      return true;
    }
    if (maxDate && isAfter(date, maxDate)) {
      return true;
    }
    return false;
  };
  
  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selected ? (
          format(selected, 'dd.MM.yyyy')
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white rounded-md shadow-lg border">
          <div className="p-3">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium capitalize">{monthName}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map(({ date, isCurrentMonth }, index) => {
                const isSelected = selected && date.toDateString() === selected.toDateString();
                const isDisabled = isDateDisabled(date);
                
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 w-9 p-0 font-normal",
                      !isCurrentMonth && "text-gray-400",
                      isSelected && "bg-primary text-white hover:bg-primary hover:text-white",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    disabled={isDisabled}
                  >
                    {date.getDate()}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="p-3 border-t flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (selected) {
                  onSelect(selected);
                }
                setIsOpen(false);
              }}
            >
              Готово
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDatePicker;