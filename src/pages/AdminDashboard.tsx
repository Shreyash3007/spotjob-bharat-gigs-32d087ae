
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { BarChart, Activity, Settings, Users, AlertTriangle, CheckCircle, Info, ShieldCheck } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading, appSettings, toggleMaintenanceMode, toggleFeature, updateSetting } = useAdmin();
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    appSettings?.maintenance_mode.message || "We are currently performing maintenance. Please check back shortly."
  );

  // Update maintenance message when appSettings changes
  React.useEffect(() => {
    if (appSettings?.maintenance_mode.message) {
      setMaintenanceMessage(appSettings.maintenance_mode.message);
    }
  }, [appSettings]);

  // Save maintenance message
  const saveMaintenanceMessage = async () => {
    if (!appSettings) return;
    
    await updateSetting('maintenance_mode', {
      ...appSettings.maintenance_mode,
      message: maintenanceMessage
    });
  };

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // If loading, show loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-4 mx-auto"></div>
            <p className="text-lg font-medium">Checking admin privileges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If not admin, show unauthorized
  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <ShieldCheck className="h-6 w-6" />
                Unauthorized Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 dark:text-red-300">
                You don't have permission to access the admin dashboard. Please contact an administrator if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage app settings and monitor performance</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              v{appSettings?.app_info.version || '1.0.0'}
            </Badge>
          </div>

          <Tabs defaultValue="app-settings">
            <TabsList className="mb-6">
              <TabsTrigger value="app-settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                App Settings
              </TabsTrigger>
              <TabsTrigger value="user-management" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="system-status" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="app-settings">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Maintenance Mode
                    </CardTitle>
                    <CardDescription>
                      When enabled, users will see a maintenance message instead of the app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Maintenance Mode</h3>
                        <p className="text-sm text-muted-foreground">
                          {appSettings?.maintenance_mode.enabled ? 'Currently active' : 'Currently inactive'}
                        </p>
                      </div>
                      <Switch 
                        checked={appSettings?.maintenance_mode.enabled || false} 
                        onCheckedChange={toggleMaintenanceMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-message">Maintenance Message</Label>
                      <Textarea 
                        id="maintenance-message"
                        value={maintenanceMessage} 
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        placeholder="Enter the message users will see during maintenance"
                        className="min-h-32"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button onClick={saveMaintenanceMessage}>Save Message</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      Feature Toggles
                    </CardTitle>
                    <CardDescription>
                      Enable or disable specific features in the app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Demo Jobs</h3>
                        <p className="text-sm text-muted-foreground">
                          Show sample job listings when real data is limited
                        </p>
                      </div>
                      <Switch 
                        checked={appSettings?.features.fake_jobs_enabled || false} 
                        onCheckedChange={() => toggleFeature('fake_jobs_enabled')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Demo Profiles</h3>
                        <p className="text-sm text-muted-foreground">
                          Show sample user profiles when real data is limited
                        </p>
                      </div>
                      <Switch 
                        checked={appSettings?.features.fake_profiles_enabled || false}
                        onCheckedChange={() => toggleFeature('fake_profiles_enabled')} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="user-management">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage users and roles (to be implemented)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This section will be implemented in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    View app analytics and insights (to be implemented)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This section will be implemented in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system-status">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>
                    View system health and performance metrics (to be implemented)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This section will be implemented in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
