
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { JobPost } from "@/types";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { mockSupabase } from "@/integrations/supabase/mockClient";

interface JobCardProps {
  job: JobPost;
  onSwipe?: (direction: "left" | "right") => void;
  swipeable?: boolean;
}

const JobCard = ({ job, onSwipe, swipeable = false }: JobCardProps) => {
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const categoryColors: Record<string, string> = {
    delivery: "bg-blue-100 text-blue-800",
    tutoring: "bg-green-100 text-green-800",
    tech: "bg-purple-100 text-purple-800",
    babysitting: "bg-pink-100 text-pink-800",
    housekeeping: "bg-yellow-100 text-yellow-800",
    event: "bg-orange-100 text-orange-800",
    other: "bg-gray-100 text-gray-800",
  };

  const payTypeDisplay: Record<string, string> = {
    hourly: "/hr",
    daily: "/day",
    fixed: " total"
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please log in to apply for jobs");
      return;
    }

    if (hasApplied) return;
    
    setIsApplying(true);
    
    try {
      const application = {
        job_id: job.id,
        applicant_id: user.id,
        status: "pending",
        applied_at: new Date().toISOString()
      };
      
      // Using mockSupabase until database types are updated
      mockSupabase
        .from('job_applications')
        .insert([application])
        .then(() => {
          setHasApplied(true);
          toast.success("Application sent! The employer can now contact you.");
          setIsApplying(false);
        });
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Failed to apply for this job. Please try again.");
      setIsApplying(false);
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

  // Get address from location object
  const getAddress = () => {
    if (typeof job.location === 'object' && job.location) {
      return 'address' in job.location ? job.location.address : 'Location unavailable';
    }
    return 'Location unavailable';
  };

  // Get pay information
  const getPayAmount = () => {
    if (typeof job.pay === 'number') {
      return job.pay;
    } else if (typeof job.pay === 'object' && job.pay) {
      return job.pay && 'amount' in job.pay ? job.pay.amount : 'N/A';
    }
    return 'N/A';
  };

  const getPayType = () => {
    if (typeof job.pay === 'object' && job.pay) {
      return job.pay && 'type' in job.pay ? job.pay.type as string : 'hourly';
    }
    return 'hourly';
  };

  // Check if user is verified
  const isVerified = () => {
    return 'posterVerified' in job && job.posterVerified === true;
  };

  // Get user rating
  const getRating = () => {
    return 'posterRating' in job ? job.posterRating : 4.5;
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="w-full"
    >
      <Card 
        className={`w-full max-w-md mx-auto job-card ${
          swipeDirection === "right" 
            ? "animate-swipe-right" 
            : swipeDirection === "left" 
              ? "animate-swipe-left" 
              : ""
        } hover:border-primary/30 transition-all`}
        onTouchStart={handleTouchStart}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{job.title}</h3>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate max-w-[200px]">{getAddress()}</span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${job.category && categoryColors[job.category] || categoryColors.other} border-0`}
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
              <span className="font-semibold">₹{getPayAmount()}{payTypeDisplay[getPayType()]}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Duration</span>
              <span className="font-semibold">{job.duration}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={job.posterAvatar} />
              <AvatarFallback>{job.posterName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{job.posterName || "Unknown"}</span>
                {isVerified() && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-1 rounded">✓</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-xs text-yellow-500">★</span>
                <span className="text-xs ml-0.5">{getRating().toString()}</span>
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
            disabled={hasApplied || isApplying}
          >
            {isApplying ? 
              <span className="flex items-center">
                <span className="w-3 h-3 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Applying...
              </span> : 
              hasApplied ? "Applied ✓" : "Quick Apply"
            }
          </Button>
          <Button variant="outline" className="flex-1" onClick={openWhatsApp}>
            WhatsApp
          </Button>
          <Link to={`/job/${job.id}`} className="flex-1">
            <Button variant="outline" className="w-full">Details</Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default JobCard;
