import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { OTPInput } from "@/components/ui/otp-input";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PhoneIcon, LockIcon, Loader2, ArrowRightIcon, CheckCircle2, Fingerprint, Mail, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { TruecallerButton } from "@/components/ui/truecaller-button";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginMethod = "phone" | "email" | "biometric";

const Login = () => {
  // Use our custom auth hook instead of AppContext
  const { 
    sendOTP, 
    verifyOTP, 
    resendOTP, 
    loginWithGoogle, 
    loginWithTruecaller, 
    loginWithWhatsApp,
    sendMagicLink,
    loginWithBiometrics,
    isBiometricsAvailable,
    isAuthenticating
  } = useAuth();
  
  // State for login screen
  const [loginStep, setLoginStep] = useState<"input" | "verify">("input");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: "+91", name: "India", flag: "🇮🇳" });
  const [error, setError] = useState<string | null>(null);
  
  // For handling rate limiting UI feedback
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate email format
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);
  
  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendCountdown, resendDisabled]);
  
  // Auto-focus effect for OTP input
  useEffect(() => {
    if (loginStep === "verify") {
      // Let the animation complete first
      const timer = setTimeout(() => {
        const otpInput = document.querySelector('input[aria-label="Please enter verification code. Digit 1"]');
        if (otpInput) {
          (otpInput as HTMLInputElement).focus();
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [loginStep]);

  // Check for saved credentials
  useEffect(() => {
    const savedPhone = localStorage.getItem("auth_remembered_phone");
    const savedEmail = localStorage.getItem("auth_remembered_email");
    const savedMethod = localStorage.getItem("auth_remembered_method") as LoginMethod | null;
    
    if (savedMethod && (savedPhone || savedEmail)) {
      setLoginMethod(savedMethod);
      if (savedMethod === "phone" && savedPhone) {
        setPhone(savedPhone);
        setRememberMe(true);
      } else if (savedMethod === "email" && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
    
    // Check if biometrics were previously set up
    const hasBiometrics = !!localStorage.getItem("biometric_user");
    if (hasBiometrics && isBiometricsAvailable) {
      setLoginMethod("biometric");
    }
  }, [isBiometricsAvailable]);

  // Handle phone number validation
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setError(null);
    
    // Phone validation is now handled by the PhoneInput component
    const phoneRegex = /^[6-9]\d{9}$/;
    setIsValidPhone(phoneRegex.test(value));
  };
  
  // Handle country code change
  const handleCountryChange = (country: { code: string; name: string; flag: string }) => {
    setSelectedCountry(country);
  };

  // Handle send OTP for phone auth
  const handleSendOTP = async () => {
    if (!isValidPhone) {
      setError("Please enter a valid phone number");
      return;
    }

    setError(null);
    
    // Format phone with country code
    const formattedPhone = `${selectedCountry.code}${phone}`;
    
    const { error } = await sendOTP(formattedPhone);
    if (error) {
      if (error.code === "auth/too-many-requests") {
        setResendDisabled(true);
        setResendCountdown(60); // 1 minute cooldown
      }
      
      setError(error.message);
      toast({
        title: "Error sending verification code",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setOtpSent(true);
      setLoginStep("verify");
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
        duration: 4000
      });
      
      // Save phone if remember me is checked
      if (rememberMe) {
        localStorage.setItem("auth_remembered_phone", phone);
        localStorage.setItem("auth_remembered_method", "phone");
      } else {
        localStorage.removeItem("auth_remembered_phone");
        localStorage.removeItem("auth_remembered_method");
      }
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setError(null);
    
    // Format phone with country code
    const formattedPhone = `${selectedCountry.code}${phone}`;
    
    const { error } = await verifyOTP(formattedPhone, otp);
    if (error) {
      setError(error.message);
      toast({
        title: "Error verifying code",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login successful",
        description: "Welcome to SpotJob!"
      });
      navigate("/");
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setResendDisabled(true);
    setResendCountdown(60); // 1 minute cooldown
    
    const formattedPhone = `${selectedCountry.code}${phone}`;
    const { error } = await resendOTP(formattedPhone);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Error resending code",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Verification code resent",
        description: "Please check your phone for the new code",
        duration: 4000
      });
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    const { error } = await loginWithGoogle();
    if (error) {
      setError(error.message);
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive"
      });
    }
    // No need to navigate - the OAuth redirect will handle this
  };
  
  // Handle Truecaller login
  const handleTruecallerLogin = async (accessToken: string) => {
    const { error } = await loginWithTruecaller();
    if (error) {
      setError(error.message);
      toast({
        title: "Error signing in with Truecaller",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login successful",
        description: "Welcome to SpotJob!"
      });
      navigate("/");
    }
  };
  
  // Handle WhatsApp login
  const handleWhatsAppLogin = async (phone: string) => {
    const formattedPhone = phone.startsWith(selectedCountry.code) 
      ? phone 
      : `${selectedCountry.code}${phone}`;
      
    const { error } = await loginWithWhatsApp();
    if (error) {
      setError(error.message);
      toast({
        title: "Error signing in with WhatsApp",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login successful",
        description: "Welcome to SpotJob!"
      });
      navigate("/");
    }
  };
  
  // Handle Magic Link email login
  const handleSendMagicLink = async () => {
    if (!isValidEmail) {
      setError("Please enter a valid email address");
      return;
    }
    
    setError(null);
    const { error } = await sendMagicLink(email);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Error sending login link",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login link sent",
        description: "Please check your email for the login link",
        variant: "success",
        duration: 6000
      });
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("auth_remembered_email", email);
        localStorage.setItem("auth_remembered_method", "email");
      } else {
        localStorage.removeItem("auth_remembered_email");
        localStorage.removeItem("auth_remembered_method");
      }
    }
  };
  
  // Handle biometric login
  const handleBiometricLogin = async () => {
    const { error } = await loginWithBiometrics();
    if (error) {
      setError(error.message);
      toast({
        title: "Biometric authentication failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login successful",
        description: "Welcome back to SpotJob!"
      });
      navigate("/");
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const otpInputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }
  };

  return (
    <motion.div 
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full max-w-md overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-black/70 shadow-xl border-primary/10 relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl z-0" />
        <div className="absolute -bottom-32 -left-24 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl z-0" />
        
        <CardHeader className="text-center relative z-10">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Welcome to SpotJob
          </CardTitle>
          <CardDescription className="mt-2 text-base opacity-90">
            {loginStep === "verify" 
              ? "Verify your phone number" 
              : "Sign in to find your next opportunity"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <AnimatePresence mode="wait">
            {loginStep === "input" ? (
              <motion.div
                key="input-step"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <Tabs 
                  defaultValue={loginMethod} 
                  onValueChange={(val) => setLoginMethod(val as LoginMethod)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="phone" className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Phone</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Email</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="biometric" 
                      disabled={!isBiometricsAvailable || !localStorage.getItem("biometric_user")}
                      className="flex items-center gap-2"
                    >
                      <Fingerprint className="h-4 w-4" />
                      <span className="hidden sm:inline">Biometric</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="phone" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center">
                        <PhoneIcon className="h-4 w-4 text-primary mr-2" />
                        Phone Number
                      </Label>
                      <PhoneInput
                        value={phone}
                        onChange={handlePhoneChange}
                        selectedCountry={selectedCountry}
                        onCountryChange={handleCountryChange}
                        error={error || undefined}
                        placeholder="9876543210"
                        disabled={isAuthenticating}
                        required
                        aria-label="Phone number"
                        aria-required="true"
                        aria-invalid={!!error}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember-phone" 
                        checked={rememberMe} 
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <Label htmlFor="remember-phone" className="text-sm text-muted-foreground">
                        Remember me
                      </Label>
                    </div>
                    
                    <Button
                      className="w-full py-6 text-base font-medium rounded-xl transition-all hover:scale-[1.02] group"
                      onClick={handleSendOTP}
                      disabled={isAuthenticating || !isValidPhone}
                      aria-label="Continue with phone verification"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending verification code...
                        </>
                      ) : (
                        <>
                          Continue with Phone
                          <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                    
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                      </div>
                      
                      <WhatsAppButton 
                        onLogin={() => handleWhatsAppLogin(phone)}
                        isLoading={isAuthenticating}
                        phone={isValidPhone ? phone : undefined}
                        className="mb-3"
                      />
                      
                      <TruecallerButton
                        onSuccess={handleTruecallerLogin}
                        onError={(error) => {
                          setError(error.message);
                          toast({
                            title: "Truecaller error",
                            description: error.message,
                            variant: "destructive"
                          });
                        }}
                        appKey="your-truecaller-app-key"
                        isLoading={isAuthenticating}
                        variant="outline"
                        className="mb-3"
                      />
                      
                      <Button
                        variant="outline"
                        className="w-full py-6 text-base bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl"
                        onClick={handleGoogleLogin}
                        disabled={isAuthenticating}
                        aria-label="Continue with Google"
                      >
                        <img 
                          src="https://developers.google.com/identity/images/g-logo.png" 
                          alt="Google Logo" 
                          className="h-5 w-5 mr-2" 
                          loading="lazy"
                        />
                        Continue with Google
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="email" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center">
                        <Mail className="h-4 w-4 text-primary mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                        placeholder="you@example.com"
                        disabled={isAuthenticating}
                        className="py-6 text-lg placeholder:text-gray-400 border-primary/20 focus:border-primary"
                        required
                        aria-label="Email address"
                        aria-required="true"
                        aria-invalid={!!error}
                      />
                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember-email" 
                        checked={rememberMe} 
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <Label htmlFor="remember-email" className="text-sm text-muted-foreground">
                        Remember me
                      </Label>
                    </div>
                    
                    <Button
                      className="w-full py-6 text-base font-medium rounded-xl transition-all hover:scale-[1.02] group"
                      onClick={handleSendMagicLink}
                      disabled={isAuthenticating || !isValidEmail}
                      aria-label="Send magic link to email"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending login link...
                        </>
                      ) : (
                        <>
                          Send Login Link
                          <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                    
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full py-6 text-base bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl"
                        onClick={handleGoogleLogin}
                        disabled={isAuthenticating}
                        aria-label="Continue with Google"
                      >
                        <img 
                          src="https://developers.google.com/identity/images/g-logo.png" 
                          alt="Google Logo" 
                          className="h-5 w-5 mr-2" 
                          loading="lazy"
                        />
                        Continue with Google
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="biometric" className="mt-4 space-y-4">
                    <div className="text-center py-6">
                      <Fingerprint className="h-16 w-16 mx-auto text-primary mb-4" />
                      <h3 className="text-lg font-medium mb-2">Biometric Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Use your fingerprint, face, or device PIN to sign in securely
                      </p>
                      
                      <Button
                        className="w-full py-6 text-base font-medium rounded-xl transition-all hover:scale-[1.02] group"
                        onClick={handleBiometricLogin}
                        disabled={isAuthenticating}
                        aria-label="Sign in with biometrics"
                      >
                        {isAuthenticating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Sign in with Biometrics
                            <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full py-6 text-base font-medium"
                        onClick={() => setLoginMethod("phone")}
                      >
                        Sign in with another method
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div 
                key="verify-step"
                variants={otpInputVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-4 -ml-2"
                  onClick={() => setLoginStep("input")}
                  aria-label="Go back to phone input"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <LockIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Verification Code</span>
                  </div>
                  
                  <div className="py-4">
                    <OTPInput
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      containerClassName="flex justify-center gap-2"
                      inputClassName="w-12 h-16 text-center text-xl font-bold border-2 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}
                  
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {otpSent ? (
                      <>We've sent a verification code to <span className="font-medium text-foreground">{selectedCountry.code} {phone}</span></>
                    ) : (
                      "Enter the 6-digit verification code"
                    )}
                  </p>
                  
                  <Button
                    className="w-full py-6 text-base font-medium rounded-xl mt-6 transition-all hover:scale-[1.02] group"
                    onClick={handleVerifyOTP}
                    disabled={isAuthenticating || otp.length !== 6}
                    aria-label="Verify code and continue"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  
                  <div className="flex justify-between mt-4 text-sm">
                    <button
                      onClick={() => setLoginStep("input")}
                      className="text-primary hover:text-primary/80 hover:underline"
                      aria-label="Change phone number"
                    >
                      Change phone number
                    </button>
                    <button
                      onClick={handleResendOTP}
                      className={`text-primary hover:text-primary/80 hover:underline ${resendDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={isAuthenticating || resendDisabled}
                      aria-label="Resend verification code"
                    >
                      {resendDisabled 
                        ? `Resend in ${resendCountdown}s` 
                        : isAuthenticating 
                          ? "Sending..." 
                          : "Resend code"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="relative z-10 flex justify-center pt-0 pb-6">
          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default Login; 