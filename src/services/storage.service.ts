/**
 * Storage Service
 *
 * Handles all file uploads to Supabase Storage with optimization.
 */

import { optimizeImage, validateImageFile } from '../lib/imageOptimization';
import { validateAudioFile, extractAudioMetadata } from '../lib/audioOptimization';
import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from '../lib/supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

function generateStoragePath(prefix: string, ext = 'webp'): string {
  return `${prefix}/${crypto.randomUUID()}.${ext}`;
}

/**
 * Upload optimized image to Supabase Storage.
 * Falls back to original file if optimization fails (e.g. HEIC, unsupported formats).
 */
export async function uploadImage(
  file: File,
  bucket: 'covers' | 'photos',
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; publicUrl: string }> {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  let blob: Blob;
  let contentType = 'image/webp';
  let uploadPath = path;

  try {
    blob = await optimizeImage(file, {
      maxWidth: bucket === 'covers' ? 1000 : 1920,
      quality: 0.85,
      format: 'image/webp',
    });
  } catch {
    // Fallback: upload original when optimization fails (e.g. HEIC, AVIF, corrupted)
    blob = file;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    uploadPath = path.replace(/\.webp$/i, `.${ext}`);
    contentType = file.type || 'image/jpeg';
  }

  if (onProgress) {
    onProgress({ loaded: blob.size, total: blob.size, percentage: 100 });
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uploadPath, blob, {
        contentType,
        cacheControl: 'public, max-age=31536000',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: data.path, publicUrl };
  }

  return {
    url: `${bucket}/${uploadPath}`,
    publicUrl: URL.createObjectURL(blob),
  };
}

/**
 * Upload responsive image variants (optional - use uploadImage for single optimized upload)
 */
export async function uploadResponsiveImage(
  file: File,
  bucket: 'covers' | 'photos',
  basePath: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ urls: Record<string, string> }> {
  const { generateResponsiveSizes } = await import('../lib/imageOptimization');
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const variants = await generateResponsiveSizes(file);
  const urls: Record<string, string> = {};

  if (isSupabaseConfigured) {
    await Promise.all(
      variants.map(async ({ size, blob }) => {
        const path = `${basePath}_${size}.webp`;
        const { error } = await supabase.storage.from(bucket).upload(path, blob, {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
        });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        urls[size] = publicUrl;
      })
    );
  } else {
    variants.forEach(({ size, blob }) => {
      urls[size] = URL.createObjectURL(blob);
    });
  }

  if (onProgress) onProgress({ loaded: 1, total: 1, percentage: 100 });
  return { urls };
}

/**
 * Upload audio file to Supabase Storage
 */
export async function uploadAudio(
  path: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; publicUrl: string; metadata?: Record<string, unknown> }> {
  const validation = validateAudioFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const metadata = await extractAudioMetadata(file);

  if (onProgress) {
    onProgress({ loaded: file.size, total: file.size, percentage: 100 });
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.storage.from('audio').upload(path, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
      upsert: false,
    });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(data.path);
    return { url: data.path, publicUrl, metadata };
  }

  return {
    url: `audio/${path}`,
    publicUrl: URL.createObjectURL(file),
    metadata,
  };
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
}

/**
 * Get optimized CDN URL with transformations
 * Supabase supports image transformations via URL parameters
 */
export function getOptimizedUrl(
  publicUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }
): string {
  if (!options) return publicUrl;

  // CURSOR TODO: Use Supabase image transformations
  // const params = new URLSearchParams();
  // if (options.width) params.set('width', options.width.toString());
  // if (options.height) params.set('height', options.height.toString());
  // if (options.quality) params.set('quality', options.quality.toString());
  // if (options.format) params.set('format', options.format);
  //
  // return `${publicUrl}?${params.toString()}`;

  return publicUrl;
}
