import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface ActivityOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface ActivitySelectorProps {
  options: ActivityOption[];
  selectedActivities: string[];
  onChange: (selectedIds: string[]) => void;
}

const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  options,
  selectedActivities,
  onChange,
}) => {
  const toggleActivity = (id: string) => {
    if (selectedActivities.includes(id)) {
      onChange(selectedActivities.filter(activityId => activityId !== id));
    } else {
      onChange([...selectedActivities, id]);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-3">Activities</h2>
      <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
        {options.map((option) => {
          const isSelected = selectedActivities.includes(option.id);
          
          return (
            <div 
              key={option.id}
              onClick={() => toggleActivity(option.id)}
              className={`
                relative flex flex-col items-center justify-center p-3 
                border rounded-md min-w-[100px] cursor-pointer transition-colors
                ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 text-primary">
                  <CheckCircle size={16} />
                </div>
              )}
              
              <div className="mb-2 text-gray-600">
                {option.icon}
              </div>
              <span className="text-sm text-center">
                {option.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivitySelector;