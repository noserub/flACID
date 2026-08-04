/**
 * Native AVFoundation / Media3 playback for Capacitor.
 * Required for reliable background audio (Maps while driving, lock screen).
 * Web/PWA continues to use the HTML <audio> element.
 */

import { AudioPlayer } from '@mediagrid/capacitor-native-audio';
import { isNativeApp } from './isNativeApp';

export const NATIVE_AUDIO_ID = 'flacid-main';

export type NativeTrackMeta = {
  url: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
};

type Status = 'playing' | 'paused' | 'stopped';

type Listeners = {
  onReady?: () => void;
  onEnd?: () => void;
  onStatus?: (status: Status) => void;
};

let created = false;
let currentUrl: string | null = null;
let listeners: Listeners = {};
let ready = false;

export function isNativeAudioAvailable(): boolean {
  return isNativeApp();
}

export function setNativeAudioListeners(next: Listeners): void {
  listeners = next;
}

async function ensureCreated(meta: NativeTrackMeta): Promise<void> {
  if (created) return;

  await AudioPlayer.create({
    audioId: NATIVE_AUDIO_ID,
    audioSource: meta.url,
    friendlyTitle: meta.title,
    artistName: meta.artist,
    albumTitle: meta.album || 'flACID',
    artworkSource: meta.artworkUrl,
    useForNotification: true,
    showSeekBackward: true,
    showSeekForward: true,
    seekBackwardTime: 15,
    seekForwardTime: 15,
  });

  await AudioPlayer.onAudioReady({ audioId: NATIVE_AUDIO_ID }, () => {
    ready = true;
    listeners.onReady?.();
  });
  await AudioPlayer.onAudioEnd({ audioId: NATIVE_AUDIO_ID }, () => {
    listeners.onEnd?.();
  });
  await AudioPlayer.onPlaybackStatusChange({ audioId: NATIVE_AUDIO_ID }, (result) => {
    listeners.onStatus?.(result.status);
  });

  await AudioPlayer.initialize({ audioId: NATIVE_AUDIO_ID });
  created = true;
  currentUrl = meta.url;
}

export async function loadNativeTrack(meta: NativeTrackMeta): Promise<void> {
  if (!isNativeApp()) return;
  ready = false;

  if (!created) {
    await ensureCreated(meta);
    return;
  }

  if (currentUrl === meta.url) {
    await AudioPlayer.changeMetadata({
      audioId: NATIVE_AUDIO_ID,
      friendlyTitle: meta.title,
      artistName: meta.artist,
      albumTitle: meta.album || 'flACID',
      artworkSource: meta.artworkUrl,
    });
    ready = true;
    listeners.onReady?.();
    return;
  }

  await AudioPlayer.changeAudioSource({
    audioId: NATIVE_AUDIO_ID,
    source: meta.url,
  });
  await AudioPlayer.changeMetadata({
    audioId: NATIVE_AUDIO_ID,
    friendlyTitle: meta.title,
    artistName: meta.artist,
    albumTitle: meta.album || 'flACID',
    artworkSource: meta.artworkUrl,
  });
  currentUrl = meta.url;
}

export async function playNative(): Promise<void> {
  if (!isNativeApp() || !created) return;
  await AudioPlayer.play({ audioId: NATIVE_AUDIO_ID });
}

export async function pauseNative(): Promise<void> {
  if (!isNativeApp() || !created) return;
  await AudioPlayer.pause({ audioId: NATIVE_AUDIO_ID });
}

export async function seekNative(timeInSeconds: number): Promise<void> {
  if (!isNativeApp() || !created) return;
  await AudioPlayer.seek({ audioId: NATIVE_AUDIO_ID, timeInSeconds });
}

export async function stopNative(): Promise<void> {
  if (!isNativeApp() || !created) return;
  await AudioPlayer.stop({ audioId: NATIVE_AUDIO_ID });
}

export async function getNativeCurrentTime(): Promise<number> {
  if (!isNativeApp() || !created) return 0;
  const { currentTime } = await AudioPlayer.getCurrentTime({ audioId: NATIVE_AUDIO_ID });
  return currentTime;
}

export async function getNativeDuration(): Promise<number> {
  if (!isNativeApp() || !created) return 0;
  const { duration } = await AudioPlayer.getDuration({ audioId: NATIVE_AUDIO_ID });
  return duration;
}

export async function isNativePlaying(): Promise<boolean> {
  if (!isNativeApp() || !created) return false;
  const { isPlaying } = await AudioPlayer.isPlaying({ audioId: NATIVE_AUDIO_ID });
  return isPlaying;
}

export function isNativeReady(): boolean {
  return ready;
}

export async function destroyNativeAudio(): Promise<void> {
  if (!created) return;
  try {
    await AudioPlayer.destroy({ audioId: NATIVE_AUDIO_ID });
  } catch {
    /* ignore */
  }
  created = false;
  currentUrl = null;
  ready = false;
}
