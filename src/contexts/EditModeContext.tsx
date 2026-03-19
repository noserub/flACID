import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { loadContentFromSupabase, publishContentToSupabase } from '../services/contentSync.service';
import { uploadImage as storageUploadImage, uploadAudio as storageUploadAudio } from '../services/storage.service';
import { isSupabaseConfigured } from '../lib/supabase';

// Content structure for the entire site
export interface SiteContent {
  hero: {
    logoImage: string;
    subtitle: string;
    tagline: string;
    backgroundImage: string;
    visible: boolean;
  };
  about: {
    title: string;
    content: string;
    image: string;
    visible: boolean;
  };
  listenNow: {
    title: string;
    description: string;
    visible: boolean;
  };
  discography: {
    title: string;
    albums: Array<{
      id: string;
      title: string;
      year: string;
      coverImage: string;
      description: string;
      tracks: string[];
    }>;
    visible: boolean;
  };
  tour: {
    title: string;
    dates: Array<{
      id: string;
      date: string;
      venue: string;
      city: string;
      ticketUrl: string;
    }>;
    visible: boolean;
  };
  gallery: {
    title: string;
    tabs: Array<{
      id: string;
      name: string;
      visible: boolean;
      images: Array<{
        id: string;
        url: string;
        caption: string;
      }>;
    }>;
    visible: boolean;
  };
  musicPlayer: {
    tracks: Array<{
      id: number;
      title: string;
      artist: string;
      album: string;
      duration: string;
      url: string;
      visualizationId: number;
    }>;
  };
  footer: {
    bandName: string;
    description: string;
    email: string;
    socialLinks: {
      facebook: string;
      instagram: string;
      twitter: string;
      youtube: string;
      spotify: string;
      bandcamp: string;
    };
    copyright: string;
  };
}

export interface UploadImageOptions {
  bucket?: 'covers' | 'photos';
  pathPrefix?: string;
}

interface EditModeContextType {
  isEditMode: boolean;
  isDraft: boolean;
  content: SiteContent;
  /** Increments when draft (e.g. music player) is updated so players can re-read and show changes before Publish */
  draftRevision: number;
  loading: boolean;
  toggleEditMode: () => void;
  updateContent: <K extends keyof SiteContent>(section: K, data: SiteContent[K]) => void;
  publishChanges: () => Promise<void>;
  discardDraft: () => void;
  uploadImage: (file: File, options?: UploadImageOptions) => Promise<string>;
  uploadAudio: (file: File) => Promise<string>;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

// Default content
const defaultContent: SiteContent = {
  hero: {
    logoImage: '',
    subtitle: 'The Fragile Sphere',
    tagline: '',
    backgroundImage: '',
    visible: true,
  },
  about: {
    title: 'The Journey',
    content: `FLACID is less of a traditional band and more of a sonic experiment in controlled chaos. What began as a curiosity—blending the raw power of heavy music with the fluid unpredictability of improvisational jams—has evolved into a coherent experience. Driven by sheer velocity, the thrill of the unexpected, and total immersion.

Step outside the standard verse-chorus structure and into a landscape of shifting dynamics. Through building a wall of crushing distortion or stripping back to a minimalist pulse, the goal remains the same: to create a live environment where the music feels alive, evolving, and infinitely expansive.`,
    image: '',
    visible: true,
  },
  listenNow: {
    title: 'Listen Now',
    description: 'Experience our latest tracks with immersive psychedelic visualizations',
    visible: true,
  },
  discography: {
    title: 'Journey',
    albums: [
      {
        id: '1',
        title: 'Cosmic Doom',
        year: '2023',
        coverImage: '',
        description: 'A journey through the void, where crushing riffs meet ethereal atmospheres.',
        tracks: [
          'Ethereal Descent',
          'Cosmic Doom',
          'Mountains of Sleep',
          'Void Walker',
          'Infinite Horizons'
        ],
      },
      {
        id: '2',
        title: 'Astral Resonance',
        year: '2022',
        coverImage: '',
        description: 'Progressive sonic explorations of the space between heavy and atmospheric.',
        tracks: [
          'Astral Resonance',
          'Nebula Dreams',
          'Gravity Well',
          'Solar Winds'
        ],
      },
    ],
    visible: true,
  },
  tour: {
    title: 'Tour Dates',
    dates: [
      {
        id: '1',
        date: '2024-03-15',
        venue: 'The Underground',
        city: 'Portland, OR',
        ticketUrl: '#',
      },
      {
        id: '2',
        date: '2024-03-22',
        venue: 'Doom Chamber',
        city: 'Seattle, WA',
        ticketUrl: '#',
      },
      {
        id: '3',
        date: '2024-04-05',
        venue: 'Heavy Sound House',
        city: 'San Francisco, CA',
        ticketUrl: '#',
      },
    ],
    visible: true,
  },
  gallery: {
    title: 'Gallery',
    tabs: [
      {
        id: 'live',
        name: 'Live',
        visible: true,
        images: [],
      },
      {
        id: 'studio',
        name: 'Studio',
        visible: true,
        images: [],
      },
      {
        id: 'artwork',
        name: 'Artwork',
        visible: true,
        images: [],
      },
    ],
    visible: true,
  },
  musicPlayer: {
    tracks: [
      { id: 1, title: 'Ethereal Descent', artist: 'FLACID', album: 'Cosmic Doom', duration: '8:42', url: '', visualizationId: 0 },
      { id: 2, title: 'Cosmic Doom', artist: 'FLACID', album: 'Cosmic Doom', duration: '12:15', url: '', visualizationId: 1 },
      { id: 3, title: 'Astral Resonance', artist: 'FLACID', album: 'Astral Resonance', duration: '9:33', url: '', visualizationId: 2 },
      { id: 4, title: 'Mountains of Sleep', artist: 'FLACID', album: 'Astral Resonance', duration: '11:08', url: '', visualizationId: 3 },
      { id: 5, title: 'Infinite Horizons', artist: 'FLACID', album: 'Cosmic Doom', duration: '14:27', url: '', visualizationId: 4 },
    ],
  },
  footer: {
    bandName: 'FLACID',
    description: 'Transcending reality through heavy, atmospheric soundscapes.',
    email: 'contact@flacid.com',
    socialLinks: {
      facebook: 'https://facebook.com/flacid',
      instagram: 'https://instagram.com/flacid',
      twitter: 'https://twitter.com/flacid',
      youtube: 'https://youtube.com/@flacid',
      spotify: 'https://open.spotify.com/artist/flacid',
      bandcamp: 'https://flacid.bandcamp.com',
    },
    copyright: '© 2025 FLACID. All rights reserved. Embrace the void.',
  },
};

function generatePath(prefix: string, ext = 'webp'): string {
  return `${prefix}/${crypto.randomUUID()}.${ext}`;
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [publishedContent, setPublishedContent] = useState<SiteContent>(defaultContent);
  const [draftContent, setDraftContent] = useState<SiteContent>(defaultContent);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishLoading, setPublishLoading] = useState(false);

