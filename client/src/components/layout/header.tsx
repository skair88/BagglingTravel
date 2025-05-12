import React from 'react';
import { Button } from '@/components/ui/button';

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
  return (
    <header className="px-5 py-4 border-b border-border flex items-center justify-between">
      {showBackButton ? (
        <Button variant="ghost" size="icon" onClick={onBackClick} className="text-text-primary">
          <span className="material-icons">arrow_back</span>
        </Button>
      ) : (
        <div className="w-8"></div> // Spacer for alignment
      )}
      
      <h1 className="text-xl font-semibold">{title}</h1>
      
      {rightAction ? rightAction : <div className="w-8"></div>}
    </header>
  );
};

export default Header;
