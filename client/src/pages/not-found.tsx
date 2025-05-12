import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from 'wouter/use-browser-location';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
      <p className="text-gray-500 mt-2 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/')}>
        Return to Home
      </Button>
    </div>
  );
}