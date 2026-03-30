import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDescentSupported } from '../hooks/useDescentSupported';

interface DescentModeContextType {
  isDescentMode: boolean;
  /** False on primary coarse-pointer (touch) devices — Descend UI hidden and mode forced off */
  descentSupported: boolean;
  toggleDescentMode: () => void;
  /** Set explicit on/off (e.g. onboarding “Try Descend”) */
  setDescentMode: (value: boolean) => void;
}

const DescentModeContext = createContext<DescentModeContextType | undefined>(undefined);

export function DescentModeProvider({ children }: { children: ReactNode }) {
  const descentSupported = useDescentSupported();
  const [isDescentMode, setIsDescentMode] = useState(false);

  useEffect(() => {
    if (!descentSupported) {
      setIsDescentMode(false);
      try {
        localStorage.setItem('descentMode', 'false');
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const saved = localStorage.getItem('descentMode');
      if (saved === 'true') {
        setIsDescentMode(true);
      }
    } catch {
      /* ignore */
    }
  }, [descentSupported]);

  useEffect(() => {
    if (!descentSupported) return;
    try {
      localStorage.setItem('descentMode', isDescentMode.toString());
    } catch {
      /* ignore */
    }
  }, [isDescentMode, descentSupported]);

  const toggleDescentMode = () => {
    if (!descentSupported) return;
    setIsDescentMode(prev => !prev);
  };

  const setDescentMode = (value: boolean) => {
    if (value && !descentSupported) return;
    setIsDescentMode(value);
  };

  return (
    <DescentModeContext.Provider
      value={{ isDescentMode, descentSupported, toggleDescentMode, setDescentMode }}
    >
      {children}
    </DescentModeContext.Provider>
  );
}

export function useDescentMode() {
  const context = useContext(DescentModeContext);
  if (!context) {
    throw new Error('useDescentMode must be used within DescentModeProvider');
  }
  return context;
}
