export const ALLOWED_IMAGE_DOMAINS = [
    'i.imgur.com',
    'imgur.com',
    'cdn.discordapp.com',
    'media.discordapp.net',
    'raw.githubusercontent.com',
    'github.com',
    '*.githubusercontent.com'
  ] as const;
  
  export const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;
  
  interface ValidationResult {
    isValid: boolean;
    error?: string;
  }
  
  export function isValidImageUrl(url: string): ValidationResult {
    if (!url) return { isValid: true }; // Empty URL is valid since it's optional
  
    try {
      const parsedUrl = new URL(url);
      
      // Check if URL uses HTTPS
      if (parsedUrl.protocol !== 'https:') {
        return { 
          isValid: false, 
          error: 'Image URL must use HTTPS' 
        };
      }
  
      // Check if domain is allowed
      const domain = parsedUrl.hostname.toLowerCase();
      const isAllowedDomain = ALLOWED_IMAGE_DOMAINS.some(allowedDomain => {
        if (allowedDomain.startsWith('*.')) {
          const suffix = allowedDomain.slice(1); // Remove *
          return domain.endsWith(suffix);
        }
        return domain === allowedDomain;
      });
  
      if (!isAllowedDomain) {
        return { 
          isValid: false, 
          error: 'Image must be hosted on Imgur, Discord, or GitHub' 
        };
      }
  
      // Check file extension for common image formats
      const fileExtension = parsedUrl.pathname.toLowerCase().split('.').pop();
      
      if (!fileExtension || !VALID_IMAGE_EXTENSIONS.includes(fileExtension as any)) {
        return { 
          isValid: false, 
          error: `Image URL must end with a valid image extension (${VALID_IMAGE_EXTENSIONS.join(', ')})` 
        };
      }
  
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Invalid URL format' 
      };
    }
  }
  
  // Helper function to check if an image actually loads
  export function checkImageLoads(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
  
  // Helper to format domain list for error messages
  export function getFormattedDomainList(): string {
    const domains = ALLOWED_IMAGE_DOMAINS.map(domain => 
      domain.startsWith('*.') ? domain.slice(2) : domain
    );
    return [...new Set(domains)].join(', ');
  }