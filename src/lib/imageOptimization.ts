/**
 * Utility functions for image handling and optimization
 */

/**
 * Generate optimized image URL with correct parameters for responsive images
 * @param url Original image URL
 * @param width Desired width
 * @param height Desired height (optional)
 * @param quality Image quality percentage (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width: number,
  height?: number,
  quality = 80
): string {
  // If no URL is provided, return placeholder
  if (!url) {
    return `https://placehold.co/${width}x${height || width}/f5f5f5/a3a3a3?text=No+Image`;
  }
  
  // If it's already a data URL, return as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // If it's a Supabase storage URL, add transformation parameters
  if (url.includes('supabase.co/storage/v1/object/public')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}${height ? `&height=${height}` : ''}&quality=${quality}&resize=cover`;
  }
  
  // For other URLs, return as is (can be expanded later for other CDNs)
  return url;
}

/**
 * Handle image loading errors by setting a fallback
 * @param event Image error event
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>): void {
  const target = event.target as HTMLImageElement;
  const width = target.width || 300;
  const height = target.height || 300;
  target.src = `https://placehold.co/${width}x${height}/f5f5f5/a3a3a3?text=Error+Loading+Image`;
}

/**
 * Generate image placeholder URL for blurry loading effect
 * @param url Original image URL
 * @returns Low quality placeholder URL
 */
export function getImagePlaceholder(url: string | null | undefined): string {
  if (!url) {
    return `https://placehold.co/60x60/f5f5f5/a3a3a3?text=...`;
  }
  
  if (url.startsWith('data:')) {
    return url;
  }
  
  if (url.includes('supabase.co/storage/v1/object/public')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=20&quality=10&blur=10`;
  }
  
  return url;
} 