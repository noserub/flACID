import { Loader2, Play } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { findFirstStreamableTrackIndex } from '../lib/albumTracks';
import { brandPrimaryButtonClass } from '../lib/brandClasses';
import { cn } from './ui/utils';

export function HeroListenInvite() {
  const { content } = useEditMode();
  const { tracks, playTrackAtHero, playFromHero, isBuffering } = usePlayback();

  const primaryAlbum = content.discography.albums[0];
  const featuredIndex = primaryAlbum
    ? findFirstStreamableTrackIndex(tracks, primaryAlbum.title, primaryAlbum.tracks)
    : tracks.findIndex((t) => Boolean(t.url?.trim()));

  const canPlay = featuredIndex >= 0 || tracks.some((t) => t.url?.trim());

  if (!canPlay) return null;

  const handleListen = () => {
    if (featuredIndex >= 0) {
      playTrackAtHero(featuredIndex);
      return;
    }
    playFromHero();
  };

  return (
    <div className="flex w-full flex-col items-center px-2 text-center">
      <button
        type="button"
        onClick={handleListen}
        disabled={isBuffering}
        className={cn(
          brandPrimaryButtonClass,
          'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-8 py-3 text-base font-semibold',
          'shadow-[0_0_32px_rgba(139,92,246,0.45)] transition-transform hover:scale-[1.02] active:scale-[0.98]',
          'disabled:cursor-wait disabled:opacity-80'
        )}
      >
        {isBuffering ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Play className="h-5 w-5 fill-current" aria-hidden />
        )}
        {isBuffering ? 'Loading…' : 'Listen now'}
      </button>
    </div>
  );
}
