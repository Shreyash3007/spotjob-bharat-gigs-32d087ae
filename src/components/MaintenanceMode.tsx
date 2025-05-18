
import React from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";

const MaintenanceMode: React.FC = () => {
  const { appSettings } = useAdmin();
  
  if (!appSettings?.maintenance_mode.enabled) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full rounded-lg border shadow-lg bg-card p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Under Maintenance</h2>
        <p className="text-muted-foreground mb-6">
          {appSettings.maintenance_mode.message}
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span>We're working on it</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MaintenanceMode;
