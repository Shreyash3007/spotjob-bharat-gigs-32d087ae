import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, User, Phone, Mail, FileCheck, BadgeCheck } from "lucide-react";

export type VerificationLevel = "none" | "basic" | "phone" | "email" | "id" | "premium";

export interface VerificationBadgeProps {
  level: VerificationLevel;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VERIFICATION_CONFIG = {
  none: {
    icon: User,
    label: "Unverified",
    description: "This user has not completed any verification steps",
    variant: "outline",
    color: "text-gray-400"
  },
  basic: {
    icon: Phone,
    label: "Basic",
    description: "Phone number verified",
    variant: "secondary",
    color: "text-gray-700"
  },
  phone: {
    icon: Phone,
    label: "Phone Verified",
    description: "Phone number has been verified",
    variant: "secondary",
    color: "text-blue-500"
  },
  email: {
    icon: Mail,
    label: "Email Verified",
    description: "Email and phone have been verified",
    variant: "secondary",
    color: "text-blue-600"
  },
  id: {
    icon: FileCheck,
    label: "ID Verified",
    description: "Government ID has been verified",
    variant: "default",
    color: "text-green-500"
  },
  premium: {
    icon: Shield,
    label: "Premium Verified",
    description: "Full verification including background check",
    variant: "default",
    color: "text-purple-600"
  }
};

export function VerificationBadge({
  level,
  showTooltip = true,
  size = "md",
  className = ""
}: VerificationBadgeProps) {
  const config = VERIFICATION_CONFIG[level];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  const badgeSizeClasses = {
    sm: "text-xs py-0 px-1.5",
    md: "text-sm py-0.5 px-2",
    lg: "text-base py-1 px-2.5"
  };
  
  const badge = (
    <Badge 
      variant={config.variant as any}
      className={`flex items-center gap-1 font-medium ${badgeSizeClasses[size]} ${className}`}
    >
      <Icon className={`${sizeClasses[size]} ${config.color}`} />
      {size !== "sm" && <span>{config.label}</span>}
    </Badge>
  );
  
  if (!showTooltip) {
    return badge;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            <div className="font-medium flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-primary" />
              {config.label}
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              {config.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 