  const [audioCache, setAudioCache] = useState<Record<number, string>>({});
  const [draftRevision, setDraftRevision] = useState(0);

  // Migration helper to ensure all required fields exist
  const migrateContent = (content: unknown): SiteContent => {
    const c = content as Partial<SiteContent> & Record<string, unknown>;
    const migrated = {
      ...defaultContent,
      ...c,
      // Ensure listenNow exists (for backward compatibility)
      listenNow: c.listenNow || defaultContent.listenNow,
      // Ensure all other sections have defaults
      hero: { ...defaultContent.hero, ...c.hero },
      about: { ...defaultContent.about, ...c.about },
      discography: { ...defaultContent.discography, ...c.discography },
      tour: { ...defaultContent.tour, ...c.tour },
      gallery: { ...defaultContent.gallery, ...c.gallery },
      musicPlayer: { ...defaultContent.musicPlayer, ...c.musicPlayer },
      footer: { ...defaultContent.footer, ...c.footer },
    };
    
    // Force update hero text if it contains old values
    if (migrated.hero.subtitle === 'Transcendence through sound') {
      migrated.hero.subtitle = 'The Fragile Sphere';
    }
    if (migrated.hero.tagline === 'Live from the basement') {
      migrated.hero.tagline = '';
    }
    
    // Force update about section if it contains old Crash Moons text
    if (migrated.about.content?.includes('CRASH MOONS emerged from')) {
      migrated.about.content = defaultContent.about.content;
    }
    
    // Force update about section if it contains old "defined by intensity" text
    if (migrated.about.content?.includes('defined by intensity, surprise, and wonder')) {
      migrated.about.content = defaultContent.about.content;
    }
    
    // Update all "Crash Moons" references to "FLACID" in tracks
    migrated.musicPlayer.tracks = migrated.musicPlayer.tracks.map((track: { artist?: string }) => ({
      ...track,
      artist: track.artist === 'Crash Moons' ? 'FLACID' : track.artist
    }));
    
    // Update footer band name if it's still "Crash Moons" or "CRASH MOONS"
    if (migrated.footer.bandName === 'Crash Moons' || migrated.footer.bandName === 'CRASH MOONS') {
      migrated.footer.bandName = 'FLACID';
    }
    
    // Update copyright if it contains "Crash Moons"
    if (migrated.footer.copyright?.includes('Crash Moons')) {
      migrated.footer.copyright = migrated.footer.copyright.replace(/Crash Moons/g, 'FLACID');
    }
    
    // Update email and social links if they contain "crashmoons"
    if (migrated.footer.email?.includes('crashmoons')) {
      migrated.footer.email = migrated.footer.email.replace(/crashmoons/g, 'flacid');
    }
    Object.keys(migrated.footer.socialLinks).forEach(key => {
      const link = migrated.footer.socialLinks[key as keyof typeof migrated.footer.socialLinks];
      if (typeof link === 'string' && link.includes('crashmoons')) {
        migrated.footer.socialLinks[key as keyof typeof migrated.footer.socialLinks] = 
          link.replace(/crashmoons/g, 'flacid');
      }
    });
    
    return migrated;
  };

