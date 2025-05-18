
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { AppSettings, AdminUser } from "@/types/admin";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  appSettings: AppSettings | null;
  updateAppSettings: (key: string, value: any) => Promise<void>;
  toggleMaintenanceMode: (enabled: boolean, message?: string) => Promise<void>;
  toggleFeature: (feature: keyof AppSettings['features'], enabled: boolean) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
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
          .rpc('is_admin', { user_id: user.id });

        if (error) throw error;
        setIsAdmin(data || false);
        
        // If user is admin, fetch app settings
        if (data) {
          await fetchAppSettings();
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
  const fetchAppSettings = async () => {
    try {
      // Fetch maintenance mode settings
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (maintenanceError) throw maintenanceError;

      // Fetch features settings
      const { data: featuresData, error: featuresError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'features')
        .single();

      if (featuresError) throw featuresError;

      // Fetch app info
      const { data: appInfoData, error: appInfoError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'app_info')
        .single();

      if (appInfoError) throw appInfoError;

      // Combine settings
      const settings: AppSettings = {
        maintenance_mode: maintenanceData.value as AppSettings['maintenance_mode'],
        features: featuresData.value as AppSettings['features'],
        app_info: appInfoData.value as AppSettings['app_info'],
      };

      setAppSettings(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      toast.error("Failed to load app settings");
    }
  };

  // Update app settings
  const updateAppSettings = async (key: string, value: any) => {
    if (!isAdmin || !user) return;
    
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('key', key);
      
      if (error) throw error;
      
      // Update local state
      await fetchAppSettings();
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error(`Error updating ${key} settings:`, error);
      toast.error(`Failed to update settings`);
    }
  };

  // Toggle maintenance mode
  const toggleMaintenanceMode = async (enabled: boolean, message?: string) => {
    if (!appSettings) return;
    
    const updatedValue = {
      enabled,
      message: message || appSettings.maintenance_mode.message
    };
    
    await updateAppSettings('maintenance_mode', updatedValue);
  };

  // Toggle feature
  const toggleFeature = async (feature: keyof AppSettings['features'], enabled: boolean) => {
    if (!appSettings) return;
    
    const updatedFeatures = {
      ...appSettings.features,
      [feature]: enabled
    };
    
    await updateAppSettings('features', updatedFeatures);
  };
  
  const value = {
    isAdmin,
    loading,
    appSettings,
    updateAppSettings,
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
