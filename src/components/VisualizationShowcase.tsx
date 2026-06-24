import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { PsychedelicVisualizer } from './PsychedelicVisualizer';
import { usePlayback } from '../contexts/PlaybackContext';
import { VISUALIZATION_NAMES } from '../lib/visualizationNames';
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
import { heading, vizCardHint, vizCardName } from '../lib/typography';
import { border, shadow } from '../lib/colors';

function scrollToHero() {
  const el = document.getElementById('hero-stage');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function findTrackForViz(
  tracks: { visualizationId?: number }[],
  vizId: number
): number {
  const exact = tracks.findIndex(
    (t) => (t.visualizationId ?? 0) % VISUALIZATION_NAMES.length === vizId
  );
  return exact >= 0 ? exact : 0;
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
  index,
  onOpen,
}: {
  vizId: number;
  name: string;
  index: number;
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
      transition={{ duration: 0.4, delay: index * 0.02 }}
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
        <TextLabel as="span" className="mb-0.5 font-medium">
          Viz {index + 1}
        </TextLabel>
        <span className={vizCardName}>{name}</span>
        <span className={cn('mt-2', vizCardHint)}>Preview</span>
      </div>
    </motion.button>
  );
}

export function VisualizationShowcase({ className }: VisualizationShowcaseProps) {
  const { tracks, selectTrack, playFromHero } = usePlayback();
  const [selectedViz, setSelectedViz] = useState<number | null>(null);

  const selectedName =
    selectedViz !== null ? VISUALIZATION_NAMES[selectedViz] : '';

  const seeItLive = useCallback(
    (vizId: number) => {
      const trackIndex = findTrackForViz(tracks, vizId);
      setSelectedViz(null);
      selectTrack(trackIndex);
      scrollToHero();
      window.setTimeout(() => playFromHero(), 650);
    },
    [tracks, selectTrack, playFromHero]
  );

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5',
          className
        )}
      >
        {VISUALIZATION_NAMES.map((name, index) => (
          <VizPreviewCard
            key={name}
            vizId={index}
            name={name}
            index={index}
            onOpen={() => setSelectedViz(index)}
          />
        ))}
      </div>

      <Dialog open={selectedViz !== null} onOpenChange={(open) => !open && setSelectedViz(null)}>
        <DialogContent className="max-w-4xl border-signal-purple/40 bg-void p-0 overflow-hidden gap-0">
          <DialogTitle className="sr-only">
            {selectedName} visualization preview
          </DialogTitle>
          <DialogDescription className="sr-only">
            Live preview for {selectedName}. Open the hero player to experience this visualization with music.
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
                    <TextLabel as="span" className="font-medium">
                      Viz {selectedViz + 1}
                    </TextLabel>
                    <h3 className={cn(heading, 'mt-1')}>{selectedName}</h3>
                  </div>

                  {tracks.some((t) => t.url) && (
                    <Button
                      type="button"
                      className="w-full bg-primary hover:bg-signal-purple-bright"
                      onClick={() => seeItLive(selectedViz)}
                    >
                      See it live
                    </Button>
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
