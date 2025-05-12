import React from 'react';
import { navigate } from 'wouter/use-browser-location';
import { useLocation } from 'wouter';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';

export default function PackingList() {
  const [location] = useLocation();
  const tripId = parseInt(location.split('/').pop() || '0', 10);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Packing List" showBackButton />
      
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Under Construction</h2>
          <p className="text-gray-500 mb-4">
            This page is currently under development.
          </p>
          <Button onClick={() => navigate('/')}>
            Go Back Home
          </Button>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}