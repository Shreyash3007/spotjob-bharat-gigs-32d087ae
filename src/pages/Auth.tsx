import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Github, Mail, Phone, Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("mode") === "signup" ? "signup" : "login";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        toast.success("Account created! You can now log in.");
        navigate("/home");
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign up");
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;
      
      if (data.user) {
        toast.success("Logged in successfully!");
        navigate("/home");
      }
    } catch (error: any) {
      setError(error.message || "Failed to log in");
      toast.error(error.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
    } catch (error: any) {
      setError(error.message || `Failed to sign in with ${provider}`);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-accent/10">
      {/* Left side - marketing content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary/70 text-white relative p-12">
        <div className="max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Find Local Jobs. Get Hired Fast.</h1>
              <p className="text-lg opacity-90">
                Spotjob connects you with flexible work opportunities in your area. Sign up now to start earning!
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Find Work That Fits Your Schedule</h3>
                  <p className="opacity-90">Browse jobs based on your skills and availability</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v6a2 2 0 0 0 2 2h6"></path>
                    <path d="M5.41 5.41L5 5c-1.1 1.1-1 3.12.412 4.533L9 13.121l5.247 5.248 4.329-4.329-5.248-5.247-3.588-3.588C8.42 4 6.4 3.9 5.3 5l.11.41"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Chat Directly with Employers</h3>
                  <p className="opacity-90">No middlemen, deal directly with job posters</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Get Paid Quickly</h3>
                  <p className="opacity-90">Secure payment options right in the app</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="absolute bottom-8 left-12">
            <p className="text-sm opacity-70">© 2025 Spotjob. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right side - auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl">S</div>
              <span className="ml-2 text-2xl font-bold">SpotJob</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Welcome to SpotJob
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Social Sign-in Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border border-gray-300 relative h-11"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading || socialLoading !== null}
                  >
                    {socialLoading === 'google' ? (
                      <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : (
                      <svg 
                        className="h-5 w-5 mr-2" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574 0-4.185 3.345-7.574 7.439-7.574 2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4" />
                        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574 0-4.185 3.345-7.574 7.439-7.574 2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4" />
                        <path d="M0 11.449c0-6.627 5.373-12 12-12 3.059 0 5.842 1.154 7.961 3.039l-3.179 3.143C15.584 4.59 13.889 3.924 12 3.924c-4.151 0-7.516 3.396-7.516 7.524 0 4.129 3.365 7.525 7.516 7.525 3.584 0 5.997-1.936 6.827-4.69.212-.692.318-1.43.318-2.2H12v-4.101h12c.13.848 0 1.657 0 2.246 0 6.339-4.38 10.862-10.895 10.862-6.291-.001-11.584-5.09-11.584-11.717z" fill="#FBBC05" />
                        <path d="M12 5.975c2.321 0 4.365 1.131 5.657 2.85l2.775-2.725C18.46 3.812 15.598 2.3 12 2.3 7.3 2.3 3.249 5.024 1.323 8.964l3.218 2.394C5.532 8.081 8.451 5.975 12 5.975z" fill="#EA4335" />
                        <path d="M12 23c5.223 0 9.652-2.184 12.099-5.813l-3.107-2.459C19.434 16.867 16.677 18 13.99 18c-3.899 0-7.215-2.63-8.397-6.178L2.293 14.26C4.134 19.313 8.656 23 12 23z" fill="#34A853" />
                      </svg>
                    )}
                    Sign in with Google
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border border-gray-300 relative h-11"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading || socialLoading !== null}
                  >
                    {socialLoading === 'github' ? (
                      <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : (
                      <Github className="h-5 w-5 mr-2" />
                    )}
                    Sign in with GitHub
                  </Button>
                </div>

                <div className="flex items-center">
                  <Separator className="flex-1" />
                  <span className="px-3 text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
                </div>

                {/* Email Authentication Tabs */}
                <Tabs defaultValue={defaultTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="login-email" className="block text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="login-password" className="block text-sm font-medium">
                          Password
                        </label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                          {error}
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading || socialLoading !== null}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Logging in...
                          </span>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Log In with Email
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="signup-name" className="block text-sm font-medium">
                          Full Name
                        </label>
                        <Input
                          id="signup-name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="signup-email" className="block text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="signup-phone" className="block text-sm font-medium">
                          Phone Number (optional)
                        </label>
                        <Input
                          id="signup-phone"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="signup-password" className="block text-sm font-medium">
                          Password
                        </label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                          {error}
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading || socialLoading !== null}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Creating account...
                          </span>
                        ) : (
                          <>
                            <Smartphone className="h-4 w-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              By continuing, you agree to SpotJob's Terms of Service and Privacy Policy
            </CardFooter>
          </Card>
          
          <div className="mt-6 text-center text-sm text-gray-600 lg:hidden">
            © 2025 Spotjob. All rights reserved.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
