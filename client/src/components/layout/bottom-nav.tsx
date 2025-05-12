import React from 'react';
import { useLocation, Link } from 'wouter';
import { MdHome, MdSettings } from 'react-icons/md';
import { cn } from '@/lib/utils';

const BottomNav: React.FC = () => {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200">
      <div className="grid grid-cols-2 h-14">
        <Link href="/">
          <div className={cn(
            "flex flex-col items-center justify-center h-full cursor-pointer",
            location === '/' ? "bg-amber-500 text-white" : "text-gray-600"
          )}>
            <MdHome size={24} />
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>
        
        <Link href="/settings">
          <div className={cn(
            "flex flex-col items-center justify-center h-full cursor-pointer",
            location === '/settings' ? "bg-amber-500 text-white" : "text-gray-600"
          )}>
            <MdSettings size={24} />
            <span className="text-xs mt-1">Settings</span>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;