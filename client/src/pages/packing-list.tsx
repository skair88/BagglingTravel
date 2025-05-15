import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Header from '@/components/layout/header';
import PackingList from '@/components/packing/packing-list';
import { useItems } from '@/hooks/use-items';
import { localStorageService } from '@/lib/localStorageService';

export default function PackingListPage() {
  const params = useParams<{ id: string }>();
  const tripId = parseInt(params.id, 10);
  
  const {
    items,
    categories,
    loading,
    error,
    progress,
    toggleItem,
    updateQuantity,
    addItem,
    removeItem
  } = useItems(tripId);
  
  // Get trip data
  const [trip, setTrip] = useState<{destination: string} | null>(null);
  
  useEffect(() => {
    if (!isNaN(tripId)) {
      const tripData = localStorageService.getTrips().find(t => t.id === tripId);
      setTrip(tripData ? {destination: tripData.destination} : {destination: 'Packing List'});
    }
  }, [tripId]);
  
  // New item dialog state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<number>(0);
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  
  // Handler functions
  const handleToggleItem = toggleItem;
  const handleUpdateQuantity = updateQuantity;
  const handleRemoveItem = removeItem;
  
  // Handle adding a new custom item
  const handleAddItem = (categoryId: number) => {
    setNewItemCategory(categoryId);
    setIsAddItemOpen(true);
  };
  
  // Save a new custom item
  const saveNewItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem = {
      tripId,
      name: newItemName.trim(),
      categoryId: newItemCategory,
      isPacked: false,
      quantity: newItemQuantity,
      isCustom: true
    };
    
    addItem(newItem);
    
    // Reset form
    setNewItemName('');
    setNewItemQuantity(1);
    setIsAddItemOpen(false);
  };
  
  // Calculate packing progress count for display
  const packedCount = items.filter(item => item.isPacked).length;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header title="Packing List" showBackButton onBackClick={() => navigate('/')} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading packing list...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header title="Packing List" showBackButton onBackClick={() => navigate('/')} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        title={trip?.destination || 'Packing List'} 
        showBackButton 
        onBackClick={() => navigate('/')}
      />
      
      <div className="p-4 flex-1">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Packing Progress</h2>
            <div className="text-sm font-medium">{packedCount} / {items.length}</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <PackingList
          items={items}
          categories={categories}
          tripId={tripId}
          onToggleItem={handleToggleItem}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
        />
        
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => setIsAddItemOpen(true)}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Custom Item
          </Button>
        </div>
      </div>
      
      {/* Add Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom Item</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Item Name
              </label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Sunglasses, Passport, etc."
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                className="w-full p-2 border rounded"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(parseInt(e.target.value, 10))}
              >
                <option value="0" disabled>Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="99"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveNewItem}
              disabled={!newItemName.trim() || newItemCategory === 0}
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}