import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Globe, Plus, Minus, MapPin, ArrowRight, Clock, Briefcase, CreditCard, Filter, Search, Locate, PanelLeft, ChevronLeft, ChevronRight, X, ArrowUpRight, Check } from 'lucide-react';

// Set the Mapbox token directly
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hyZXlhc2gwNDUiLCJhIjoiY21hNGI5YXhzMDNwcTJqczYyMnR3OWdkcSJ9.aVpyfgys6f-h27ftG_63Zw';

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState(12);
  const [lng, setLng] = useState(77.3500);
  const [lat, setLat] = useState(28.6700);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [mapMarkers, setMapMarkers] = useState<mapboxgl.Marker[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(5);
  const [jobType, setJobType] = useState('all');
  const [sortBy, setSortBy] = useState('distance');

  // Sample job postings (replace with actual data)
  const jobPostings = [
    {
      id: 1,
      title: 'Part-Time Barista',
      description: 'Brew coffee, take orders, and provide excellent customer service. Looking for energetic individuals who can work in a fast-paced environment. Experience with espresso machines is a plus but not required.',
      category: 'food-service',
      company: 'Coffee Bliss Cafe',
      companyLogo: 'https://source.unsplash.com/100x100/?coffee,cafe',
      salary: '₹8,000 - ₹12,000 / month',
      workHours: '15-20 hours/week',
      location: {
        address: 'Sector 18, Noida',
        coordinates: [77.3550, 28.6750] as [number, number], // Explicitly type as tuple
      },
      postedDate: '2 days ago',
      skills: ['Customer Service', 'Food Handling', 'Cash Management'],
      applicants: 7,
    },
    {
      id: 2,
      title: 'Delivery Driver',
      description: 'Deliver food orders quickly and safely to customers. Must have own vehicle and valid driver\'s license. Knowledge of local area streets is required.',
      category: 'delivery',
      company: 'Quick Eats Delivery',
      companyLogo: 'https://source.unsplash.com/100x100/?delivery,food',
      salary: '₹10,000 - ₹15,000 / month',
      workHours: 'Flexible shifts',
      location: {
        address: 'Sector 62, Noida',
        coordinates: [77.3450, 28.6650] as [number, number], // Explicitly type as tuple
      },
      postedDate: '1 day ago',
      skills: ['Navigation', 'Time Management', 'Vehicle Operation'],
      applicants: 15,
    },
    {
      id: 3,
      title: 'Retail Assistant',
      description: 'Assist customers, manage inventory, and maintain store cleanliness. Previous retail experience preferred but not mandatory. Good communication skills required.',
      category: 'retail',
      company: 'Fashion Hub Retail',
      companyLogo: 'https://source.unsplash.com/100x100/?retail,fashion',
      salary: '₹9,000 - ₹13,000 / month',
      workHours: '25 hours/week',
      location: {
        address: 'DLF Mall, Noida',
        coordinates: [77.3600, 28.6800] as [number, number], // Explicitly type as tuple
      },
      postedDate: '3 days ago',
      skills: ['Customer Service', 'Inventory Management', 'Sales'],
      applicants: 12,
    },
    {
      id: 4,
      title: 'Event Photographer',
      description: 'Capture high-quality photographs at corporate events and social gatherings. Must have own professional camera equipment and portfolio.',
      category: 'creative',
      company: 'CapturePro Events',
      companyLogo: 'https://source.unsplash.com/100x100/?camera,photography',
      salary: '₹2,000 - ₹5,000 / event',
      workHours: 'Event-based',
      location: {
        address: 'Greater Noida',
        coordinates: [77.4360, 28.6240] as [number, number],
      },
      postedDate: '1 week ago',
      skills: ['Photography', 'Photo Editing', 'Event Management'],
      applicants: 8,
    },
    {
      id: 5,
      title: 'IT Support Technician',
      description: 'Provide technical support for hardware and software issues. Troubleshoot network problems and assist with system installations.',
      category: 'it',
      company: 'TechSphere Solutions',
      companyLogo: 'https://source.unsplash.com/100x100/?computer,technology',
      salary: '₹15,000 - ₹20,000 / month',
      workHours: '20-30 hours/week',
      location: {
        address: 'Sector 63, Noida',
        coordinates: [77.3780, 28.6270] as [number, number],
      },
      postedDate: '4 days ago',
      skills: ['IT Support', 'Hardware Troubleshooting', 'Customer Service'],
      applicants: 18,
    },
  ];

  // Function to filter jobs based on user criteria
  const filterJobs = () => {
    return jobPostings.filter(job => {
      // Filter by search term
      const matchesSearch = 
        searchQuery === '' || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by job type
      const matchesType = jobType === 'all' || job.category === jobType;
      
      // Filter by radius (simplified for this example)
      const distance = calculateDistance(lat, lng, job.location.coordinates[1], job.location.coordinates[0]);
      const matchesRadius = distance <= radius;
      
      return matchesSearch && matchesType && matchesRadius;
    }).sort((a, b) => {
      if (sortBy === 'distance') {
        const distanceA = calculateDistance(lat, lng, a.location.coordinates[1], a.location.coordinates[0]);
        const distanceB = calculateDistance(lat, lng, b.location.coordinates[1], b.location.coordinates[0]);
        return distanceA - distanceB;
      } else if (sortBy === 'recent') {
        // This is just a mock - in reality, you'd compare actual dates
        return a.postedDate.includes('day') && b.postedDate.includes('week') ? -1 : 1;
      } else if (sortBy === 'salary') {
        // Extract the first number from salary for comparison (a simplification)
        const salaryA = parseInt(a.salary.match(/\d+/)?.[0] || '0');
        const salaryB = parseInt(b.salary.match(/\d+/)?.[0] || '0');
        return salaryB - salaryA;
      }
      return 0;
    });
  };

  // Calculate distance between two sets of coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Initialize map and add markers
  useEffect(() => {
    if (map.current) return; // prevent initialize map more than once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    map.current.on('move', () => {
      if (!map.current) return;
      setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(map.current.getZoom().toFixed(2)));
    });

    // Add markers for job postings
    const markers: mapboxgl.Marker[] = [];
    
    jobPostings.forEach((job) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(job.location.coordinates)
        .addTo(map.current as mapboxgl.Map);

      // Add click event to markers
      el.addEventListener('click', () => {
        setSelectedJob(job);
      });
      
      markers.push(marker);
    });
    
    setMapMarkers(markers);

    // Create a popup but don't add it to the map yet
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    // Function to update popup content
    const updatePopup = (job: any) => {
      if (!map.current) return;
      
      popup
        .setLngLat(job.location.coordinates)
        .setHTML(`
          <div class="popup-content p-2">
            <h4 class="font-medium text-sm">${job.title}</h4>
            <p class="text-xs text-gray-600">${job.company}</p>
            <p class="text-xs font-medium text-primary mt-1">${job.salary}</p>
          </div>
        `)
        .addTo(map.current);
    };

    // Add mouse enter event to markers
    jobPostings.forEach((job, i) => {
      const el = markers[i].getElement();
      
      el.addEventListener('mouseenter', () => {
        updatePopup(job);
        el.style.zIndex = '10';
      });
      
      el.addEventListener('mouseleave', () => {
        popup.remove();
        el.style.zIndex = '';
      });
    });

    // Add radius circle to map
    map.current.on('load', () => {
      if (!map.current) return;
      
      map.current.addSource('radius', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: 'radius-circle',
        type: 'circle',
        source: 'radius',
        paint: {
          'circle-radius': {
            stops: [
              [0, 0],
              [20, 6400000] // Approximate 1km radius at zoom level 15
            ],
            base: 2
          },
          'circle-color': '#0080ff',
          'circle-opacity': 0.15,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#0080ff'
        }
      });
    });

    // Cleanup
    return () => {
      markers.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when filters change
  useEffect(() => {
    if (!map.current) return;
    
    // Remove existing markers
    mapMarkers.forEach(marker => marker.remove());
    
    // Add filtered markers
    const filteredJobs = filterJobs();
    const newMarkers: mapboxgl.Marker[] = [];
    
    filteredJobs.forEach((job) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(job.location.coordinates)
        .addTo(map.current as mapboxgl.Map);
      
      el.addEventListener('click', () => {
        setSelectedJob(job);
      });
      
      newMarkers.push(marker);
    });
    
    setMapMarkers(newMarkers);
    
    // Update radius visualization
    if (map.current.getSource('radius')) {
      // Cast to GeoJSONSource for proper TypeScript support
      const radiusSource = map.current.getSource('radius') as mapboxgl.GeoJSONSource;
      radiusSource.setData({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {}
      });
      
      // Adjust the radius size based on the zoom level and radius in km
      const radiusInPixels = radius * 1000; // Approximation
      const maxRadius = radiusInPixels / Math.pow(2, 20 - zoom);
      
      map.current.setPaintProperty('radius-circle', 'circle-radius', {
        stops: [
          [0, 0],
          [20, maxRadius]
        ],
        base: 2
      });
    }
  }, [radius, jobType, searchQuery, sortBy]);

  // Handle job application
  const handleApplyForJob = (jobId: number) => {
    if (user) {
      navigate(`/job/${jobId}`);
    } else {
      navigate('/auth?mode=login');
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (map.current) {
          const newLng = position.coords.longitude;
          const newLat = position.coords.latitude;
          
          map.current.flyTo({
            center: [newLng, newLat],
            zoom: 14,
            essential: true
          });
          
          setLng(newLng);
          setLat(newLat);
        }
      }, (error) => {
        console.error('Error getting current location:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="map-container relative h-screen flex">
      {/* Sidebar */}
      <div className={cn(
        "absolute top-0 left-0 h-full bg-background border-r z-20 transition-all duration-300",
        isPanelOpen ? "w-[380px]" : "w-0 overflow-hidden"
      )}>
        <div className="h-full flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Jobs Near You</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsPanelOpen(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Filters */}
          <div className="p-4 border-b space-y-4">
            <div className="relative">
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="job-type">Job Type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="food-service">Food Service</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sort-by">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="salary">Highest Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Distance: {radius} km</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={getCurrentLocation}
                >
                  <Locate className="h-3 w-3" />
                  Current Location
                </Button>
              </div>
              <Slider
                value={[radius]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => setRadius(value[0])}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filterJobs().length} jobs found
              </span>
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Filter className="h-3 w-3" />
                More Filters
              </Button>
            </div>
          </div>
          
          {/* Job List */}
          <div className="flex-1 overflow-y-auto pb-20">
            <div className="divide-y">
              {filterJobs().length > 0 ? (
                filterJobs().map((job) => (
                  <div 
                    key={job.id}
                    className={cn(
                      "p-4 hover:bg-accent/50 cursor-pointer transition-colors",
                      selectedJob?.id === job.id && "bg-accent"
                    )}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex gap-3">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                        <img 
                          src={job.companyLogo} 
                          alt={job.company} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1 text-primary" />
                            {formatDistance(calculateDistance(lat, lng, job.location.coordinates[1], job.location.coordinates[0]))}
                          </span>
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1 text-primary" />
                            {job.postedDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-primary whitespace-nowrap">
                          {job.salary.includes('/') ? job.salary.split('/')[0] : job.salary}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {job.workHours}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No jobs found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setJobType('all');
                      setRadius(5);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Toggle Button */}
      {!isPanelOpen && (
        <Button
          variant="default"
          size="sm"
          className="absolute top-4 left-4 z-20 shadow-md"
          onClick={() => setIsPanelOpen(true)}
        >
          <PanelLeft className="h-4 w-4 mr-2" />
          Show Jobs
        </Button>
      )}
      
      {/* Map Container */}
      <div ref={mapContainer} className="mapboxgl-map flex-1 h-full" />
      
      {/* Job Detail Panel */}
      {selectedJob && (
        <div className="absolute top-0 right-0 h-full w-[380px] bg-background border-l z-20 overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Job Details</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedJob(null)}
              className="h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                <img 
                  src={selectedJob.companyLogo} 
                  alt={selectedJob.company} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{selectedJob.title}</h1>
                <p className="text-muted-foreground">{selectedJob.company}</p>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="mr-2">
                    {selectedJob.category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedJob.postedDate}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center text-primary mb-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span className="font-medium">Salary</span>
                  </div>
                  <p className="text-sm">{selectedJob.salary}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center text-primary mb-1">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Work Hours</span>
                  </div>
                  <p className="text-sm">{selectedJob.workHours}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center text-primary mb-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="text-sm">{selectedJob.location.address}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center text-primary mb-1">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span className="font-medium">Applicants</span>
                  </div>
                  <p className="text-sm">{selectedJob.applicants} people applied</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Job Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {selectedJob.description}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                className="w-full mb-3"
                onClick={() => handleApplyForJob(selectedJob.id)}
              >
                Apply for this Job
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button variant="outline" className="w-full">
                Save Job
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        .mapboxgl-map {
          font: inherit;
        }
        .mapboxgl-popup {
          max-width: 240px !important;
        }
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
        .mapboxgl-popup-close-button {
          display: none !important;
        }
        .popup-content {
          background: white;
          color: #333;
          font-family: inherit;
        }
        `}
      </style>
    </div>
  );
};

export default MapView;

