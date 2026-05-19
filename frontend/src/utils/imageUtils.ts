// Utility function to get the correct image URL
// Uses /api/uploads/ for production (relative path works with nginx proxy)
// Falls back to VITE_API_BASE_URL if set, otherwise uses localhost for dev
export const getImageUrl = (imagePath: string, subdirectory?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if present
  let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // In production, use relative path /api/uploads/ (nginx proxies this)
  // In development, use VITE_API_BASE_URL or default to localhost
  const baseURL = import.meta.env.VITE_API_BASE_URL 
    || (import.meta.env.DEV ? 'http://localhost:5000' : '/api');
  
  // Construct the full path with optional subdirectory
  // If imagePath already contains a subdirectory (e.g., "services/image.jpg"), use it as is
  // Otherwise, prepend the subdirectory if provided
  let fullPath = cleanPath;
  
  // Check if path already includes a subdirectory (has a slash)
  const hasSubdirectory = cleanPath.includes('/');
  
  if (!hasSubdirectory && subdirectory) {
    // Only add subdirectory if path doesn't already have one and subdirectory is provided
    fullPath = `${subdirectory}/${cleanPath}`;
  }
  
  // Construct final URL - ensure no double slashes
  let finalUrl: string;
  if (baseURL.startsWith('/')) {
    // Relative path: /api/uploads/services/image.jpg
    // Remove trailing slash from baseURL if present, and ensure single slash
    const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    finalUrl = `${cleanBase}/uploads/${fullPath}`;
  } else {
    // Absolute URL: http://localhost:5000/uploads/services/image.jpg
    // Remove trailing slash from baseURL if present, and ensure single slash
    const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    finalUrl = `${cleanBase}/uploads/${fullPath}`;
  }
  
  return finalUrl;
};

