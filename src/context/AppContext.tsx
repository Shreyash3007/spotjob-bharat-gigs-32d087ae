
import React, { createContext, useContext, useState } from "react";
import { User } from "../types";
import { useAuth } from "./AuthContext";
import { UserProfileProvider } from "./UserProfileContext";
import { JobProvider } from "./JobContext";
import useNetworkStatus from "@/hooks/useNetworkStatus";

// Profile fields with their weights for profile completion calculation
export const PROFILE_FIELDS = {
  name: 15,
  phone: 10,
  email: 10,
  address: 10,
  dateOfBirth: 5,
  skills: 10,
  profilePicture: 10,
  bio: 10,
  education: 10,
  workExperience: 5,
  idVerification: 15
};

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  isOnline: boolean;
  // Add missing properties that were causing errors
  userProfile: any;
  profileCompletion: number;
  isProfileCompleted: boolean;
  updateUserProfile?: (data: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, isEmailVerified, signOut } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  const [user, setUser] = useState<User | null>(null);
  
  // Mock profile data until we implement proper profile functionality
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean>(false);

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
      
      // Set mock profile data
      const mockProfile = {
        id: authUser.id,
        full_name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        avatar_url: newUser.avatar,
        skills: newUser.skills,
        id_verified: false
      };
      
      setUserProfile(mockProfile);
      
      // Calculate profile completion (mock)
      setProfileCompletion(40);
      setIsProfileCompleted(false);
    } else {
      setUser(null);
      setUserProfile(null);
      setProfileCompletion(0);
      setIsProfileCompleted(false);
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
  
  // Mock update profile function
  const updateUserProfile = async (data: any) => {
    setUserProfile({
      ...userProfile,
      ...data
    });
    
    // Recalculate profile completion
    setTimeout(() => {
      setProfileCompletion(Math.min(profileCompletion + 10, 100));
      setIsProfileCompleted(profileCompletion + 10 >= 70);
    }, 100);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    logout,
    isOnline,
    userProfile,
    profileCompletion,
    isProfileCompleted,
    updateUserProfile
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
