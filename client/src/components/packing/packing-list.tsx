import React, { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Item, Category } from '@/lib/localStorageService';
import { cn } from '@/lib/utils';

interface PackingListProps {
  items: Item[];
  categories: Category[];
  tripId: number;
  onToggleItem?: (item: Item) => void;
  onAddItem?: (categoryId: number) => void;
  onRemoveItem?: (itemId: number) => void;
  onUpdateQuantity?: (item: Item, newQuantity: number) => void;
}

const PackingList: React.FC<PackingListProps> = ({
  items,
  categories,
  tripId,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>(
    // Initialize all categories as expanded
    (categories || []).reduce((acc, category) => ({ ...acc, [category.id]: true }), {})
  );

  // Group items by category
  const itemsByCategory = (categories || []).map(category => {
    const categoryItems = (items || []).filter(item => item.categoryId === category.id);
    return {
      category,
      items: categoryItems,
      packedCount: categoryItems.filter(item => item.isPacked).length,
    };
  }).filter(group => group.items.length > 0); // Only show categories with items

  // Toggle a category's expanded state
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle toggling an item's packed state
  const handleToggleItem = (item: Item) => {
    if (onToggleItem) {
      onToggleItem(item);
    }
  };

  // Handle updating an item's quantity
  const handleUpdateQuantity = (item: Item, increment: boolean) => {
    if (!onUpdateQuantity) return;
    
    const newQuantity = increment 
      ? item.quantity + 1 
      : Math.max(1, item.quantity - 1);
      
    onUpdateQuantity(item, newQuantity);
  };

  return (
    <div className="mt-4">
      {itemsByCategory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No items in your packing list yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {itemsByCategory.map(({ category, items, packedCount }) => (
            <div key={category.id} className="border rounded-md overflow-hidden">
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="font-medium">
                  {category.name}
                </div>
                <div className="text-sm text-gray-500">
                  {packedCount} / {items.length}
                </div>
              </div>
              
              {expandedCategories[category.id] && (
                <div className="px-2 divide-y">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "py-3 px-1 flex items-center",
                        item.isPacked && "opacity-60"
                      )}
                    >
                      <button
                        className={cn(
                          "w-6 h-6 rounded-full border flex items-center justify-center mr-3",
                          item.isPacked 
                            ? "bg-primary border-primary text-white" 
                            : "border-gray-300"
                        )}
                        onClick={() => handleToggleItem(item)}
                        aria-label={item.isPacked ? "Mark as unpacked" : "Mark as packed"}
                      >
                        {item.isPacked && <Check className="w-4 h-4" />}
                      </button>
                      
                      <div className="flex-1">
                        <span className={cn(item.isPacked && "line-through")}>
                          {item.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        {onUpdateQuantity && (
                          <>
                            <button
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                              onClick={() => handleUpdateQuantity(item, false)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <span className="px-2 min-w-[30px] text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                              onClick={() => handleUpdateQuantity(item, true)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {onRemoveItem && item.isCustom && (
                          <button
                            className="ml-2 text-red-400 hover:text-red-600"
                            onClick={() => onRemoveItem(item.id)}
                            aria-label="Remove item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {onAddItem && (
                    <div className="py-2">
                      <Button
                        variant="ghost"
                        className="w-full text-primary hover:text-primary-dark"
                        onClick={() => onAddItem(category.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Item
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackingList;