import React, { useState, useEffect } from "react";
import { getOptimizedImageUrl, getImagePlaceholder, handleImageError } from "@/lib/imageOptimization";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  fallbackSrc?: string;
  blurPlaceholder?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  className?: string;
  containerClassName?: string;
  skeletonClassName?: string;
  onLoad?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 300,
  height = 200,
  quality = 80,
  fallbackSrc,
  blurPlaceholder = true,
  objectFit = "cover",
  className,
  containerClassName,
  skeletonClassName,
  onLoad,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null | undefined>(
    blurPlaceholder ? getImagePlaceholder(src) : null
  );

  useEffect(() => {
    // Reset states when src changes
    setLoading(true);
    setError(false);
    setImageSrc(blurPlaceholder ? getImagePlaceholder(src) : null);
    
    // If no src provided, use fallback immediately
    if (!src) {
      setImageSrc(fallbackSrc || `https://placehold.co/${width}x${height}/f5f5f5/a3a3a3?text=No+Image`);
      setLoading(false);
      return;
    }

    // Preload the optimized image
    const img = new Image();
    img.src = getOptimizedImageUrl(src, width, height, quality);
    
    img.onload = () => {
      setImageSrc(img.src);
      setLoading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setError(true);
      setLoading(false);
      setImageSrc(fallbackSrc || `https://placehold.co/${width}x${height}/f5f5f5/a3a3a3?text=Error`);
    };
    
    return () => {
      // Cancel image load if component unmounts
      img.onload = null;
      img.onerror = null;
    };
  }, [src, width, height, quality, blurPlaceholder, fallbackSrc, onLoad]);

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
      style={{ width, height }}
    >
      {loading && (
        <Skeleton 
          className={cn("absolute inset-0", skeletonClassName)}
        />
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          onError={handleImageError}
          className={cn(
            "transition-opacity duration-300",
            loading ? "opacity-50 blur-sm" : "opacity-100 blur-0",
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain",
            objectFit === "fill" && "object-fill",
            objectFit === "none" && "object-none",
            objectFit === "scale-down" && "object-scale-down",
            className
          )}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage; 