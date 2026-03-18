/**
 * Image Optimization Utilities
 * 
 * Optimizes images before upload to minimize storage and bandwidth costs.
 * Integrates with Supabase Storage for CDN delivery.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Compress and resize an image file
 * Returns optimized blob ready for upload
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/webp', // WebP for best compression
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        format,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate multiple sizes for responsive images
 * Returns array of optimized blobs with size labels
 */
export async function generateResponsiveSizes(
  file: File
): Promise<Array<{ size: string; blob: Blob; width: number }>> {
  const sizes = [
    { size: 'thumbnail', width: 300, quality: 0.8 },
    { size: 'small', width: 640, quality: 0.85 },
    { size: 'medium', width: 1024, quality: 0.85 },
    { size: 'large', width: 1920, quality: 0.9 },
  ];

  const results = await Promise.all(
    sizes.map(async ({ size, width, quality }) => {
      const blob = await optimizeImage(file, {
        maxWidth: width,
        quality,
        format: 'image/webp',
      });
      return { size, blob, width };
    })
  );

  return results;
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }

  return { valid: true };
}

/**
 * Get estimated size after compression
 */
export async function getEstimatedSize(file: File): Promise<number> {
  const optimized = await optimizeImage(file);
  return optimized.size;
}

/**
 * Optimize image URL with CDN-style parameters for responsive loading.
 * Use for external image URLs (e.g., Unsplash, Supabase Storage) to reduce bandwidth.
 */
export function optimizeImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality = 80,
  format = 'webp'
): string {
  if (!url) return url;

  // Data URLs and blob URLs cannot be optimized
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.search);

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);

    parsed.search = params.toString();
    return parsed.toString();
  } catch {
    return url;
  }
}
