import { useState, useEffect, useCallback } from "react";
import { JobPost, User } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { Coordinates, calculateDistance } from "@/lib/geolocation";

interface JobScore {
  jobId: string;
  score: number;
  matchFactors: {
    skillMatch: number;
    locationMatch: number;
    payMatch: number;
    categoryMatch: number;
    userPreference: number;
  };
}

interface JobMatchingOptions {
  prioritizeLocation?: boolean;
  prioritizePay?: boolean;
  prioritizeSkills?: boolean;
  maxDistance?: number;
  userLocation?: Coordinates | null;
}

// Weights for different matching factors (must sum to 1)
const DEFAULT_WEIGHTS = {
  skillMatch: 0.3,
  locationMatch: 0.25,
  payMatch: 0.2,
  categoryMatch: 0.15,
  userPreference: 0.1,
};

// User interaction data types
interface UserInteraction {
  jobId: string;
  action: "view" | "apply" | "favorite" | "reject";
  timestamp: number;
}

export function useJobMatching(
  jobs: JobPost[],
  user: User | null,
  options: JobMatchingOptions = {}
) {
  const [matchedJobs, setMatchedJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Store user interactions with jobs for learning preferences
  const [userInteractions, setUserInteractions] = useLocalStorage<UserInteraction[]>(
    "job_interactions",
    []
  );
  
  // User's preferred categories based on interaction history
  const [preferredCategories, setPreferredCategories] = useState<Record<string, number>>({});
  
  // User's preferred skills based on interaction history
  const [preferredSkills, setPreferredSkills] = useState<Record<string, number>>({});
  
  // Calculate the user's preferred categories and skills based on past interactions
  useEffect(() => {
    if (!userInteractions.length) return;
    
    const categoryScores: Record<string, number> = {};
    const skillScores: Record<string, number> = {};
    
    // Get positive interactions (apply or favorite)
    const positiveInteractions = userInteractions.filter(
      interaction => interaction.action === "apply" || interaction.action === "favorite"
    );
    
    // Calculate last 30 days (for recency bias)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    // Get jobs the user interacted with
    const interactedJobs = jobs.filter(job => 
      positiveInteractions.some(interaction => interaction.jobId === job.id)
    );
    
    // Calculate preference scores
    interactedJobs.forEach(job => {
      // Find the interaction
      const interaction = positiveInteractions.find(i => i.jobId === job.id);
      if (!interaction) return;
      
      // Calculate recency factor (1.0 for recent, 0.5 for older)
      const recencyFactor = interaction.timestamp > thirtyDaysAgo ? 1.0 : 0.5;
      
      // Action weight (apply = 2.0, favorite = 1.0)
      const actionWeight = interaction.action === "apply" ? 2.0 : 1.0;
      
      // Calculate total weight
      const weight = recencyFactor * actionWeight;
      
      // Update category score
      if (job.category) {
        categoryScores[job.category] = (categoryScores[job.category] || 0) + weight;
      }
      
      // Update skills scores
      job.skills.forEach(skill => {
        skillScores[skill] = (skillScores[skill] || 0) + weight;
      });
    });
    
    setPreferredCategories(categoryScores);
    setPreferredSkills(skillScores);
  }, [userInteractions, jobs]);
  
  // Record a user interaction with a job
  const recordInteraction = useCallback((jobId: string, action: "view" | "apply" | "favorite" | "reject") => {
    setUserInteractions(prev => {
      // Remove previous interactions with the same job and action to prevent duplicates
      const filtered = prev.filter(
        item => !(item.jobId === jobId && item.action === action)
      );
      
      // Add the new interaction
      return [...filtered, { jobId, action, timestamp: Date.now() }];
    });
  }, [setUserInteractions]);
  
  // Calculate match score for a single job
  const calculateJobScore = useCallback((job: JobPost): JobScore => {
    // Default scores if user is not logged in
    if (!user) {
      return {
        jobId: job.id,
        score: 0.5, // Default middle score
        matchFactors: {
          skillMatch: 0,
          locationMatch: 0,
          payMatch: 0,
          categoryMatch: 0,
          userPreference: 0,
        }
      };
    }
    
    // 1. Skill match score (0-1)
    const userSkills = user.skills || [];
    const skillMatchCount = job.skills.filter(skill => 
      userSkills.includes(skill)
    ).length;
    
    const skillMatchScore = userSkills.length 
      ? Math.min(1, skillMatchCount / Math.max(job.skills.length, 1))
      : 0.5; // Default if user has no skills
    
    // 2. Location match score (0-1)
    let locationMatchScore = 0.5; // Default score
    
    if (options.userLocation && job.location) {
      const distance = calculateDistance(options.userLocation, {
        latitude: job.location.lat,
        longitude: job.location.lng
      });
      
      // Convert distance to score (closer = higher score)
      // Max score at 0km, min score at maxDistance (default 50km)
      const maxDistance = options.maxDistance || 50;
      locationMatchScore = Math.max(0, 1 - (distance / maxDistance));
    }
    
    // 3. Pay match score (0-1)
    // Simple score based on pay amount (higher pay = higher score)
    // This could be improved with user preferences
    const payScale = job.payType === "hourly" ? 100 : 5000; // Scale for different pay types
    const payMatchScore = Math.min(1, job.pay / payScale);
    
    // 4. Category match score (0-1)
    let categoryMatchScore = 0.5; // Default score
    
    // If user has preferred categories, use them
    if (Object.keys(preferredCategories).length > 0) {
      const categoryScore = preferredCategories[job.category] || 0;
      const maxCategoryScore = Math.max(...Object.values(preferredCategories));
      categoryMatchScore = maxCategoryScore > 0 ? categoryScore / maxCategoryScore : 0.5;
    }
    
    // 5. User preference score based on past interactions (0-1)
    let userPreferenceScore = 0.5; // Default middle score
    
    // Calculate skill preference score
    let skillPreferenceScore = 0;
    let totalSkillWeight = 0;
    
    job.skills.forEach(skill => {
      const weight = preferredSkills[skill] || 0;
      skillPreferenceScore += weight;
      totalSkillWeight += weight > 0 ? 1 : 0;
    });
    
    // Normalize skill preference score
    if (totalSkillWeight > 0) {
      skillPreferenceScore /= totalSkillWeight;
      const maxSkillScore = Math.max(...Object.values(preferredSkills));
      userPreferenceScore = maxSkillScore > 0 ? skillPreferenceScore / maxSkillScore : 0.5;
    }
    
    // Adjust weights based on options
    let weights = { ...DEFAULT_WEIGHTS };
    
    if (options.prioritizeLocation) {
      weights = adjustWeights(weights, "locationMatch", 0.1);
    }
    
    if (options.prioritizePay) {
      weights = adjustWeights(weights, "payMatch", 0.1);
    }
    
    if (options.prioritizeSkills) {
      weights = adjustWeights(weights, "skillMatch", 0.1);
    }
    
    // Calculate final weighted score
    const matchFactors = {
      skillMatch: skillMatchScore,
      locationMatch: locationMatchScore,
      payMatch: payMatchScore,
      categoryMatch: categoryMatchScore,
      userPreference: userPreferenceScore,
    };
    
    const score = Object.keys(matchFactors).reduce((total, factor) => {
      return total + (matchFactors[factor as keyof typeof matchFactors] * weights[factor as keyof typeof weights]);
    }, 0);
    
    return {
      jobId: job.id,
      score,
      matchFactors,
    };
  }, [user, options.userLocation, options.maxDistance, preferredCategories, preferredSkills, options.prioritizeLocation, options.prioritizePay, options.prioritizeSkills]);
  
  // Rank and match jobs
  useEffect(() => {
    setIsLoading(true);
    
    // Calculate scores for all jobs
    const scoredJobs = jobs.map(job => ({
      job,
      ...calculateJobScore(job)
    }));
    
    // Sort by score descending
    const sortedJobs = scoredJobs.sort((a, b) => b.score - a.score);
    
    // Extract just the job objects
    const rankedJobs = sortedJobs.map(item => item.job);
    
    setMatchedJobs(rankedJobs);
    setIsLoading(false);
  }, [jobs, calculateJobScore]);
  
  return {
    matchedJobs,
    isLoading,
    recordInteraction,
  };
}

// Helper function to adjust weights
function adjustWeights(
  weights: Record<string, number>,
  priorityKey: string,
  increase: number
): Record<string, number> {
  const result = { ...weights };
  const keys = Object.keys(weights);
  
  // Increase the priority key
  result[priorityKey] += increase;
  
  // Distribute the decrease among other keys
  const decreasePerKey = increase / (keys.length - 1);
  
  keys.forEach(key => {
    if (key !== priorityKey) {
      result[key] -= decreasePerKey;
    }
  });
  
  return result;
} 