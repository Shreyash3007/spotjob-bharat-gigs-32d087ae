
import { useEffect, useState, useRef } from 'react';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { MapPin, Search, Filter, X, AlertTriangle, Loader2 } from "lucide-react";
import { JobPost } from '@/types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Default Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hyZXlhc2gwNDUiLCJhIjoiY21hNGI5YXhzMDNwcTJqczYyMnR3OWdkcSJ9.aVpyfgys6f-h27ftG_63Zw';

const MapView = () => {
  const { jobs, filteredJobs, setJobFilters } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const popup = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [73.8567, 18.5204], // Default to Pune, India
        zoom: 12,
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        setMapLoaded(true);
        setLoading(false);
      });

      map.current.on('error', (e) => {
        console.error("Map error:", e);
        setError("Failed to load map. Please check your connection or API token.");
        setLoading(false);
      });

      // Create popup but don't add to map yet
      popup.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        className: 'custom-popup'
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please check your API token.");
      setLoading(false);
    }
  }, []);

  // Add markers when filteredJobs or map updates
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};
    
    // Add markers for each job
    filteredJobs.forEach(job => {
      if (job.location && job.location.lat && job.location.lng) {
        // Create HTML element for marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '35px';
        el.style.height = '35px';
        el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="%237c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>')`;
        el.style.backgroundSize = '100%';
        el.style.cursor = 'pointer';
        
        // Add pulse animation
        const pulse = document.createElement('div');
        pulse.className = 'marker-pulse';
        pulse.style.position = 'absolute';
        pulse.style.width = '50px';
        pulse.style.height = '50px';
        pulse.style.borderRadius = '50%';
        pulse.style.backgroundColor = 'rgba(124, 58, 237, 0.2)';
        pulse.style.transform = 'translate(-25%, -25%)';
        pulse.style.animation = 'pulse-animation 2s infinite';
        el.appendChild(pulse);
        
        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[240px] rounded-lg shadow-md bg-white dark:bg-gray-800 border-t-4 border-primary">
            <h3 class="font-medium text-lg">${job.title}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">₹${job.pay.amount} · ${job.duration}</p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">${job.category}</span>
              <button class="text-xs text-primary font-medium">View details</button>
            </div>
          </div>
        `;
        
        // Create marker and add to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([job.location.lng, job.location.lat])
          .setPopup(new mapboxgl.Popup({ 
            offset: 25,
            className: 'custom-popup'
          }).setHTML(popupContent))
          .addTo(map.current);
        
        // Add click event to marker
        el.addEventListener('click', () => {
          setSelectedJob(job);
        });
        
        // Store marker reference
        markers.current[job.id] = marker;
      }
    });
    
    // If there are jobs with valid locations, fit map to show all markers
    if (Object.keys(markers.current).length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      Object.values(markers.current).forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [filteredJobs, mapLoaded]);

  const handleSearch = () => {
    setJobFilters({ category: undefined, distance: undefined, payMin: undefined, payMax: undefined, duration: undefined, sortBy: undefined });
    if (searchQuery.trim()) {
      // In a real app, you would update the filters to include search
      toast.info(`Searching for "${searchQuery}"`, { duration: 2000 });
    }
  };

  const handleJobCardClick = (job: JobPost) => {
    navigate(`/job/${job.id}`);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-5rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Sidebar with jobs list */}
          <div className="md:col-span-1 h-full overflow-y-auto">
            <Card className="h-full border-0 md:border shadow-none md:shadow-md rounded-none md:rounded-lg bg-background/80 backdrop-blur-md">
              <CardHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b pb-4">
                <CardTitle className="text-xl flex justify-between items-center">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                  >
                    Jobs Near You
                  </motion.span>
                  <Badge variant="outline" className="font-normal bg-gradient-to-r from-primary/10 to-blue-400/10 animate-pulse">
                    {filteredJobs.length} found
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background/50 border-muted/60 focus:border-primary/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'bg-accent' : ''}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-2 mt-2"
                  >
                    <div>
                      <label className="text-xs text-muted-foreground">Category</label>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="tutoring">Tutoring</SelectItem>
                          <SelectItem value="tech">Tech</SelectItem>
                          <SelectItem value="event">Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Sort By</label>
                      <Select defaultValue="distance">
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Distance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="distance">Nearest</SelectItem>
                          <SelectItem value="pay">Highest Pay</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {filteredJobs.length > 0 ? (
                  <div className="divide-y">
                    {filteredJobs.map((job) => (
                      <motion.div 
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                          selectedJob?.id === job.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedJob(job)}
                      >
                        <h3 className="font-medium text-lg">{job.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location.address}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-primary font-medium">₹{job.pay.amount}</span>
                          <Badge variant="outline" className="bg-gradient-to-r from-primary/5 to-blue-400/5">{job.category}</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center justify-center py-12 px-4 text-center"
                  >
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-blob">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No jobs found</h3>
                    <p className="text-muted-foreground text-sm">
                      Try adjusting your search or filters
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Map */}
          <div className="md:col-span-2 h-full relative">
            <div ref={mapContainer} className="h-full w-full rounded-lg border overflow-hidden"></div>
            
            {/* Add the pulse animation styles */}
            <style jsx="true">{`
              @keyframes pulse-animation {
                0% {
                  transform: scale(0.5);
                  opacity: 1;
                }
                100% {
                  transform: scale(2);
                  opacity: 0;
                }
              }
              
              .custom-popup {
                border-radius: 8px !important;
                overflow: hidden !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
              }
              
              .custom-popup .mapboxgl-popup-content {
                padding: 0 !important;
                border-radius: 8px !important;
                overflow: hidden !important;
              }
              
              .custom-popup .mapboxgl-popup-tip {
                border-top-color: #7c3aed !important;
              }
            `}</style>
            
            {/* Loading overlay */}
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"
              >
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="font-medium">Loading map...</p>
                </div>
              </motion.div>
            )}
            
            {/* Selected job card */}
            {selectedJob && mapLoaded && !loading && !error && (
              <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <Card className="shadow-lg border bg-card/95 backdrop-blur-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedJob(null)}
                      className="absolute top-2 right-2 h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardContent className="p-4 pb-6">
                      <motion.h3 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="font-medium text-lg mb-1"
                      >
                        {selectedJob.title}
                      </motion.h3>
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-1 text-sm text-muted-foreground"
                      >
                        <MapPin className="h-3 w-3" />
                        <span>{selectedJob.location.address}</span>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-between items-center mt-2 mb-3"
                      >
                        <span className="text-primary font-medium">₹{selectedJob.pay.amount}</span>
                        <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-blue-400/10">{selectedJob.duration}</Badge>
                      </motion.div>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm line-clamp-2 mb-3"
                      >
                        {selectedJob.description}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        <Button 
                          className="w-full bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                          onClick={() => handleJobCardClick(selectedJob)}
                        >
                          View Details
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapView;
