import { useState, useEffect } from 'react';
import { toast } from "sonner";

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success("Back online", {
          description: "Your internet connection has been restored.",
          duration: 3000,
        });
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.error("You're offline", {
        description: "Please check your internet connection.",
        duration: Infinity, // This toast will stay until dismissed
        id: 'offline-toast' // Use an ID to prevent duplicate toasts
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial network state check
    if (!navigator.onLine && !wasOffline) {
      toast.error("You're offline", {
        description: "Please check your internet connection.",
        duration: Infinity,
        id: 'offline-toast'
      });
      setWasOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

export default useNetworkStatus; 