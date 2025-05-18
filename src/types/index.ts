
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
  rating?: number;
  verified?: boolean;
  avatar?: string | null;
  skills: string[];
  verificationLevel: VerificationLevel;
}

export interface JobPost {
  id: string;
  title: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  pay: number | {
    amount: number;
    type: 'hourly' | 'fixed' | 'daily';
  };
  category: JobCategory;
  skills?: string[];
  duration: string;
  posterId?: string;
  posterName?: string;
  posterRating?: number;
  posterVerified?: boolean;
  timestamp: number;
  status: 'open' | 'filled' | 'expired' | 'in-progress' | 'completed' | 'cancelled';
  posterAvatar?: string;
  postedBy: {
    id: string;
    name: string;
    verificationLevel: VerificationLevel;
  };
  postedDate: string;
  payType?: "hourly" | "fixed" | "daily";
}

export type JobCategory = 
  'delivery' | 
  'tutoring' | 
  'tech' | 
  'babysitting' | 
  'housekeeping' | 
  'event' | 
  'other';

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  message?: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
}

export interface JobFilter {
  category?: JobCategory[];
  distance?: number;
  payMin?: number;
  payMax?: number;
  duration?: string[];
  sortBy?: 'distance' | 'pay' | 'newest' | 'relevance' | 'pay_high_to_low' | 'pay_low_to_high';
  skills?: string[];
}

export type VerificationLevel = "none" | "basic" | "phone" | "email" | "id" | "premium";

export interface UserPreferences {
  darkMode?: boolean;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  jobAlerts?: boolean;
  searchRadius?: number;
  language?: "en" | "hi" | "te" | "ta" | "mr" | "gu";
}

// User profile interface for database storage
export interface UserProfile {
  user_id: string;
  created_at: string;
  updated_at?: string;
  name?: string;
  phone?: string;
  email?: string;
  phone_verified?: boolean;
  address?: string;
  dateOfBirth?: string;
  skills?: string[];
  bio?: string;
  education?: string;
  workExperience?: string;
  avatar_url?: string;
  id_verified?: boolean;
  id_type?: string;
  id_number?: string;
  id_expiry?: string;
  id_document_url?: string;
  selfie_url?: string;
  kyc_status?: 'not_started' | 'pending' | 'approved' | 'rejected';
  kyc_submitted_at?: string;
  kyc_approved_at?: string;
  kyc_rejected_at?: string;
  kyc_rejection_reason?: string;
  [key: string]: any; // Allow any other properties
}
