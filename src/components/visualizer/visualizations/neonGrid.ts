import type { EQBands, VisualizerDrawOptions } from '../types';

/**
 * Cyberpunk perspective neon grid — motion bus for groove-locked drift + pulse,
 * layered bloom, sky/vignette, and beat-synced scan for immersion.
 */
export function drawNeonGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number,
  options?: VisualizerDrawOptions
): void {
  const motion = options?.motion;
  const beatRad = motion ? motion.beatPhase * Math.PI * 2 : 0;
  const grooveW = motion?.grooveConfidence ?? 0.35;
  const pulse = motion?.pulse ?? 0;
  const inten = motion?.intensityNorm ?? Math.min(1, eq.energy / 255);
  const slowI = motion?.slowIntensity ?? 0;
  const fastI = motion?.fastIntensity ?? 0;

  const centerX = width / 2;
  const scale = Math.min(width, height) / 400;

  const camMoveSpeed = 0.00028 * (1 + slowI * 0.35);
  const camOffsetX =
    Math.sin(time * camMoveSpeed * 1.3 + beatRad * 0.4 * grooveW) * width * 0.14 +
    Math.cos(time * camMoveSpeed * 0.7) * width * 0.07;
  const camOffsetY =
    Math.cos(time * camMoveSpeed + beatRad * 0.25 * grooveW) * height * 0.07 +
    Math.sin(time * camMoveSpeed * 1.7) * height * 0.045;

  const bassJitter = (eq.bass / 100) * (1 + pulse * 0.6);
  const vanishX = centerX + camOffsetX + Math.sin(time * 0.01 + beatRad * grooveW) * bassJitter * 8;
  const vanishY =
    height * 0.32 +
    camOffsetY +
    Math.cos(time * 0.012) * bassJitter * 6 +
    pulse * 14 * grooveW;

  const gridDepth = 26;
  const horizonY = vanishY;

  // --- Sky + deep space above horizon ---
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 40);
  skyGrad.addColorStop(0, `hsla(265, 45%, 6%, 1)`);
  skyGrad.addColorStop(0.45, `hsla(200, 55%, 9%, 1)`);
  skyGrad.addColorStop(1, `hsla(195, 40%, 4%, 0.92)`);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, horizonY + 50);

  // Distant glow at vanishing point
  const glowR = Math.min(width, height) * 0.55 * (1 + inten * 0.25 + pulse * 0.2);
  const vpGlow = ctx.createRadialGradient(vanishX, horizonY, 0, vanishX, horizonY, glowR);
  vpGlow.addColorStop(0, `hsla(300, 90%, 55%, ${0.22 + pulse * 0.2})`);
  vpGlow.addColorStop(0.35, `hsla(195, 85%, 45%, ${0.08 + inten * 0.06})`);
  vpGlow.addColorStop(1, 'hsla(240, 60%, 20%, 0)');
  ctx.fillStyle = vpGlow;
  ctx.fillRect(0, 0, width, height);

  const linePulse = 1 + pulse * 0.55 + inten * 0.15;
  const beatWave = Math.sin(beatRad) * grooveW * 6;

  const drawHorizontalGrid = (bloom: boolean) => {
    for (let i = 0; i < gridDepth; i++) {
      const t = i / gridDepth;
      const perspective = 1 - t * 0.72;
      const yBase = horizonY + (height - horizonY) * (t * t);
      const y =
        yBase +
        beatWave * t * perspective +
        Math.sin(i * 0.55 + beatRad * 1.6 + time * 0.012) * pulse * 4 * perspective;
      const dataIdx = Math.floor(t * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const lineWidth = bloom
        ? 4 + perspective * 10 + eq.subBass / 50
        : 1 + perspective * 2.2 + eq.subBass / 100;
      const alpha = bloom
        ? (0.06 + perspective * 0.12 + value / 2048) * linePulse
        : (0.22 + perspective * 0.38 + value / 900) * linePulse;
      const hue = t < 0.48 ? 182 + eq.highMid / 12 : 298 + eq.presence / 12;
      const hueShift = pulse * 18 * grooveW;
      const saturation = 88 + eq.high / 12;
      ctx.strokeStyle = `hsla(${hue + hueShift}, ${saturation}%, ${58 + perspective * 8}%, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawVerticalGrid = (bloom: boolean) => {
    const vLines = 22;
    const sway = Math.sin(beatRad * 1.2) * grooveW * 12;
    for (let i = 0; i < vLines; i++) {
      const t = i / vLines;
      const x = width * t + sway * (0.3 + t * 0.7);
      const topX = vanishX + (x - vanishX) * 0.28 + Math.sin(beatRad + i * 0.4) * pulse * 3;
      const dataIdx = Math.floor(t * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const alpha = bloom
        ? (0.04 + value / 2200 + eq.mid / 2800) * linePulse
        : (0.18 + value / 1200 + eq.mid / 1600) * linePulse;
      const hue = 178 + (i % 2) * 118 + eq.bass / 12 + pulse * 10;
      ctx.strokeStyle = `hsla(${hue}, 92%, ${58 + inten * 12}%, ${alpha})`;
      ctx.lineWidth = bloom ? 3.5 + eq.bass / 40 : 1 + eq.bass / 150 + pulse * 1.2;
      ctx.beginPath();
      ctx.moveTo(topX, horizonY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  // Bloom under crisp lines
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawHorizontalGrid(true);
  drawVerticalGrid(true);
  ctx.restore();

  drawHorizontalGrid(false);
  drawVerticalGrid(false);

  // Beat-synced scan: bright band sweeping "down" the perspective
  const scanT = motion ? motion.beatPhase : (time * 0.0018) % 1;
  const scanY = horizonY + (height - horizonY) * (scanT * scanT);
  const scanAlpha = (0.12 + pulse * 0.35) * (0.45 + grooveW * 0.55);
  const scanGrad = ctx.createLinearGradient(0, scanY - 14, 0, scanY + 14);
  scanGrad.addColorStop(0, `hsla(190, 100%, 70%, 0)`);
  scanGrad.addColorStop(0.5, `hsla(300, 95%, 72%, ${scanAlpha})`);
  scanGrad.addColorStop(1, `hsla(190, 100%, 70%, 0)`);
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, scanY - 16, width, 32);

  // Rush particles — streak toward depth
  const particleCount = Math.floor(95 + eq.energy / 3.5 + pulse * 45);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 17.13;
    const angle = (i / particleCount) * Math.PI * 2 + time * 0.0022 * (1 + fastI * 0.8);
    const radius = 90 * scale + (i % 7) * 48 + Math.sin(time * 0.01 + seed) * 28;
    const x = vanishX + Math.cos(angle + beatRad * 0.2 * grooveW) * (radius + eq.lowMid / 4);
    const y =
      horizonY -
      35 -
      (i % 6) * 22 +
      Math.sin(time * 0.015 + seed) * (18 + eq.high / 14) +
      fastI * 12 * Math.sin(seed);
    const dataIdx = Math.floor((i / particleCount) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const hue = (time * 0.48 + i * 14 + pulse * 40) % 360;
    const size = 2.2 + value / 45 + eq.highMid / 55 + pulse * 2.5;
    const streak = 1 + fastI * 1.4 + pulse * 0.9;
    const tailY = (height - y) * 0.08 * streak;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
    gradient.addColorStop(0, `hsla(${hue}, 100%, 78%, ${0.85 + pulse * 0.15})`);
    gradient.addColorStop(0.45, `hsla(${hue}, 100%, 62%, ${0.45 + inten * 0.2})`);
    gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y + tailY * 0.5, size * 4.5, size * (2.2 + streak), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${hue}, 100%, 92%, ${0.92 + pulse * 0.08})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Side rails (tunnel framing)
  const railAlpha = 0.14 + inten * 0.12 + pulse * 0.15;
  ctx.strokeStyle = `hsla(310, 95%, 62%, ${railAlpha})`;
  ctx.lineWidth = 3 + pulse * 2;
  ctx.beginPath();
  ctx.moveTo(vanishX - width * 0.08, horizonY);
  ctx.lineTo(0, height);
  ctx.moveTo(vanishX + width * 0.08, horizonY);
  ctx.lineTo(width, height);
  ctx.stroke();

  // Vignette
  const vig = ctx.createRadialGradient(
    centerX,
    height * 0.48,
    Math.min(width, height) * 0.12,
    centerX,
    height * 0.52,
    Math.max(width, height) * 0.78
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(0.55, 'rgba(0,0,0,0)');
  vig.addColorStop(1, `rgba(5,2,12,${0.42 + slowI * 0.12})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}
