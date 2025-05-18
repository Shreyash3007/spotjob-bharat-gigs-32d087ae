
import React, { createContext, useContext, useState, useEffect } from "react";
import { JobPost, JobFilter } from "../types";
import { mockJobs } from "../data/mockData";
import { useAuth } from "./AuthContext";
import { mockSupabase } from "@/integrations/supabase/client"; // Use mockSupabase for now
import { toast } from "sonner";

interface JobContextType {
  jobs: JobPost[];
  filteredJobs: JobPost[];
  jobFilters: JobFilter;
  setJobFilters: (filters: JobFilter) => void;
  addJob: (job: Omit<JobPost, "id" | "postedDate" | "postedBy">) => Promise<{ success: boolean; error?: any; jobId?: string }>;
  applyToJob: (jobId: string) => Promise<{ success: boolean; error?: any }>;
  appliedJobs: Set<string>;
  getJobById: (id: string) => JobPost | undefined;
  saveJob: (jobId: string) => Promise<{ success: boolean; error?: any }>;
  savedJobs: Set<string>;
  loading: boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
  const [jobFilters, setJobFilters] = useState<JobFilter>({});
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Initialize jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from the API
        // For now using mockJobs with a slight delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        setJobs(mockJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch applied and saved jobs
  useEffect(() => {
    if (user) {
      fetchUserJobInteractions();
    } else {
      // Reset when logged out
      setAppliedJobs(new Set());
      setSavedJobs(new Set());
    }
  }, [user]);

  // Fetch user's job interactions (applications, saved jobs)
  const fetchUserJobInteractions = async () => {
    if (!user) return;
    
    try {
      // Using mockSupabase for now until DB types are updated
      // In a real implementation, we would fetch from actual tables
      
      // Mock applied jobs
      const mockApplications = [
        { job_id: mockJobs[0].id },
        { job_id: mockJobs[2].id }
      ];
      
      if (mockApplications) {
        const appliedJobIds = new Set(mockApplications.map(app => app.job_id));
        setAppliedJobs(appliedJobIds);
      }
      
      // Mock saved jobs
      const mockSaved = [
        { job_id: mockJobs[1].id },
        { job_id: mockJobs[3].id }
      ];
      
      if (mockSaved) {
        const savedJobIds = new Set(mockSaved.map(item => item.job_id));
        setSavedJobs(savedJobIds);
      }
    } catch (error) {
      console.error("Error fetching job interactions:", error);
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
      filtered = filtered.filter(job => {
        const payAmount = typeof job.pay === 'number' ? job.pay : 
                         (job.pay && typeof job.pay === 'object' && 'amount' in job.pay) ? job.pay.amount : 0;
        return payAmount >= (jobFilters.payMin || 0);
      });
    }

    if (jobFilters.payMax !== undefined) {
      filtered = filtered.filter(job => {
        const payAmount = typeof job.pay === 'number' ? job.pay : 
                         (job.pay && typeof job.pay === 'object' && 'amount' in job.pay) ? job.pay.amount : 0;
        return payAmount <= (jobFilters.payMax || Infinity);
      });
    }

    // Filter by skills if specified
    if (jobFilters.skills && jobFilters.skills.length > 0) {
      filtered = filtered.filter(job => 
        jobFilters.skills?.some(skill => job.skills.includes(skill))
      );
    }

    // Sort jobs
    if (jobFilters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else if (jobFilters.sortBy === 'pay_high_to_low') {
      filtered.sort((a, b) => {
        const payA = typeof a.pay === 'number' ? a.pay : 
                     (a.pay && typeof a.pay === 'object' && 'amount' in a.pay) ? a.pay.amount : 0;
        const payB = typeof b.pay === 'number' ? b.pay : 
                     (b.pay && typeof b.pay === 'object' && 'amount' in b.pay) ? b.pay.amount : 0;
        return (payB) - (payA);
      });
    } else if (jobFilters.sortBy === 'pay_low_to_high') {
      filtered.sort((a, b) => {
        const payA = typeof a.pay === 'number' ? a.pay : 
                     (a.pay && typeof a.pay === 'object' && 'amount' in a.pay) ? a.pay.amount : 0;
        const payB = typeof b.pay === 'number' ? b.pay : 
                     (b.pay && typeof b.pay === 'object' && 'amount' in b.pay) ? b.pay.amount : 0;
        return (payA) - (payB);
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, jobFilters]);

  const addJob = async (newJob: Omit<JobPost, "id" | "postedDate" | "postedBy">) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const jobData = {
        ...newJob,
        posted_by: user.id,
        posted_date: new Date().toISOString(),
        status: "open"
      };
      
      // Using mockSupabase for now
      const response = await mockSupabase
        .from('jobs')
        .insert([jobData])
        .select('id');
        
      const data = { id: `mock-${Date.now()}` };
      
      // Add to local state
      const jobToAdd: JobPost = {
        ...newJob,
        id: data.id,
        postedDate: new Date().toISOString(),
        postedBy: {
          id: user.id,
          name: user.name || '',
          verificationLevel: user.verificationLevel || 'basic'
        }
      };
      
      setJobs(prevJobs => [jobToAdd, ...prevJobs]);
      toast.success("Job posted successfully");
      
      return { success: true, jobId: data.id };
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Failed to post job");
      return { success: false, error };
    }
  };

  const applyToJob = async (jobId: string) => {
    if (!user) return { success: false, error: "Not authenticated" };
    
    try {
      // Check if already applied
      if (appliedJobs.has(jobId)) {
        return { success: false, error: "You have already applied to this job" };
      }
      
      const application = {
        job_id: jobId,
        applicant_id: user.id,
        status: "pending",
        applied_at: new Date().toISOString()
      };
      
      // Using mockSupabase for now
      await mockSupabase
        .from('job_applications')
        .insert([application]);
        
      // Update local state
      setAppliedJobs(prev => new Set([...prev, jobId]));
      toast.success("Application submitted successfully");
      
      return { success: true };
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Failed to submit application");
      return { success: false, error };
    }
  };

  const saveJob = async (jobId: string) => {
    if (!user) return { success: false, error: "Not authenticated" };
    
    try {
      const isSaved = savedJobs.has(jobId);
      
      if (isSaved) {
        // Unsave job using mockSupabase for now
        await mockSupabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
          
        // Update local state
        setSavedJobs(prev => {
          const updated = new Set(prev);
          updated.delete(jobId);
          return updated;
        });
        
        toast.success("Job removed from saved jobs");
      } else {
        // Save job
        const savedJob = {
          user_id: user.id,
          job_id: jobId,
          saved_at: new Date().toISOString()
        };
        
        // Using mockSupabase for now
        await mockSupabase
          .from('saved_jobs')
          .insert([savedJob]);
          
        // Update local state
        setSavedJobs(prev => new Set([...prev, jobId]));
        toast.success("Job saved successfully");
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error saving/unsaving job:", error);
      toast.error("Failed to save job");
      return { success: false, error };
    }
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  const value = {
    jobs,
    filteredJobs,
    jobFilters,
    setJobFilters,
    addJob,
    applyToJob,
    appliedJobs,
    getJobById,
    saveJob,
    savedJobs,
    loading
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobs = () => {
  const context = useContext(JobContext);
  
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  
  return context;
};
