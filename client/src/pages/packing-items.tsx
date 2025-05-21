import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { Button } from '@/components/ui/button';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import { useItems } from '@/hooks/use-items';
import { localStorageService } from '@/lib/localStorageService';
import { Item, Category } from '@/lib/localStorageService';

interface CategoryWithItems {
  category: Category;
  items: Item[];
  isExpanded: boolean;
}

export default function PackingItems() {
  const [location] = useLocation();
  // Get tripId from URL path - format: /trip/:tripId/items
  const match = location.match(/\/trip\/(\d+)\/items/);
  const tripId = match ? Number(match[1]) : 0;
  
  const { items, addItem, toggleItem, updateQuantity, removeItem: deleteItem } = useItems(tripId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesWithItems, setCategoriesWithItems] = useState<CategoryWithItems[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  
  // Get trip details
  const trip = localStorageService.getTrips().find(t => t.id === tripId);
  
  // Load categories
  useEffect(() => {
    const loadedCategories = localStorageService.getCategories();
    setCategories(loadedCategories);
  }, []);
  
  // Organize items by category
  useEffect(() => {
    if (categories.length > 0 && items.length > 0) {
      const categorized = categories.map(category => ({
        category,
        items: items.filter(item => item.categoryId === category.id),
        isExpanded: true // Default expanded
      }));
      
      // Sort categories: first with items, then empty ones
      const sorted = categorized.sort((a, b) => {
        if (a.items.length === 0 && b.items.length > 0) return 1;
        if (a.items.length > 0 && b.items.length === 0) return -1;
        return 0;
      });
      
      setCategoriesWithItems(sorted);
    } else {
      setCategoriesWithItems([]);
    }
  }, [categories, items]);
  
  // Add new item
  const handleAddItem = (categoryId: number) => {
    if (newItemName.trim() === '') return;
    
    addItem({
      tripId,
      name: newItemName.trim(),
      categoryId,
      isPacked: false,
      quantity: 1,
      isCustom: true
    });
    
    setNewItemName('');
    setShowAddItemForm(false);
  };
  
  // Add new category
  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') return;
    
    const newCategory = localStorageService.addCategory(newCategoryName.trim());
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setShowAddCategoryForm(false);
  };
  
  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    setCategoriesWithItems(prev => 
      prev.map(cat => 
        cat.category.id === categoryId 
          ? { ...cat, isExpanded: !cat.isExpanded } 
          : cat
      )
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title={trip?.destination || 'Packing List'} 
        showBackButton 
        onBackClick={() => navigate('/')}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Категории с вещами */}
        {categoriesWithItems.length > 0 ? (
          <div className="flex-1">
            {categoriesWithItems.map(({ category, items, isExpanded }) => (
              <div key={category.id} className="border-b">
                {/* Заголовок категории - стилизация согласно макету */}
                <button 
                  className="w-full flex items-center justify-between p-4 bg-gray-200"
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className="font-medium">{category.name}</span>
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
                
                {/* Предметы в категории */}
                {isExpanded && (
                  <div>
                    {items.map(item => (
                      <div 
                        key={item.id} 
                        className="px-4 py-3 border-t border-gray-200 flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={item.isPacked}
                          onChange={() => toggleItem(item)}
                          className="h-5 w-5 mr-3"
                        />
                        <span 
                          className={`flex-1 ${item.isPacked ? 'line-through text-gray-400' : ''}`}
                        >
                          {item.name}
                        </span>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Кнопка добавления предмета - макет "Add +" */}
                    <div className="px-4 py-3 border-t border-gray-200">
                      {showAddItemForm && selectedCategory === category.id ? (
                        <div className="flex">
                          <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Enter item name"
                            className="border border-gray-300 rounded-l px-3 py-2 flex-1"
                            autoFocus
                          />
                          <Button
                            onClick={() => handleAddItem(category.id)}
                            disabled={!newItemName.trim()}
                            className="rounded-l-none"
                          >
                            Add
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="flex items-center justify-center w-full text-center py-2 text-gray-600"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setShowAddItemForm(true);
                          }}
                        >
                          <span>Add +</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Добавление новой категории */}
            <div className="border-b">
              <button 
                className="w-full flex items-center justify-between p-4 bg-gray-200"
                onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
              >
                <span className="font-medium">Add category</span>
                <PlusIcon className="h-5 w-5" />
              </button>
              
              {showAddCategoryForm && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      className="border border-gray-300 rounded-l px-3 py-2 flex-1"
                    />
                    <Button
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                      className="rounded-l-none"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <p className="text-gray-500 mb-4 text-center">
              No items found. Add some categories and items to get started.
            </p>
            
            <Button
              onClick={() => setShowAddCategoryForm(true)}
            >
              Add Category
            </Button>
            
            {showAddCategoryForm && (
              <div className="mt-4 w-full max-w-md">
                <div className="flex">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="border border-gray-300 rounded-l px-3 py-2 flex-1"
                  />
                  <Button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="rounded-l-none"
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}