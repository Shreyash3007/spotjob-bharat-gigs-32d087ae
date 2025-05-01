
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Phone, Loader2, CheckCircle, User, Shield, Star, Search, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, logout, jobs, appliedJobs } = useApp();
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !user) {
        navigate('/auth');
      }
    });
  }, [navigate, user]);

  useEffect(() => {
    // OTP timer countdown
    let interval: ReturnType<typeof setInterval>;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const postedJobs = jobs.filter(job => job.posterId === user?.id);
  const myAppliedJobs = jobs.filter(job => appliedJobs.has(job.id));

  const handleSendVerificationCode = async () => {
    if (!phone.trim() || !/^\+?[0-9]{10,12}$/.test(phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsVerifying(true);
    setVerificationStatus('sending');
    
    try {
      // In a real app with Supabase, we would verify the phone here
      // Using a timeout to simulate the API call
      setTimeout(() => {
        setShowVerifyInput(true);
        setVerificationStatus('sent');
        setIsVerifying(false);
        setOtpTimer(30); // 30 seconds countdown
        toast.success("Verification code sent", {
          description: `We've sent a verification code to ${phone}`
        });
      }, 1500);
    } catch (error) {
      toast.error("Failed to send verification code");
      setIsVerifying(false);
      setVerificationStatus('idle');
    }
  };

  const handleVerifyPhone = async () => {
    if (!verifyCode.trim() || !/^[0-9]{4,6}$/.test(verifyCode)) {
      toast.error("Please enter a valid verification code");
      return;
    }
    
    setIsVerifying(true);
    setVerificationStatus('verifying');
    
    try {
      // In a real app with Supabase, we would verify the code here
      // Using a timeout to simulate the API call
      setTimeout(() => {
        setIsVerifying(false);
        setShowVerifyInput(false);
        setVerificationStatus('verified');
        toast.success("Phone number verified successfully!");
      }, 1500);
    } catch (error) {
      toast.error("Failed to verify code. Please try again.");
      setIsVerifying(false);
      setVerificationStatus('sent');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  if (!user) {
    return (
      <Layout>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md mx-auto py-10"
        >
          <Card className="border shadow-lg overflow-hidden backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-6">
              <CardTitle className="text-xl">Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to access your profile and job applications
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Layout>
    );
  }

  // Calculate profile completion percentage (mock functionality)
  const profileCompletion = user.verified ? 90 : 70;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mb-8 border shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
              <div className="flex flex-row items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-lg">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    {verificationStatus === 'verified' || user.verified ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{user.phone || "Phone not verified"}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Pune, Maharashtra</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30">
                  <User className="h-3 w-3 mr-1" />
                  Profile {profileCompletion}% Complete
                </Badge>
                
                <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30">
                  <Star className="h-3 w-3 mr-1" />
                  {user.rating} Rating
                </Badge>
                
                <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/30">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.verified ? "KYC Verified" : "KYC Pending"}
                </Badge>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium text-lg mb-4">Verify your phone number</h3>
                {verificationStatus === 'verified' ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-400">Phone number verified</p>
                      <p className="text-sm text-green-700 dark:text-green-500">{phone || user.phone} has been successfully verified</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Enter phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isVerifying || showVerifyInput || verificationStatus === 'verified'}
                          className="pl-9"
                        />
                      </div>
                      <Button 
                        onClick={handleSendVerificationCode}
                        disabled={isVerifying || showVerifyInput || verificationStatus === 'verified' || otpTimer > 0 || !phone}
                        className="whitespace-nowrap"
                      >
                        {verificationStatus === 'sending' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : otpTimer > 0 ? (
                          `Resend in ${otpTimer}s`
                        ) : (
                          "Send Code"
                        )}
                      </Button>
                    </div>
                    
                    {showVerifyInput && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-col sm:flex-row gap-2"
                      >
                        <Input
                          placeholder="Enter verification code"
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value)}
                          disabled={isVerifying || verificationStatus === 'verified'}
                          className="flex-1 text-center tracking-widest font-mono"
                          maxLength={6}
                        />
                        <Button 
                          onClick={handleVerifyPhone}
                          disabled={isVerifying || verificationStatus === 'verified' || !verifyCode}
                          className="whitespace-nowrap"
                          variant={verificationStatus === 'verifying' ? "outline" : "default"}
                        >
                          {verificationStatus === 'verifying' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="border-t bg-muted/20 justify-end">
              <Button variant="outline" onClick={handleLogout} className="hover:bg-red-100 hover:text-red-600">
                Logout
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        <Tabs defaultValue="applications">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="posted">Jobs Posted</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications">
            <div className="space-y-4">
              {myAppliedJobs.length > 0 ? (
                myAppliedJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all bg-card/80 backdrop-blur-sm">
                      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent border-b">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location.address}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3 pt-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-primary">₹{job.pay.amount}</span>
                          <span className="text-muted-foreground">{job.duration}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        
                        <div className="mt-4 pt-2 border-t">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/30">
                              Applied
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(job.timestamp + 86400000).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-accent/20 pt-2 pb-2">
                        <Button variant="outline" size="sm" className="w-full"
                          onClick={() => navigate(`/job/${job.id}`)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-16 bg-muted/5 rounded-lg border border-dashed"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground/70" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    You haven't applied to any jobs yet. Browse available jobs and start applying.
                  </p>
                  <Button onClick={() => navigate("/swipe")}>
                    Find Jobs
                  </Button>
                </motion.div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="posted">
            <div className="space-y-4">
              {postedJobs.length > 0 ? (
                postedJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all bg-card/80 backdrop-blur-sm">
                      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent border-b">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location.address}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3 pt-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-primary">₹{job.pay.amount}</span>
                          <span className="text-muted-foreground">Posted {new Date(job.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="mt-4 pt-2 border-t">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30">
                            4 Applicants
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-accent/20 pt-2 pb-2">
                        <Button variant="outline" size="sm" className="w-full"
                          onClick={() => navigate(`/job/${job.id}`)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-16 bg-muted/5 rounded-lg border border-dashed"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-muted-foreground/70" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No jobs posted</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    You haven't posted any jobs yet. Create a job listing to find the perfect candidate.
                  </p>
                  <Button onClick={() => navigate("/post-job")}>
                    Post a Job
                  </Button>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
