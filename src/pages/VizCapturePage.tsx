/**
 * Dev-only page for recording WebM preview loops.
 * Visit /capture-viz?viz=0 or run `npm run capture:viz-previews`.
 */

import { useEffect } from 'react';
import { PsychedelicVisualizer } from '../components/PsychedelicVisualizer';
import { NUM_VISUALIZATIONS } from '../components/visualizer/visualizations';
import { VISUALIZATION_NAMES } from '../lib/visualizationNames';

const CAPTURE_W = 1280;
const CAPTURE_H = 720;

declare global {
  interface Window {
    __vizCaptureReady?: boolean;
    __vizCaptureVizId?: number;
  }
}

export function VizCapturePage() {
  const vizId = (() => {
    if (typeof window === 'undefined') return 0;
    const n = parseInt(new URLSearchParams(window.location.search).get('viz') ?? '0', 10);
    return Number.isNaN(n) ? 0 : n % NUM_VISUALIZATIONS;
  })();

  useEffect(() => {
    window.__vizCaptureVizId = vizId;
    const timer = window.setTimeout(() => {
      window.__vizCaptureReady = true;
    }, 600);
    return () => {
      clearTimeout(timer);
      window.__vizCaptureReady = false;
    };
  }, [vizId]);

  return (
    <div
      className="bg-void overflow-hidden"
      style={{ width: CAPTURE_W, height: CAPTURE_H }}
      data-capture-root
    >
      <PsychedelicVisualizer
        analyser={null}
        isPlaying
        currentTrack={0}
        visualizationId={vizId}
      />
      <span className="sr-only">{VISUALIZATION_NAMES[vizId]} preview capture</span>
    </div>
  );
}
