
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  AnimatedCard
} from "@/components/ui/card";
import { Button, MotionButton } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  BookMarked,
  ChevronDown,
  Edit,
  LogOut,
  Phone,
  Save,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobType } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// Define this as a type to ensure it's used consistently throughout the code
type VerificationStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified';

const Profile = () => {
  const { user, logout, jobs, appliedJobs } = useApp();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  // Fetch user's posted jobs
  const postedJobs = jobs.filter(job => job.posterName === user?.username);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    
    setVerificationStatus('sending');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call your backend service
      // const { error } = await supabase.auth.api.sendMobileOTP({
      //   phone,
      // });
      
      // if (error) throw new Error(error.message);
      
      setVerificationStatus('sent');
      setShowVerifyInput(true);
      setOtpTimer(30);
      toast.success("Verification code sent to your phone");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setVerificationStatus('idle');
      toast.error("Failed to send verification code");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter verification code");
      return;
    }
    
    setVerificationStatus('verifying');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call your backend service
      // const { error } = await supabase.auth.verifyOTP({
      //   phone,
      //   token: otp,
      //   type: 'sms',
      // });
      
      // if (error) throw new Error(error.message);
      
      setVerificationStatus('verified');
      toast.success("Phone number verified successfully");
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      setVerificationStatus('idle');
      toast.error("Invalid verification code");
    }
  };

  const handleCancelVerification = () => {
    setPhone("");
    setOtp("");
    setShowVerifyInput(false);
    setVerificationStatus('idle');
  };
  
  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Profile Header */}
          <AnimatedCard animated className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {user.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <CardTitle className="text-2xl font-bold">{user.username}</CardTitle>
                  <CardDescription className="mt-1">
                    {user.email}
                  </CardDescription>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                    <Badge variant="outline" className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                      New User
                    </Badge>
                    
                    {verificationStatus === 'verified' ? (
                      <Badge className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-0">
                        Phone Verified ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                        Verification Pending
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              {/* Phone Verification */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Phone Verification</h3>
                
                {verificationStatus === 'verified' ? (
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Phone Number Verified</p>
                      <p className="text-sm text-muted-foreground">{phone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="phone" className="text-sm font-medium block mb-1">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={verificationStatus === 'sending' || verificationStatus === 'sent' || verificationStatus === 'verifying'}
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleSendOtp}
                            disabled={verificationStatus === 'sending' || verificationStatus === 'sent' || verificationStatus === 'verifying' || !phone.trim()}
                            className="whitespace-nowrap"
                          >
                            {verificationStatus === 'sending' ? 'Sending...' : 
                             verificationStatus === 'sent' && otpTimer > 0 ? `Resend in ${otpTimer}s` : 
                             'Send OTP'}
                          </Button>
                          {(verificationStatus === 'sent' || verificationStatus === 'verifying') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={handleCancelVerification}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {showVerifyInput && (
                        <div className="animate-fade-in">
                          <label htmlFor="otp" className="text-sm font-medium block mb-1">
                            Verification Code
                          </label>
                          <div className="flex gap-2">
                            <Input
                              id="otp"
                              type="text"
                              placeholder="Enter verification code"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              disabled={verificationStatus === 'verifying'}
                              className="flex-1"
                              maxLength={6}
                            />
                            <Button 
                              onClick={handleVerifyOtp}
                              disabled={verificationStatus === 'verifying' || !otp.trim()}
                            >
                              {verificationStatus === 'verifying' ? 'Verifying...' : 'Verify'}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter the 6-digit code sent to your phone
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              {/* User Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-accent/50 p-4 rounded-lg text-center">
                  <h3 className="text-sm text-muted-foreground">Jobs Applied</h3>
                  <p className="text-2xl font-bold text-primary mt-1">{appliedJobs.size}</p>
                </div>
                <div className="bg-accent/50 p-4 rounded-lg text-center">
                  <h3 className="text-sm text-muted-foreground">Jobs Posted</h3>
                  <p className="text-2xl font-bold text-primary mt-1">{postedJobs.length}</p>
                </div>
                <div className="bg-accent/50 p-4 rounded-lg text-center">
                  <h3 className="text-sm text-muted-foreground">Rating</h3>
                  <p className="text-2xl font-bold text-primary mt-1">4.8</p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
          
          {/* Jobs Tab Interface */}
          <Tabs defaultValue="applied" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="applied">
                Applied Jobs ({appliedJobs.size})
              </TabsTrigger>
              <TabsTrigger value="posted">
                Posted Jobs ({postedJobs.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="applied" className="mt-4">
              {appliedJobs.size > 0 ? (
                <div className="space-y-4">
                  {Array.from(appliedJobs).map(jobId => {
                    const job = jobs.find(j => j.id === jobId);
                    return job ? (
                      <JobCard key={job.id} job={job} />
                    ) : null;
                  })}
                </div>
              ) : (
                <Card className="bg-accent/30 border-dashed">
                  <CardContent className="flex flex-col items-center py-10">
                    <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-4">
                      <BookMarked className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No Applied Jobs</h3>
                    <p className="text-muted-foreground mt-1">
                      You haven't applied to any jobs yet.
                    </p>
                    <Button variant="default" className="mt-4" onClick={() => navigate("/swipe")}>
                      Browse Jobs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="posted" className="mt-4">
              {postedJobs.length > 0 ? (
                <div className="space-y-4">
                  {postedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <Card className="bg-accent/30 border-dashed">
                  <CardContent className="flex flex-col items-center py-10">
                    <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-4">
                      <BookMarked className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No Posted Jobs</h3>
                    <p className="text-muted-foreground mt-1">
                      You haven't posted any jobs yet.
                    </p>
                    <Button variant="default" className="mt-4" onClick={() => navigate("/post-job")}>
                      Post a Job
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

interface JobCardProps {
  job: JobType;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <AnimatedCard animated className="overflow-hidden p-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex justify-between items-start cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div>
            <h3 className="font-medium">{job.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <Phone className="h-3 w-3 mr-1" inline="true" />
              {job.location.address}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant="outline" className="mb-2">₹{job.pay.amount}</Badge>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 border-t">
            <p className="text-sm my-4">{job.description}</p>
            <div className="flex justify-between">
              <Badge variant="outline">{job.category}</Badge>
              <Button size="sm" onClick={() => navigate(`/job/${job.id}`)}>
                View Details
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </AnimatedCard>
  );
};

export default Profile;
