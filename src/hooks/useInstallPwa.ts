import { useCallback, useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isLikelyIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // Standard iOS / iPadOS mobile UA
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+ desktop UA, or iPhone "Request Desktop Website"
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  // iOS Chrome (WebKit) — mobile Chrome build
  if (/CriOS\//.test(ua) && /Mobile\/[\w]+/i.test(ua)) return true;
  // FxiOS (Firefox), EdgiOS, etc. on iPhone
  if (/(CriOS|FxiOS|EdgiOS|OPiOS)/i.test(ua)) return true;
  return false;
}

/**
 * Chromium: captures beforeinstallprompt so the app can trigger install from UI.
 * Safari iOS: no beforeinstallprompt — use showIosAddToHome + instructions instead.
 */
export function useInstallPwa() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(isStandaloneDisplay);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());
  }, []);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null);
    }
  }, [deferred]);

  const isIOS = isLikelyIOS();

  return {
    isStandalone,
    /** Chromium: deferred install prompt is available */
    canUseBrowserInstall: Boolean(deferred) && !isStandalone,
    /** Safari iOS: show Share → Add to Home Screen guidance */
    showIosAddToHome: isIOS && !isStandalone,
    promptInstall,
  };
}
