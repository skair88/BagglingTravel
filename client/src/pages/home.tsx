import React, { useState } from 'react';
import { navigate } from 'wouter/use-browser-location';
import { Trip } from '@shared/schema';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import TripCard from '@/components/trips/trip-card';
import EmptyState from '@/components/trips/empty-state';
import { useTrips } from '@/hooks/use-trips';
import { localStorageService } from '@/lib/localStorageService';

export default function Home() {
  const { trips, isLoading, getDaysUntilDeparture } = useTrips();
  
  // Get upcoming and past trips
  const upcomingTrips = trips.filter(trip => new Date(trip.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
  const pastTrips = trips.filter(trip => new Date(trip.endDate) < new Date())
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  
  const loading = isLoading;
  const [showPastTrips, setShowPastTrips] = useState(false);
  
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
  
  // Create a demo trip if needed for testing
  const createDemoTrip = () => {
    localStorageService.generateDemoTrip();
    window.location.reload(); // Refresh to show the new trip
  };
  
  // Main content based on trip data
  const renderContent = () => {
    // Loading state
    if (loading) {
      return <div className="p-4 text-center">Loading trips...</div>;
    }
    
    // Empty state - no trips
    if (upcomingTrips.length === 0 && pastTrips.length === 0) {
      return (
        <EmptyState onAddClick={handleAddTrip} />
      );
    }
    
    // Trips available
    return (
      <div className="flex flex-col flex-1 p-4">
        {/* Upcoming trips */}
        {upcomingTrips.length > 0 ? (
          <div className="space-y-4 mb-6">
            {upcomingTrips.map((trip: Trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                progress={trip.progress || 0}
                daysUntilDeparture={getDaysUntilDeparture(trip.startDate)}
                weather={localStorageService.getWeatherByTripId(trip.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAddClick={handleAddTrip} />
        )}
        
        {/* Past trips section (toggleable) */}
        {pastTrips.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-700">Past Trips</h2>
              <Button 
                variant="ghost" 
                className="text-sm text-gray-500"
                onClick={() => setShowPastTrips(!showPastTrips)}
              >
                {showPastTrips ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showPastTrips && (
              <div className="space-y-4">
                {pastTrips.map((trip: Trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    progress={trip.progress || 0}
                    isPast={true}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Baggle" />
      
      <main className="flex-1 flex flex-col mb-14">
        {renderContent()}
      </main>
      
      {/* Add trip button */}
      {upcomingTrips.length > 0 || pastTrips.length > 0 ? (
        <div className="px-4 pb-20">
          <Button 
            onClick={handleAddTrip}
            className="w-full py-6"
            variant="outline"
          >
            Add one more trip
          </Button>
        </div>
      ) : null}
      
      <BottomNav />
    </div>
  );
}