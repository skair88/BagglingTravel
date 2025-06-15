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
    <header className="w-full p-4 bg-gray-50 border-b border-gray-500">
      <div className="flex items-center justify-between">
        <div className="w-10">
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
        
        <div className="w-30 flex justify-end">
          {/* Static .png image added here */}
          <img src="/static/images/title.png" alt="Static Icon" className="h-8 w-30" />
        </div>
      </div>
    </header>
  );
};

export default Header;