import React from 'react';
import { navigate } from 'wouter/use-browser-location';

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
    <header className="w-full p-4 bg-gray-100 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={handleBackClick}
              className="mr-2 text-gray-600 hover:text-gray-900"
              aria-label="Go back"
            >
              &larr;
            </button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        
        {rightAction && (
          <div className="flex items-center">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;