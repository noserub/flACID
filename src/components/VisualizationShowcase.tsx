import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { PsychedelicVisualizer } from './PsychedelicVisualizer';
import { usePlayback } from '../contexts/PlaybackContext';
import {
  formatVizTrackCardLabel,
  getTrackMappedVisualizationIds,
  getTracksForVisualization,
  type VizTrackRef,
  VISUALIZATION_NAMES,
} from '../lib/visualizationNames';
import { vizPreviewPosterPath } from '../lib/vizPreviewPaths';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import { cn } from './ui/utils';
import { TextLabel } from './TextLabel';
import { caption, heading, vizCardHint, vizCardName } from '../lib/typography';
import { border, shadow } from '../lib/colors';

function scrollToHero() {
  const el = document.getElementById('hero-stage');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

interface VisualizationShowcaseProps {
  className?: string;
}

/** Live engine preview — same renderer as the player. */
function VizLivePreview({ vizId, className }: { vizId: number; className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <PsychedelicVisualizer
        analyser={null}
        isPlaying
        currentTrack={0}
        visualizationId={vizId}
      />
    </div>
  );
}

/** Grid card — static poster; live viz on hover. */
function VizPreviewCard({
  vizId,
  name,
  trackLabel,
  displayIndex,
  onOpen,
}: {
  vizId: number;
  name: string;
  trackLabel: string;
  displayIndex: number;
  onOpen: () => void;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const poster = vizPreviewPosterPath(vizId);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: displayIndex * 0.02 }}
      onClick={onOpen}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
      className={cn(
        'group relative aspect-[4/3] overflow-hidden rounded-xl text-left',
        'border border-signal-purple/40 bg-void',
        shadow.card,
        'transition-[border-color,box-shadow] duration-300',
        border.brandHover,
        shadow.hoverGreen,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/50'
      )}
    >
      {!isHovering && (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      )}
      {isHovering && <VizLivePreview vizId={vizId} />}
      <div
        className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/20 to-transparent pointer-events-none"
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-end p-3 sm:p-3.5 pointer-events-none">
        <span className={vizCardName}>{name}</span>
        {trackLabel && (
          <span className={cn('mt-1 truncate', caption)}>
            Seen on {trackLabel}
          </span>
        )}
        <span className={cn('mt-2', vizCardHint)}>Preview</span>
      </div>
    </motion.button>
  );
}

function VizTrackList({ refs }: { refs: VizTrackRef[] }) {
  if (refs.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <TextLabel as="p" className="font-medium">
        Seen on
      </TextLabel>
      <ul className="space-y-1">
        {refs.map((ref) => (
          <li key={ref.index} className={cn(caption, 'text-foreground/90')}>
            {ref.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VisualizationShowcase({ className }: VisualizationShowcaseProps) {
  const { tracks, selectTrack, playFromHero } = usePlayback();
  const [selectedViz, setSelectedViz] = useState<number | null>(null);

  const mappedVizIds = useMemo(
    () => getTrackMappedVisualizationIds(tracks),
    [tracks]
  );

  const tracksByVizId = useMemo(() => {
    const map = new Map<number, VizTrackRef[]>();
    for (const vizId of mappedVizIds) {
      map.set(vizId, getTracksForVisualization(tracks, vizId));
    }
    return map;
  }, [tracks, mappedVizIds]);

  const selectedName =
    selectedViz !== null ? VISUALIZATION_NAMES[selectedViz] : '';

  const selectedTrackRefs =
    selectedViz !== null ? tracksByVizId.get(selectedViz) ?? [] : [];

  const selectedPlayableRefs = useMemo(
    () => selectedTrackRefs.filter((ref) => Boolean(tracks[ref.index]?.url?.trim())),
    [selectedTrackRefs, tracks]
  );

  const playTrackLive = useCallback(
    (trackIndex: number) => {
      setSelectedViz(null);
      selectTrack(trackIndex);
      scrollToHero();
      window.setTimeout(() => playFromHero(), 650);
    },
    [selectTrack, playFromHero]
  );

  const selectedTrackSummary = selectedTrackRefs.map((ref) => ref.title).join(', ');

  return (
    <>
      {mappedVizIds.length === 0 ? (
        <p className={cn('text-sm text-muted-foreground', className)}>
          Visualizations appear here when tracks are assigned a viz in the music player.
        </p>
      ) : (
        <div
          className={cn(
            'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5',
            className
          )}
        >
          {mappedVizIds.map((vizId, displayIndex) => {
            const refs = tracksByVizId.get(vizId) ?? [];
            return (
              <VizPreviewCard
                key={vizId}
                vizId={vizId}
                name={VISUALIZATION_NAMES[vizId]}
                trackLabel={formatVizTrackCardLabel(refs)}
                displayIndex={displayIndex}
                onOpen={() => setSelectedViz(vizId)}
              />
            );
          })}
        </div>
      )}

      <Dialog open={selectedViz !== null} onOpenChange={(open) => !open && setSelectedViz(null)}>
        <DialogContent className="max-w-4xl border-signal-purple/40 bg-void p-0 overflow-hidden gap-0">
          <DialogTitle className="sr-only">
            {selectedName} visualization preview
          </DialogTitle>
          <DialogDescription className="sr-only">
            Live preview for {selectedName}
            {selectedTrackSummary ? `, used on ${selectedTrackSummary}` : ''}.
            Open the hero player to experience this visualization with music.
          </DialogDescription>

          <AnimatePresence mode="wait">
            {selectedViz !== null && (
              <motion.div
                key={selectedViz}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="relative aspect-video w-full bg-black">
                  <VizLivePreview vizId={selectedViz} />
                  <button
                    type="button"
                    onClick={() => setSelectedViz(null)}
                    className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-signal-purple/40 bg-void/80 text-foreground hover:border-neon-green/50 transition-colors"
                    aria-label="Close preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div>
                    <h3 className={heading}>{selectedName}</h3>
                  </div>

                  <VizTrackList refs={selectedTrackRefs} />

                  {selectedPlayableRefs.length === 1 && (
                    <Button
                      type="button"
                      className="w-full bg-primary hover:bg-signal-purple-bright"
                      onClick={() => playTrackLive(selectedPlayableRefs[0].index)}
                    >
                      See it live: {selectedPlayableRefs[0].title}
                    </Button>
                  )}

                  {selectedPlayableRefs.length > 1 && (
                    <div className="space-y-2">
                      <TextLabel as="p" className="font-medium">
                        Play with track
                      </TextLabel>
                      <div className="flex flex-col gap-2">
                        {selectedPlayableRefs.map((ref) => (
                          <Button
                            key={ref.index}
                            type="button"
                            variant="outline"
                            className="w-full justify-start border-signal-purple/40 hover:border-neon-green/50"
                            onClick={() => playTrackLive(ref.index)}
                          >
                            {ref.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
