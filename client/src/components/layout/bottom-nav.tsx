import React from 'react';
import { useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';

const BottomNav: React.FC = () => {
  const [location] = useLocation();
  
  // Determine active route
  const isHome = location === '/';
  const isSettings = location === '/settings';
  
  return (
    <div className="bottom-nav flex items-center justify-between bg-white border-t border-border py-2 px-5 mt-auto">
      <button 
        className={`flex flex-col items-center px-5 py-2 ${isHome ? 'text-primary' : 'text-text-secondary'}`}
        onClick={() => navigate('/')}
      >
        <span className="material-icons">luggage</span>
        <span className="text-xs mt-1">Trips</span>
      </button>
      
      <button 
        className={`flex flex-col items-center px-5 py-2 ${isSettings ? 'text-primary' : 'text-text-secondary'}`}
        onClick={() => navigate('/settings')}
      >
        <span className="material-icons">settings</span>
        <span className="text-xs mt-1">Settings</span>
      </button>
    </div>
  );
};

export default BottomNav;
