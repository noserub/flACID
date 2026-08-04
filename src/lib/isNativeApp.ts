import { Capacitor } from '@capacitor/core';

/** True when running inside a Capacitor iOS/Android shell (not Safari/PWA). */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
