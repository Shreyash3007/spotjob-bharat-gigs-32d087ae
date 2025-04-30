
import React, { createContext, useContext, useState, useEffect } from "react";
import { JobPost, User, JobFilter } from "../types";
import { currentUser, mockJobs } from "../data/mockData";

interface AppContextType {
  user: User | null;
  jobs: JobPost[];
  filteredJobs: JobPost[];
  jobFilters: JobFilter;
  setJobFilters: (filters: JobFilter) => void;
  login: (phone: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  addJob: (job: Omit<JobPost, "id" | "timestamp" | "posterId" | "posterName" | "posterRating" | "posterVerified" | "posterAvatar">) => void;
  applyToJob: (jobId: string) => void;
  appliedJobs: Set<string>;
  getJobById: (id: string) => JobPost | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [jobFilters, setJobFilters] = useState<JobFilter>({});
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  // Initialize mock data
  useEffect(() => {
    setJobs(mockJobs);
    // Auto login for demo
    setUser(currentUser);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...jobs];

    // Filter by category if specified
    if (jobFilters.category && jobFilters.category.length > 0) {
      filtered = filtered.filter(job => jobFilters.category?.includes(job.category));
    }

    // Filter by pay range if specified
    if (jobFilters.payMin !== undefined) {
      filtered = filtered.filter(job => job.pay.amount >= (jobFilters.payMin || 0));
    }

    if (jobFilters.payMax !== undefined) {
      filtered = filtered.filter(job => job.pay.amount <= (jobFilters.payMax || Infinity));
    }

    // Sort jobs
    if (jobFilters.sortBy === 'newest') {
      filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else if (jobFilters.sortBy === 'pay') {
      filtered.sort((a, b) => b.pay.amount - a.pay.amount);
    }
    // Distance-based sorting would require user location, which we simulate in the real implementation

    setFilteredJobs(filtered);
  }, [jobs, jobFilters]);

  const login = async (phone: string): Promise<void> => {
    // In a real app, this would validate OTP, but we'll simulate success
    setTimeout(() => {
      setUser(currentUser);
    }, 1000);
    return Promise.resolve();
  };

  const logout = () => {
    setUser(null);
    setAppliedJobs(new Set());
  };

  const addJob = (newJob: Omit<JobPost, "id" | "timestamp" | "posterId" | "posterName" | "posterRating" | "posterVerified" | "posterAvatar">) => {
    if (!user) return;

    const jobToAdd: JobPost = {
      ...newJob,
      id: `job-${Date.now()}`,
      timestamp: Date.now(),
      posterId: user.id,
      posterName: user.name,
      posterRating: user.rating,
      posterVerified: user.verified,
      posterAvatar: user.avatar,
      status: "open"
    };

    setJobs(prevJobs => [jobToAdd, ...prevJobs]);
  };

  const applyToJob = (jobId: string) => {
    setAppliedJobs(prev => new Set(prev).add(jobId));
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        jobs,
        filteredJobs,
        jobFilters,
        setJobFilters,
        login,
        logout,
        isAuthenticated: !!user,
        addJob,
        applyToJob,
        appliedJobs,
        getJobById
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
