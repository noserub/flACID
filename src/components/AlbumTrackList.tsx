import { Pause, Play } from 'lucide-react';
import { usePlayback } from '../contexts/PlaybackContext';
import { findPlayableTrackIndex, isTrackStreamable } from '../lib/albumTracks';
import { brandControlClass, brandPrimaryButtonClass } from '../lib/brandClasses';
import { caption, inlineSecondary } from '../lib/typography';
import { cn } from './ui/utils';

interface AlbumTrackListProps {
  albumTitle: string;
  trackNames: string[];
  /** Single column (card) vs two columns on md+ (featured release) */
  layout?: 'stack' | 'grid';
  /** Tighter rows for long tracklists */
  density?: 'default' | 'compact';
  bordered?: boolean;
}

function splitTrackColumns(trackNames: string[]): [string[], string[]] {
  const listed = trackNames.map((t) => t.trim()).filter(Boolean);
  const splitAt = Math.ceil(listed.length / 2);
  return [listed.slice(0, splitAt), listed.slice(splitAt)];
}

export function AlbumTrackList({
  albumTitle,
  trackNames,
  layout = 'stack',
  density = 'default',
  bordered = true,
}: AlbumTrackListProps) {
  const {
    tracks,
    currentTrack,
    isPlaying,
    isBuffering,
    hasPlaybackSession,
    playTrackInPlace,
    togglePlay,
    formatTime,
    duration,
    currentTime,
  } = usePlayback();

  const listed = trackNames.map((t) => t.trim()).filter(Boolean);
  if (listed.length === 0) return null;

  const compact = density === 'compact';

  const handleTrackPress = (playableIndex: number) => {
    const isActive = playableIndex === currentTrack;
    if (isActive && (isPlaying || isBuffering)) {
      togglePlay();
      return;
    }
    if (isActive && hasPlaybackSession) {
      togglePlay();
      return;
    }
    playTrackInPlace(playableIndex);
  };

  const renderTrack = (name: string, index: number) => {
    const playableIndex = findPlayableTrackIndex(tracks, albumTitle, name);
    const streamable = isTrackStreamable(tracks, playableIndex);
    const isActive = streamable && playableIndex === currentTrack;
    const isActiveSession = isActive && hasPlaybackSession;
    const isActivePlayback = isActiveSession && (isPlaying || isBuffering);
    const rowDuration =
      isActive && duration > 0
        ? `${formatTime(currentTime)} / ${formatTime(duration)}`
        : playableIndex != null
          ? tracks[playableIndex]?.duration || '0:00'
          : null;

    if (streamable && playableIndex != null) {
      return (
        <li key={`${name}-${index}`}>
          <button
            type="button"
            onClick={() => handleTrackPress(playableIndex)}
            aria-current={isActive ? 'true' : undefined}
            aria-label={
              isActivePlayback
                ? `Pause ${name}`
                : isActiveSession
                  ? `Resume ${name}`
                  : `Play ${name}`
            }
            className={cn(
              'group flex w-full items-center gap-2 rounded-md text-left transition-colors',
              compact ? 'px-1.5 py-1.5' : 'px-2 py-2',
              isActive
                ? 'bg-signal-purple/15 text-foreground'
                : 'hover:bg-white/[0.04]'
            )}
          >
            <span
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full transition-colors',
                compact ? 'h-7 w-7' : 'h-8 w-8',
                isActivePlayback ? brandPrimaryButtonClass : brandControlClass
              )}
              aria-hidden
            >
              {isActivePlayback ? (
                <Pause className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
              ) : (
                <Play className={cn('fill-current', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
              )}
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 truncate font-medium text-foreground',
                compact ? 'text-sm' : 'text-base'
              )}
            >
              <span className="tabular-nums text-muted-foreground mr-1.5">{index + 1}.</span>
              {name}
            </span>
            {rowDuration && (
              <span className={cn(caption, 'shrink-0 tabular-nums')}>{rowDuration}</span>
            )}
          </button>
        </li>
      );
    }

    return (
      <li
        key={`${name}-${index}`}
        className={cn(
          'flex items-center gap-2 text-muted-foreground',
          compact ? 'px-1.5 py-1.5' : 'px-2 py-2'
        )}
      >
        <span
          className={cn(
            'flex shrink-0 items-center justify-center tabular-nums text-muted-foreground',
            compact ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-sm'
          )}
        >
          {index + 1}
        </span>
        <span className={cn(inlineSecondary, 'min-w-0 flex-1 truncate', compact && 'text-sm')}>
          {name}
        </span>
      </li>
    );
  };

  const rowListClassName = 'space-y-0.5';
  const stackListClassName = cn(bordered && 'border-t border-border/60 pt-4', rowListClassName);

  const trackLists =
    layout === 'grid' ? (
      (() => {
        const [col1, col2] = splitTrackColumns(trackNames);
        const col2Offset = col1.length;

        return (
          <div
            className={cn(
              bordered && 'border-t border-border/60 pt-4',
              'grid grid-cols-1 gap-x-8 md:grid-cols-2'
            )}
          >
            <ul className={rowListClassName} role="list">
              {col1.map((name, i) => renderTrack(name, i))}
            </ul>
            <ul className={rowListClassName} role="list">
              {col2.map((name, i) => renderTrack(name, col2Offset + i))}
            </ul>
          </div>
        );
      })()
    ) : (
      <ul className={stackListClassName} role="list">
        {listed.map((name, index) => renderTrack(name, index))}
      </ul>
    );

  return trackLists;
}
