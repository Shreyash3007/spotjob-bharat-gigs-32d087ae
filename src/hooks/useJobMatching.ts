import { useEffect, useState } from 'react';
import { JobPost, User } from '@/types';

interface MatchScores {
  skillMatch: number;
  locationMatch: number;
  payMatch: number;
  categoryMatch: number;
  userPreference: number;
}

export const useJobMatching = (currentUser?: User | null) => {
  const [userPreferences, setUserPreferences] = useState({
    preferredCategories: ['delivery', 'tech'],
    preferredPay: { min: 300, max: 1500 },
    preferredDistance: 10, // km
  });

  // Mock function to calculate match score between user and job
  const calculateMatchScore = (job: JobPost): MatchScores => {
    if (!currentUser) {
      return { 
        skillMatch: 0, 
        locationMatch: 0, 
        payMatch: 0, 
        categoryMatch: 0, 
        userPreference: 0 
      };
    }

    // Calculate skill match score
    const skillMatch = job.skills ? 
      job.skills.filter(skill => 
        currentUser.skills.includes(skill)
      ).length / Math.max(job.skills.length, 1) * 100 : 0;

    // Calculate location match based on distance
    let locationMatch = 0;
    if (currentUser.location && job.location) {
      const distance = calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        job.location.lat,
        job.location.lng
      );
      locationMatch = Math.max(0, 100 - (distance / userPreferences.preferredDistance) * 100);
    }

    // Calculate pay match score
    let payMatch = 0;
    const jobPay = typeof job.pay === 'number' ? 
      job.pay : 
      (job.pay && 'amount' in job.pay) ? 
        (job.pay as any).amount : 0;
    
    if (jobPay >= userPreferences.preferredPay.min && 
        jobPay <= userPreferences.preferredPay.max) {
      payMatch = 100;
    } else if (jobPay < userPreferences.preferredPay.min) {
      payMatch = (jobPay / userPreferences.preferredPay.min) * 100;
    } else {
      payMatch = (userPreferences.preferredPay.max / jobPay) * 100;
    }

    // Category match
    const categoryMatch = userPreferences.preferredCategories.includes(job.category) ? 100 : 50;

    // User preference (can be refined based on user behavior data)
    const userPreference = 70; // default value for now

    return {
      skillMatch,
      locationMatch,
      payMatch,
      categoryMatch,
      userPreference
    };
  };

  // Calculate overall match percentage
  const calculateOverallMatch = (scores: MatchScores): number => {
    const weights = {
      skillMatch: 0.3,
      locationMatch: 0.25,
      payMatch: 0.2,
      categoryMatch: 0.15,
      userPreference: 0.1
    };

    return (
      scores.skillMatch * weights.skillMatch +
      scores.locationMatch * weights.locationMatch +
      scores.payMatch * weights.payMatch +
      scores.categoryMatch * weights.categoryMatch +
      scores.userPreference * weights.userPreference
    );
  };

  // Get match quality label based on percentage
  const getMatchQuality = (percentage: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  };

  // Calculate distance between two coordinates in km (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Function to get job recommendations for a user
  const getRecommendedJobs = (jobs: JobPost[]): JobPost[] => {
    if (!currentUser) return jobs;

    const jobsWithMatches = jobs.map(job => {
      const matchScores = calculateMatchScore(job);
      const overallMatch = calculateOverallMatch(matchScores);
      return {
        ...job,
        matchScores,
        overallMatch,
        matchQuality: getMatchQuality(overallMatch)
      };
    });

    // Sort by match score
    return jobsWithMatches.sort((a, b) => (b as any).overallMatch - (a as any).overallMatch);
  };

  // Mock function to train model based on user interactions
  const trainModelOnInteraction = (job: JobPost, interactionType: 'apply' | 'view' | 'skip') => {
    // In a real app, this would update a machine learning model
    if (interactionType === 'apply') {
      // User likes this kind of job, update preferences
      setUserPreferences(prev => ({
        ...prev,
        preferredCategories: [
          ...new Set([...prev.preferredCategories, job.category])
        ]
      }));
    }
    // Other interaction types would be handled similarly
  };

  return {
    calculateMatchScore,
    calculateOverallMatch,
    getMatchQuality,
    getRecommendedJobs,
    trainModelOnInteraction,
    userPreferences,
    setUserPreferences
  };
};

// Keep the default export for backward compatibility
export default useJobMatching;
