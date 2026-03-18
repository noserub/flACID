import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DescentModeContextType {
  isDescentMode: boolean;
  toggleDescentMode: () => void;
}

const DescentModeContext = createContext<DescentModeContextType | undefined>(undefined);

export function DescentModeProvider({ children }: { children: ReactNode }) {
  const [isDescentMode, setIsDescentMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('descentMode');
    if (saved === 'true') {
      setIsDescentMode(true);
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('descentMode', isDescentMode.toString());
  }, [isDescentMode]);

  const toggleDescentMode = () => {
    setIsDescentMode(prev => !prev);
  };

  return (
    <DescentModeContext.Provider value={{ isDescentMode, toggleDescentMode }}>
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
