
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { MapPin, Calendar, Clock, ArrowLeft, Phone } from "lucide-react";
import { toast } from "sonner";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, applyToJob, appliedJobs } = useApp();
  
  const job = getJobById(id || "");
  const hasApplied = job ? appliedJobs.has(job.id) : false;

  if (!job) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-xl font-semibold mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

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

  const handleCall = () => {
    // In a real app, this would use the actual phone number
    window.location.href = "tel:+919876543210";
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="p-6 border-b">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location.address}</span>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`${categoryColors[job.category]} border-0`}
              >
                {job.category}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Pay</span>
                <span className="font-semibold text-lg">
                  ₹{job.pay.amount}{payTypeDisplay[job.pay.type]}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Duration</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{job.duration}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Posted</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-semibold">
                    {new Date(job.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Job Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="font-medium mb-3">Posted By</h3>
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={job.posterAvatar} />
                <AvatarFallback>{job.posterName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{job.posterName}</span>
                  {job.posterVerified && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded">Verified ✓</span>
                  )}
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{job.posterRating.toFixed(1)}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="text-gray-500">15 reviews</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                variant={hasApplied ? "outline" : "default"}
                className={`w-full ${hasApplied ? "bg-green-50 text-green-700 border-green-200" : ""}`}
                onClick={handleApply}
                disabled={hasApplied}
              >
                {hasApplied ? "Applied ✓" : "Quick Apply"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2" 
                onClick={openWhatsApp}
              >
                WhatsApp
              </Button>
              <Button 
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleCall}
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetails;
