import React from 'react';
import { navigate } from 'wouter/use-browser-location';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddClick }) => {
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      navigate('/trip/new');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-[60vh]">
      {/* Sad luggage icon as shown in mockup */}
      <div className="w-32 h-32 mb-6">
        <img 
          src="/static/images/sad-luggage.png" 
          alt="Sad luggage illustration" 
          className="w-full h-full object-contain"
        />
      </div>

      <h3 className="text-xl text-gray-500 font-medium mb-6">
        You don't have any trips planned yet...
      </h3>
      
    </div>
  );
};

export default EmptyState;