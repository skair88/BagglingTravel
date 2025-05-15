import { Router, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import TripCreator from "@/pages/trip-creator";
import PackingList from "@/pages/packing-list";
import { useEffect, useState } from "react";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading of app resources
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(loadingTimeout);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="text-gray-400 text-5xl mb-4 animate-bounce">🧳</div>
          <h1 className="text-xl font-semibold text-gray-800">Baggle</h1>
          <p className="text-gray-500">Loading your travel companion...</p>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Toaster />
      <div className="bg-gray-50 text-gray-900 flex flex-col min-h-screen max-w-md mx-auto relative">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/trip/new" component={TripCreator} />
          <Route path="/trip/:id/packing" component={PackingList} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Router>
      </div>
    </TooltipProvider>
  );
}

export default App;
