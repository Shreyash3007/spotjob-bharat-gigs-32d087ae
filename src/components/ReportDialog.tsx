import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createReport, ReportType, ReportReason } from "@/lib/reports";
import { useApp } from "@/context/AppContext";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: ReportType;
  targetName: string;
}

export function ReportDialog({ 
  isOpen, 
  onClose, 
  targetId, 
  targetType, 
  targetName 
}: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useApp();
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to report content",
        variant: "destructive"
      });
      onClose();
      return;
    }
    
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for your report",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        reporter_id: user.id,
        target_id: targetId,
        target_type: targetType,
        reason,
        details: details.trim() || undefined
      };
      
      const { error } = await createReport(reportData);
      
      if (error) throw error;
      
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep SpotJob safe"
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error submitting report",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reportTypeLabel = targetType === ReportType.JOB ? "job" : "user";
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report {reportTypeLabel}
          </DialogTitle>
          <DialogDescription>
            {targetType === ReportType.JOB 
              ? `Report inappropriate or suspicious job: "${targetName}"`
              : `Report user: "${targetName}"`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Why are you reporting this {reportTypeLabel}?</Label>
            <RadioGroup 
              value={reason || ""} 
              onValueChange={(value) => setReason(value as ReportReason)}
            >
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={ReportReason.SPAM} id="spam" />
                <Label htmlFor="spam" className="cursor-pointer">Spam</Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={ReportReason.MISLEADING} id="misleading" />
                <Label htmlFor="misleading" className="cursor-pointer">Misleading information</Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={ReportReason.FRAUD} id="fraud" />
                <Label htmlFor="fraud" className="cursor-pointer">Fraud or scam</Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={ReportReason.INAPPROPRIATE} id="inappropriate" />
                <Label htmlFor="inappropriate" className="cursor-pointer">Inappropriate content</Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={ReportReason.OTHER} id="other" />
                <Label htmlFor="other" className="cursor-pointer">Other</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Please provide any additional information that might help us understand the issue"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 