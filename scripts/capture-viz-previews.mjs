#!/usr/bin/env node
/**
 * Records 60fps WebM preview loops + PNG poster stills for all visualization modes.
 * Uses canvas MediaRecorder (smooth); falls back to Playwright video if needed.
 *
 * Usage:
 *   npm run capture:viz-previews
 *   VIZ_ONLY=11,12 npm run capture:viz-previews
 */

import { chromium } from 'playwright';
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'viz-previews');
const TMP_VIDEO_DIR = join(ROOT, '.viz-capture-tmp');
const NUM_VIZ = 20;
const WARMUP_MS = 1000;
const PLAYWRIGHT_RECORD_MS = 5000;

const SLUGS = [
  '00-organic-flow',
  '01-depth-layers',
  '02-waveform-interference',
  '03-minimal-geometric',
  '04-atmospheric-noise',
  '05-kaleidoscope-fractals',
  '06-liquid-plasma',
  '07-neon-grid',
  '08-spiral-galaxy',
  '09-crystal-lattice',
  '10-breathing-mandala',
  '11-ifs-kaleidoscope',
  '12-prism-spectrum',
  '13-metaballs',
  '14-reaction-diffusion',
  '15-pulse-horizon',
  '16-light-speed-warp',
  '17-tron-corridor',
  '18-lite-brite-magic',
  '19-neon-tunnel-3d',
];

const PORT = process.env.PORT || '5173';
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const VIEWPORT = { width: 1280, height: 720 };

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not reachable at ${url}`);
}

async function maybeStartDevServer() {
  if (process.env.BASE_URL) return null;

  try {
    await waitForServer(BASE_URL, 2);
    console.log(`Using existing server at ${BASE_URL}`);
    return null;
  } catch {
    console.log(`Starting dev server on port ${PORT}…`);
    const proc = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', PORT], {
      cwd: ROOT,
      stdio: 'ignore',
      shell: true,
    });
    await waitForServer(BASE_URL);
    return proc;
  }
}

async function capturePoster(page) {
  const posterBase64 = await page.evaluate(() => window.__captureVizPoster?.() ?? null);
  if (!posterBase64?.startsWith('data:image/png')) {
    throw new Error('Poster capture failed');
  }
  return Buffer.from(posterBase64.split(',')[1], 'base64');
}

async function captureCanvasWebm(page) {
  const buffer = await page.evaluate(async () => {
    if (!window.__recordVizPreview) {
      throw new Error('__recordVizPreview not exposed');
    }
    const ab = await window.__recordVizPreview();
    return Array.from(new Uint8Array(ab));
  });
  if (buffer.length < 8_000) {
    throw new Error(`Recording too small (${buffer.length} bytes)`);
  }
  return Buffer.from(buffer);
}

async function capturePlaywrightWebm(browser, viz, webmPath) {
  rmSync(TMP_VIDEO_DIR, { recursive: true, force: true });
  mkdirSync(TMP_VIDEO_DIR, { recursive: true });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: TMP_VIDEO_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/capture-viz?viz=${viz}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__vizCaptureReady === true, { timeout: 30_000 });
  await page.waitForTimeout(WARMUP_MS + PLAYWRIGHT_RECORD_MS);
  const video = page.video();
  await context.close();
  if (!video) throw new Error('Playwright fallback produced no video');
  await video.saveAs(webmPath);
}

async function captureAll() {
  mkdirSync(OUT_DIR, { recursive: true });

  const devProc = await maybeStartDevServer();

  const onlyEnv = process.env.VIZ_ONLY;
  const vizIndices = onlyEnv
    ? onlyEnv.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n))
    : Array.from({ length: NUM_VIZ }, (_, i) => i);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader'],
  });

  try {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();

    for (const viz of vizIndices) {
      const slug = SLUGS[viz];
      const webmPath = join(OUT_DIR, `${slug}.webm`);
      const posterPath = join(OUT_DIR, `${slug}.png`);
      console.log(`Recording viz ${viz} → ${slug}`);

      await page.goto(`${BASE_URL}/capture-viz?viz=${viz}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__vizCaptureReady === true, { timeout: 30_000 });
      await page.waitForTimeout(400);

      writeFileSync(posterPath, await capturePoster(page));
      console.log(`  poster ${Math.round(statSync(posterPath).size / 1024)} KB`);

      try {
        writeFileSync(webmPath, await captureCanvasWebm(page));
        console.log(`  webm ${Math.round(statSync(webmPath).size / 1024)} KB (60fps canvas)`);
      } catch (err) {
        console.warn(`  canvas record failed (${err.message}), Playwright fallback…`);
        await capturePlaywrightWebm(browser, viz, webmPath);
        console.log(`  webm ${Math.round(statSync(webmPath).size / 1024)} KB (fallback)`);
      }
    }

    await context.close();
  } finally {
    await browser.close();
    devProc?.kill('SIGTERM');
    rmSync(TMP_VIDEO_DIR, { recursive: true, force: true });
  }

  console.log(`\nDone — ${vizIndices.length} previews in public/viz-previews/`);
}

captureAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
