import React, { useState } from "react";
import { useGeolocation, Coordinates } from "@/lib/geolocation";
import { useJobMatching } from "@/hooks/useJobMatching";
import RadiusSelector from "@/components/RadiusSelector";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { EscrowPayment } from "@/components/payment/EscrowPayment";
import { JobPost, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Search,
  Briefcase,
  Calendar,
  Clock,
  IndianRupee,
  Filter,
  SlidersHorizontal,
  Star,
  StarHalf,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Mock user data
const currentUser: User = {
  id: "user1",
  name: "Rahul Sharma",
  email: "rahul@example.com",
  skills: ["Web Development", "JavaScript", "React", "UI Design"],
  verificationLevel: "email",
};

// Mock job data
const mockJobs: JobPost[] = [
  {
    id: "job1",
    title: "Website UI Redesign",
    description: "Redesign the landing page for a local restaurant website",
    category: "Design",
    skills: ["UI Design", "HTML", "CSS"],
    pay: 4500,
    payType: "fixed",
    duration: "3 days",
    location: { lat: 28.6139, lng: 77.2090 }, // Delhi
    postedBy: {
      id: "employer1",
      name: "Priya's Restaurant",
      verificationLevel: "premium",
    },
    postedDate: new Date("2023-10-15").toISOString(),
  },
  {
    id: "job2",
    title: "React Component Development",
    description: "Create 5 reusable React components for an e-commerce website",
    category: "Development",
    skills: ["React", "JavaScript", "UI Design"],
    pay: 120,
    payType: "hourly",
    duration: "1 week",
    location: { lat: 28.5355, lng: 77.3910 }, // Noida
    postedBy: {
      id: "employer2",
      name: "TechSolutions Ltd",
      verificationLevel: "id",
    },
    postedDate: new Date("2023-10-20").toISOString(),
  },
  {
    id: "job3",
    title: "Content Writing for Blog",
    description: "Write 5 blog posts about sustainable living",
    category: "Writing",
    skills: ["Content Writing", "Blogging", "Research"],
    pay: 3000,
    payType: "fixed",
    duration: "5 days",
    location: { lat: 28.7041, lng: 77.1025 }, // Delhi NCR
    postedBy: {
      id: "employer3",
      name: "EcoLiving Blog",
      verificationLevel: "basic",
    },
    postedDate: new Date("2023-10-18").toISOString(),
  },
  {
    id: "job4",
    title: "App Bug Fixes",
    description: "Fix 3 critical bugs in a Flutter mobile app",
    category: "Development",
    skills: ["Flutter", "Dart", "Mobile Development"],
    pay: 150,
    payType: "hourly",
    duration: "2 days",
    location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
    postedBy: {
      id: "employer4",
      name: "AppDev Studio",
      verificationLevel: "id",
    },
    postedDate: new Date("2023-10-22").toISOString(),
  },
  {
    id: "job5",
    title: "Video Editing for YouTube",
    description: "Edit a 15-minute video for a tech review channel",
    category: "Multimedia",
    skills: ["Video Editing", "Adobe Premiere", "Animation"],
    pay: 5000,
    payType: "fixed",
    duration: "2 days",
    location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    postedBy: {
      id: "employer5",
      name: "TechTalks",
      verificationLevel: "email",
    },
    postedDate: new Date("2023-10-19").toISOString(),
  },
  {
    id: "job6",
    title: "Local Data Collection",
    description: "Visit 10 shops in your area and collect pricing information",
    category: "Research",
    skills: ["Data Collection", "Research", "Local Knowledge"],
    pay: 2000,
    payType: "fixed",
    duration: "1 day",
    location: { lat: 28.6129, lng: 77.2295 }, // Delhi (close to user)
    postedBy: {
      id: "employer6",
      name: "Market Research Inc",
      verificationLevel: "phone",
    },
    postedDate: new Date("2023-10-23").toISOString(),
  },
];

const JobListingPage: React.FC = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [radius, setRadius] = useState<number>(10);
  const [appliedFilters, setAppliedFilters] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Get user's geolocation
  const { coordinates, error: geoError } = useGeolocation();

  // Use job matching hook
  const { matchedJobs, recordInteraction } = useJobMatching(mockJobs, currentUser, {
    userLocation: coordinates,
    maxDistance: radius,
    prioritizeLocation: sortBy === "distance",
    prioritizePay: sortBy === "pay",
    prioritizeSkills: sortBy === "skills",
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter jobs based on search, category, and active tab
  const filteredJobs = matchedJobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = category === "" || job.category === category;
    
    // Filter by tab selection (all, nearby, matching)
    if (activeTab === "nearby" && coordinates) {
      const isNearby = job.location && calculateDistanceFromUser(job.location, coordinates) <= radius;
      return matchesSearch && matchesCategory && isNearby;
    } else if (activeTab === "matching") {
      // Find jobs that match at least 2 of the user's skills
      const skillMatchCount = job.skills.filter(skill => 
        currentUser.skills.includes(skill)
      ).length;
      return matchesSearch && matchesCategory && skillMatchCount >= 2;
    }

    return matchesSearch && matchesCategory;
  });

  // Calculate distance between job location and user
  const calculateDistanceFromUser = (
    jobLocation: { lat: number; lng: number },
    userLocation: Coordinates
  ) => {
    const EARTH_RADIUS_KM = 6371;
    const dLat = toRad(userLocation.latitude - jobLocation.lat);
    const dLon = toRad(userLocation.longitude - jobLocation.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(jobLocation.lat)) * Math.cos(toRad(userLocation.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return EARTH_RADIUS_KM * c;
  };

  // Convert degrees to radians
  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  // Format distance to show km or m
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Handle job view
  const handleViewJob = (job: JobPost) => {
    setSelectedJob(job);
    recordInteraction(job.id, "view");
  };

  // Handle apply for job
  const handleApplyJob = (job: JobPost) => {
    recordInteraction(job.id, "apply");
    setShowPaymentDialog(true);
  };

  // Handle payment completion
  const handlePaymentComplete = (transactionId: string) => {
    setShowPaymentDialog(false);
    
    // In a real app, you would update the job application status in the backend
    alert(`Job application successful! Transaction ID: ${transactionId}`);
  };

  // Calculate match score display (simplified for UI)
  const calculateMatchDisplay = (job: JobPost) => {
    const userSkills = currentUser.skills || [];
    const skillMatchCount = job.skills.filter(skill => 
      userSkills.includes(skill)
    ).length;
    
    const percentage = Math.min(100, Math.round((skillMatchCount / job.skills.length) * 100));
    
    // Return 1-5 stars based on percentage
    if (percentage >= 80) return 5;
    if (percentage >= 60) return 4;
    if (percentage >= 40) return 3;
    if (percentage >= 20) return 2;
    return 1;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Local Gigs</h1>
        <p className="text-muted-foreground">
          Discover short-term jobs that match your skills in your area
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs, skills, or keywords"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <Briefcase className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
                <SelectItem value="Multimedia">Multimedia</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="pay">Highest Pay</SelectItem>
                <SelectItem value="skills">Skill Match</SelectItem>
                <SelectItem value="date">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <RadiusSelector 
            radius={radius} 
            onChange={setRadius} 
            className="w-full md:w-80" 
          />
          
          <div className="ml-auto flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setAppliedFilters(!appliedFilters)}
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Location warning if geolocation is not available */}
      {geoError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Location access denied</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>
                  Enable location access for better job matching based on your location.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="matching">Matching Skills</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Posted by {job.postedBy.name}
                    </p>
                  </div>
                  <VerificationBadge level={job.postedBy.verificationLevel} size="sm" />
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-2 mb-4">{job.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{job.duration}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <IndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {job.pay} {job.payType === "hourly" ? "/hr" : "fixed"}
                    </span>
                  </div>
                  {coordinates && job.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDistance(calculateDistanceFromUser(job.location, coordinates))}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {job.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="font-normal">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 3 && (
                    <Badge variant="outline" className="font-normal">
                      +{job.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between items-center">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const matchScore = calculateMatchDisplay(job);
                    if (index < Math.floor(matchScore)) {
                      return <Star key={index} className="h-4 w-4 text-yellow-400" />;
                    } else if (index < matchScore) {
                      return <StarHalf key={index} className="h-4 w-4 text-yellow-400" />;
                    }
                    return <Star key={index} className="h-4 w-4 text-muted-foreground/30" />;
                  })}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewJob(job)}>
                    View
                  </Button>
                  <Button size="sm" onClick={() => handleApplyJob(job)}>
                    Apply
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="bg-muted rounded-full p-6 mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-1">No jobs found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Try adjusting your search filters or increasing your radius to find more jobs.
            </p>
          </div>
        )}
      </div>

      {/* Job Detail Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedJob(null)}
                  className="absolute right-4 top-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Posted by {selectedJob.postedBy.name}</span>
                <VerificationBadge level={selectedJob.postedBy.verificationLevel} />
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Job Description</h3>
                  <p>{selectedJob.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-4">Job Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <IndianRupee className="mr-2 h-4 w-4" />
                          Payment
                        </span>
                        <span className="font-medium">
                          ₹{selectedJob.pay} {selectedJob.payType === "hourly" ? "/hr" : "fixed"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Duration
                        </span>
                        <span className="font-medium">{selectedJob.duration}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Posted Date
                        </span>
                        <span className="font-medium">
                          {new Date(selectedJob.postedDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {coordinates && selectedJob.location && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            Distance
                          </span>
                          <span className="font-medium">
                            {formatDistance(
                              calculateDistanceFromUser(
                                selectedJob.location,
                                coordinates
                              )
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleApplyJob(selectedJob)}
                >
                  Apply for Job
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      {selectedJob && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Application</DialogTitle>
              <DialogDescription>
                Secure payment will be held in escrow until job completion
              </DialogDescription>
            </DialogHeader>
            
            <EscrowPayment
              jobId={selectedJob.id}
              amount={selectedJob.payType === "fixed" ? selectedJob.pay : selectedJob.pay * 8} // Assuming 8 hours for hourly jobs
              onPaymentComplete={handlePaymentComplete}
              onCancel={() => setShowPaymentDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default JobListingPage; 