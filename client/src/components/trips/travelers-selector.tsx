import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import ProgressBar from '@/components/trips/progress-bar';
import BottomNav from '@/components/layout/bottom-nav';
import MobileNumberPicker from '@/components/ui/mobile-number-picker';

interface TravelerType {
  id: string;
  type: 'adult' | 'kid';
  subtype: string;
  label: string;
  description?: string;
  count: number;
}

interface TravelersSelectorProps {
  onBack: () => void;
  onNext: () => void;
  onSaveTravelers: (travelers: TravelerType[]) => void;
  initialTravelers?: TravelerType[];
}

const defaultTravelers: TravelerType[] = [
  // Взрослые
  { id: 'men', type: 'adult', subtype: 'men', label: 'Men', count: 0 },
  { id: 'women', type: 'adult', subtype: 'women', label: 'Women', count: 0 },
  
  // Дети
  { id: 'baby', type: 'kid', subtype: 'baby', label: 'Baby', description: 'during pregnancy, at birth and up to 1 year', count: 0 },
  { id: 'toddler', type: 'kid', subtype: 'toddler', label: 'Toddler', description: '1 to 3 years', count: 0 },
  { id: 'child', type: 'kid', subtype: 'child', label: 'Child', description: '4 to 12 years', count: 0 },
  { id: 'teenager', type: 'kid', subtype: 'teenager', label: 'Teenager', description: '13 to 18 years', count: 0 },
];

