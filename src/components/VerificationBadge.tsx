import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BadgeCheck, AlertCircle, ShieldCheck } from "lucide-react";

type VerificationType = "phone" | "kyc" | "govt" | "none";

interface VerificationBadgeProps {
  type: VerificationType;
  size?: "sm" | "md" | "lg";
}

export function VerificationBadge({ type, size = "md" }: VerificationBadgeProps) {
  if (type === "none") {
    return null;
  }

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const badgeVariants = {
    phone: {
      icon: BadgeCheck,
      color: "text-blue-500",
      tooltip: "Phone Verified"
    },
    kyc: {
      icon: ShieldCheck,
      color: "text-green-600",
      tooltip: "KYC Verified"
    },
    govt: {
      icon: ShieldCheck,
      color: "text-purple-600",
      tooltip: "Government ID Verified"
    }
  };

  const { icon: Icon, color, tooltip } = badgeVariants[type];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="px-1.5 py-0.5 border-none">
            <Icon className={`${sizeClasses[size]} ${color}`} />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 