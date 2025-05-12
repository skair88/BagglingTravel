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
      <div className="w-32 h-32 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="w-full h-full text-gray-300"
        >
          <rect x="30" y="40" width="140" height="120" rx="10" fill="none" stroke="currentColor" strokeWidth="6" />
          <rect x="70" y="20" width="60" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="6" />
          <circle cx="70" cy="90" r="10" fill="currentColor" />
          <circle cx="130" cy="90" r="10" fill="currentColor" />
          <path d="M70 120 Q100 140, 130 120" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>

      <h3 className="text-xl text-gray-500 font-medium mb-4">
        You don't have any trips planned yet...
      </h3>
      
      <Button 
        onClick={handleAddClick}
        className="mt-4 w-full max-w-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Add one more trip
      </Button>
    </div>
  );
};

export default EmptyState;