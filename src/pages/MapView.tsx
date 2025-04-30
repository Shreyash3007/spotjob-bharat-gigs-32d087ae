
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const MapView = () => {
  const { filteredJobs, user } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Map initialization
  useEffect(() => {
    // Mock Google Maps implementation since we can't load the real API here
    const mockLoadGoogleMaps = () => {
      // Create a mock map container
      if (mapRef.current) {
        const mockMapContainer = document.createElement("div");
        mockMapContainer.className = "h-full w-full bg-gray-200 relative";
        mockMapContainer.style.backgroundImage = "url('https://maps.googleapis.com/maps/api/staticmap?center=18.5204,73.8567&zoom=13&size=600x400&key=YOUR_API_KEY')";
        mockMapContainer.style.backgroundSize = "cover";
        mockMapContainer.style.backgroundPosition = "center";
        
        // Create job markers
        const jobMarkerContainer = document.createElement("div");
        jobMarkerContainer.className = "absolute inset-0";
        mockMapContainer.appendChild(jobMarkerContainer);
        
        filteredJobs.forEach((job, index) => {
          const marker = document.createElement("div");
          marker.className = "absolute w-6 h-6 bg-spotjob-purple rounded-full flex items-center justify-center text-white text-xs font-bold transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all";
          marker.style.left = `${20 + Math.random() * 60}%`;
          marker.style.top = `${20 + Math.random() * 60}%`;
          marker.textContent = (index + 1).toString();
          marker.onclick = () => setSelectedJob(job.id);
          
          jobMarkerContainer.appendChild(marker);
        });
        
        // Replace existing content with our mock map
        mapRef.current.innerHTML = "";
        mapRef.current.appendChild(mockMapContainer);
        setIsMapLoaded(true);
      }
    };
    
    mockLoadGoogleMaps();
  }, [filteredJobs]);

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
