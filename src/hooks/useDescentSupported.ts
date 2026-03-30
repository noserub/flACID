import { useEffect, useState } from 'react';

/**
 * Full Descend mode (full-page effects) is too heavy for primary touch / coarse-pointer
 * devices. We still allow Ascend if state was restored incorrectly.
 */
function getInitialDescentSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return true;
  }
}

/** True when Descend may be enabled (typically mouse / fine pointer). */
export function useDescentSupported(): boolean {
  const [supported, setSupported] = useState(getInitialDescentSupported);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const sync = () => setSupported(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return supported;
}
