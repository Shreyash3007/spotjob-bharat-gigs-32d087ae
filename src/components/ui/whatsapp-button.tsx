import React from "react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

export interface WhatsAppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onLogin: (phone: string) => Promise<void>;
  isLoading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  phone?: string;
}

export function WhatsAppButton({
  onLogin,
  isLoading = false,
  variant = "default",
  className,
  phone,
  ...props
}: WhatsAppButtonProps) {
  const handleWhatsAppLogin = async () => {
    try {
      // In production, you would integrate with WhatsApp Business API
      // This is a simplified version that uses the phone number already entered
      if (phone) {
        await onLogin(phone);
      } else {
        // If no phone provided, could prompt user or show error
        console.error("No phone number provided for WhatsApp authentication");
      }
    } catch (error) {
      console.error("Error initiating WhatsApp login:", error);
    }
  };
  
  return (
    <Button
      variant={variant || "default"}
      className={`flex items-center justify-center w-full py-6 text-base bg-[#25D366] hover:bg-[#128C7E] text-white ${className}`}
      onClick={handleWhatsAppLogin}
      disabled={isLoading || !phone}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24"
            viewBox="0 0 24 24" 
            fill="white"
            className="mr-2 h-5 w-5"
          >
            <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.22-.16-.47-.27z"/>
          </svg>
          Continue with WhatsApp
        </>
      )}
    </Button>
  );
} 