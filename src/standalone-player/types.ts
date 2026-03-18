/**
 * Type definitions for Standalone Music Player
 */

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string; // Format: "MM:SS" e.g., "8:42"
  url: string; // Audio file URL or data URL
  visualizationId?: number; // 0-9, defaults to track index % 10
}

export interface StandaloneMusicPlayerProps {
  tracks: Track[];
  enableEditMode?: boolean;
  onTracksChange?: (tracks: Track[]) => void;
  initialTrackIndex?: number;
  autoPlay?: boolean;
  className?: string;
}

export interface PsychedelicVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  currentTrack: number;
  visualizationId?: number;
}

export interface EQBands {
  subBass: number;    // 20-60 Hz
  bass: number;       // 60-250 Hz
  lowMid: number;     // 250-500 Hz
  mid: number;        // 500-2000 Hz
  highMid: number;    // 2000-4000 Hz
  high: number;       // 4000-8000 Hz
  presence: number;   // 8000-16000 Hz
  energy: number;     // Overall energy level
}

export interface MusicPlayerEditDialogProps {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
}
