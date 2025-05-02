export interface User {
  id: string;
  name: string;
  phone?: string;
  email: string;
  location?: { lat: number; lng: number } | null;
  rating?: number;
  verified?: boolean;
  avatar?: string | null;
  provider?: "phone" | "google" | "truecaller" | "whatsapp" | "magiclink";
  lastLogin?: Date;
  preferences?: UserPreferences;
  skills: string[];
  verificationLevel: VerificationLevel;
}

// Extended profile information stored in Supabase
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

export interface JobPost {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  pay: number;
  payType: "hourly" | "fixed";
  duration: string;
  location?: {
    lat: number;
    lng: number;
  };
  postedBy: {
    id: string;
    name: string;
    verificationLevel: VerificationLevel;
  };
  postedDate: string;
  durationType?: "hours" | "days";
  timestamp?: string;
  posterId?: string;
  posterName?: string;
  posterAvatar?: string;
  status?: "open" | "in-progress" | "completed" | "cancelled";
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  message?: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Review {
  id: string;
  userId: string;
  targetId: string;
  jobId: string;
  rating: number;
  comment?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "job_application" | "job_update" | "chat" | "payment" | "review" | "system";
  read: boolean;
  timestamp: string;
  data?: {
    jobId?: string;
    applicationId?: string;
    chatId?: string;
    paymentId?: string;
    reviewId?: string;
  };
}

export interface JobFilter {
  category?: string;
  payRange?: { min: number; max: number };
  payMin?: number;
  payMax?: number;
  durationType?: "hours" | "days";
  skills?: string[];
  distance?: number;
  sortBy?: "relevance" | "newest" | "pay_high_to_low" | "pay_low_to_high";
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: "job" | "user" | "review";
  targetId: string;
  reason: "inappropriate" | "fraud" | "spam" | "other";
  description?: string;
  timestamp: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
}

export type VerificationLevel = "none" | "basic" | "phone" | "email" | "id" | "premium";

export type ApplicationStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface Transaction {
  id: string;
  jobId: string;
  amount: number;
  status: "pending" | "completed" | "refunded";
  createdAt: string;
}

export type JobCategory = "delivery" | "tutoring" | "tech" | "babysitting" | "housekeeping" | "event" | "other"; 