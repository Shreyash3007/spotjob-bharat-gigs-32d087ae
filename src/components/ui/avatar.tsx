import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { getOptimizedImageUrl, handleImageError } from "@/lib/imageOptimization"
import { User } from "lucide-react"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & {
    size?: number;
    optimizeImage?: boolean;
  }
>(({ className, src, alt, size = 40, optimizeImage = true, ...props }, ref) => {
  const optimizedSrc = optimizeImage && typeof src === 'string' 
    ? getOptimizedImageUrl(src, size) 
    : src;
    
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      src={optimizedSrc}
      alt={alt}
      onError={handleImageError}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

const UserAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  React.ComponentPropsWithoutRef<typeof Avatar> & {
    username?: string;
    userImage?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
    showFallback?: boolean;
  }
>(({ 
  username, 
  userImage, 
  size = "md", 
  showFallback = true,
  className,
  ...props 
}, ref) => {
  const sizesMap = {
    sm: { avatar: "h-8 w-8", icon: "h-4 w-4" },
    md: { avatar: "h-10 w-10", icon: "h-5 w-5" },
    lg: { avatar: "h-14 w-14", icon: "h-6 w-6" },
    xl: { avatar: "h-20 w-20", icon: "h-10 w-10" }
  };
  
  const pixelSizesMap = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80
  };

  const avatarSize = sizesMap[size].avatar;
  const iconSize = sizesMap[size].icon;
  const pixelSize = pixelSizesMap[size];
  
  // Get initials from username
  const initials = username
    ? username
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <Avatar
      ref={ref}
      className={cn(avatarSize, className)}
      {...props}
    >
      {userImage ? (
        <AvatarImage 
          src={userImage} 
          alt={username || "User"} 
          size={pixelSize}
        />
      ) : null}
      
      {showFallback ? (
        <AvatarFallback>
          {initials || <User className={iconSize} />}
        </AvatarFallback>
      ) : null}
    </Avatar>
  );
});
UserAvatar.displayName = "UserAvatar";

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
