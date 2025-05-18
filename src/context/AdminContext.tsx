
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSettings, UserRole } from "@/types/admin";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  appSettings: AppSettings | null;
  updateSetting: <K extends keyof AppSettings>(
    category: K, 
    value: AppSettings[K]
  ) => Promise<void>;
  toggleMaintenanceMode: () => Promise<void>;
  toggleFeature: (feature: keyof AppSettings['features']) => Promise<void>;
}

const defaultAppSettings: AppSettings = {
  maintenance_mode: {
    enabled: false,
    message: "We are currently performing maintenance. Please check back shortly."
  },
  features: {
    fake_jobs_enabled: false,
    fake_profiles_enabled: false
  },
  app_info: {
    version: "1.0.0",
    last_updated: new Date().toISOString().split('T')[0]
  }
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // Check if the current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data !== null);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fetch app settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('key, value');
          
        if (error) {
          console.error("Error fetching app settings:", error);
          return;
        }

        // Transform the settings array into our AppSettings object
        if (data && data.length > 0) {
          const settings = data.reduce<Record<string, any>>((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {});
          
          setAppSettings({
            maintenance_mode: settings.maintenance_mode || defaultAppSettings.maintenance_mode,
            features: settings.features || defaultAppSettings.features,
            app_info: settings.app_info || defaultAppSettings.app_info
          });
        } else {
          // Use default settings if none exist
          setAppSettings(defaultAppSettings);
        }
      } catch (error) {
        console.error("Error fetching app settings:", error);
      }
    };

    if (isAdmin) {
      fetchSettings();
    }
  }, [user, isAdmin]);

  // Update a specific setting category
  const updateSetting = async <K extends keyof AppSettings>(
    category: K, 
    value: AppSettings[K]
  ): Promise<void> => {
    if (!isAdmin || !user) {
      toast.error("You don't have permission to update settings");
      return;
    }

    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value, updated_by: user.id, updated_at: new Date().toISOString() })
        .eq('key', category);

      if (error) {
        console.error(`Error updating ${String(category)} setting:`, error);
        toast.error(`Failed to update ${String(category)} setting`);
        return;
      }

      // Update local state
      setAppSettings(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [category]: value
        };
      });
      
      toast.success(`${String(category).replace('_', ' ')} setting updated`);
    } catch (error) {
      console.error(`Error updating ${String(category)} setting:`, error);
      toast.error(`Failed to update ${String(category)} setting`);
    }
  };

  // Toggle maintenance mode
  const toggleMaintenanceMode = async (): Promise<void> => {
    if (!appSettings) return;
    
    const newMaintenanceSetting = {
      ...appSettings.maintenance_mode,
      enabled: !appSettings.maintenance_mode.enabled
    };
    
    await updateSetting('maintenance_mode', newMaintenanceSetting);
  };

  // Toggle a feature
  const toggleFeature = async (feature: keyof AppSettings['features']): Promise<void> => {
    if (!appSettings) return;
    
    const newFeatures = {
      ...appSettings.features,
      [feature]: !appSettings.features[feature]
    };
    
    await updateSetting('features', newFeatures);
  };

  const value = {
    isAdmin,
    loading,
    appSettings,
    updateSetting,
    toggleMaintenanceMode,
    toggleFeature
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  
  return context;
};
