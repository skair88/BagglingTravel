import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import { localStorage } from '@/lib/storage';
import { useQueryClient } from '@tanstack/react-query';

interface AppSettings {
  darkMode: boolean;
  offlineMode: boolean;
  language: string;
}

const Settings: React.FC = () => {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    offlineMode: true,
    language: 'English'
  });
  const [cacheSize, setCacheSize] = useState<string>('0 KB');
  
  // Load settings on component mount
  useEffect(() => {
    const storedSettings = localStorage.getSettings();
    if (storedSettings) {
      setSettings({
        darkMode: storedSettings.darkMode,
        offlineMode: storedSettings.offlineMode,
        language: storedSettings.language
      });
    }
    
    // Calculate cache size
    const size = localStorage.getStorageSize();
    setCacheSize(formatSize(size));
  }, []);
  
  // Format file size for display
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  // Handle toggle changes
  const handleToggleChange = (key: keyof AppSettings, value: boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Update local storage
      const storedSettings = localStorage.getSettings();
      if (storedSettings) {
        localStorage.saveSettings({ ...storedSettings, [key]: value });
      }
      
      return newSettings;
    });
  };
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    setSettings(prev => {
      const newSettings = { ...prev, language: value };
      
      // Update local storage
      const storedSettings = localStorage.getSettings();
      if (storedSettings) {
        localStorage.saveSettings({ ...storedSettings, language: value });
      }
      
      return newSettings;
    });
  };
  
  // Handle clear cache
  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the cache? This will remove all offline data.')) {
      localStorage.clearAll();
      queryClient.clear();
      setCacheSize('0 KB');
      alert('Cache cleared successfully.');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="Settings" 
        showBackButton 
        onBackClick={() => navigate('/')}
      />
      
      <div className="px-5 py-4 flex-1">
        <div className="space-y-5">
          {/* Profile Section */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="p-4 flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-icons text-primary">person</span>
              </div>
              <div className="ml-3">
                <h3 className="font-medium">Your Profile</h3>
                <p className="text-sm text-text-secondary">Manage your personal information</p>
              </div>
              <span className="material-icons text-text-secondary ml-auto">chevron_right</span>
            </div>
          </div>
          
          {/* App Preferences */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <h3 className="p-3 text-sm text-text-secondary font-medium uppercase bg-gray-50">App Preferences</h3>
            
            {/* Theme Settings */}
            <div className="border-b border-border">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons text-text-secondary mr-3">dark_mode</span>
                  <span>Dark Mode</span>
                </div>
                <Switch 
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleToggleChange('darkMode', checked)}
                />
              </div>
            </div>
            
            {/* Language Settings */}
            <div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons text-text-secondary mr-3">language</span>
                  <span>Language</span>
                </div>
                <div className="flex items-center">
                  <Select 
                    value={settings.language}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Data & Storage */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <h3 className="p-3 text-sm text-text-secondary font-medium uppercase bg-gray-50">Data & Storage</h3>
            
            {/* Offline Mode */}
            <div className="border-b border-border">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons text-text-secondary mr-3">cloud_off</span>
                  <span>Offline Mode</span>
                </div>
                <Switch 
                  checked={settings.offlineMode}
                  onCheckedChange={(checked) => handleToggleChange('offlineMode', checked)}
                />
              </div>
            </div>
            
            {/* Clear Cache */}
            <div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons text-text-secondary mr-3">delete</span>
                  <span>Clear Cache</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearCache}
                  className="text-text-secondary text-sm"
                >
                  {cacheSize}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Help & Support */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="p-4 flex items-center">
              <span className="material-icons text-text-secondary mr-3">help</span>
              <span>Help & Support</span>
              <span className="material-icons text-text-secondary ml-auto">chevron_right</span>
            </div>
          </div>
          
          {/* About */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="p-4 flex items-center">
              <span className="material-icons text-text-secondary mr-3">info</span>
              <span>About Baggle</span>
              <span className="material-icons text-text-secondary ml-auto">chevron_right</span>
            </div>
          </div>
          
          {/* Version Info */}
          <p className="text-center text-sm text-text-secondary mt-4">Version 1.0.0</p>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Settings;
