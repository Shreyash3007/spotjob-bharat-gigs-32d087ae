import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The actual auth is handled by Supabase automatically
        // We just need to wait for the onAuthStateChange event
        // and then redirect to the home page
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } catch (err) {
        setError("Authentication failed. Please try again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="text-center">
        {error ? (
          <div className="text-destructive">{error}</div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold">Completing login...</h1>
            <p className="text-muted-foreground mt-2">You'll be redirected automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 