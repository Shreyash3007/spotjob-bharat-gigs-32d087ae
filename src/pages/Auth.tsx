
import { useState } from "react";
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
import { Mail, Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if the user is already logged in
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      navigate("/");
    }
  });

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
      
      toast.success("Check your email for the confirmation link");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      navigate("/");
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

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <Card className="border-0 shadow-lg dark:shadow-primary/10">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome to SpotJob</CardTitle>
            <CardDescription>Sign in to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleEmailLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password-login">Password</Label>
                      <Input
                        id="password-login"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        disabled={loading}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="mt-2">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleEmailSignUp}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-register">Email</Label>
                      <Input
                        id="email-register"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password-register">Password</Label>
                      <Input
                        id="password-register"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={loading}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="mt-2">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin} 
                className="w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8.27346 11.3068C6.71224 11.3068 5.44489 10.0381 5.44489 8.47546C5.44489 6.91279 6.71224 5.64542 8.27346 5.64542C9.04193 5.64542 9.69543 5.93245 10.1991 6.3965L11.1303 5.46657C10.3651 4.7478 9.35249 4.33456 8.27346 4.33456C5.98911 4.33456 4.13403 6.19095 4.13403 8.47546C4.13403 10.76 5.98911 12.6164 8.27346 12.6164C9.36932 12.6164 10.3303 12.184 11.0754 11.5021C11.8766 10.7657 12.1973 9.77756 12.1973 8.95293C12.1973 8.62323 12.1666 8.31898 12.1155 8.09112H8.27346V9.35031H10.8682C10.7798 9.89113 10.446 10.3308 10.0272 10.6184C9.52834 10.9688 8.92615 11.3068 8.27346 11.3068Z" fill="currentColor" />
                </svg>
                Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
