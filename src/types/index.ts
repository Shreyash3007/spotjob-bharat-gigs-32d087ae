
export interface User {
  id: string;
  name: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  verified: boolean;
  avatar?: string;
}

export interface JobPost {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  pay: {
    amount: number;
    type: 'hourly' | 'fixed' | 'daily';
  };
  category: JobCategory;
  duration: string;
  posterId: string;
  posterName: string;
  posterRating: number;
  posterVerified: boolean;
  timestamp: number;
  status: 'open' | 'filled' | 'expired';
  posterAvatar?: string;
}

export type JobCategory = 
  'delivery' | 
  'tutoring' | 
  'tech' | 
  'babysitting' | 
  'housekeeping' | 
  'event' | 
  'other';

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  distance: number;
  timestamp: number;
}

export interface JobFilter {
  category?: JobCategory[];
  distance?: number;
  payMin?: number;
  payMax?: number;
  duration?: string[];
  sortBy?: 'distance' | 'pay' | 'newest';
}
