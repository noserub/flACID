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
const CAPTURE_FPS = 60;
const WARMUP_MS = 1000;
const RECORD_MS = 4000;

declare global {
  interface Window {
    __vizCaptureReady?: boolean;
    __vizCaptureVizId?: number;
    __captureVizPoster?: () => string | null;
    __recordVizPreview?: () => Promise<ArrayBuffer>;
  }
}

function pickRecorderMime(): string {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'video/webm';
}

function getActiveCanvas(root: HTMLElement): HTMLCanvasElement | null {
  for (const el of root.querySelectorAll('canvas')) {
    if (window.getComputedStyle(el).display !== 'none') {
      return el as HTMLCanvasElement;
    }
  }
  return null;
}

async function recordCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  await new Promise((r) => setTimeout(r, WARMUP_MS));

  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & {
    requestFrame?: () => void;
  };

  let rafId = 0;
  const pumpFrames = () => {
    track.requestFrame?.();
    rafId = requestAnimationFrame(pumpFrames);
  };
  pumpFrames();

  const mimeType = pickRecorderMime();
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onerror = () => {
      cancelAnimationFrame(rafId);
      reject(new Error('MediaRecorder failed'));
    };
    recorder.onstop = () => {
      cancelAnimationFrame(rafId);
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
      if (blob.size < 8_000) {
        reject(new Error(`Recording too small (${blob.size} bytes)`));
        return;
      }
      resolve(blob);
    };
    recorder.start(100);
    setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop();
    }, RECORD_MS);
  });
}

export function VizCapturePage() {
  const vizId = (() => {
    if (typeof window === 'undefined') return 0;
    const n = parseInt(new URLSearchParams(window.location.search).get('viz') ?? '0', 10);
    return Number.isNaN(n) ? 0 : n % NUM_VISUALIZATIONS;
  })();

  useEffect(() => {
    window.__vizCaptureVizId = vizId;
    window.__vizCaptureReady = false;

    const timer = window.setTimeout(() => {
      window.__vizCaptureReady = true;
    }, 500);

    window.__captureVizPoster = () => {
      const root = document.querySelector('[data-capture-root]');
      if (!root) return null;
      const canvas = getActiveCanvas(root as HTMLElement);
      if (!canvas) return null;
      try {
        return canvas.toDataURL('image/png');
      } catch {
        return null;
      }
    };

    window.__recordVizPreview = async () => {
      const root = document.querySelector('[data-capture-root]');
      if (!root) throw new Error('Capture root missing');
      const canvas = getActiveCanvas(root as HTMLElement);
      if (!canvas) throw new Error('Capture canvas not found');
      const blob = await recordCanvas(canvas);
      return blob.arrayBuffer();
    };

    return () => {
      clearTimeout(timer);
      window.__vizCaptureReady = false;
      delete window.__captureVizPoster;
      delete window.__recordVizPreview;
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
