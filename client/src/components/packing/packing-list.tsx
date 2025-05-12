import React, { useState } from 'react';
import { Item, Category } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import ItemCategory from './item-category';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

interface PackingListProps {
  items: Item[];
  categories: Category[];
  tripId: number;
}

const PackingList: React.FC<PackingListProps> = ({ items, categories, tripId }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', categoryId: '', quantity: 1 });
  const queryClient = useQueryClient();
  
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const categoryId = item.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(item);
    return acc;
  }, {} as Record<number, Item[]>);
  
  // Toggle item packed status
  const toggleItemPacked = async (item: Item) => {
    try {
      await apiRequest('PATCH', `/api/items/${item.id}`, {
        isPacked: !item.isPacked
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/items`] });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };
  
  // Handle adding new custom item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.categoryId) return;
    
    try {
      await apiRequest('POST', '/api/items', {
        tripId,
        name: newItem.name,
        categoryId: parseInt(newItem.categoryId),
        quantity: newItem.quantity,
        isPacked: false,
        isCustom: true
      });
      
      // Reset form and close dialog
      setNewItem({ name: '', categoryId: '', quantity: 1 });
      setIsAddDialogOpen(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/items`] });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };
  
  return (
    <div className="flex flex-col flex-1">
      {/* Categories Tabs */}
      <div className="border-b border-border">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="flex overflow-x-auto px-1">
            <TabsTrigger value="all" className="py-3 px-4 text-sm font-medium">
              All Items
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id.toString()}
                className="py-3 px-4 text-sm font-medium"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="px-5 py-4">
            {categories.map(category => (
              <ItemCategory 
                key={category.id}
                category={category}
                items={groupedItems[category.id] || []}
                onToggleItem={toggleItemPacked}
              />
            ))}
          </TabsContent>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="px-5 py-4">
              <ItemCategory 
                category={category}
                items={groupedItems[category.id] || []}
                onToggleItem={toggleItemPacked}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Add Item Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center justify-center text-primary py-3 rounded-lg font-medium w-full border border-primary border-dashed mt-4 mx-5 mb-5">
            <span className="material-icons mr-1">add</span>
            Add Custom Item
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input 
                id="item-name" 
                placeholder="Enter item name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select 
                value={newItem.categoryId}
                onValueChange={(value) => setNewItem(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger id="item-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-quantity">Quantity</Label>
              <Input 
                id="item-quantity" 
                type="number"
                min={1}
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              />
            </div>
            <Button className="w-full" onClick={handleAddItem}>
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackingList;
