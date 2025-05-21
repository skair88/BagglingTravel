import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from '@/lib/utils';

// Иконки для активностей
const ActivityIcons = {
  swimming: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20L17.5 6L10.5 2L7.5 5.5L11 10L5 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  sightseeing: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  business: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6H21M9 12H21M9 18H21M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="16" width="2" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="10" width="2" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="4" width="2" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  addMore: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <div className="pt-2 pb-4">
        <h1 className="text-xl font-medium text-center">Activities</h1>
      </div>
      
      {/* Сетка активностей */}
      <div className="px-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allActivities.map(activity => (
          <button
            key={activity.id}
            className={cn(
              "aspect-square flex flex-col items-center justify-center rounded-lg border p-3 transition-colors",
              selectedActivities.includes(activity.id)
                ? "bg-orange-400 text-white border-orange-500"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            )}
            onClick={() => toggleActivity(activity.id)}
          >
            <div className="mb-2">
              {activity.icon}
            </div>
            <span className="text-sm font-medium">{activity.name}</span>
          </button>
        ))}
        
        {/* Кнопка "Добавить ещё" */}
        <button
          className="aspect-square flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 p-3"
          onClick={() => setShowAddCustom(true)}
        >
          <div className="mb-2">
            {ActivityIcons.addMore}
          </div>
          <span className="text-sm font-medium">Add more</span>
        </button>
      </div>
      
      {/* Форма добавления новой активности */}
      {showAddCustom && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg mx-4">
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
      
      {/* Кнопки действий */}
      <div className="mt-auto px-4 space-y-3 py-4">
        <Button
          variant="outline"
          className="w-full py-3"
          onClick={handleCreateOwnList}
        >
          Create your own list
        </Button>
        
        <Button
          className="w-full py-3"
          onClick={handleGenerateList}
        >
          Generate list
        </Button>
      </div>
      
      {/* Нижняя навигация */}
      <div className="flex border-t">
        <div className="flex-1 p-4 flex items-center justify-center bg-orange-400 text-white">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSelector;