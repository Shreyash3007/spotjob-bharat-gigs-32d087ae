
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="spotjob-theme">
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
