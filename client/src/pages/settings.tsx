import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { localStorageService } from '@/lib/localStorageService';

interface AppSettings {
  darkMode: boolean;
  language: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    language: 'English'
  });
  
  const [isSaved, setIsSaved] = useState(false);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorageService.getSettings();
    if (savedSettings) {
      setSettings({
        darkMode: savedSettings.darkMode,
        language: savedSettings.language
      });
    }
  }, []);
  
  const handleDarkModeChange = (checked: boolean) => {
    setSettings(prev => ({ ...prev, darkMode: checked }));
    setIsSaved(false);
  };
  
  const handleLanguageChange = (value: string) => {
    setSettings(prev => ({ ...prev, language: value }));
    setIsSaved(false);
  };
  
  const handleSave = () => {
    localStorageService.saveSettings(settings);
    setIsSaved(true);
    
    // Apply dark mode to the document if needed
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all app data? This action cannot be undone.')) {
      localStorageService.clearAll();
      window.location.href = '/';
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Settings" showBackButton />
      
      <main className="flex-1 p-4">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">App Preferences</h2>
            <p className="text-sm text-gray-500">Customize how Baggle works for you</p>
          </div>
          
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-gray-500">Use dark theme for the app</p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={settings.darkMode} 
                onCheckedChange={handleDarkModeChange} 
              />
            </div>
            
            {/* Language Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Save Button */}
            <Button onClick={handleSave} className="w-full">
              {isSaved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
          
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold">Data Management</h2>
              <p className="text-sm text-gray-500">Manage your app data</p>
            </div>
            
            {/* Clear Data Button */}
            <Button 
              variant="destructive" 
              onClick={handleClearData} 
              className="w-full"
            >
              Clear All Data
            </Button>
            
            <p className="text-xs text-gray-400 text-center">
              This will delete all your trips, items, and settings
            </p>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-400 text-center">
              Baggle v1.0.0
            </p>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}