import React, { useState } from 'react';
import { navigate } from 'wouter/use-browser-location';
import { TripCreationData } from '@shared/schema';
import { useTrips } from '@/hooks/use-trips';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export default function TripCreator() {
  const { createTrip } = useTrips();
  
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 7)) // Default to +7 days
  );
  const [purpose, setPurpose] = useState('Vacation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (startDate > endDate) {
      setError('Start date cannot be after end date');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const tripData: TripCreationData = {
        destination,
        location: { lat: 0, lng: 0 }, // Would normally get real coordinates
        startDate,
        endDate,
        purpose,
        activities: []
      };
      
      const newTrip = await createTrip(tripData);
      navigate('/');
    } catch (err) {
      console.error('Failed to create trip:', err);
      setError('Failed to create trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Create New Trip" showBackButton />
      
      <main className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input 
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. London, Paris, New York"
              required
            />
          </div>
          
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  id="start-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  id="end-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <select
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300"
            >
              <option value="Vacation">Vacation</option>
              <option value="Business">Business</option>
              <option value="Family Visit">Family Visit</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
          </Button>
        </form>
      </main>
      
      <BottomNav />
    </div>
  );
}