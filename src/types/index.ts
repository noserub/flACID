/**
 * Shared TypeScript Types
 * 
 * Common interfaces and types used across the application
 */

// Re-export database types
export type { Database } from '../lib/supabase';

/**
 * Content Management Types
 */
export interface EditableContent {
  hero: {
    title: string;
    subtitle: string;
  };
  about: {
    visible: boolean;
    title: string;
    description: string;
  };
  listenNow: {
    visible: boolean;
    title: string;
    description: string;
  };
  musicPlayer: {
    tracks: Track[];
  };
  albums: {
    visible: boolean;
    title: string;
    items: Album[];
  };
  photos: {
    visible: boolean;
    title: string;
    description: string;
    items: Photo[];
  };
  tour: {
    visible: boolean;
    title: string;
    dates: TourDate[];
  };
  footer: {
    socialLinks: SocialLink[];
  };
}

/**
 * Music Types
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  audioUrl: string;
  coverImage?: string;
  visualizationType: VisualizationType;
}

export type VisualizationType = 
  | 'flowField'
  | 'particleSystem'
  | 'waveInterference'
  | 'geometric'
  | 'frequencyBars'
  | 'radial'
  | 'waveform';

/**
 * Album Types
 */
export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverImage: string;
  description?: string;
  links: {
    spotify?: string;
    appleMusic?: string;
    bandcamp?: string;
  };
}

/**
 * Photo Gallery Types
 */
export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  altText?: string;
  photographer?: string;
}

/**
 * Tour Types
 */
export interface TourDate {
  id: string;
  date: string; // ISO date string
  venue: string;
  city: string;
  country: string;
  ticketUrl?: string;
  status: 'upcoming' | 'sold_out' | 'cancelled';
}

/**
 * Social Media Types
 */
export interface SocialLink {
  platform: 'spotify' | 'bandcamp' | 'instagram' | 'facebook' | 'youtube' | 'twitter';
  url: string;
  icon: string;
}

/**
 * Audio Analysis Types
 */
export interface EQBands {
  subBass: number;    // 20-60 Hz
  bass: number;       // 60-250 Hz
  lowMid: number;     // 250-500 Hz
  mid: number;        // 500-2k Hz
  highMid: number;    // 2k-4k Hz
  presence: number;   // 4k-6k Hz
  brilliance: number; // 6k-20k Hz
}

export interface IntensityData {
  eqBands: EQBands;
  totalIntensity: number; // 0-1
  timestamp: number;
}

/**
 * File Upload Types
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  publicUrl: string;
  metadata?: Record<string, any>;
}

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export interface ResponsiveImageUrls {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
}

/**
 * Descent Mode Types
 */
export interface DescentModeState {
  isActive: boolean;
  intensity: number; // 0-1
}

export interface ParticleOrganism {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  baseAlpha: number;
  targetX: number;
  targetY: number;
  behaviorType: 'wanderer' | 'seeker' | 'avoider' | 'orbiter';
  decisionTimer: number;
  energy: number;
  maxSpeed: number;
  personalityPhase: number;
}

/**
 * Visualization Types
 */
export interface VisualizationProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export interface VisualizationConfig {
  type: VisualizationType;
  colorScheme?: 'cyan' | 'magenta' | 'gradient';
  particleCount?: number;
  sensitivity?: number;
}

/**
 * Form Types
 */
export interface TrackFormData {
  title: string;
  artist: string;
  album?: string;
  audioFile: File;
  coverImage?: File;
  visualizationType: VisualizationType;
}

export interface AlbumFormData {
  title: string;
  artist: string;
  year: number;
  coverImage: File;
  description?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  bandcampUrl?: string;
}

export interface TourDateFormData {
  date: string;
  venue: string;
  city: string;
  country: string;
  ticketUrl?: string;
  status: 'upcoming' | 'sold_out' | 'cancelled';
}

export interface PhotoFormData {
  file: File;
  altText?: string;
  photographer?: string;
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Utility Types
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;

/**
 * Component Prop Types
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface EditableComponentProps extends BaseComponentProps {
  isEditMode?: boolean;
  onEdit?: () => void;
}

/**
 * Context Types
 */
export interface EditModeContextType {
  isEditMode: boolean;
  content: EditableContent;
  updateContent: <K extends keyof EditableContent>(section: K, data: EditableContent[K]) => void;
  toggleEditMode: () => void;
}

export interface DescentModeContextType {
  isDescentMode: boolean;
  toggleDescentMode: () => void;
}

export interface DescentIntensityContextType {
  intensity: IntensityData;
  registerAnalyser: (analyser: AnalyserNode) => void;
}
