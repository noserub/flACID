import { Loader2, Music, Play } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { findFirstStreamableTrackIndex } from '../lib/albumTracks';
import { brandPrimaryButtonClass } from '../lib/brandClasses';
import { miniPlayerMetaOnDark } from '../lib/typography';
import { cn } from './ui/utils';

export function HeroListenInvite() {
  const { content } = useEditMode();
  const {
    tracks,
    playTrackAtHero,
    playFromHero,
    isBuffering,
    hasPlaybackSession,
    currentTrackData,
  } = usePlayback();

  const primaryAlbum = content.discography.albums[0];
  const featuredIndex = primaryAlbum
    ? findFirstStreamableTrackIndex(tracks, primaryAlbum.title, primaryAlbum.tracks)
    : tracks.findIndex((t) => Boolean(t.url?.trim()));

  const canPlay = featuredIndex >= 0 || tracks.some((t) => t.url?.trim());

  if (!canPlay) return null;

  const handleListen = () => {
    if (hasPlaybackSession) {
      playFromHero();
      return;
    }
    if (featuredIndex >= 0) {
      playTrackAtHero(featuredIndex);
      return;
    }
    playFromHero();
  };

  const trackTitle = currentTrackData?.title?.trim();
  const label = isBuffering ? 'Loading…' : hasPlaybackSession ? 'Resume' : 'Listen now';
  const showTrackCaption = hasPlaybackSession && !isBuffering && Boolean(trackTitle);

  const ariaLabel = isBuffering
    ? trackTitle
      ? `Loading ${trackTitle}`
      : 'Loading playback'
    : hasPlaybackSession
      ? trackTitle
        ? `Resume ${trackTitle}`
        : 'Resume playback'
      : 'Listen now';

  return (
    <div className="flex w-full flex-col items-center px-2 text-center">
      <button
        type="button"
        onClick={handleListen}
        disabled={isBuffering}
        aria-label={ariaLabel}
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
        {label}
      </button>
      {showTrackCaption && (
        <p
          className={cn(
            miniPlayerMetaOnDark,
            'mt-2 flex max-w-[min(100%,16rem)] items-center justify-center gap-1.5 px-2'
          )}
        >
          <Music className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          <span className="truncate">{trackTitle}</span>
        </p>
      )}
    </div>
  );
}
