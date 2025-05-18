
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, AlertCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileCompletionCheckerProps {
  children: React.ReactNode;
}

export const ProfileCompletionChecker: React.FC<ProfileCompletionCheckerProps> = ({ children }) => {
  const { userProfile, profileCompletion, isProfileCompleted } = useApp();
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  
  // Check if profile needs to be completed
  useEffect(() => {
    if (userProfile && !isProfileCompleted) {
      setShowDialog(true);
    }
  }, [userProfile, isProfileCompleted]);
  
  // Force user to complete profile
  const handleContinueToProfile = () => {
    setShowDialog(false);
    navigate("/profile?complete=true");
  };
  
  // Get field status for each required field
  const getFieldStatus = () => {
    if (!userProfile) return {};
    
    const statuses: Record<string, boolean> = {};
    const PROFILE_FIELDS = {
      name: 15,
      phone: 10,
      email: 10,
      address: 10,
      dateOfBirth: 5,
      skills: 10,
      profilePicture: 10,
      bio: 10,
      education: 10,
      workExperience: 5,
      idVerification: 15
    };
    
    Object.entries(PROFILE_FIELDS).forEach(([field]) => {
      if (field === 'skills') {
        statuses[field] = !!userProfile.skills?.length;
      } else if (field === 'profilePicture') {
        statuses[field] = !!userProfile.avatar_url;
      } else if (field === 'idVerification') {
        statuses[field] = !!userProfile.id_verified;
      } else {
        statuses[field] = !!userProfile[field as keyof typeof userProfile];
      }
    });
    
    return statuses;
  };
  
  const fieldStatuses = getFieldStatus();
  const fieldLabels: Record<string, string> = {
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    address: "Home Address",
    dateOfBirth: "Date of Birth",
    skills: "Skills",
    profilePicture: "Profile Picture",
    bio: "Short Bio",
    education: "Education",
    workExperience: "Work Experience",
    idVerification: "ID Verification"
  };
  
  if (!showDialog) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md md:max-w-lg" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
            <DialogDescription>
              Your profile is only {profileCompletion}% complete. You need at least 70% completion 
              to access all features of the app.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-medium">{profileCompletion}%</span>
            </div>
            <Progress 
              value={profileCompletion} 
              className="h-2" 
            />
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {Object.entries(fieldLabels).map(([field, label]) => (
              <motion.div 
                key={field}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  fieldStatuses[field] ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 
                  'bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700'
                }`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    fieldStatuses[field] ? 'bg-green-100 text-green-600 dark:bg-green-800/50 dark:text-green-400' : 
                    'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}>
                    {fieldStatuses[field] ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Required for profile completion
                    </div>
                  </div>
                </div>
                <div>
                  {fieldStatuses[field] ? (
                    <span className="text-xs text-green-600 dark:text-green-400 inline-flex items-center">
                      Completed <Check className="h-3 w-3 ml-1" />
                    </span>
                  ) : (
                    <span className="text-xs text-orange-600 dark:text-orange-400">Required</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              onClick={handleContinueToProfile} 
              className="w-full sm:w-auto flex items-center justify-center"
            >
              Complete My Profile
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
};
