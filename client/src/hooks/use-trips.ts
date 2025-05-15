import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { localStorageService } from '@/lib/localStorageService';
import { TripCreationData, Trip } from '@/shared/schema';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch trips from localStorage
  useEffect(() => {
    try {
      const storedTrips = localStorageService.getTrips();
      setTrips(storedTrips);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load trips'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate days until departure for a trip
  const getDaysUntilDeparture = (startDate: Date) => {
    const today = new Date();
    return differenceInDays(new Date(startDate), today);
  };

  // Create a new trip
  const createTrip = async (tripData: TripCreationData) => {
    try {
      const newTrip = localStorageService.addTrip({
        ...tripData,
        progress: 0,
      });
      
      setTrips(prev => [...prev, newTrip]);
      return newTrip;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create trip'));
      throw err;
    }
  };

  // Update a trip
  const updateTrip = async (tripId: number, tripData: Partial<Trip>) => {
    try {
      const updatedTrip = localStorageService.updateTrip(tripId, tripData);
      if (updatedTrip) {
        setTrips(prev => prev.map(trip => 
          trip.id === tripId ? updatedTrip : trip
        ));
        return updatedTrip;
      }
      throw new Error('Trip not found');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update trip'));
      throw err;
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId: number) => {
    try {
      const success = localStorageService.deleteTrip(tripId);
      if (success) {
        setTrips(prev => prev.filter(trip => trip.id !== tripId));
        return true;
      }
      throw new Error('Trip not found');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete trip'));
      throw err;
    }
  };

  // Get upcoming trips
  const getUpcomingTrips = () => {
    return trips
      .filter(trip => new Date(trip.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  // Get past trips
  const getPastTrips = () => {
    return trips
      .filter(trip => new Date(trip.endDate) < new Date())
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  };

  // Get current trips
  const getCurrentTrips = () => {
    const today = new Date();
    return trips
      .filter(trip => 
        new Date(trip.startDate) <= today && new Date(trip.endDate) >= today
      )
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  };

  return {
    trips,
    isLoading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
    getUpcomingTrips,
    getPastTrips,
    getCurrentTrips,
    getDaysUntilDeparture
  };
}