  // Load from Supabase on mount (or use defaultContent)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const content = await loadContentFromSupabase(defaultContent);
        if (!cancelled) {
          setPublishedContent(migrateContent(content));
          setDraftContent(migrateContent(content));
        }
      } catch (e) {
        console.error('[EditMode] Failed to load from Supabase:', e);
        if (!cancelled) {
          setPublishedContent(defaultContent);
          setDraftContent(defaultContent);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // No localStorage persistence - all data lives in Supabase

  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    
    // Clear audio cache when exiting edit mode for performance
    if (!newEditMode) {
      setAudioCache({});
      console.log('Audio cache cleared for performance');
    }
  };

  const updateContent = <K extends keyof SiteContent>(section: K, data: SiteContent[K]) => {
    setDraftContent(prev => {
      if (section === 'musicPlayer' && typeof data === 'object' && data !== null && 'tracks' in data && Array.isArray((data as { tracks: unknown }).tracks)) {
        const nextTracks = (data as SiteContent['musicPlayer']).tracks.map((t) => ({ ...t }));
        return {
          ...prev,
          musicPlayer: { ...prev.musicPlayer, tracks: nextTracks },
        };
      }
      return { ...prev, [section]: data };
    });
    if (section === 'musicPlayer') setDraftRevision((r) => r + 1);
    setIsDraft(true);
    
    // If updating music player tracks, cache the audio URLs
    if (section === 'musicPlayer' && 'tracks' in data && Array.isArray(data.tracks)) {
      const newCache: Record<number, string> = {};
      data.tracks.forEach((track: SiteContent['musicPlayer']['tracks'][number]) => {
        if (track.url && track.url.startsWith('data:')) {
          newCache[track.id] = track.url;
          console.log(`Cached audio for track ${track.id}: ${track.title}`);
        }
      });
      setAudioCache(prev => ({ ...prev, ...newCache }));
      console.log('Audio cache updated:', Object.keys(newCache).length, 'tracks');
    }
  };

  const publishChanges = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setPublishedContent(draftContent);
      setIsDraft(false);
      return;
    }
    setPublishLoading(true);
    try {
      await publishContentToSupabase(draftContent);
      setPublishedContent(draftContent);
      setIsDraft(false);
    } catch (e) {
      console.error('[EditMode] Publish failed:', e);
      throw e;
    } finally {
      setPublishLoading(false);
    }
  }, [draftContent]);

  const discardDraft = useCallback(() => {
    setDraftContent(publishedContent);
    setIsDraft(false);
  }, [publishedContent]);

  const uploadImage = useCallback(async (file: File, options?: UploadImageOptions): Promise<string> => {
    const bucket = options?.bucket ?? 'covers';
    const pathPrefix = options?.pathPrefix ?? 'images'; // Avoid bucket/path duplication
    const path = generatePath(pathPrefix);
    const { publicUrl } = await storageUploadImage(file, bucket, path);
    return publicUrl;
  }, []);

  const uploadAudio = useCallback(async (file: File): Promise<string> => {
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('Audio file too large. Maximum size is 50MB.');
    }
    const path = `tracks/${crypto.randomUUID()}.${file.name.split('.').pop() || 'mp3'}`;
    const { publicUrl } = await storageUploadAudio(path, file);
    return publicUrl;
  }, []);

  // Merge audio cache with content when in edit mode
  const getContentWithAudio = () => {
    const baseContent = isEditMode ? draftContent : publishedContent;
    
    // In edit mode, inject cached audio URLs
    if (isEditMode && Object.keys(audioCache).length > 0) {
      return {
        ...baseContent,
        musicPlayer: {
          ...baseContent.musicPlayer,
          tracks: baseContent.musicPlayer.tracks.map(track => ({
            ...track,
            url: audioCache[track.id] || track.url
          }))
        }
      };
    }
    
    return baseContent;
  };
  
  const content = getContentWithAudio();

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        isDraft,
        content,
        draftRevision,
        loading,
        toggleEditMode,
        updateContent,
        publishChanges,
        discardDraft,
        uploadImage,
        uploadAudio,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
}