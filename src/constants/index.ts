/**
 * Application Constants
 *
 * Centralized configuration for API endpoints, app settings, and shared values.
 */

/**
 * Supabase / API Endpoints
 * Update when Supabase project is configured
 */
export const API_ENDPOINTS = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
  storage: {
    images: 'images',
    audio: 'audio',
    covers: 'covers',
    photos: 'photos',
  },
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  /** Max file size for audio uploads (50MB) */
  maxAudioSizeBytes: 50 * 1024 * 1024,
  /** Max file size for image uploads (10MB) */
  maxImageSizeBytes: 10 * 1024 * 1024,
  /** Supported audio MIME types */
  allowedAudioTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg'] as const,
  /** Supported image MIME types */
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
  /** Default image optimization */
  imageOptimization: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'image/webp' as const,
  },
  /** Canvas performance limits */
  visualizer: {
    maxPixelRatio: 1.5,
    fftSize: 2048,
  },
} as const;

/**
 * Visualization type identifiers
 * Matches VisualizationType in types/index.ts
 */
export const VISUALIZATION_TYPES = [
  'flowField',
  'particleSystem',
  'waveInterference',
  'geometric',
  'frequencyBars',
  'radial',
  'waveform',
] as const;
