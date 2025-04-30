
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapView = () => {
  const { filteredJobs, user } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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

      // Create markers for each job with random positions (for demo purposes)
      filteredJobs.forEach((job, index) => {
        // Create a custom marker element
        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-spotjob-purple rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-all';
        el.textContent = (index + 1).toString();
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.backgroundColor = '#6559d2';
        el.style.color = 'white';
        el.style.borderRadius = '50%';
        el.style.fontWeight = 'bold';
        el.style.cursor = 'pointer';
        
        // Use actual coordinates if available, otherwise use random locations around India
        const lng = job.location?.coordinates?.lng || 78.9629 + (Math.random() * 10 - 5);
        const lat = job.location?.coordinates?.lat || 20.5937 + (Math.random() * 10 - 5);
        
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

  return (
    <Layout fullHeight>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Jobs Near You</h2>
        </div>
        
        <div className="flex-1 grid md:grid-cols-3 gap-4 h-[calc(100%-48px)]">
          <div className="md:col-span-2 h-full rounded-lg overflow-hidden border bg-card">
            {!isMapLoaded ? (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading map...</span>
              </div>
            ) : (
              <div ref={mapRef} className="h-full w-full" />
            )}
          </div>
          
          <div className="flex flex-col overflow-hidden">
            {selectedJobData ? (
              <div className="flex flex-col h-full">
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
              <div className="flex-1 overflow-auto space-y-2 pr-1">
                <p className="text-sm text-muted-foreground mb-4">
                  Click on a marker to view job details
                </p>
                {filteredJobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className="p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedJob(job.id)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-spotjob-purple rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{job.location.address}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-semibold">₹{job.pay.amount}</span>
                          <span className="text-xs text-muted-foreground">{job.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapView;
