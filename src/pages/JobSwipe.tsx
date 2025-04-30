
import { useState } from "react";
import Layout from "@/components/Layout";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, ArrowRight, Filter } from "lucide-react";
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

const JobSwipe = () => {
  const { filteredJobs, jobFilters, setJobFilters } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<JobFilter>({
    ...jobFilters,
    distance: jobFilters.distance || 10,
  });

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
    // If right swipe, apply to job
    if (direction === "right" && currentCardJob) {
      // Application logic handled inside JobCard
    }
    setTimeout(() => {
      setCurrentIndex(idx => idx + 1);
    }, 300);
  };

  const handleButtonSwipe = (direction: "left" | "right") => {
    handleSwipe(direction);
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

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Find Jobs</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
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
                      variant={filters.sortBy === 'pay' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('sortBy', 'pay')}
                    >
                      Highest Pay
                    </Button>
                    <Button 
                      variant={filters.sortBy === 'distance' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('sortBy', 'distance')}
                    >
                      Nearest
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

        <div className="w-full max-w-md h-[500px] flex flex-col items-center">
          {hasMoreJobs ? (
            <div className="relative w-full h-full">
              <div className="absolute inset-0">
                <JobCard job={currentCardJob} onSwipe={handleSwipe} swipeable />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full border rounded-lg p-8 bg-muted/20">
              <h3 className="text-xl font-semibold mb-2">No more jobs</h3>
              <p className="text-muted-foreground text-center mb-4">
                You've seen all available jobs matching your filters.
              </p>
              <Button onClick={() => setCurrentIndex(0)}>
                Start Over
              </Button>
            </div>
          )}
          
          {hasMoreJobs && (
            <div className="flex justify-center mt-4 gap-4">
              <Button 
                size="lg"
                variant="outline"
                onClick={() => handleButtonSwipe("left")}
                className="rounded-full h-12 w-12 p-0"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <Button 
                size="lg"
                onClick={() => handleButtonSwipe("right")}
                className="rounded-full h-12 w-12 p-0"
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobSwipe;
