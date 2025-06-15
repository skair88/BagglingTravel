
import React, { useState } from 'react';
import { Plus } from "lucide-react";
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import ProgressBar from '@/components/trips/progress-bar';
import BottomNav from '@/components/layout/bottom-nav';
import { TripButton } from '@/components/ui/trip-button';
import { Button } from "@/components/ui/button";

// Иконки для активностей
const ActivityIcons = {
  swimming: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 13C2.55228 13 3 12.5523 3 12C3 11.4477 2.55228 11 2 11C1.44772 11 1 11.4477 1 12C1 12.5523 1.44772 13 2 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 17.5C21.4388 17.8465 21.9559 18.0405 22.4901 18.0405C23.0243 18.0405 23.5414 17.8465 23.9802 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17.5C16.4388 17.8465 16.9559 18.0405 17.4901 18.0405C18.0243 18.0405 18.5414 17.8465 18.9802 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 17.5C11.4388 17.8465 11.9559 18.0405 12.4901 18.0405C13.0243 18.0405 13.5414 17.8465 13.9802 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 17.5C6.43885 17.8465 6.95589 18.0405 7.49012 18.0405C8.02435 18.0405 8.54139 17.8465 8.98024 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 17.5C1.43885 17.8465 1.95589 18.0405 2.49012 18.0405C3.02435 18.0405 3.54139 17.8465 3.98024 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 8C6.10457 8 7 7.10457 7 6C7 4.89543 6.10457 4 5 4C3.89543 4 3 4.89543 3 6C3 7.10457 3.89543 8 5 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.37908 8.50012L5.61908 9.00012C4.38908 9.20012 4.38908 10.0001 4.38908 10.0001C4.38908 10.0001 8.38908 11.0001 9.38908 11.0001C10.3891 11.0001 12.3891 10.5001 14.3891 10.0001C16.3891 9.50012 16.3891 8.00012 14.3891 7.50012C12.3891 7.00012 9.38908 8.50012 9.37908 8.50012Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 13L9.37872 14.0001C8.14872 14.2001 7.38872 13.5001 7.38872 13.5001C7.38872 13.5001 10.3887 14.0001 12.3887 14.0001C14.3887 14.0001 15.0087 13.0001 16.0087 13.0001H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  hiking: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20L17.5 6L10.5 2L7.5 5.5L11 10L5 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  sightseeing: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  business: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6H21M9 12H21M9 18H21M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="16" width="2" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="10" width="2" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="4" width="2" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  addMore: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// Типы активностей, доступных в приложении
type ActivityType = 'swimming' | 'hiking' | 'sightseeing' | 'business' | string;

// Интерфейсы
interface Activity {
  id: ActivityType;
  name: string;
  icon: React.ReactNode;
  isCustom?: boolean;
}

interface ActivitiesSelectorProps {
  onBack: () => void;
  onSaveActivities: (activities: ActivityType[]) => void;
  initialActivities?: ActivityType[];
}

// Компонент выбора активностей
const ActivitiesSelector: React.FC<ActivitiesSelectorProps> = ({
  onBack,
  onSaveActivities,
  initialActivities = []
}) => {
  // Доступные активности
  const defaultActivities: Activity[] = [
    { id: 'swimming', name: 'Swimming', icon: ActivityIcons.swimming },
    { id: 'hiking', name: 'Hiking', icon: ActivityIcons.hiking },
    { id: 'sightseeing', name: 'Sightseeing', icon: ActivityIcons.sightseeing },
    { id: 'business', name: 'Business', icon: ActivityIcons.business },
  ];
  
  // Состояние выбранных активностей
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>(initialActivities);
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  
  // Все активности (стандартные + пользовательские)
  const allActivities = [...defaultActivities, ...customActivities];
  
  // Обработчик выбора активности
  const toggleActivity = (activityId: ActivityType) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };
  
  // Добавление пользовательской активности
  const addCustomActivity = () => {
    if (newActivityName.trim()) {
      const id = `custom-${Date.now()}`;
      const newActivity: Activity = {
        id,
        name: newActivityName.trim(),
        icon: ActivityIcons.addMore,
        isCustom: true
      };
      
      setCustomActivities(prev => [...prev, newActivity]);
      setSelectedActivities(prev => [...prev, id]);
      setNewActivityName('');
      setShowAddCustom(false);
    }
  };
  
  // Создание собственного списка
  const handleCreateOwnList = () => {
    onSaveActivities(selectedActivities);
  };
  
  // Генерация списка
  const handleGenerateList = () => {
    // Сохраняем выбранные активности и переходим к списку вещей
    onSaveActivities(selectedActivities);
    
    // После создания путешествия нас перенаправят на главную страницу
    // Оттуда мы сможем открыть список вещей для конкретной поездки
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="New Trip" 
        showBackButton 
        onBackClick={onBack}
      />
      
      {/* Progress Bar */}
      <div className="px-4 mt-4">
        <ProgressBar currentStep={3} totalSteps={3} />
      </div>
      
      {/* Content */}
      <div className="flex-1 px-4 mt-6 mb-20">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-center">Activities</h1>
          <p className="text-gray-600 text-center mt-2">Select activities you plan to do</p>
        </div>
        
        {/* Сетка активностей */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {allActivities.map(activity => (
            <button
              key={activity.id}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg border p-2 transition-colors",
                selectedActivities.includes(activity.id)
                  ? "bg-orange-400 text-white border-orange-500"
                  : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
              )}
              onClick={() => toggleActivity(activity.id)}
            >
              <div className="mb-1">
                {activity.icon}
              </div>
              <span className="text-xs font-medium text-center leading-tight">{activity.name}</span>
            </button>
          ))}
          
          {/* Кнопка "Добавить ещё" */}
          <button
            className="aspect-square flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 p-2"
            onClick={() => setShowAddCustom(true)}
          >
            <div className="mb-1">
              {ActivityIcons.addMore}
            </div>
            <span className="text-xs font-medium text-center leading-tight">Add more</span>
          </button>
        </div>
        
        {/* Форма добавления новой активности */}
        {showAddCustom && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Add custom activity</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="Activity name"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addCustomActivity}
                disabled={!newActivityName.trim()}
              >
                <Plus className="mr-1" size={16} />
                Add
              </Button>
            </div>
            <button
              className="text-xs text-gray-500 mt-2"
              onClick={() => setShowAddCustom(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-4 bg-gray-50 border-t border-gray-200">
        <div className="space-y-3">
          <TripButton
            variant="default"
            onClick={handleCreateOwnList}
          >
            Create your own list
          </TripButton>
          
          <TripButton
            variant="pressed"
            onClick={handleGenerateList}
          >
            Generate list
          </TripButton>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ActivitiesSelector;
