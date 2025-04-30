
import { useState } from "react";
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
import { MapPin, Phone } from "lucide-react";

const Profile = () => {
  const { user, logout, jobs, appliedJobs } = useApp();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const postedJobs = jobs.filter(job => job.posterId === user?.id);
  const myAppliedJobs = jobs.filter(job => appliedJobs.has(job.id));

  const handleSendOtp = () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    // In a real app, this would send an OTP via SMS
    setShowOtpInput(true);
    toast.success("OTP sent! Check your phone");
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    
    setIsVerifying(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsVerifying(false);
      toast.success("Phone number verified successfully!");
      setShowOtpInput(false);
    }, 1500);
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your phone number to login or create an account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Button onClick={handleSendOtp}>
                    Send OTP
                  </Button>
                </div>
              </div>
              
              {showOtpInput && (
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="otp"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button onClick={handleVerifyOtp} disabled={isVerifying}>
                      {isVerifying ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{user.name}</CardTitle>
                {user.verified && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-0">
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
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-amber-50 px-2 py-1 rounded border border-amber-200 text-amber-800 flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="font-medium">{user.rating}</span>
                <span className="mx-1 text-amber-300">•</span>
                <span className="text-sm">24 reviews</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Member since {new Date().toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={logout} className="w-full">
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
                  <Card key={job.id}>
                    <CardHeader className="pb-2">
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
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full"
                        onClick={() => window.location.href = `/job/${job.id}`}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
                  <Button onClick={() => window.location.href = "/swipe"}>
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
                  <Card key={job.id}>
                    <CardHeader className="pb-2">
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
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full"
                        onClick={() => window.location.href = `/job/${job.id}`}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
                  <Button onClick={() => window.location.href = "/post-job"}>
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