const TravelersSelector: React.FC<TravelersSelectorProps> = ({
  onBack,
  onNext,
  onSaveTravelers,
  initialTravelers,
}) => {
  const [travelers, setTravelers] = useState<TravelerType[]>(
    initialTravelers || defaultTravelers
  );
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Обновление количества путешественников определенного типа
  const updateTravelerCount = (id: string, change: number) => {
    setTravelers(prev => prev.map(traveler => {
      if (traveler.id === id) {
        const newCount = Math.max(0, traveler.count + change);
        return { ...traveler, count: newCount };
      }
      return traveler;
    }));
  };

  // Прямое обновление количества (для picker)
  const setTravelerCount = (id: string, count: number) => {
    setTravelers(prev => prev.map(traveler => {
      if (traveler.id === id) {
        return { ...traveler, count: Math.max(0, count) };
      }
      return traveler;
    }));
  };

  // Обработчик чекбокса - включает/выключает категорию
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setTravelers(prev => prev.map(traveler => {
      if (traveler.id === id) {
        return { ...traveler, count: checked ? 1 : 0 };
      }
      return traveler;
    }));
  };

  // Обработчик клика по количеству
  const handleCountClick = (id: string) => {
    if (isMobile) {
      setPickerOpen(id);
    }
  };

  // Обработчик изменения в picker
  const handlePickerChange = (id: string, value: number) => {
    setTravelerCount(id, value);
  };

  // Получение текущего путешественника для picker
  const getCurrentTraveler = () => {
    return travelers.find(t => t.id === pickerOpen);
  };

  // Проверка, выбран ли хотя бы один путешественник
  const hasTravelers = travelers.some(traveler => traveler.count > 0);
  
  // Обработчик для кнопки "Далее"
  const handleNext = () => {
    if (hasTravelers) {
      onSaveTravelers(travelers);
      onNext();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Хэдер */}
      <Header 
        title="New Trip" 
        showBackButton 
        onBackClick={onBack}
      />

      {/* Прогрессбар */}
      <div className="px-6 py-4">
        <div className="flex space-x-2">
          <div className="flex-1 h-2 bg-amber-500 rounded-full"></div>
          <div className="flex-1 h-2 bg-amber-500 rounded-full"></div>
          <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Заголовок */}
      <div className="px-6 pb-4">
        <h1 className="text-center text-lg font-medium">Travelers</h1>
      </div>

      <div className="flex-1 overflow-auto px-6">
        {/* Секция взрослых */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 mr-2">
              <span className="text-gray-700 text-sm">👤</span>
            </div>
            <span className="text-lg font-medium">Adult</span>
          </div>

          {travelers
            .filter(t => t.type === 'adult')
            .map(traveler => (
              <div key={traveler.id} className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div
                    onClick={() => handleCheckboxChange(traveler.id, traveler.count === 0)}
                    className={cn(
                      "w-5 h-5 mr-3 rounded border-2 cursor-pointer transition-colors",
                      traveler.count > 0 
                        ? "bg-amber-500 border-amber-500" 
                        : "bg-white border-gray-300"
                    )}
                  /></div>
                  <span className="text-base">{traveler.label}</span>
                </div>
                {isMobile ? (
                  <div 
                    className="px-4 py-2 bg-gray-100 rounded-lg cursor-pointer min-w-12 text-center"
                    onClick={() => handleCountClick(traveler.id)}
                  >
                    <span className="text-base font-medium">{traveler.count}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateTravelerCount(traveler.id, 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                    >
                      <Plus size={18} />
                    </button>
                    <span className="w-5 text-center">{traveler.count}</span>
                    <button 
                      onClick={() => updateTravelerCount(traveler.id, -1)}
                      disabled={traveler.count === 0}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        traveler.count > 0 
                          ? "text-gray-700 hover:bg-gray-100" 
                          : "text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <Minus size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Секция детей */}
        <div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 mr-2">
              <span className="text-gray-700 text-sm">👶</span>
            </div>
            <span className="text-lg font-medium">Kids</span>
          </div>

          {travelers
            .filter(t => t.type === 'kid')
            .map(traveler => (
              <div key={traveler.id} className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div
                      onClick={() => handleCheckboxChange(traveler.id, traveler.count === 0)}
                      className={cn(
                        "w-5 h-5 mr-3 rounded border-2 cursor-pointer transition-colors",
                        traveler.count > 0 
                          ? "bg-amber-500 border-amber-500" 
                          : "bg-white border-gray-300"
                      )}
                    /></div>
                    <span className="text-base">{traveler.label}</span>
                  </div>
                  {traveler.description && (
                    <p className="text-xs text-gray-500 ml-8 mt-1">{traveler.description}</p>
                  )}
                </div>
                {isMobile ? (
                  <div 
                    className="px-4 py-2 bg-gray-100 rounded-lg cursor-pointer min-w-12 text-center"
                    onClick={() => handleCountClick(traveler.id)}
                  >
                    <span className="text-base font-medium">{traveler.count}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {traveler.count > 0 ? (
                      <>
                        <button 
                          onClick={() => updateTravelerCount(traveler.id, 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                        >
                          <Plus size={18} />
                        </button>
                        <span className="w-5 text-center">{traveler.count}</span>
                        <button 
                          onClick={() => updateTravelerCount(traveler.id, -1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                        >
                          <Minus size={18} />
                        </button>
                      </>
                    ) : (
                      <span className="w-5 text-center">0</span>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Кнопка "Далее" */}
      <div className="fixed bottom-16 left-0 right-0 px-6 py-2 bg-gray-50 pb-4">
        <Button
          onClick={handleNext}
          className="w-full py-2 text-base"
          variant="outline"
          disabled={!hasTravelers}
        >
          Next
        </Button>
        {!hasTravelers && (
          <p className="text-center text-sm text-red-500 mt-2">
            Please select at least one traveler
          </p>
        )}
      </div>

      {/* Нижняя навигация */}
      <BottomNav />

      {/* Mobile Number Picker */}
      {pickerOpen && getCurrentTraveler() && (
        <MobileNumberPicker
          value={getCurrentTraveler()!.count}
          min={0}
          max={10}
          onChange={(value) => handlePickerChange(pickerOpen, value)}
          isOpen={!!pickerOpen}
          onClose={() => setPickerOpen(null)}
          title={`Select ${getCurrentTraveler()!.label} count`}
        />
      )}
    </div>
  );
};

export default TravelersSelector;