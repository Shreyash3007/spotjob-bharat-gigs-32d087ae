
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { MapPin, Calendar, Clock, ArrowLeft, Phone, MessageSquare, Share, Bookmark, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const categoryColors: Record<string, string> = {
    delivery: "bg-blue-100 text-blue-800",
    tutoring: "bg-green-100 text-green-800",
    tech: "bg-primary/10 text-primary",
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
      toast.success("Application sent! The employer will contact you soon.");
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card className="overflow-hidden border shadow-sm bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location.address}</span>
                </CardDescription>
              </div>
              <Badge 
                variant="outline" 
                className={`${categoryColors[job.category]} border-0`}
              >
                {job.category}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pb-0">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-accent/50 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Pay</div>
                <div className="text-lg font-semibold text-primary">
                  ₹{job.pay.amount}{payTypeDisplay[job.pay.type]}
                </div>
              </div>
              <div className="bg-accent/50 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="font-medium">{job.duration}</span>
                </div>
              </div>
              <div className="bg-accent/50 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Posted</div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(job.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Job Description</h3>
              <div className="bg-accent/30 p-4 rounded-lg">
                <p className="text-foreground whitespace-pre-line">{job.description}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Posted By</h3>
              <div className="flex items-start p-4 rounded-lg border">
                <Avatar className="h-14 w-14 mr-4">
                  <AvatarImage src={job.posterAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">{job.posterName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{job.posterName}</h4>
                    {job.posterVerified && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-600 border-0">
                        Verified ✓
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center mt-0.5">
                    <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                      <span className="font-medium text-amber-700">{job.posterRating.toFixed(1)}</span>
                      <span className="mx-1 text-amber-300">•</span>
                      <span className="text-amber-700">15 reviews</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Professional {job.category} specialist with over 5 years of experience.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
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
                <MessageSquare className="h-4 w-4" />
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
          </CardContent>
        </Card>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Similar Jobs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Just show two example similar jobs */}
            {[1, 2].map((idx) => (
              <Card key={idx} className="hover:border-primary/30 transition-all cursor-pointer hover:shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-medium">{job.title} - Similar Position {idx}</h4>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    Near {job.location.address}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className={`${categoryColors[job.category]} border-0`}>
                      {job.category}
                    </Badge>
                    <span className="text-sm font-medium text-primary">₹{job.pay.amount - 50 + (idx * 100)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetails;
