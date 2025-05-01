
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Index from "./pages/Index";
import MapView from "./pages/MapView";
import JobSwipe from "./pages/JobSwipe";
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import JobDetails from "./pages/JobDetails";
import { AppProvider } from "./context/AppContext";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const ThemeMetaColor = () => {
  useEffect(() => {
    // Create meta theme-color if it doesn't exist
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    // Set initial color
    metaThemeColor.setAttribute('content', '#ffffff');
    
    // Update on theme change
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          const isDark = document.documentElement.classList.contains('dark');
          metaThemeColor.setAttribute(
            'content',
            isDark ? '#0f172a' : '#ffffff'
          );
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  return null;
}

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="spotjob-theme">
          <ThemeMetaColor />
          <AuthProvider>
            <AppProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <Toaster />
                  <Sonner expand={true} closeButton richColors />
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/map" element={<MapView />} />
                      <Route path="/swipe" element={<JobSwipe />} />
                      <Route path="/post-job" element={<PostJob />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/job/:id" element={<JobDetails />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnimatePresence>
                </BrowserRouter>
              </TooltipProvider>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
