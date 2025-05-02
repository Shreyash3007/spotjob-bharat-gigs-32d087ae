import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertOctagon, 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  User,
  MessageSquare,
  Flag
} from "lucide-react";
import { format } from "date-fns";
import { ReportType, ReportReason } from "@/lib/reports";

const AdminDashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useApp();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select(`
            *,
            reporter:reporter_id(id, name, avatar),
            target_job:target_id(id, title, description, category)
          `)
          .order('created_at', { ascending: false });
          
        if (reportsError) throw reportsError;
        
        // Fetch user count
        const { count: userCountData, error: userCountError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
          
        if (userCountError) throw userCountError;
        
        // Fetch job count
        const { count: jobCountData, error: jobCountError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });
          
        if (jobCountError) throw jobCountError;
        
        // Fetch active job count
        const { count: activeCountData, error: activeCountError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');
          
        if (activeCountError) throw activeCountError;
        
        setReports(reportsData || []);
        setPendingReports((reportsData || []).filter(report => report.status === 'pending'));
        setUserCount(userCountData || 0);
        setJobCount(jobCountData || 0);
        setActiveCount(activeCountData || 0);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "Error loading dashboard data",
          description: "There was a problem loading the admin dashboard data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up realtime subscription for reports
    const reportsSubscription = supabase
      .channel('admin-reports')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reports' 
      }, fetchDashboardData)
      .subscribe();
      
    return () => {
      supabase.removeChannel(reportsSubscription);
    };
  }, [toast]);
  
  const handleApproveReport = async (reportId: string) => {
    try {
      // Update report status
      const { error } = await supabase
        .from('reports')
        .update({ status: 'approved' })
        .eq('id', reportId);
        
      if (error) throw error;
      
      // This will trigger the realtime subscription
      
      toast({
        title: "Report approved",
        description: "The report has been marked as approved",
      });
    } catch (error) {
      console.error('Error approving report:', error);
      toast({
        title: "Error approving report",
        description: "There was a problem approving the report",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectReport = async (reportId: string) => {
    try {
      // Update report status
      const { error } = await supabase
        .from('reports')
        .update({ status: 'rejected' })
        .eq('id', reportId);
        
      if (error) throw error;
      
      // This will trigger the realtime subscription
      
      toast({
        title: "Report rejected",
        description: "The report has been marked as rejected",
      });
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast({
        title: "Error rejecting report",
        description: "There was a problem rejecting the report",
        variant: "destructive"
      });
    }
  };
  
  const getReasonBadgeColor = (reason: ReportReason) => {
    switch (reason) {
      case ReportReason.SPAM:
        return "bg-yellow-100 text-yellow-800";
      case ReportReason.FRAUD:
        return "bg-red-100 text-red-800";
      case ReportReason.INAPPROPRIATE:
        return "bg-purple-100 text-purple-800";
      case ReportReason.MISLEADING:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getReportTypeIcon = (type: ReportType) => {
    return type === ReportType.JOB ? <FileText className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };
  
  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-destructive/10 p-3 rounded-full mb-4">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-center max-w-sm">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Dashboard
          </h1>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Data
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{userCount}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-3xl font-bold">{jobCount}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-3xl font-bold">{activeCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                  <p className="text-3xl font-bold">{pendingReports.length}</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Flag className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="pending">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-1">
                <AlertOctagon className="h-4 w-4" />
                Pending ({pendingReports.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                All Reports ({reports.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="pending" className="mt-0">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-lg">Pending Reports</CardTitle>
                <CardDescription>Reports that need review and action</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading reports...</div>
                ) : pendingReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending reports to review. Great job!
                  </div>
                ) : (
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-1">
                                {getReportTypeIcon(report.target_type)}
                                <span>
                                  {report.target_type === ReportType.JOB ? 'Job' : 'User'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getReasonBadgeColor(report.reason)}>
                                {report.reason}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {report.reporter?.name || 'Anonymous'}
                            </TableCell>
                            <TableCell>
                              {format(new Date(report.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleRejectReport(report.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={() => handleApproveReport(report.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-lg">All Reports</CardTitle>
                <CardDescription>Complete history of all reports</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading reports...</div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reports in the system.
                  </div>
                ) : (
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-1">
                                {getReportTypeIcon(report.target_type)}
                                <span>
                                  {report.target_type === ReportType.JOB ? 'Job' : 'User'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getReasonBadgeColor(report.reason)}>
                                {report.reason}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                report.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : report.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(report.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {selectedReport && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Details</CardTitle>
              <CardDescription>
                Report #{selectedReport.id.slice(0, 8)} - Submitted on {format(new Date(selectedReport.created_at), 'MMM dd, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Report Type</h3>
                <p className="flex items-center gap-1">
                  {getReportTypeIcon(selectedReport.target_type)}
                  <span>{selectedReport.target_type === ReportType.JOB ? 'Job Report' : 'User Report'}</span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Reason</h3>
                <Badge className={getReasonBadgeColor(selectedReport.reason)}>
                  {selectedReport.reason}
                </Badge>
              </div>
              
              {selectedReport.details && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Additional Details</h3>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {selectedReport.details}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Reported Content</h3>
                <div className="bg-muted p-3 rounded-md">
                  {selectedReport.target_type === ReportType.JOB && selectedReport.target_job ? (
                    <div>
                      <p className="font-medium">{selectedReport.target_job.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedReport.target_job.description}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">User profile information</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedReport.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleRejectReport(selectedReport.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => handleApproveReport(selectedReport.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Report
                    </Button>
                  </>
                )}
                <Button 
                  variant="default"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard; 