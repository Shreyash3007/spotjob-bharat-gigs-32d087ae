
import { useEffect, useState, useRef } from 'react';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { MapPin, Search, Filter, X, AlertTriangle, Loader2 } from "lucide-react";
import { Job } from '@/types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Default Mapbox token - This should ideally come from environment variables or Supabase secrets
// For demo purposes only
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1haSIsImEiOiJjbG95eWQ5YnQwYmprMmtxcm84dGdoeHNkIn0.HWOKtgy07R0JTMHSJGJ60g';

const MapView = () => {
  const { jobs, filteredJobs, setJobFilters } = useApp();
  const [search, setSearch] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapToken, setMapToken] = useState<string>(MAPBOX_TOKEN);
  const [customToken, setCustomToken] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const popup = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = mapToken;
      
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
  }, [mapToken]);

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
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="%237c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>')`;
        el.style.backgroundSize = '100%';
        
        // Create popup content
        const popupContent = `
          <div class="p-2 min-w-[220px]">
            <h3 class="font-medium">${job.title}</h3>
            <p class="text-sm text-gray-600">₹${job.pay.amount} · ${job.duration}</p>
          </div>
        `;
        
        // Create marker and add to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([job.location.lng, job.location.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
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
    setJobFilters({ search });
  };

  const tryAgainWithToken = () => {
    if (customToken.trim()) {
      setMapToken(customToken.trim());
      setLoading(true);
      setError(null);
      
      // Remove the existing map instance
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    } else {
      toast.error("Please enter a valid Mapbox token");
    }
  };

  const resetToken = () => {
    setMapToken(MAPBOX_TOKEN);
    setCustomToken('');
    setLoading(true);
    setError(null);
    
    // Remove the existing map instance
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };

  const handleJobCardClick = (job: Job) => {
    navigate(`/job/${job.id}`);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-5rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Sidebar with jobs list */}
          <div className="md:col-span-1 h-full overflow-y-auto">
            <Card className="h-full border-0 md:border shadow-none md:shadow-md rounded-none md:rounded-lg">
              <CardHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b pb-4">
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>Jobs Near You</span>
                  <Badge variant="outline" className="font-normal">
                    {filteredJobs.length} found
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
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
                      <div 
                        key={job.id}
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
                          <Badge variant="outline">{job.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No jobs found</h3>
                    <p className="text-muted-foreground text-sm">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Map */}
          <div className="md:col-span-2 h-full relative">
            <div ref={mapContainer} className="h-full w-full rounded-lg border overflow-hidden"></div>
            
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="font-medium">Loading map...</p>
                </div>
              </div>
            )}
            
            {/* Error overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
                <Card className="max-w-md w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Map Loading Error
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{error}</p>
                    <div className="space-y-2">
                      <label htmlFor="mapbox-token" className="text-sm font-medium">
                        Enter your Mapbox token:
                      </label>
                      <Input
                        id="mapbox-token"
                        value={customToken}
                        onChange={(e) => setCustomToken(e.target.value)}
                        placeholder="pk.eyJ1Ijoi..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={tryAgainWithToken}>Try with this token</Button>
                      <Button variant="outline" onClick={resetToken}>
                        Reset to default
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-1">{selectedJob.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{selectedJob.location.address}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 mb-3">
                        <span className="text-primary font-medium">₹{selectedJob.pay.amount}</span>
                        <Badge variant="outline">{selectedJob.duration}</Badge>
                      </div>
                      <p className="text-sm line-clamp-2 mb-3">{selectedJob.description}</p>
                      <Button 
                        className="w-full"
                        onClick={() => handleJobCardClick(selectedJob)}
                      >
                        View Details
                      </Button>
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
