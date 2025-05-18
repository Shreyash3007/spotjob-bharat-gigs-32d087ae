import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

// Profile fields and their weights for completion percentage
export const PROFILE_FIELDS = {
  name: 10,
  phone: 15,
  email: 10,
  address: 10,
  dateOfBirth: 10,
  skills: 15,
  profilePicture: 10,
  bio: 5,
  education: 5,
  workExperience: 5,
  idVerification: 15,
};

interface UserProfileContextType {
  userProfile: UserProfile | null;
  profileCompletion: number;
  isProfileCompleted: boolean; // True if profile is at least 70% complete
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: any }>;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  submitKYC: (data: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [kycStatus, setKycStatus] = useState<'not_started' | 'pending' | 'approved' | 'rejected'>('not_started');
  const [loading, setLoading] = useState(true);
  
  const isProfileCompleted = profileCompletion >= 70;

  // Fetch user profile when auth user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setUserProfile(null);
      setProfileCompletion(0);
      setLoading(false);
    }
  }, [user]);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load your profile");
        setLoading(false);
        return;
      }
      
      if (data) {
        setUserProfile(data);
        calculateProfileCompletion(data);
        setKycStatus(data.kyc_status || 'not_started');
      } else {
        // Create initial profile if it doesn't exist
        const initialProfile: UserProfile = {
          user_id: userId,
          created_at: new Date().toISOString(),
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([initialProfile]);
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
          toast.error("Failed to create your profile");
        } else {
          setUserProfile(initialProfile);
          calculateProfileCompletion(initialProfile);
        }
      }
    } catch (error) {
      console.error("Error in profile fetch:", error);
      toast.error("Something went wrong while loading your profile");
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: UserProfile) => {
    if (!profile) {
      setProfileCompletion(0);
      return;
    }
    
    let completedWeight = 0;
    let totalWeight = 0;
    
    // Add up weights of completed fields
    Object.entries(PROFILE_FIELDS).forEach(([field, weight]) => {
      totalWeight += weight;
      
      if (field === 'skills' && profile.skills?.length > 0) {
        completedWeight += weight;
      } else if (field === 'profilePicture' && profile.avatar_url) {
        completedWeight += weight;
      } else if (field === 'idVerification' && profile.id_verified) {
        completedWeight += weight;
      } else if (profile[field as keyof UserProfile]) {
        completedWeight += weight;
      }
    });
    
    const percentage = Math.round((completedWeight / totalWeight) * 100);
    setProfileCompletion(percentage);
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: "Not authenticated" };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedProfile = { ...userProfile, ...updates } as UserProfile;
      setUserProfile(updatedProfile);
      calculateProfileCompletion(updatedProfile);
      
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update your profile");
      return { success: false, error };
    }
  };

  // Send OTP for phone verification
  const sendOTP = async (phoneNumber: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("OTP sent to your phone");
      return { success: true };
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      return { 
        success: false, 
        error: error.message || "Failed to send OTP"
      };
    }
  };

  // Verify OTP
  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms'
      });
      
      if (error) {
        throw error;
      }
      
      // Update phone verification status in profile
      if (userProfile) {
        await updateUserProfile({
          phone: phoneNumber,
          phone_verified: true
        });
      }
      
      toast.success("Phone number verified successfully");
      return { success: true };
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      return {
        success: false,
        error: error.message || "Failed to verify OTP"
      };
    }
  };

  // Submit KYC documents
  const submitKYC = async (data: Record<string, any>) => {
    if (!user) return { success: false, error: "Not authenticated" };
    
    try {
      // Update KYC status to pending
      const updates = {
        ...data,
        kyc_status: 'pending',
        kyc_submitted_at: new Date().toISOString()
      };
      
      const result = await updateUserProfile(updates);
      
      if (!result.success) {
        throw new Error("Failed to submit KYC");
      }
      
      setKycStatus('pending');
      toast.success("KYC documents submitted for verification");
      return { success: true };
    } catch (error: any) {
      console.error("Error submitting KYC:", error);
      return {
        success: false,
        error: error.message || "Failed to submit KYC documents"
      };
    }
  };

  const value = {
    userProfile,
    profileCompletion,
    isProfileCompleted,
    updateUserProfile,
    sendOTP,
    verifyOTP,
    kycStatus,
    submitKYC,
    loading
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  
  return context;
}; 