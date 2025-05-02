import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Upload, Loader2, ShieldCheck, Info } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

enum KycStep {
  ID_SELECTION,
  ID_UPLOAD,
  SELFIE,
  REVIEW,
  COMPLETE
}

interface KycVerificationProps {
  onComplete: () => void;
}

export function KycVerification({ onComplete }: KycVerificationProps) {
  const [currentStep, setCurrentStep] = useState<KycStep>(KycStep.ID_SELECTION);
  const [idType, setIdType] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateUserProfile } = useApp();
  const { toast } = useToast();

  const handleIdTypeChange = (value: string) => {
    setIdType(value);
  };

  const handleIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdNumber(e.target.value);
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfieImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, this would send the data to a verification service
      // For demo purposes, we'll just simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user profile to mark as verified
      await updateUserProfile({ verified: true });
      
      setCurrentStep(KycStep.COMPLETE);
      toast({
        title: "Verification submitted successfully",
        description: "Your ID has been submitted for verification. This usually takes 1-2 business days."
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "There was an error submitting your verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>
          Verify your identity to build trust and access more opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === KycStep.ID_SELECTION && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Why verify?</AlertTitle>
              <AlertDescription>
                Verified profiles get 3x more responses and have higher trust scores.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="id-type">Select ID Type</Label>
              <Select value={idType} onValueChange={handleIdTypeChange}>
                <SelectTrigger id="id-type">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                  <SelectItem value="pan">PAN Card</SelectItem>
                  <SelectItem value="voter">Voter ID</SelectItem>
                  <SelectItem value="driving">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="id-number">ID Number</Label>
              <Input 
                id="id-number" 
                value={idNumber} 
                onChange={handleIdNumberChange}
                placeholder={
                  idType === "aadhaar" ? "1234 5678 9012" :
                  idType === "pan" ? "ABCDE1234F" :
                  "Enter ID number"
                }
              />
            </div>
          </div>
        )}
        
        {currentStep === KycStep.ID_UPLOAD && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {idImage ? (
                <div className="space-y-2">
                  <img 
                    src={idImage} 
                    alt="ID" 
                    className="max-h-40 mx-auto object-contain" 
                  />
                  <p className="text-sm text-muted-foreground">ID uploaded successfully</p>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">Upload your {idType === "aadhaar" ? "Aadhaar Card" : idType === "pan" ? "PAN Card" : "ID"}</p>
                  <p className="text-xs text-muted-foreground mb-4">JPG or PNG, max 5MB</p>
                  <Label 
                    htmlFor="id-upload" 
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90"
                  >
                    Choose File
                  </Label>
                  <Input 
                    id="id-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleIdUpload}
                    className="hidden" 
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentStep === KycStep.SELFIE && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {selfieImage ? (
                <div className="space-y-2">
                  <img 
                    src={selfieImage} 
                    alt="Selfie" 
                    className="max-h-40 mx-auto object-contain" 
                  />
                  <p className="text-sm text-muted-foreground">Selfie captured successfully</p>
                </div>
              ) : (
                <div className="py-4">
                  <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">Take a Selfie</p>
                  <p className="text-xs text-muted-foreground mb-4">For identity verification</p>
                  <Label 
                    htmlFor="selfie-upload" 
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90"
                  >
                    Take Photo
                  </Label>
                  <Input 
                    id="selfie-upload" 
                    type="file" 
                    accept="image/*" 
                    capture="user"
                    onChange={handleSelfieCapture}
                    className="hidden" 
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentStep === KycStep.REVIEW && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Review your information</AlertTitle>
              <AlertDescription>
                Please check that all details are correct before submitting.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">ID Type:</span>
                <span className="font-medium">
                  {idType === "aadhaar" ? "Aadhaar Card" : 
                   idType === "pan" ? "PAN Card" : 
                   idType === "voter" ? "Voter ID" : 
                   "Driving License"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-sm text-muted-foreground">ID Number:</span>
                <span className="font-medium">{idNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID Image:</p>
                  {idImage && (
                    <img 
                      src={idImage} 
                      alt="ID" 
                      className="h-24 w-auto object-contain border rounded" 
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Selfie:</p>
                  {selfieImage && (
                    <img 
                      src={selfieImage} 
                      alt="Selfie" 
                      className="h-24 w-auto object-contain border rounded" 
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentStep === KycStep.COMPLETE && (
          <div className="text-center space-y-3 py-4">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Verification Submitted</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Your verification is being processed. This usually takes 1-2 business days.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep < KycStep.REVIEW ? (
          <>
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={currentStep === KycStep.ID_SELECTION}
            >
              Back
            </Button>
            <Button 
              onClick={handleNextStep}
              disabled={
                (currentStep === KycStep.ID_SELECTION && (!idType || !idNumber)) ||
                (currentStep === KycStep.ID_UPLOAD && !idImage) ||
                (currentStep === KycStep.SELFIE && !selfieImage)
              }
            >
              Continue
            </Button>
          </>
        ) : currentStep === KycStep.REVIEW ? (
          <>
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
            >
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Verification"
              )}
            </Button>
          </>
        ) : (
          <Button 
            className="w-full" 
            onClick={onComplete}
          >
            Return to Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 