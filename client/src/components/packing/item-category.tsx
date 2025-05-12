import React from 'react';
import { Item, Category } from '@shared/schema';
import { Checkbox } from '@/components/ui/checkbox';

interface ItemCategoryProps {
  category: Category;
  items: Item[];
  onToggleItem: (item: Item) => void;
}

const ItemCategory: React.FC<ItemCategoryProps> = ({ category, items, onToggleItem }) => {
  if (items.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="font-medium text-text-secondary text-sm uppercase mb-3">{category.name}</h3>
        <p className="text-text-secondary text-sm italic">No items in this category</p>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <h3 className="font-medium text-text-secondary text-sm uppercase mb-3">{category.name}</h3>
      
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center bg-white rounded-lg border border-border p-3">
            <Checkbox 
              id={`item-${item.id}`}
              checked={item.isPacked}
              onCheckedChange={() => onToggleItem(item)}
            />
            <label 
              htmlFor={`item-${item.id}`}
              className={`ml-3 font-medium cursor-pointer ${item.isPacked ? 'line-through text-text-secondary' : ''}`}
            >
              {item.name}
              {item.quantity > 1 && ` (${item.quantity})`}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemCategory;
