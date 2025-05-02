import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Wallet, 
  CreditCard, 
  LucideIcon, 
  ShieldCheck, 
  ArrowRight,
  ThumbsUp,
  Handshake
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

export interface EscrowPaymentProps {
  jobId: string;
  amount: number;
  serviceFee?: number;
  currency?: string;
  onPaymentComplete?: (transactionId: string) => void;
  onCancel?: () => void;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "upi",
    name: "UPI",
    icon: Wallet,
    description: "Pay using any UPI app like PhonePe, Google Pay, or Paytm"
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Pay using Visa, Mastercard, RuPay or American Express"
  }
];

// Mock escrow service
const createEscrowPayment = async (
  jobId: string,
  amount: number,
  paymentMethod: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate success (90% of the time)
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${jobId}`
    };
  } else {
    return {
      success: false,
      error: "Payment processing failed. Please try again."
    };
  }
};

export function EscrowPayment({
  jobId,
  amount,
  serviceFee = amount * 0.05, // 5% service fee by default
  currency = "₹",
  onPaymentComplete,
  onCancel
}: EscrowPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(PAYMENT_METHODS[0].id);
  const [paymentStep, setPaymentStep] = useState<"select" | "process" | "complete">("select");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<{ id: string } | null>(null);
  
  const totalAmount = amount + serviceFee;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    setPaymentStep("process");
    
    try {
      const result = await createEscrowPayment(jobId, totalAmount, selectedMethod);
      
      if (result.success && result.transactionId) {
        setTransaction({ id: result.transactionId });
        setPaymentStep("complete");
        onPaymentComplete?.(result.transactionId);
      } else {
        setError(result.error || "Payment failed. Please try again.");
        setPaymentStep("select");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setPaymentStep("select");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto border-2 border-primary/10">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Secure Escrow Payment
          </CardTitle>
          <ShieldCheck className="h-6 w-6 text-primary/70" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {paymentStep === "select" && (
          <>
            <div className="mb-6 space-y-1">
              <h3 className="font-medium text-lg">Payment Summary</h3>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Job Amount</span>
                <span>{formatCurrency(amount, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Service Fee (5%)</span>
                <span>{formatCurrency(serviceFee, currency)}</span>
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Select Payment Method</h3>
              <Tabs
                defaultValue={selectedMethod}
                onValueChange={setSelectedMethod}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  {PAYMENT_METHODS.map(method => (
                    <TabsTrigger
                      key={method.id}
                      value={method.id}
                      className="flex gap-2 items-center"
                    >
                      <method.icon className="h-4 w-4" />
                      <span>{method.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {PAYMENT_METHODS.map(method => (
                  <TabsContent key={method.id} value={method.id} className="mt-4">
                    <div className="rounded-lg bg-muted/50 p-4 text-sm">
                      <p>{method.description}</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Alert className="mt-6 bg-primary/5 border-primary/20">
              <Lock className="h-4 w-4 text-primary" />
              <AlertTitle>Secure Escrow Protection</AlertTitle>
              <AlertDescription className="text-xs">
                Payment will be held securely in escrow and only released to the service provider after you confirm the job is complete.
              </AlertDescription>
            </Alert>
          </>
        )}
        
        {paymentStep === "process" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="animate-pulse">
              <Lock className="h-12 w-12 text-primary opacity-80" />
            </div>
            <h3 className="text-lg font-medium">Processing Payment</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Please wait while we securely process your payment. This may take a few moments.
            </p>
          </div>
        )}
        
        {paymentStep === "complete" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-center">Payment Successful!</h3>
            <div className="bg-muted p-3 rounded-md w-full text-center">
              <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
              <p className="font-mono text-sm">{transaction?.id}</p>
            </div>
            <div className="text-sm text-muted-foreground text-center max-w-xs space-y-2">
              <p className="flex items-center justify-center gap-2">
                <Handshake className="h-4 w-4 text-primary" />
                Funds are now held securely in escrow
              </p>
              <p>The provider will be notified and can begin work on your job.</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={cn(
        "flex gap-3 pt-2 pb-6", 
        paymentStep === "complete" ? "justify-center" : "justify-between"
      )}>
        {paymentStep === "select" && (
          <>
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing} className="gap-2">
              {isProcessing ? "Processing..." : "Pay Securely"}
              <Lock className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {paymentStep === "process" && (
          <Button disabled className="w-full opacity-50">
            Processing Payment...
          </Button>
        )}
        
        {paymentStep === "complete" && (
          <Button onClick={() => onPaymentComplete?.(transaction?.id || "")} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 