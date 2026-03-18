/**
 * Audio Optimization Utilities
 * 
 * Handles audio file validation and metadata extraction.
 * Actual transcoding should be done server-side to avoid client performance issues.
 */

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
}

/**
 * Validate audio file before upload
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for audio
  const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg'];

  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|ogg)$/i)) {
    return { valid: false, error: 'Invalid audio format. Please upload MP3, WAV, FLAC, or OGG.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 50MB.' };
  }

  return { valid: true };
}

/**
 * Extract audio metadata and duration
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.onloadedmetadata = () => {
      const metadata: AudioMetadata = {
        duration: audio.duration,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      };

      URL.revokeObjectURL(url);
      resolve(metadata);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata'));
    };

    audio.src = url;
  });
}

/**
 * Format duration in MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
