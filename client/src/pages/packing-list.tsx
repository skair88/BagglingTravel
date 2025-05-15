import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { Plus, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Header from '@/components/layout/header';
import PackingList from '@/components/packing/packing-list';
import { Item, Category } from '@/lib/localStorageService';
import { generatePackingList, getDefaultCategories } from '@/lib/packing-templates';
import { localStorageService } from '@/lib/localStorageService';

export default function PackingListPage() {
  const params = useParams<{ id: string }>();
  const tripId = parseInt(params.id, 10);
  
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New item dialog state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<number>(0);
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  
  // Load initial data
  useEffect(() => {
    if (isNaN(tripId)) {
      setError('Invalid trip ID');
      setLoading(false);
      return;
    }

    try {
      // Get trip details
      const tripData = localStorageService.getTrips().find(t => t.id === tripId);
      if (!tripData) {
        setError('Trip not found');
        setLoading(false);
        return;
      }
      setTrip(tripData);
      
      // Get categories
      let cats = localStorageService.getCategories();
      if (cats.length === 0) {
        // Initialize default categories if none exist
        cats = getDefaultCategories();
        cats.forEach(cat => localStorageService.addCategory(cat.name));
        cats = localStorageService.getCategories();
      }
      setCategories(cats);
      
      // Get items for this trip
      let tripItems = localStorageService.getItemsByTripId(tripId);
      
      // If no items exist, generate a packing list based on trip data
      if (tripItems.length === 0) {
        // Get temperature data from trip weather if available
        const tripWeather = localStorageService.getWeatherByTripId(tripId);
        const temperatures = tripWeather.map(w => w.temperature);
        
        const generatedItems = generatePackingList(
          tripId,
          tripData.purpose,
          tripData.activities,
          tripData.startDate,
          tripData.endDate,
          temperatures
        );
        
        // Save generated items
        generatedItems.forEach(item => {
          localStorageService.addItem(item);
        });
        
        // Get the saved items with proper IDs
        tripItems = localStorageService.getItemsByTripId(tripId);
      }
      
      setItems(tripItems);
    } catch (err) {
      console.error('Error loading packing list data:', err);
      setError('Failed to load packing list');
    } finally {
      setLoading(false);
    }
  }, [tripId]);
  
  // Handle toggling an item's packed state
  const handleToggleItem = (item: Item) => {
    const updatedItem = { ...item, isPacked: !item.isPacked };
    const result = localStorageService.updateItem(item.id, updatedItem);
    
    if (result) {
      setItems(items.map(i => i.id === item.id ? updatedItem : i));
      
      // Recalculate trip progress
      localStorageService.calculateTripProgress(tripId);
    }
  };
  
  // Handle updating an item's quantity
  const handleUpdateQuantity = (item: Item, newQuantity: number) => {
    const updatedItem = { ...item, quantity: newQuantity };
    const result = localStorageService.updateItem(item.id, updatedItem);
    
    if (result) {
      setItems(items.map(i => i.id === item.id ? updatedItem : i));
    }
  };
  
  // Handle removing an item
  const handleRemoveItem = (itemId: number) => {
    const result = localStorageService.deleteItem(itemId);
    
    if (result) {
      setItems(items.filter(i => i.id !== itemId));
      
      // Recalculate trip progress
      localStorageService.calculateTripProgress(tripId);
    }
  };
  
  // Handle adding a new custom item
  const handleAddItem = (categoryId: number) => {
    setNewItemCategory(categoryId);
    setIsAddItemOpen(true);
  };
  
  // Save a new custom item
  const saveNewItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: Omit<Item, 'id'> = {
      tripId,
      name: newItemName.trim(),
      categoryId: newItemCategory,
      isPacked: false,
      quantity: newItemQuantity,
      isCustom: true
    };
    
    const savedItem = localStorageService.addItem(newItem);
    
    if (savedItem) {
      setItems([...items, savedItem]);
      
      // Reset form
      setNewItemName('');
      setNewItemQuantity(1);
      setIsAddItemOpen(false);
    }
  };
  
  // Calculate packing progress
  const packedCount = items.filter(item => item.isPacked).length;
  const progress = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;
  
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