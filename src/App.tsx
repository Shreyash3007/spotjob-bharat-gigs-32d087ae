
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import { AdminProvider } from "./context/AdminContext";
import { AuthProvider } from "./context/AuthContext";
import MaintenanceMode from "./components/MaintenanceMode";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded pages for better performance
const Auth = lazy(() => import("./pages/Auth"));
const JobListingPage = lazy(() => import("./pages/JobListingPage"));
const JobSwipe = lazy(() => import("./pages/JobSwipe"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Index = lazy(() => import("./pages/Index"));
const MapView = lazy(() => import("./pages/MapView"));
const PostJob = lazy(() => import("./pages/PostJob"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminProvider>
          <MaintenanceMode />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes that require authentication */}
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <JobListingPage />
                </ProtectedRoute>
              } />
              
              <Route path="/swipe" element={
                <ProtectedRoute>
                  <JobSwipe />
                </ProtectedRoute>
              } />
              
              <Route path="/job/:id" element={<JobDetails />} />
              
              <Route path="/home" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              
              <Route path="/map" element={<MapView />} />
              
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
              
              {/* Admin route that requires admin privileges */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true} redirectTo="/home">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
          <SonnerToaster position="top-center" closeButton expand={false} richColors theme="system" />
        </AdminProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
