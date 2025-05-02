import React, { createContext, useContext, useState, useEffect } from "react";
import { JobPost, User, JobFilter, UserProfile } from "../types";
import { mockJobs } from "../data/mockData";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

interface AppContextType {
  user: User | null;
  userProfile: UserProfile | null;
  profileCompletion: number;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isProfileCompleted: boolean; // True if profile is at least 70% complete
  jobs: JobPost[];
  filteredJobs: JobPost[];
  jobFilters: JobFilter;
  setJobFilters: (filters: JobFilter) => void;
  logout: () => void;
  isAuthenticated: boolean;
  addJob: (job: Omit<JobPost, "id" | "timestamp" | "posterId" | "posterName" | "posterRating" | "posterVerified" | "posterAvatar">) => void;
  applyToJob: (jobId: string) => void;
  appliedJobs: Set<string>;
  getJobById: (id: string) => JobPost | undefined;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  submitKYC: (data: any) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, isEmailVerified } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [jobFilters, setJobFilters] = useState<JobFilter>({});
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [kycStatus, setKycStatus] = useState<'not_started' | 'pending' | 'approved' | 'rejected'>('not_started');

  // Initialize mock data
  useEffect(() => {
    setJobs(mockJobs);
  }, []);

  // Sync auth user with app user
  useEffect(() => {
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
      
      // Fetch additional profile data from Supabase
      fetchUserProfile(authUser.id);
    } else {
      setUser(null);
      setUserProfile(null);
    }
  }, [authUser, isEmailVerified]);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        setUserProfile(data);
        calculateProfileCompletion(data);
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
        } else {
          setUserProfile(initialProfile);
          calculateProfileCompletion(initialProfile);
        }
      }
    } catch (error) {
      console.error("Error in profile fetch:", error);
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
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile as UserProfile);
      calculateProfileCompletion(updatedProfile as UserProfile);
      
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
  };

  // Apply filters to jobs
  useEffect(() => {
    let filtered = [...jobs];

    // Filter by category if specified
    if (jobFilters.category && jobFilters.category.length > 0) {
      filtered = filtered.filter(job => jobFilters.category?.includes(job.category));
    }

    // Filter by pay range if specified
    if (jobFilters.payMin !== undefined) {
      filtered = filtered.filter(job => job.pay >= (jobFilters.payMin || 0));
    }

    if (jobFilters.payMax !== undefined) {
      filtered = filtered.filter(job => job.pay <= (jobFilters.payMax || Infinity));
    }

    // Sort jobs
    if (jobFilters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else if (jobFilters.sortBy === 'pay_high_to_low') {
      filtered.sort((a, b) => b.pay - a.pay);
    } else if (jobFilters.sortBy === 'pay_low_to_high') {
      filtered.sort((a, b) => a.pay - b.pay);
    }

    setFilteredJobs(filtered);
  }, [jobs, jobFilters]);

  const logout = () => {
    setUser(null);
    setUserProfile(null);
    setAppliedJobs(new Set());
  };

  const addJob = (newJob: Omit<JobPost, "id" | "timestamp" | "posterId" | "posterName" | "posterRating" | "posterVerified" | "posterAvatar">) => {
    if (!user) return;

    const jobToAdd: JobPost = {
      ...newJob,
      id: `job-${Date.now()}`,
      postedDate: new Date().toISOString(),
      postedBy: {
        id: user.id,
        name: user.name,
        verificationLevel: user.verificationLevel,
      }
    };

    setJobs(prevJobs => [jobToAdd, ...prevJobs]);
  };

  const applyToJob = (jobId: string) => {
    setAppliedJobs(prev => new Set(prev).add(jobId));
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  // Send OTP for phone verification
  const sendOTP = async (phoneNumber: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      return { success: false, error: error.message };
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
      
      if (error) throw error;
      
      // If success, update the user profile
      if (user) {
        await updateUserProfile({ phone: phoneNumber, phone_verified: true });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      return { success: false, error: error.message };
    }
  };

  // Submit KYC data
  const submitKYC = async (data: any) => {
    try {
      // First update profile
      const { error } = await supabase
        .from('kyc_verifications')
        .insert([{
          user_id: user?.id,
          ...data,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }]);
        
      if (error) throw error;
      
      // Update local state
      setKycStatus('pending');
      
      return { success: true };
    } catch (error: any) {
      console.error("Error submitting KYC:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        userProfile,
        profileCompletion,
        updateUserProfile,
        isProfileCompleted: profileCompletion >= 70,
        jobs,
        filteredJobs,
        jobFilters,
        setJobFilters,
        logout,
        isAuthenticated: !!user,
        addJob,
        applyToJob,
        appliedJobs,
        getJobById,
        sendOTP,
        verifyOTP,
        kycStatus,
        submitKYC
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
