import React from 'react';
import { navigate } from 'wouter/use-browser-location';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  rightAction
}) => {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="w-full p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {showBackButton && (
            <button 
              onClick={handleBackClick}
              className="text-gray-600 hover:text-gray-900 p-1"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex-1 flex justify-end">
          {rightAction && rightAction}
        </div>
      </div>
    </header>
  );
};

export default Header;