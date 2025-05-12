import React from 'react';
import { useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import TripWizard from '@/components/trips/trip-wizard';
import { useTrips } from '@/hooks/use-trips';
import { Trip } from '@shared/schema';

const TripCreator: React.FC = () => {
  const [location] = useLocation();
  const { createTrip, generatePackingList } = useTrips();
  
  // Handle wizard completion
  const handleWizardComplete = async (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
    try {
      // Create the trip
      const newTrip = await createTrip(tripData, {
        onSuccess: (createdTrip: Trip) => {
          // Generate packing list based on trip details
          generatePackingList(createdTrip.id, {
            onSuccess: () => {
              // Navigate to the packing list
              navigate(`/trip/${createdTrip.id}`);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <TripWizard onComplete={handleWizardComplete} />
    </div>
  );
};

export default TripCreator;
