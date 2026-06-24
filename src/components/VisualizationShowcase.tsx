import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, X } from 'lucide-react';
import { usePlayback } from '../contexts/PlaybackContext';
import { VISUALIZATION_NAMES } from '../lib/visualizationNames';
import { vizPreviewWebmPath } from '../lib/vizPreviewPaths';
import { SECTION_SCROLL_MARGIN_PX } from '../lib/sectionNav';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import { cn } from './ui/utils';

function scrollToPlayer() {
  const el =
    document.getElementById('music-player') ??
    document.getElementById('listen-section-head');
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_MARGIN_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
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

function VizPreviewVideo({ vizId, className }: { vizId: number; className?: string }) {
  const src = vizPreviewWebmPath(vizId);

  return (
    <video
      src={src}
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}

export function VisualizationShowcase({ className }: VisualizationShowcaseProps) {
  const { tracks, selectTrack, setIsFullscreen, setShouldAutoPlay } = usePlayback();
  const [selectedViz, setSelectedViz] = useState<number | null>(null);

  const selectedName =
    selectedViz !== null ? VISUALIZATION_NAMES[selectedViz] : '';

  const launchLive = useCallback(
    (vizId: number, autoPlay: boolean) => {
      const trackIndex = findTrackForViz(tracks, vizId);
      selectTrack(trackIndex);
      if (autoPlay) {
        setShouldAutoPlay(true);
      }
      scrollToPlayer();
      window.setTimeout(() => setIsFullscreen(true), 450);
      setSelectedViz(null);
    },
    [tracks, selectTrack, setShouldAutoPlay, setIsFullscreen]
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
            <motion.button
              key={name}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.02 }}
              onClick={() => setSelectedViz(index)}
              className={cn(
                'group relative aspect-[4/3] overflow-hidden rounded-xl text-left',
                'border border-signal-purple/40 bg-void',
                'shadow-[0_8px_28px_rgba(0,0,0,0.35)]',
                'transition-all duration-300',
                'hover:border-neon-green/50 hover:shadow-[0_0_24px_rgba(74,222,128,0.18)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/50'
              )}
            >
              <VizPreviewVideo vizId={index} />
              <div className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/25 to-transparent" aria-hidden />

              <div className="relative flex h-full flex-col justify-end p-3 sm:p-3.5">
                <span className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-neon-green/90">
                  Viz {index + 1}
                </span>
                <span className="font-hero text-sm leading-tight text-foreground sm:text-base">
                  {name}
                </span>
                <span className="mt-2 text-[11px] text-foreground/65 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Preview
                </span>
              </div>
            </motion.button>
        ))}
      </div>

      <Dialog open={selectedViz !== null} onOpenChange={(open) => !open && setSelectedViz(null)}>
        <DialogContent className="max-w-2xl border-signal-purple/40 bg-void p-0 overflow-hidden gap-0">
          <DialogTitle className="sr-only">
            {selectedName} visualization preview
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview loop for {selectedName}. Choose to see it live in the player or play a matching track.
          </DialogDescription>

          <AnimatePresence mode="wait">
            {selectedViz !== null && (
              <motion.div
                key={selectedViz}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative aspect-video w-full bg-black">
                  <VizPreviewVideo vizId={selectedViz} />
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
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-green">
                      Viz {selectedViz + 1}
                    </p>
                    <h3 className="font-hero text-2xl text-foreground mt-1">{selectedName}</h3>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      className="flex-1 gap-2 bg-primary hover:bg-signal-purple-bright"
                      onClick={() => launchLive(selectedViz, true)}
                    >
                      <Sparkles className="h-4 w-4" aria-hidden />
                      See it live
                    </Button>
                    {tracks.some((t) => t.url) && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 gap-2 border-signal-purple/50 hover:border-neon-green/50"
                        onClick={() => {
                          const trackIndex = findTrackForViz(tracks, selectedViz);
                          selectTrack(trackIndex);
                          setShouldAutoPlay(true);
                          setIsFullscreen(false);
                          scrollToPlayer();
                          setSelectedViz(null);
                        }}
                      >
                        <Play className="h-4 w-4" aria-hidden />
                        Play track
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
