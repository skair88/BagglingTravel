import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { Button } from '@/components/ui/button';
import TripCard from '@/components/trips/trip-card';
import BottomNav from '@/components/layout/bottom-nav';
import Header from '@/components/layout/header';
import { useTrips } from '@/hooks/use-trips';
import { useItems } from '@/hooks/use-items';
import { Item } from '@shared/schema';

const Home: React.FC = () => {
  const [location] = useLocation();
  const { 
    upcomingTrips, 
    pastTrips, 
    isLoading, 
    getWeatherForTrip,
    getTripProgress,
    getDaysUntilDeparture
  } = useTrips();
  
  // Create a new trip
  const handleCreateTrip = () => {
    navigate('/trip-creator/step/1');
  };
  
  // If there are no trips, but loading is complete, show empty state
  const showEmptyState = !isLoading && upcomingTrips.length === 0 && pastTrips.length === 0;
  
  return (
    <>
      <Header title="My Trips" />
      
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary">Loading trips...</p>
          </div>
        ) : showEmptyState ? (
          <div className="flex flex-col items-center justify-center h-full px-5 text-center">
            <span className="material-icons text-5xl text-text-secondary mb-4">luggage</span>
            <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
            <p className="text-text-secondary mb-6">Start planning your next adventure!</p>
            <Button onClick={handleCreateTrip}>Create Trip</Button>
          </div>
        ) : (
          <>
            {/* Upcoming Trip Section */}
            <section className="px-5 pt-6 pb-3">
              <h2 className="text-lg font-medium mb-3">
                {upcomingTrips.length === 0 ? 'No Upcoming Trips' : 'Upcoming Trip'}
              </h2>
              
              {upcomingTrips.slice(0, 1).map(trip => {
                // Get weather data for the trip
                const { data: weather } = getWeatherForTrip(trip.id);
                
                // Calculate progress
                const { data: items = [] } = useItems().getItemsByTripId(trip.id);
                const progress = getTripProgress(trip.id, items as Item[]);
                
                // Calculate days until departure
                const daysUntil = getDaysUntilDeparture(trip.startDate);
                
                return (
                  <TripCard 
                    key={trip.id}
                    trip={trip}
                    weather={weather}
                    progress={progress}
                    daysUntilDeparture={daysUntil}
                  />
                );
              })}
              
              {upcomingTrips.length > 1 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2 text-text-secondary">
                    Other Upcoming Trips
                  </h3>
                  
                  {upcomingTrips.slice(1).map(trip => {
                    // Calculate progress
                    const { data: items = [] } = useItems().getItemsByTripId(trip.id);
                    const progress = getTripProgress(trip.id, items as Item[]);
                    
                    // Calculate days until departure
                    const daysUntil = getDaysUntilDeparture(trip.startDate);
                    
                    return (
                      <TripCard 
                        key={trip.id}
                        trip={trip}
                        progress={progress}
                        daysUntilDeparture={daysUntil}
                      />
                    );
                  })}
                </div>
              )}
            </section>
            
            {/* Past Trips Section */}
            {pastTrips.length > 0 && (
              <section className="px-5 py-3">
                <h2 className="text-lg font-medium mb-3">Past Trips</h2>
                
                {pastTrips.map(trip => (
                  <TripCard 
                    key={trip.id}
                    trip={trip}
                    progress={100}
                    isPast={true}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
      
      {/* Add Trip Button */}
      <Button 
        className="fixed bottom-24 right-5 h-14 w-14 rounded-full shadow-lg flex items-center justify-center p-0"
        onClick={handleCreateTrip}
      >
        <span className="material-icons">add</span>
      </Button>
      
      <BottomNav />
    </>
  );
};

export default Home;
