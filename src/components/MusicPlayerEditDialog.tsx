import { useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useEditMode } from '../contexts/EditModeContext';
import type { SiteContent } from '../contexts/EditModeContext';

type Track = SiteContent['musicPlayer']['tracks'][number];
import { EditDialog, AudioUpload } from './EditableSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export function MusicPlayerEditDialog() {
  const { content, updateContent } = useEditMode();
  const [tracks, setTracks] = useState(content.musicPlayer.tracks);
  const [processingTrack, setProcessingTrack] = useState<number | null>(null);

  const pushTracksToContext = (nextTracks: typeof tracks) => {
    updateContent('musicPlayer', { tracks: nextTracks.map((t) => ({ ...t })) });
  };

  const handleAddTrack = () => {
    const newTrack: Track = {
      id: Date.now(),
      title: 'New Track',
      artist: 'FLACID',
      album: '',
      duration: '0:00',
      url: '',
      visualizationId: 0,
    };
    const nextTracks = [...tracks, newTrack];
    setTracks(nextTracks);
    pushTracksToContext(nextTracks);
  };

  const handleRemoveTrack = (id: number) => {
    const nextTracks = tracks.filter((t) => t.id !== id);
    setTracks(nextTracks);
    pushTracksToContext(nextTracks);
  };

  const handleUpdateTrack = (id: number, field: string, value: string | number | boolean) => {
    const nextTracks = tracks.map((track) =>
      track.id === id ? { ...track, [field]: value } : track
    );
    setTracks(nextTracks);
    pushTracksToContext(nextTracks);
  };

  const handleAudioUpload = async (id: number, url: string) => {
    // Validate URL before processing
    if (!url || url.trim() === '') {
      console.error('Empty audio URL provided');
      return;
    }
    
    // Set processing state
    setProcessingTrack(id);
    
    // Extract duration from audio file
    const audio = new Audio();
    
    // Set up event listeners before setting src
    const loadPromise = new Promise<void>((resolve, reject) => {
      const onLoadedMetadata = () => {
        try {
          const duration = audio.duration;
          
          // Check if duration is valid
          if (!isFinite(duration) || duration <= 0) {
            throw new Error('Invalid audio duration');
          }
          
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          console.log(`Audio uploaded - Duration: ${durationStr}`);
          
          // Update track with URL and duration
          setTracks(
            tracks.map((track) =>
              track.id === id ? { ...track, url, duration: durationStr } : track
            )
          );
          
          cleanup();
          resolve();
        } catch (err) {
          cleanup();
          reject(err);
        }
      };
      
      const onError = (e: ErrorEvent | Event) => {
        cleanup();
        
        // Get detailed error information
        let errorMsg = 'Failed to load audio file.';
        if (audio.error) {
          switch (audio.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMsg = 'Audio loading was aborted.';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMsg = 'Network error while loading audio.';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMsg = 'Audio file is corrupted or format not supported.';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMsg = 'Audio format not supported. Please use MP3, WAV, or OGG.';
              break;
          }
          console.error('Audio error:', {
            code: audio.error.code,
            message: audio.error.message
          });
        }
        
        reject(new Error(errorMsg));
      };
      
      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('error', onError);
        audio.pause();
        audio.src = '';
      };
      
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('error', onError);
      
      // Set a timeout for loading
      setTimeout(() => {
        if (audio.readyState === 0) {
          cleanup();
          reject(new Error('Audio loading timed out. File may be too large or connection is slow.'));
        }
      }, 30000); // 30 second timeout
    });
    
    try {
      // Set the source and load
      audio.src = url;
      audio.load();
      await loadPromise;
    } catch (error) {
      console.error('Failed to load audio metadata:', error);
      alert(error instanceof Error ? error.message : 'Failed to load audio file. Please try again with a different file.');
      
      // Still update the track with URL but keep original duration
      const nextTracks = tracks.map((track) =>
        track.id === id ? { ...track, url } : track
      );
      setTracks(nextTracks);
      pushTracksToContext(nextTracks);
    } finally {
      setProcessingTrack(null);
    }
  };

  const handleSave = () => {
    updateContent('musicPlayer', {
      tracks: tracks.map((t) => ({ ...t })),
    });
  };

  return (
    <EditDialog
      onOpenChange={(open) => {
        if (open) setTracks(content.musicPlayer.tracks.map((t) => ({ ...t })));
      }}
      trigger={
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Tracks
        </Button>
      }
      title="Edit Music Player"
      onSave={handleSave}
    >
      <Button onClick={handleAddTrack} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Track
      </Button>

      {tracks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tracks yet. Click "Add Track" to get started.
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {tracks.map((track, index) => (
            <AccordionItem key={track.id} value={track.id.toString()}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    Viz {(track.visualizationId ?? index % 10) + 1}
                  </span>
                  {track.title} - {track.duration}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTrack(track.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>

                  <AudioUpload
                    label="Audio File"
                    currentUrl={track.url}
                    onUpload={(url) => handleAudioUpload(track.id, url)}
                  />
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3">
                    <p className="text-xs text-purple-300">
                      💡 <strong>Edit Mode Only:</strong> Audio files are kept in memory while editing so you can test visualizations. They're cleared when you exit edit mode for performance.
                    </p>
                  </div>

                  {processingTrack === track.id && (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
                      <p className="text-xs text-blue-300">
                        ⏳ Processing audio file...
                      </p>
                    </div>
                  )}

                  {track.url && processingTrack !== track.id && (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                      <p className="text-xs text-green-300">
                        ✓ Audio loaded • Duration: {track.duration}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Track Title</Label>
                    <Input
                      value={track.title}
                      onChange={(e) =>
                        handleUpdateTrack(track.id, 'title', e.target.value)
                      }
                      placeholder="Track title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Artist</Label>
                    <Input
                      value={track.artist}
                      onChange={(e) =>
                        handleUpdateTrack(track.id, 'artist', e.target.value)
                      }
                      placeholder="Artist name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Album</Label>
                    <Input
                      value={track.album}
                      onChange={(e) =>
                        handleUpdateTrack(track.id, 'album', e.target.value)
                      }
                      placeholder="Album name (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Visualization</Label>
                    <Select
                      key={`viz-${track.id}`}
                      value={(track.visualizationId ?? 0).toString()}
                      onValueChange={(value) =>
                        handleUpdateTrack(track.id, 'visualizationId', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visualization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">1. Organic Flow Field</SelectItem>
                        <SelectItem value="1">2. Depth Layers</SelectItem>
                        <SelectItem value="2">3. Waveform Interference</SelectItem>
                        <SelectItem value="3">4. Minimal Geometric</SelectItem>
                        <SelectItem value="4">5. Atmospheric Noise</SelectItem>
                        <SelectItem value="5">6. Kaleidoscope Fractals</SelectItem>
                        <SelectItem value="6">7. Liquid Plasma</SelectItem>
                        <SelectItem value="7">8. Neon Grid</SelectItem>
                        <SelectItem value="8">9. Spiral Galaxy</SelectItem>
                        <SelectItem value="9">10. Crystal Lattice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </EditDialog>
  );
}