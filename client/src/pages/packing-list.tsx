import React from 'react';
import { useParams, useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import PackingListComponent from '@/components/packing/packing-list';
import ProgressCircle from '@/components/packing/progress-circle';
import { useTrips } from '@/hooks/use-trips';
import { useItems } from '@/hooks/use-items';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const PackingList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [location] = useLocation();
  const tripId = parseInt(id);
  
  const { trips, getTripProgress, deleteTrip } = useTrips();
  const { getItemsByTripId, categories } = useItems();
  
  // Get trip details
  const trip = trips.find(t => t.id === tripId);
  
  // Get trip items
  const { data: items = [], isLoading: itemsLoading } = getItemsByTripId(tripId);
  
  // Calculate progress
  const progress = getTripProgress(tripId, items);
  
  // Format dates for display
  const formatDateRange = (startDate: Date, endDate: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(startDate)) + ' - ' + 
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(endDate));
  };
  
  // Handle delete trip
  const handleDeleteTrip = () => {
    if (confirm('Are you sure you want to delete this trip?')) {
      deleteTrip(tripId, {
        onSuccess: () => {
          navigate('/');
        }
      });
    }
  };
  
  if (!trip) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
          title="Trip Not Found" 
          showBackButton 
          onBackClick={() => navigate('/')}
        />
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center">
            <span className="material-icons text-5xl text-text-secondary mb-4">error_outline</span>
            <p className="text-lg font-medium mb-2">Trip not found</p>
            <p className="text-text-secondary mb-6">The trip you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/')}>Go Back Home</Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="Packing List" 
        showBackButton 
        onBackClick={() => navigate('/')}
        rightAction={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="material-icons">more_vert</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeleteTrip} className="text-red-500">
                <span className="material-icons mr-2 text-sm">delete</span>
                Delete Trip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      
      {/* Trip Summary */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{trip.destination}</h2>
            <p className="text-text-secondary text-sm">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          
          {/* Progress Circle */}
          <ProgressCircle progress={progress} size={48} label="Packed" />
        </div>
      </div>
      
      {/* Packing List */}
      {itemsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">Loading packing list...</p>
        </div>
      ) : (
        <PackingListComponent 
          items={items} 
          categories={categories} 
          tripId={tripId} 
        />
      )}
      
      <BottomNav />
    </div>
  );
};

export default PackingList;
