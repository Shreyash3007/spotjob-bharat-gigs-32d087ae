
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/context/JobContext";
import { ArrowLeft, ArrowRight, Filter, Star, MapPin } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { JobCategory, JobFilter } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";

const JobSwipe = () => {
  const { user } = useAuth();
  const { filteredJobs, jobFilters, setJobFilters } = useJobs();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<JobFilter>({
    ...jobFilters,
    distance: jobFilters.distance || 10,
  });
  const [animationClass, setAnimationClass] = useState("");

  // Category options with display names
  const categoryOptions: {label: string; value: JobCategory}[] = [
    { label: "Delivery", value: "delivery" },
    { label: "Tutoring", value: "tutoring" },
    { label: "Tech Work", value: "tech" },
    { label: "Babysitting", value: "babysitting" },
    { label: "Housekeeping", value: "housekeeping" },
    { label: "Events", value: "event" },
    { label: "Other", value: "other" }
  ];

  const handleSwipe = (direction: "left" | "right") => {
    setAnimationClass(direction === "right" ? "animate-swipe-right" : "animate-swipe-left");
    
    // Reset animation and move to next card after animation completes
    setTimeout(() => {
      setAnimationClass("");
      setCurrentIndex(idx => idx + 1);
    }, 500);
  };

  const handleFilterChange = (key: keyof JobFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryChange = (category: JobCategory, checked: boolean) => {
    const current = filters.category || [];
    const updated = checked 
      ? [...current, category]
      : current.filter(c => c !== category);
    
    handleFilterChange('category', updated);
  };

  const applyFilters = () => {
    setJobFilters(filters);
  };

  const currentCardJob = filteredJobs[currentIndex];
  const hasMoreJobs = currentIndex < filteredJobs.length;

  const categoryIcons: Record<JobCategory, string> = {
    delivery: "🚚",
    tutoring: "📚",
    tech: "💻",
    babysitting: "👶",
    housekeeping: "🧹",
    event: "🎭",
    other: "🛠️"
  };

  // Helper function to get address from location object
  const getAddress = (job: typeof currentCardJob) => {
    if (!job) return 'Location unavailable';
    
    if (typeof job.location === 'object' && job.location) {
      return 'address' in job.location ? job.location.address : 'Location unavailable';
    }
    return 'Location unavailable';
  };

  return (
    <PageLayout 
      title="Find Jobs" 
      description="Swipe through available jobs that match your skills and interests"
    >
      <div className="flex flex-col items-center max-w-4xl mx-auto">
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex-grow"></div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Jobs</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <Label>Distance (km)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{filters.distance} km</span>
                  </div>
                  <Slider 
                    defaultValue={[filters.distance || 10]} 
                    max={50}
                    step={1}
                    className="py-2"
                    onValueChange={(values) => handleFilterChange('distance', values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOptions.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category.value}`} 
                          checked={(filters.category || []).includes(category.value)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category.value, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`category-${category.value}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Pay Range (₹)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={filters.payMin || ""}
                      onChange={(e) => handleFilterChange('payMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={filters.payMax || ""}
                      onChange={(e) => handleFilterChange('payMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={filters.sortBy === 'newest' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('sortBy', 'newest')}
                    >
                      Newest
                    </Button>
                    <Button 
                      variant={filters.sortBy === 'pay_high_to_low' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('sortBy', 'pay_high_to_low')}
                    >
                      Highest Pay
                    </Button>
                    <Button 
                      variant={filters.sortBy === 'pay_low_to_high' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('sortBy', 'pay_low_to_high')}
                    >
                      Lowest Pay
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={applyFilters}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="w-full max-w-lg h-[520px] flex flex-col items-center">
          <AnimatePresence>
            {hasMoreJobs ? (
              <motion.div 
                key={currentIndex}
                className="relative w-full h-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`absolute inset-0 ${animationClass}`}>
                  {currentCardJob && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-lg overflow-hidden h-full flex flex-col">
                      {/* Card Header */}
                      <div className="p-5 border-b">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold">{currentCardJob.title}</h2>
                          <span className="text-2xl">{categoryIcons[currentCardJob.category]}</span>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          {getAddress(currentCardJob)}
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-5 flex-1 overflow-auto">
                        <div className="mb-4">
                          <Label className="text-xs text-muted-foreground">POSTED BY</Label>
                          <div className="flex items-center mt-1">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium mr-2">
                              {currentCardJob.posterName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{currentCardJob.posterName}</div>
                              <div className="flex items-center text-xs">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                                <span>{('posterRating' in currentCardJob ? currentCardJob.posterRating : 4.5).toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-accent/50 p-3 rounded-lg">
                            <div className="text-xs text-muted-foreground">Pay</div>
                            <div className="text-lg font-semibold text-primary">
                              ₹{typeof currentCardJob.pay === 'object' && currentCardJob.pay && 'amount' in currentCardJob.pay ? 
                                currentCardJob.pay.amount : 
                                typeof currentCardJob.pay === 'number' ? 
                                  currentCardJob.pay : 
                                  'N/A'}
                            </div>
                          </div>
                          <div className="bg-accent/50 p-3 rounded-lg">
                            <div className="text-xs text-muted-foreground">Duration</div>
                            <div className="font-medium">{currentCardJob.duration}</div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">DESCRIPTION</Label>
                          <p className="mt-1 text-sm whitespace-pre-line">{currentCardJob.description}</p>
                        </div>
                      </div>
                      
                      <div className="p-5 border-t bg-accent/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <Badge variant="outline" className="bg-accent">
                              {currentCardJob.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Posted {new Date(currentCardJob.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center h-full w-full border rounded-xl p-8 bg-accent/10 animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-semibold mb-2">No more jobs</h3>
                <p className="text-muted-foreground text-center mb-6">
                  You've seen all available jobs matching your filters.
                </p>
                <Button onClick={() => setCurrentIndex(0)}>
                  Start Over
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {hasMoreJobs && (
            <div className="flex justify-center mt-6 gap-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => handleSwipe("left")}
                  className="rounded-full h-14 w-14 p-0 border-2"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  size="lg"
                  onClick={() => handleSwipe("right")}
                  className="rounded-full h-14 w-14 p-0 bg-primary border-none"
                >
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          )}
        </div>

        <motion.div 
          className="w-full mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium">How it works</h3>
            <p className="text-muted-foreground text-sm">Swipe through jobs to find your next opportunity</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary mx-auto mb-2">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <p className="text-sm">Swipe left to skip</p>
            </div>
            <div className="p-4">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary mx-auto mb-2">
                <ArrowRight className="h-4 w-4" />
              </div>
              <p className="text-sm">Swipe right to apply</p>
            </div>
            <div className="p-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-2">
                ✓
              </div>
              <p className="text-sm">Get hired!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default JobSwipe;
