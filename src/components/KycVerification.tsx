
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { AspectRatio } from './ui/aspect-ratio';

interface KycVerificationProps {
  onComplete?: () => void;
}

const KycVerification: React.FC<KycVerificationProps> = ({ onComplete }) => {
  const { updateUserProfile } = useApp();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImage: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async () => {
    if (!frontImage || !backImage || !selfieImage) {
      toast.error("Please upload all required images");
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, these images would be uploaded to a secure storage
      // and processed by a KYC verification service
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Update user profile if updateUserProfile exists
      if (updateUserProfile) {
        await updateUserProfile({ id_verified: true });
      }
      
      toast.success("ID verification successful!");
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error during KYC verification:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-bold">ID Verification</DialogTitle>
        <DialogDescription>
          Please upload clear images of your government ID (front and back) and a selfie to verify your identity.
        </DialogDescription>
        
        <div className="grid gap-5 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">ID Card (Front)</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                frontImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary'
              }`}
            >
              {frontImage ? (
                <AspectRatio ratio={16/10} className="w-full bg-muted">
                  <img src={frontImage} alt="ID Front" className="rounded object-cover w-full h-full" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => setFrontImage(null)}
                  >
                    Change
                  </Button>
                </AspectRatio>
              ) : (
                <label className="cursor-pointer w-full h-32 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground text-center">
                    Click to upload front side of your ID
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setFrontImage)}
                  />
                </label>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">ID Card (Back)</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                backImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary'
              }`}
            >
              {backImage ? (
                <AspectRatio ratio={16/10} className="w-full bg-muted">
                  <img src={backImage} alt="ID Back" className="rounded object-cover w-full h-full" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => setBackImage(null)}
                  >
                    Change
                  </Button>
                </AspectRatio>
              ) : (
                <label className="cursor-pointer w-full h-32 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground text-center">
                    Click to upload back side of your ID
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setBackImage)}
                  />
                </label>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Selfie with ID</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                selfieImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary'
              }`}
            >
              {selfieImage ? (
                <AspectRatio ratio={1/1} className="w-full bg-muted">
                  <img src={selfieImage} alt="Selfie" className="rounded object-cover w-full h-full" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => setSelfieImage(null)}
                  >
                    Change
                  </Button>
                </AspectRatio>
              ) : (
                <label className="cursor-pointer w-full h-32 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground text-center">
                    Click to upload selfie holding your ID
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setSelfieImage)}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!frontImage || !backImage || !selfieImage || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Submit for Verification"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KycVerification;
