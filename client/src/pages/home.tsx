import React, { useState } from 'react';
import { navigate } from 'wouter/use-browser-location';
import { Trip } from '@shared/schema';
import { TripButton } from '@/components/ui/trip-button';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import TripCard from '@/components/trips/trip-card';
import EmptyState from '@/components/trips/empty-state';
import { useTrips } from '@/hooks/use-trips';
import { localStorageService } from '@/lib/localStorageService';

export default function Home() {
  const { trips, isLoading, getDaysUntilDeparture } = useTrips();
  
  // Sort trips by their start date regardless of whether they are upcoming or past
  const sortedTrips = trips.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const loading = isLoading;
  
  const handleAddTrip = () => {
    navigate('/trip/new');
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  
  // Main content based on trip data
  const renderContent = () => {
    // Loading state
    if (loading) {
      return <div className="p-4 text-center">Loading trips...</div>;
    }
    
    // Empty state - no trips
    if (sortedTrips.length === 0) {
      return (
        <EmptyState onAddClick={handleAddTrip} />
      );
    }
    
    // Trips available
    return (
      <div className="flex flex-col flex-1 p-4 overflow-y-auto">
        {/* Sorted trips */}
        <div className="space-y-4 mb-6">
          {sortedTrips.map((trip: Trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              progress={trip.progress || 0}
              daysUntilDeparture={getDaysUntilDeparture(trip.startDate)}
              weather={localStorageService.getWeatherByTripId(trip.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  // Always available Add Trip Button
  const renderAddTripButton = () => (
    <div className="px-6 pb-6 flex-grow items-end flex">
      <TripButton 
        onClick={handleAddTrip}
        className="w-full py-2 text-base"
      >
        Add one more trip
      </TripButton>
    </div>
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Baggle" />
      
      <main className="flex-1 flex flex-col mb-14">
        {renderContent()}
        {renderAddTripButton()}
      </main>

      
      <BottomNav />
    </div>
  );
}