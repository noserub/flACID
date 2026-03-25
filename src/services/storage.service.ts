/**
 * Storage Service
 *
 * Handles all file uploads to Supabase Storage with optimization.
 */

import { optimizeImage, validateImageFile } from '../lib/imageOptimization';
import {
  validateAudioFile,
  extractAudioMetadata,
  type AudioMetadata,
} from '../lib/audioOptimization';
import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * storage-js builds `Cache-Control` as `max-age=${cacheControl}` (see StorageFileApi.uploadOrUpdate).
 * Passing `public, max-age=31536000` becomes invalid `max-age=public, max-age=31536000` and can break uploads.
 */
const STORAGE_CACHE_MAX_AGE_SEC = '31536000';

/** Storage API matches `type/subtype` only — params (`; codecs=`) or case break `audio/mp4` vs allowlist. */
function sanitizeStorageMime(mime: string): string {
  return mime.split(';')[0].trim().toLowerCase();
}

function isStorageMimeErrorMessage(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes('mime') || m.includes('invalid_mimetype') || m.includes('415');
}

/**
 * Multipart upload with explicit `contentType` field — Storage reads this before the file part
 * for MIME validation (see supabase/storage uploader: formData.fields.contentType).
 */
async function postStorageObjectMultipart(
  bucket: string,
  objectPath: string,
  fileBuf: ArrayBuffer,
  fileName: string,
  contentType: string
): Promise<void> {
  const fd = new FormData();
  fd.append('cacheControl', STORAGE_CACHE_MAX_AGE_SEC);
  fd.append('contentType', contentType);
  const f = new File([fileBuf], fileName, {
    type: contentType,
    lastModified: Date.now(),
  });
  fd.append('', f);

  const { error } = await supabase.storage.from(bucket).upload(objectPath, fd, {
    cacheControl: STORAGE_CACHE_MAX_AGE_SEC,
    upsert: false,
  });
  if (error) throw error;
}

/**
 * Try several upload shapes (binary body, Blob multipart, custom FormData, M4A→mpeg label).
 * Uses the same storage-js URL/headers as image uploads; avoids hand-rolled fetch URL drift.
 */
async function uploadAudioBytesToBucket(
  objectPath: string,
  buf: ArrayBuffer,
  fileName: string,
  contentType: string
): Promise<void> {
  const opts = {
    contentType,
    cacheControl: STORAGE_CACHE_MAX_AGE_SEC,
    upsert: false as const,
  };

  const tryUpload = async (
    body: Uint8Array | Blob,
    ct: string
  ): Promise<{ error: { message: string } | null }> => {
    const { error } = await supabase.storage.from('audio').upload(objectPath, body, {
      ...opts,
      contentType: ct,
    });
    return { error };
  };

  let lastMsg = '';

  const u8 = new Uint8Array(buf);
  for (const attempt of [
    () => tryUpload(u8, contentType),
    () => tryUpload(new Blob([buf], { type: contentType }), contentType),
  ]) {
    const { error } = await attempt();
    if (!error) return;
    lastMsg = error.message;
    if (!isStorageMimeErrorMessage(lastMsg)) throw error;
  }

  try {
    await postStorageObjectMultipart('audio', objectPath, buf, fileName, contentType);
    return;
  } catch (e) {
    const raw =
      e instanceof Error
        ? e.message
        : e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string'
          ? (e as { message: string }).message
          : String(e);
    lastMsg = raw;
    if (!isStorageMimeErrorMessage(raw)) throw e;
  }

  if (fileName.toLowerCase().endsWith('.m4a')) {
    const { error } = await supabase.storage.from('audio').upload(objectPath, u8, {
      ...opts,
      contentType: 'audio/mpeg',
    });
    if (!error) return;
    lastMsg = error.message;
  }

  throw new Error(
    `${lastMsg} If the bucket allows audio, this may be a Supabase Storage bug or project mismatch — open a support ticket with your project ref from Settings → General.`
  );
}

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
        cacheControl: STORAGE_CACHE_MAX_AGE_SEC,
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
          cacheControl: STORAGE_CACHE_MAX_AGE_SEC,
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

  let metadata: AudioMetadata;
  try {
    metadata = await extractAudioMetadata(file);
  } catch {
    metadata = { title: file.name.replace(/\.[^/.]+$/, '') };
  }

  if (onProgress) {
    onProgress({ loaded: file.size, total: file.size, percentage: 100 });
  }

  /**
   * Declared type must stay under `audio/*` when the bucket allows only `audio/*`.
   * Browsers often send empty type, `application/octet-stream`, or `audio/x-m4a; codecs=…`.
   * Never upload `application/octet-stream` for files that passed validateAudioFile.
   */
  const normalizeAudioContentType = (): string => {
    const lower = file.name.toLowerCase();
    const base = (file.type || '').split(';')[0].trim().toLowerCase();

    const fromExtension = (): string | null => {
      if (lower.endsWith('.mp3')) return 'audio/mpeg';
      if (lower.endsWith('.wav')) return 'audio/wav';
      if (lower.endsWith('.flac')) return 'audio/flac';
      if (lower.endsWith('.ogg') || lower.endsWith('.oga')) return 'audio/ogg';
      /** IANA-registered; Supabase may reject non-standard `audio/m4a` with InvalidMimeType */
      if (lower.endsWith('.m4a')) return 'audio/mp4';
      if (lower.endsWith('.aac')) return 'audio/aac';
      return null;
    };

    const isM4aName = lower.endsWith('.m4a');
    const isM4aMime =
      base === 'audio/x-m4a' ||
      base === 'audio/m4a' ||
      (base === 'audio/mp4' && isM4aName) ||
      (base === 'video/mp4' && isM4aName);

    if (isM4aName || isM4aMime) return 'audio/mp4';

    if (base.startsWith('audio/')) return sanitizeStorageMime(base);

    const ext = fromExtension();
    if (ext) return ext;

    if (base && base !== 'application/octet-stream') return sanitizeStorageMime(base);

    return 'audio/mpeg';
  };

  const contentType = sanitizeStorageMime(normalizeAudioContentType());

  if (isSupabaseConfigured) {
    const buf = await file.arrayBuffer();
    await uploadAudioBytesToBucket(path, buf, file.name, contentType);

    const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(path);
    return { url: path, publicUrl, metadata };
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
