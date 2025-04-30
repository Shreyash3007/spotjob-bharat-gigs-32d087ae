
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, List, Loader2, MapPin, LayoutGrid } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { JobCategory, JobFilter } from "@/types";

const MapView = () => {
  const { filteredJobs, user, jobFilters, setJobFilters } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
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

  // Initialize Mapbox
  useEffect(() => {
    // Set Mapbox access token
    mapboxgl.accessToken = "pk.eyJ1Ijoic2hyZXlhc2gwNDUiLCJhIjoiY21hNGI5YXhzMDNwcTJqczYyMnR3OWdkcSJ9.aVpyfgys6f-h27ftG_63Zw";
    
    // Create map instance if mapRef is available and no map exists yet
    if (mapRef.current && !map) {
      // Initialize map centered on India
      const newMap = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [78.9629, 20.5937], // Center of India
        zoom: 4,
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), "top-right");
      
      // Set map loaded state when map is ready
      newMap.on("load", () => {
        setIsMapLoaded(true);
        setMap(newMap);
      });
    }

    return () => {
      // Clean up map when component unmounts
      if (map) map.remove();
    };
  }, [mapRef]);

  // Add job markers when map and jobs are loaded
  useEffect(() => {
    if (map && isMapLoaded && filteredJobs.length > 0) {
      // Remove any existing markers
      markers.forEach(marker => marker.remove());
      const newMarkers: mapboxgl.Marker[] = [];

      // Create markers for each job
      filteredJobs.forEach((job, index) => {
        // Create a custom marker element
        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-all';
        el.textContent = (index + 1).toString();
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.backgroundColor = '#7c3aed';
        el.style.color = 'white';
        el.style.borderRadius = '50%';
        el.style.fontWeight = 'bold';
        el.style.cursor = 'pointer';
        
        // Use the job's actual location data
        const lng = job.location.lng;
        const lat = job.location.lat;
        
        // Create and add the marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map);
          
        // Add click event
        el.addEventListener('click', () => {
          setSelectedJob(job.id);
        });
        
        newMarkers.push(marker);
      });
      
      setMarkers(newMarkers);
    }
  }, [map, isMapLoaded, filteredJobs]);

  const selectedJobData = filteredJobs.find(job => job.id === selectedJob);

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

  return (
    <Layout fullHeight>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Jobs Near You</h2>
          <div className="flex items-center gap-2">
            <div className="bg-accent rounded-md flex p-1">
              <Button 
                variant={viewMode === "map" ? "default" : "ghost"} 
                size="sm" 
                className="h-8 px-2"
                onClick={() => setViewMode("map")}
              >
                <MapPin className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Map</span>
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm" 
                className="h-8 px-2"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">List</span>
              </Button>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Filters</span>
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
        </div>
        
        <div className="flex-1 grid md:grid-cols-3 gap-4 h-[calc(100%-48px)]">
          {viewMode === "map" ? (
            <>
              <div className="md:col-span-2 h-full rounded-xl overflow-hidden border bg-card">
                {!isMapLoaded ? (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <span className="text-muted-foreground">Loading map...</span>
                  </div>
                ) : (
                  <div ref={mapRef} className="h-full w-full rounded-xl" />
                )}
              </div>
              
              <div className="flex flex-col overflow-hidden">
                {selectedJobData ? (
                  <div className="flex flex-col h-full animate-fade-in">
                    <JobCard job={selectedJobData} />
                    <Button 
                      variant="ghost" 
                      className="mt-2"
                      onClick={() => setSelectedJob(null)}
                    >
                      Back to list
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto space-y-3 pr-1 animate-slide-up">
                    <p className="text-sm text-muted-foreground mb-4">
                      Click on a marker to view job details
                    </p>
                    {filteredJobs.map((job, index) => (
                      <div 
                        key={job.id} 
                        className="p-4 border rounded-lg cursor-pointer hover:border-primary/30 hover:bg-accent/30 transition-all"
                        onClick={() => setSelectedJob(job.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{job.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 flex items-center">
                              <MapPin className="h-3 w-3 mr-1 inline" />
                              {job.location.address}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-semibold text-primary">₹{job.pay.amount}</span>
                              <Badge variant="outline" className="bg-accent/50 hover:bg-accent/80">
                                {job.duration}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="col-span-3 grid sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
              {filteredJobs.map((job) => (
                <Link to={`/job/${job.id}`} key={job.id} className="block">
                  <Card className="h-full hover:border-primary/30 transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        <div>
                          <h3 className="font-medium line-clamp-1">{job.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1 inline flex-shrink-0" />
                            {job.location.address}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 my-3">{job.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="font-medium text-primary">₹{job.pay.amount}</span>
                          <Badge variant="outline" className="bg-accent/50 hover:bg-accent/80">
                            {job.duration}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MapView;
