import React from "react";
import { useApp } from "@/context/AppContext";
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const NetworkStatusBanner = () => {
  const { isOnline } = useApp();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-destructive text-destructive-foreground w-full py-2 px-4 text-center text-sm font-medium flex items-center justify-center"
        >
          <WifiOff className="h-4 w-4 mr-2" />
          You're offline. Some features may be unavailable.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatusBanner; 