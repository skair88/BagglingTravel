import React from 'react';
import { useLocation, Link } from 'wouter';
import { MdHome, MdSettings } from 'react-icons/md';
import { cn } from '@/lib/utils';

const BottomNav: React.FC = () => {
  const [location] = useLocation();

  // Check if we're at home page or on trip creation page (which should highlight home)
  const isHomePage = location === '/' || location.startsWith('/trip/');

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-50">
      <div className="grid grid-cols-2 h-14">
        <Link href="/">
          <div className={cn(
            "flex flex-col items-center justify-center w-1/2 h-full mx-auto cursor-pointer rounded-xl",
            isHomePage ? "bg-amber-500 text-white" : "text-gray-600"
          )}>
            <MdHome size={42} />
          </div>
        </Link>
        
        <Link href="/settings">
          <div className={cn(
            "flex flex-col items-center justify-center w-1/2 h-full mx-auto cursor-pointer rounded-xl",
            location === '/settings' ? "bg-amber-500 text-white" : "text-gray-600"
          )}>
            <MdSettings size={42} />
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;