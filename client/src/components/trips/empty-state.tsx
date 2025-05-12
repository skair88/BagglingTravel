import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from 'wouter/use-browser-location';

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
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="w-full h-full text-gray-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Main luggage body */}
          <rect x="4" y="6" width="16" height="15" rx="2" />
          
          {/* Handle */}
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          
          {/* Eyes (sad) */}
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          
          {/* Sad mouth */}
          <path d="M9 16c.85.5 2.4 1 3 1 .6 0 2.15-.5 3-1" />
        </svg>
      </div>

      <h3 className="text-xl text-gray-500 font-medium mb-4">
        You don't have any trips planned yet...
      </h3>
      
      <Button 
        onClick={handleAddClick}
        className="mt-4 w-full max-w-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        variant="outline"
      >
        Add one more trip
      </Button>
    </div>
  );
};

export default EmptyState;