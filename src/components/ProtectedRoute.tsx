
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  redirectTo = "/auth"
}) => {
  const { user, isLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  // If authentication is required and user is not logged in
  if (isLoading || (requireAdmin && adminLoading)) {
    // Show loading state while checking auth
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to={redirectTo} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
