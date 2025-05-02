
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
  X,
  UserCheck,
  Lock,
  ShieldCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobPost } from '@/types';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// Define this as a type to ensure it's used consistently throughout the code
type VerificationStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified';

// KYC verification status
type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

const Profile = () => {
  const { user, logout, jobs, appliedJobs } = useApp();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [kycStatus, setKycStatus] = useState<KycStatus>('not_started');
  const [showKycForm, setShowKycForm] = useState(false);
  const [kycData, setKycData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    idType: 'passport',
    idNumber: '',
  });
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
  const postedJobs = jobs.filter(job => job.posterName === user?.name);

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
  
  const handleKycSubmit = async () => {
    // Validate form fields
    if (!kycData.fullName || !kycData.dateOfBirth || !kycData.address || !kycData.idNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setKycStatus('pending');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would call your backend service
      // const { error } = await supabase.from('kyc_verifications').insert([
      //   { user_id: user.id, ...kycData }
      // ]);
      
      // if (error) throw new Error(error.message);
      
      setKycStatus('approved');
      setShowKycForm(false);
      toast.success("KYC verification approved successfully!");
    } catch (error) {
      console.error("Failed to submit KYC:", error);
      setKycStatus('rejected');
      toast.error("KYC verification failed. Please try again.");
    }
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
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {user.phone}
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
                    
                    {kycStatus === 'approved' ? (
                      <Badge className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                        KYC Verified ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-0">
                        KYC {kycStatus !== 'not_started' ? kycStatus : 'required'}
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
              {/* KYC Verification */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  KYC Verification
                  <span className="inline-block animate-pulse-glow bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">Required</span>
                </h3>
                
                {kycStatus === 'approved' ? (
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">KYC Verification Approved</p>
                      <p className="text-sm text-muted-foreground">Your identity has been verified successfully</p>
                    </div>
                  </div>
                ) : kycStatus === 'pending' ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2">
                      <div className="animate-spin h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                    </div>
                    <h4 className="text-lg font-medium">Verification in Progress</h4>
                    <p className="text-sm text-muted-foreground">We are reviewing your documents. This usually takes 1-2 business days.</p>
                  </div>
                ) : (
                  <AnimatedCard animated className="border-dashed p-0 overflow-hidden">
                    {!showKycForm ? (
                      <div className="p-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Lock className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-medium">Identity Verification Required</h4>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Complete KYC verification to post jobs or apply to jobs on our platform. This helps ensure safety and trust.
                        </p>
                        <Button 
                          variant="gradient" 
                          onClick={() => setShowKycForm(true)}
                          className="animate-shimmer"
                        >
                          Start Verification
                        </Button>
                      </div>
                    ) : (
                      <div className="p-6 space-y-4">
                        <h4 className="text-lg font-medium text-center mb-4">KYC Verification</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Full Name</label>
                            <Input 
                              value={kycData.fullName}
                              onChange={(e) => setKycData({...kycData, fullName: e.target.value})}
                              className="mt-1"
                              placeholder="As per official ID"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Date of Birth</label>
                            <Input 
                              type="date" 
                              value={kycData.dateOfBirth}
                              onChange={(e) => setKycData({...kycData, dateOfBirth: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Address</label>
                            <Input 
                              value={kycData.address}
                              onChange={(e) => setKycData({...kycData, address: e.target.value})}
                              className="mt-1"
                              placeholder="Your permanent address"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">ID Type</label>
                            <select 
                              value={kycData.idType}
                              onChange={(e) => setKycData({...kycData, idType: e.target.value})}
                              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="passport">Passport</option>
                              <option value="driving_license">Driving License</option>
                              <option value="national_id">National ID Card</option>
                              <option value="voter_id">Voter ID</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">ID Number</label>
                            <Input 
                              value={kycData.idNumber}
                              onChange={(e) => setKycData({...kycData, idNumber: e.target.value})}
                              className="mt-1"
                              placeholder="Enter your ID number"
                            />
                          </div>
                        </div>
                        <div className="border-t pt-4 flex justify-between items-center mt-4">
                          <Button variant="outline" onClick={() => setShowKycForm(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleKycSubmit} className="gradient-btn relative overflow-hidden">
                            <span className="relative z-10">Submit for Verification</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </AnimatedCard>
                )}
              </div>

              {/* Phone Verification */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Phone Verification
                </h3>
                
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
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-sm text-muted-foreground">Jobs Applied</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mt-1">{appliedJobs.size}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-sm text-muted-foreground">Jobs Posted</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mt-1">{postedJobs.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-sm text-muted-foreground">Rating</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent mt-1">4.8</p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
          
          {/* Jobs Tab Interface */}
          <Tabs defaultValue="applied" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-gradient-to-r from-background via-accent/50 to-background rounded-full p-1">
              <TabsTrigger value="applied" className="rounded-full">
                Applied Jobs ({appliedJobs.size})
              </TabsTrigger>
              <TabsTrigger value="posted" className="rounded-full">
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
                <Card className="bg-accent/30 border-dashed backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center py-10">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-blue-400/20 flex items-center justify-center mb-4 animate-float">
                      <BookMarked className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">No Applied Jobs</h3>
                    <p className="text-muted-foreground mt-1">
                      You haven't applied to any jobs yet.
                    </p>
                    <Button variant="gradient" className="mt-4 animate-shimmer" onClick={() => navigate("/swipe")}>
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
                <Card className="bg-accent/30 border-dashed backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center py-10">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-400/20 to-pink-400/20 flex items-center justify-center mb-4 animate-float">
                      <BookMarked className="h-6 w-6 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-medium">No Posted Jobs</h3>
                    <p className="text-muted-foreground mt-1">
                      You haven't posted any jobs yet.
                    </p>
                    <Button variant="gradient" className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 animate-shimmer" onClick={() => navigate("/post-job")}>
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
  job: JobPost;
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
              <Phone className="h-3 w-3 mr-1" />
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
