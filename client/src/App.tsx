import { Router, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TripCreator from "@/pages/trip-creator";
import PackingList from "@/pages/packing-list";
import Settings from "@/pages/settings";
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
          <div className="material-icons text-primary text-5xl mb-4 animate-bounce">luggage</div>
          <h1 className="text-xl font-semibold text-foreground">Baggle</h1>
          <p className="text-muted-foreground">Loading your travel companion...</p>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Toaster />
      <div className="bg-background text-foreground flex flex-col min-h-screen max-w-md mx-auto relative">
        <div className="ios-status-bar bg-background"></div>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/trip-creator/step/:step" component={TripCreator} />
          <Route path="/trip/:id" component={PackingList} />
          <Route path="/settings" component={Settings} />
          <Route path="/:rest*" component={NotFound} />
        </Router>
      </div>
    </TooltipProvider>
  );
}

export default App;
