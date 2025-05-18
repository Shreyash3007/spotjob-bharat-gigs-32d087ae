
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    truecallerCallback?: (response: {
      requestId: string;
      flowType: string;
      accessToken: string;
      error?: { code: string; message: string };
    }) => void;
    truecaller?: {
      init: (options: any) => void;
      open: () => void;
    };
  }
}

export interface TruecallerButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onError'> {
  onSuccess: (accessToken: string) => void;
  onError: (error: { code: string; message: string }) => void;
  appKey: string;
  isLoading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function TruecallerButton({
  onSuccess,
  onError,
  appKey,
  isLoading = false,
  variant = "default",
  className,
  ...props
}: TruecallerButtonProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const requestId = useRef(`truecaller_${Date.now()}`);
  
  // Load Truecaller SDK script
  useEffect(() => {
    if (isScriptLoaded) return;
    
    const script = document.createElement("script");
    script.src = "https://cdn.truecallersdk.com/sdk/latest/truecallersdk.min.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [isScriptLoaded]);
  
  // Initialize Truecaller SDK once script is loaded
  useEffect(() => {
    if (!isScriptLoaded || isInitialized || !window.truecaller) return;
    
    window.truecallerCallback = (response) => {
      if (response.accessToken) {
        onSuccess(response.accessToken);
      } else if (response.error) {
        onError(response.error);
      }
    };
    
    try {
      window.truecaller.init({
        requestId: requestId.current,
        appKey,
        flowType: "VERIFICATION",
        buttonTheme: "dark",
        buttonSize: "large",
        buttonId: "truecaller-sdk-button",
        callback: "truecallerCallback",
      });
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize Truecaller SDK:", error);
    }
  }, [isScriptLoaded, isInitialized, appKey, onSuccess, onError]);
  
  const handleTruecallerLogin = () => {
    if (window.truecaller && isInitialized) {
      window.truecaller.open();
    } else {
      onError({ 
        code: "SDK_NOT_INITIALIZED", 
        message: "Truecaller SDK is not initialized yet." 
      });
    }
  };
  
  return (
    <Button
      variant={variant}
      className={`flex items-center justify-center w-full py-6 text-base ${className}`}
      onClick={handleTruecallerLogin}
      disabled={isLoading || !isInitialized}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <img
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NSA1NSI+PHBhdGggZD0iTTI3LjUgNTVBMjcuNSAyNy41IDAgMSAxIDU1IDI3LjUgMjcuNDk5IDI3LjQ5OSAwIDAgMSAyNy41IDU1eiIgZmlsbD0iIzAwODVmZiIvPjxwYXRoIGQ9Ik0yNy41IDEwQTExLjUgMTEuNSAwIDAgMCAxNiAyMS41YzAgMTEuNDcgMTEuNSAyMy41IDExLjUgMjMuNVM0MyAzMi45OSA0MyAyMS41QTExLjUgMTEuNSAwIDAgMCAyNy41IDEwem0wIDE1YTMuNSAzLjUgMCAxIDEgMC03IDMuNSAzLjUgMCAwIDEgMCA3eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg=="
            alt="Truecaller"
            className="h-6 w-6 mr-2"
          />
          Continue with Truecaller
        </>
      )}
    </Button>
  );
}
