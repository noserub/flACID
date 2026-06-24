import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronDown, Loader2, Music, Pause, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePlayback } from '../contexts/PlaybackContext';
import { findFirstStreamableTrackIndex } from '../lib/albumTracks';
import { toast } from '../lib/toast';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { DiscographyEditDialog } from './DiscographyEditDialog';
import { MusicPlayerEditDialog } from './MusicPlayerEditDialog';
import { AlbumTrackList } from './AlbumTrackList';
import { SectionTitle } from './SectionTitle';
import { SectionAmbient } from './SectionAmbient';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { bodySecondary, caption, cardTitle, heading } from '../lib/typography';
import { border, shadow } from '../lib/colors';
import { brandControlClass, brandPrimaryButtonClass } from '../lib/brandClasses';

const defaultAlbumImage =
  'https://images.unsplash.com/photo-1564178413634-1ec30062c5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtfGVufDF8fHx8MTc2MDIyOTk5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

export interface DiscographyAlbum {
  id: string;
  title: string;
  year: string;
  coverImage: string;
  description: string;
  tracks: string[];
}

function AlbumMeta({ album }: { album: DiscographyAlbum }) {
  const trackCount = album.tracks.filter((t) => t.trim()).length;

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1', caption)}>
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>{album.year}</span>
      </div>
      {trackCount > 0 && (
        <div className="flex items-center gap-1">
          <Music className="h-4 w-4" />
          <span>
            {trackCount} track{trackCount === 1 ? '' : 's'}
          </span>
        </div>
      )}
    </div>
  );
}

function PlayAlbumButton({
  albumTitle,
  trackNames,
  className,
}: {
  albumTitle: string;
  trackNames: string[];
  className?: string;
}) {
  const { tracks, playTrackInPlace, togglePlay, currentTrack, isPlaying, isBuffering, hasPlaybackSession } =
    usePlayback();
  const firstIndex = findFirstStreamableTrackIndex(tracks, albumTitle, trackNames);
  const hasTrackList = trackNames.some((t) => t.trim());
  const isActiveTrack = firstIndex != null && firstIndex === currentTrack;
  const isLoading = isActiveTrack && isBuffering && !isPlaying;
  const isActivePlaying = isActiveTrack && (isPlaying || isBuffering);
  const isActivePaused = isActiveTrack && hasPlaybackSession && !isPlaying && !isBuffering;

  if (!hasTrackList) return null;

  const handleClick = () => {
    if (firstIndex == null) {
      toast.error('No uploaded audio matches this album yet. Add tracks in the music catalog (edit mode).');
      return;
    }
    if (isActivePlaying || isActivePaused) {
      togglePlay();
      return;
    }
    playTrackInPlace(firstIndex);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={firstIndex == null || isLoading}
      className={cn(
        brandPrimaryButtonClass,
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isActivePlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4 fill-current" />
      )}
      {isLoading ? 'Loading…' : isActivePlaying ? 'Pause album' : isActivePaused ? 'Resume album' : 'Play album'}
    </button>
  );
}

function FeaturedAlbum({ album }: { album: DiscographyAlbum }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-lg',
        border.brandCardHover,
        shadow.hoverPurple
      )}
    >
      <div className="grid gap-8 p-6 lg:grid-cols-[minmax(220px,300px)_1fr] lg:gap-10 lg:p-8 xl:grid-cols-[minmax(240px,320px)_1fr]">
        <div className="mx-auto w-full max-w-xs space-y-5 lg:mx-0 lg:max-w-none lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <ImageWithFallback
              src={album.coverImage || defaultAlbumImage}
              alt={album.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <h3 className={heading}>{album.title}</h3>
            <AlbumMeta album={album} />
            {album.description && (
              <p className={cn(bodySecondary, 'leading-relaxed')}>{album.description}</p>
            )}
            <div className="flex justify-center lg:justify-start">
              <PlayAlbumButton albumTitle={album.title} trackNames={album.tracks} />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className={cn(caption, 'mb-3 uppercase tracking-wider text-neon-green')}>Tracklist</p>
          <AlbumTrackList
            albumTitle={album.title}
            trackNames={album.tracks}
            layout="grid"
            density="compact"
            bordered={false}
          />
        </div>
      </div>
    </motion.div>
  );
}

function CatalogAlbumCard({
  album,
  index,
}: {
  album: DiscographyAlbum;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const trackCount = album.tracks.filter((t) => t.trim()).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            'overflow-hidden rounded-lg border border-border bg-card shadow-lg transition-all duration-300',
            border.brandCardHover,
            shadow.hoverPurple
          )}
        >
          <div className="relative aspect-square overflow-hidden">
            <ImageWithFallback
              src={album.coverImage || defaultAlbumImage}
              alt={album.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="space-y-3 p-6">
            <h3 className={cardTitle}>{album.title}</h3>
            <AlbumMeta album={album} />
            {album.description && (
              <p className={cn(bodySecondary, 'line-clamp-3 leading-relaxed')}>{album.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <PlayAlbumButton albumTitle={album.title} trackNames={album.tracks} />
              {trackCount > 0 && (
                <CollapsibleTrigger
                  className={cn(
                    brandControlClass,
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium'
                  )}
                >
                  {open ? 'Hide tracks' : `View ${trackCount} tracks`}
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
                  />
                </CollapsibleTrigger>
              )}
            </div>

            <CollapsibleContent>
              <AlbumTrackList
                albumTitle={album.title}
                trackNames={album.tracks}
                layout="stack"
                density="compact"
              />
            </CollapsibleContent>
          </div>
        </div>
      </Collapsible>
    </motion.div>
  );
}

export function AlbumsSection() {
  const { content, isEditMode, updateContent } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const albums = content.discography.albums;
  const isFeaturedLayout = albums.length === 1;

  return (
    <EditableSection
      sectionName="Discography"
      visible={content.discography.visible}
      onVisibilityChange={(visible) =>
        updateContent('discography', { ...content.discography, visible })
      }
    >
      <section
        className="relative overflow-hidden px-4 py-20"
        aria-labelledby="journey-section-head"
        data-section="discography"
      >
        <SectionAmbient />
        <div className="relative">
          <div className={cn('mx-auto max-w-7xl', sectionLift)}>
            <div id="journey-section-head" className="mb-12 scroll-mt-28 text-center lg:mb-16">
              <SectionTitle>{content.discography.title}</SectionTitle>
              {isEditMode && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <DiscographyEditDialog />
                  <MusicPlayerEditDialog />
                </div>
              )}
            </div>

            <div>
              {isFeaturedLayout ? (
                <FeaturedAlbum album={albums[0]} />
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {albums.map((album, index) => (
                    <CatalogAlbumCard key={album.id} album={album} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </EditableSection>
  );
}
