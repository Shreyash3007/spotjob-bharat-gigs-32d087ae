
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { JobPost } from "@/types";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

interface JobCardProps {
  job: JobPost;
  onSwipe?: (direction: "left" | "right") => void;
  swipeable?: boolean;
}

const JobCard = ({ job, onSwipe, swipeable = false }: JobCardProps) => {
  const { applyToJob, appliedJobs } = useApp();
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const hasApplied = appliedJobs.has(job.id);

  const categoryColors = {
    delivery: "bg-blue-100 text-blue-800",
    tutoring: "bg-green-100 text-green-800",
    tech: "bg-purple-100 text-purple-800",
    babysitting: "bg-pink-100 text-pink-800",
    housekeeping: "bg-yellow-100 text-yellow-800",
    event: "bg-orange-100 text-orange-800",
    other: "bg-gray-100 text-gray-800",
  };

  const payTypeDisplay = {
    hourly: "/hr",
    daily: "/day",
    fixed: " total"
  };

  const handleApply = () => {
    if (!hasApplied) {
      applyToJob(job.id);
      toast.success("Application sent! The employer can now contact you.");
    }
  };

  const openWhatsApp = () => {
    // In a real app, this would use the actual phone number
    const message = `Hi, I'm interested in your job: ${job.title}`;
    const whatsappURL = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeable) return;
    
    const touchStartX = e.touches[0].clientX;
    const element = e.currentTarget;
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - touchStartX;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          setSwipeDirection("right");
          if (onSwipe) onSwipe("right");
        } else {
          setSwipeDirection("left");
          if (onSwipe) onSwipe("left");
        }
        
        element.removeEventListener("touchmove", handleTouchMove);
      }
    };
    
    element.addEventListener("touchmove", handleTouchMove, { once: true });
  };

  return (
    <Card 
      className={`w-full max-w-md mx-auto job-card ${
        swipeDirection === "right" 
          ? "animate-swipe-right" 
          : swipeDirection === "left" 
            ? "animate-swipe-left" 
            : ""
      }`}
      onTouchStart={handleTouchStart}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{job.title}</h3>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate max-w-[200px]">{job.location.address}</span>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${categoryColors[job.category]} border-0`}
          >
            {job.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Pay</span>
            <span className="font-semibold">₹{job.pay.amount}{payTypeDisplay[job.pay.type]}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Duration</span>
            <span className="font-semibold">{job.duration}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={job.posterAvatar} />
            <AvatarFallback>{job.posterName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{job.posterName}</span>
              {job.posterVerified && (
                <span className="bg-blue-100 text-blue-600 text-xs px-1 rounded">✓</span>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-xs text-yellow-500">★</span>
              <span className="text-xs ml-0.5">{job.posterRating.toFixed(1)}</span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(job.timestamp).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-2">
        <Button 
          variant={hasApplied ? "outline" : "default"}
          className={`flex-1 ${hasApplied ? "bg-green-50 text-green-700 border-green-200" : ""}`}
          onClick={handleApply}
          disabled={hasApplied}
        >
          {hasApplied ? "Applied ✓" : "Quick Apply"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={openWhatsApp}>
          WhatsApp
        </Button>
        <Link to={`/job/${job.id}`} className="flex-1">
          <Button variant="outline" className="w-full">Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
