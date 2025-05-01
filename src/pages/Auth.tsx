
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Phone, Lock, ArrowRight, UserCheck, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationTab, setVerificationTab] = useState<'email' | 'phone'>('email');

  // Check if the user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            email_verified: false,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Please check your email for the confirmation link", {
        description: "We've sent you an email with a link to verify your account."
      });
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      navigate("/");
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "An error occurred with Google login");
    }
  };

  const sendPhoneOTP = async () => {
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, this would call your backend/edge function to send OTP
      // For now, we'll simulate this behavior
      setTimeout(() => {
        setOtpSent(true);
        toast.success("OTP sent successfully", {
          description: "Please check your phone for the verification code."
        });
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
      setLoading(false);
    }
  };

  const verifyPhoneOTP = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, this would verify the OTP with your backend
      // For now, we'll simulate a successful verification
      setTimeout(() => {
        toast.success("Phone verified successfully");
        navigate("/");
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Card className="border-0 shadow-xl dark:bg-card/50 dark:border-muted/30 backdrop-blur-sm">
            <CardHeader className="text-center space-y-1 bg-gradient-to-b from-primary/10 to-transparent rounded-t-lg pb-6">
              <CardTitle className="text-2xl font-bold">Welcome to SpotJob</CardTitle>
              <CardDescription>Access flexible job opportunities</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="login" value={verificationTab === 'phone' ? 'phone' : 'login'} 
                onValueChange={(v) => {
                  if (v === 'phone') {
                    setVerificationTab('phone');
                  } else {
                    setVerificationTab('email');
                  }
                }}
              >
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="phone">Phone OTP</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email-login"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          autoComplete="email"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="password-login">Password</Label>
                        <a href="#forgot" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="password-login"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          autoComplete="current-password"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        <>
                          Sign in <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email-register"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          autoComplete="email"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="password-register"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          autoComplete="new-password"
                          disabled={loading}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Password must be at least 8 characters.
                      </p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account
                        </>
                      ) : (
                        <>
                          Create account <UserCheck className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="phone" className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={(e) => { e.preventDefault(); sendPhoneOTP(); }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone-number">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="phone-number"
                            type="tel"
                            placeholder="+91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10"
                            disabled={loading}
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          We'll send a verification code to this number.
                        </p>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending OTP
                          </>
                        ) : (
                          <>
                            Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="pl-10 tracking-widest text-center font-mono text-lg"
                            disabled={loading}
                            maxLength={6}
                            required
                          />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <p className="text-muted-foreground">
                            Code sent to {phone}
                          </p>
                          <button 
                            type="button" 
                            onClick={sendPhoneOTP}
                            className="text-primary hover:underline"
                            disabled={loading}
                          >
                            Resend
                          </button>
                        </div>
                      </div>
                      <Button 
                        onClick={verifyPhoneOTP} 
                        disabled={loading || !otp} 
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying
                          </>
                        ) : (
                          <>
                            Verify & Login
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground dark:bg-card/50">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleGoogleLogin} 
                  className="w-full flex items-center justify-center gap-2 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground"
                  disabled={loading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </div>
            </CardContent>
            <CardFooter className="pb-6 px-8 flex justify-center">
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to SpotJob's{" "}
                <a href="#terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
                <a href="#privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Auth;
