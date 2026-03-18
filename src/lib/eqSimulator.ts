/**
 * EQ Simulator
 *
 * Generates simulated frequency data for visualizations when no analyser is available.
 */

import type { EQBands } from '../components/visualizer/types';

const TRACK_PROFILES = [
  { subBassWeight: 1.5, bassWeight: 1.8, midWeight: 1.2, highWeight: 0.7, tempo: 0.02 },
  { subBassWeight: 2.0, bassWeight: 1.9, midWeight: 0.8, highWeight: 1.1, tempo: 0.015 },
  { subBassWeight: 1.2, bassWeight: 1.3, midWeight: 1.8, highWeight: 1.3, tempo: 0.025 },
  { subBassWeight: 1.4, bassWeight: 1.5, midWeight: 1.5, highWeight: 0.9, tempo: 0.018 },
  { subBassWeight: 1.3, bassWeight: 1.4, midWeight: 1.6, highWeight: 1.4, tempo: 0.022 },
];

export function generateEQData(
  dataArray: Uint8Array,
  trackIndex: number,
  musicTime: number,
  time: number
): EQBands {
  const bufferLength = dataArray.length;
  const phrase = Math.floor(musicTime / 4000) % 4;
  const beat = (musicTime % 1000) / 1000;
  const profile = TRACK_PROFILES[trackIndex] ?? TRACK_PROFILES[0];

  let dynamicMultiplier = 1.0;
  if (phrase === 0) {
    dynamicMultiplier = 0.7 + beat * 0.3;
  } else if (phrase === 1) {
    dynamicMultiplier = 0.7 + (musicTime % 4000) / 4000 * 0.6;
  } else if (phrase === 2) {
    dynamicMultiplier = 1.3 + Math.sin(beat * Math.PI * 2) * 0.2;
  } else {
    dynamicMultiplier = 0.8 + Math.sin(beat * Math.PI * 4) * 0.4;
  }

  const subBass = (Math.sin(time * profile.tempo) * 60 + Math.sin(time * profile.tempo * 0.5) * 40 + Math.random() * 20 + 80) * profile.subBassWeight * dynamicMultiplier;
  const bass = (Math.sin(time * profile.tempo * 1.5) * 50 + Math.cos(time * profile.tempo * 0.7) * 35 + Math.random() * 25 + 70) * profile.bassWeight * dynamicMultiplier;
  const lowMid = (Math.sin(time * profile.tempo * 2) * 40 + Math.sin(time * profile.tempo * 1.2 + 1) * 30 + Math.random() * 20 + 60) * profile.midWeight * dynamicMultiplier;
  const mid = (Math.sin(time * profile.tempo * 2.5 + 2) * 45 + Math.cos(time * profile.tempo * 1.8) * 25 + Math.random() * 20 + 55) * profile.midWeight * dynamicMultiplier;
  const highMid = (Math.sin(time * profile.tempo * 3 + 3) * 35 + Math.sin(time * profile.tempo * 2.2) * 20 + Math.random() * 15 + 45) * profile.highWeight * dynamicMultiplier;
  const high = (Math.sin(time * profile.tempo * 4 + 4) * 30 + Math.cos(time * profile.tempo * 3.5) * 20 + Math.random() * 15 + 40) * profile.highWeight * dynamicMultiplier;
  const presence = (Math.sin(time * profile.tempo * 5 + 5) * 25 + Math.random() * 10 + 30) * profile.highWeight * dynamicMultiplier;

  const bassRange = Math.floor(bufferLength * 0.1);
  const midRange = Math.floor(bufferLength * 0.4);
  const highRange = bufferLength;

  for (let i = 0; i < bufferLength; i++) {
    if (i < bassRange) {
      dataArray[i] = subBass + (bass - subBass) * (i / bassRange) + Math.random() * 15;
    } else if (i < midRange) {
      const t = (i - bassRange) / (midRange - bassRange);
      dataArray[i] = bass + (mid - bass) * t + Math.random() * 12;
    } else {
      const t = (i - midRange) / (highRange - midRange);
      dataArray[i] = mid + (high - mid) * t + Math.random() * 10;
    }
  }

  const energy = (subBass + bass + lowMid + mid + highMid + high + presence) / 7;

  return {
    subBass: Math.min(255, Math.max(0, subBass)),
    bass: Math.min(255, Math.max(0, bass)),
    lowMid: Math.min(255, Math.max(0, lowMid)),
    mid: Math.min(255, Math.max(0, mid)),
    highMid: Math.min(255, Math.max(0, highMid)),
    high: Math.min(255, Math.max(0, high)),
    presence: Math.min(255, Math.max(0, presence)),
    energy: Math.min(255, Math.max(0, energy)),
  };
}
