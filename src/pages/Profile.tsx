
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
import { MapPin, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, logout, jobs, appliedJobs } = useApp();
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !user) {
        navigate('/auth');
      }
    });
  }, [navigate, user]);

  const postedJobs = jobs.filter(job => job.posterId === user?.id);
  const myAppliedJobs = jobs.filter(job => appliedJobs.has(job.id));

  const handleSendVerificationCode = async () => {
    if (!phone.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // In a real app with Supabase, we would verify the phone here
      // Using a timeout to simulate the API call
      setTimeout(() => {
        setShowVerifyInput(true);
        setIsVerifying(false);
        toast.success("Verification code sent to your phone");
      }, 1500);
    } catch (error) {
      toast.error("Failed to send verification code");
      setIsVerifying(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!verifyCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // In a real app with Supabase, we would verify the code here
      // Using a timeout to simulate the API call
      setTimeout(() => {
        setIsVerifying(false);
        setShowVerifyInput(false);
        toast.success("Phone number verified successfully!");
      }, 1500);
    } catch (error) {
      toast.error("Failed to verify code. Please try again.");
      setIsVerifying(false);
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

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-10">
          <Card className="border shadow-lg overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6 border shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
            <div className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/30">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{user.name}</CardTitle>
                  {user.verified && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                      Verified ✓
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-muted-foreground mt-1">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Pune, Maharashtra</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-200 flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="font-medium">{user.rating}</span>
                <span className="mx-1 text-amber-300">•</span>
                <span className="text-sm">24 reviews</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Member since {new Date().toLocaleDateString()}
            </p>
            
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Verify your phone number</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isVerifying || showVerifyInput}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendVerificationCode}
                    disabled={isVerifying || showVerifyInput || !phone}
                    className="whitespace-nowrap"
                  >
                    {isVerifying && !showVerifyInput ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Code"
                    )}
                  </Button>
                </div>
                
                {showVerifyInput && (
                  <div className="flex flex-col sm:flex-row gap-2 animate-fade-in">
                    <Input
                      placeholder="Enter verification code"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      disabled={isVerifying}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleVerifyPhone}
                      disabled={isVerifying || !verifyCode}
                      className="whitespace-nowrap"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20">
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </CardFooter>
        </Card>
        
        <Tabs defaultValue="applications">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="posted">Jobs Posted</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications">
            <div className="space-y-4">
              {myAppliedJobs.length > 0 ? (
                myAppliedJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">₹{job.pay.amount} {job.pay.type}</span>
                        <span className="text-muted-foreground">{job.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    </CardContent>
                    <CardFooter className="bg-muted/10">
                      <Button variant="outline" size="sm" className="w-full"
                        onClick={() => navigate(`/job/${job.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 bg-muted/5 rounded-lg border border-dashed">
                  <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
                  <Button onClick={() => navigate("/swipe")}>
                    Find Jobs
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="posted">
            <div className="space-y-4">
              {postedJobs.length > 0 ? (
                postedJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">₹{job.pay.amount} {job.pay.type}</span>
                        <span className="text-muted-foreground">Posted {new Date(job.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    </CardContent>
                    <CardFooter className="bg-muted/10">
                      <Button variant="outline" size="sm" className="w-full"
                        onClick={() => navigate(`/job/${job.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 bg-muted/5 rounded-lg border border-dashed">
                  <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
                  <Button onClick={() => navigate("/post-job")}>
                    Post a Job
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
