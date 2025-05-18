import React, { createContext, useContext, useState } from "react";
import { User } from "../types";
import { useAuth } from "./AuthContext";
import { UserProfileProvider } from "./UserProfileContext";
import { JobProvider } from "./JobContext";
import useNetworkStatus from "@/hooks/useNetworkStatus";

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, isEmailVerified, signOut } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  const [user, setUser] = useState<User | null>(null);

  // Sync auth user with app user
  React.useEffect(() => {
    if (authUser) {
      // Create basic user from auth data
      const newUser: User = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        phone: authUser.phone || '',
        verified: isEmailVerified,
        avatar: authUser.user_metadata?.avatar_url || null,
        skills: [],
        verificationLevel: isEmailVerified ? 'email' : 'none'
      };
      
      setUser(newUser);
    } else {
      setUser(null);
    }
  }, [authUser, isEmailVerified]);

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    logout,
    isOnline,
  };

  return (
    <AppContext.Provider value={value}>
      <UserProfileProvider>
        <JobProvider>
          {children}
        </JobProvider>
      </UserProfileProvider>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  
  return context;
};
