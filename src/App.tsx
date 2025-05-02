import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
import LandingPage from "./pages/LandingPage";

// Set Mapbox token globally
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hyZXlhc2gwNDUiLCJhIjoiY21hNGI5YXhzMDNwcTJqczYyMnR3OWdkcSJ9.aVpyfgys6f-h27ftG_63Zw';

const queryClient = new QueryClient();

// Route protection component
type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isEmailVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    // You could show a loading spinner here
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Redirect to auth page if not logged in
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isEmailVerified) {
    // Redirect to auth page with a specific message if email is not verified
    return <Navigate to="/auth" state={{ 
      from: location, 
      verificationRequired: true,
      email: user.email
    }} replace />;
  }

  // User is logged in and email is verified, render the protected route
  return <>{children}</>;
};

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
        <ThemeProvider defaultTheme="light" storageKey="spotjob-theme">
          <ThemeMetaColor />
          <AuthProvider>
            <AppProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <Toaster />
                  <Sonner expand={true} closeButton richColors />
                  <AnimatePresence mode="wait">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/auth" element={<Auth />} />
                      
                      {/* Protected routes */}
                      <Route path="/home" element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      } />
                      <Route path="/map" element={
                        <ProtectedRoute>
                          <MapView />
                        </ProtectedRoute>
                      } />
                      <Route path="/swipe" element={
                        <ProtectedRoute>
                          <JobSwipe />
                        </ProtectedRoute>
                      } />
                      <Route path="/post-job" element={
                        <ProtectedRoute>
                          <PostJob />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/job/:id" element={
                        <ProtectedRoute>
                          <JobDetails />
                        </ProtectedRoute>
                      } />
                      
                      {/* Fallback route */}
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
