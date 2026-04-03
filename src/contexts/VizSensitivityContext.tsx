import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const VIZ_SENSITIVITY_STORAGE_KEY = 'viz_sensitivity';
/** Wider range so low vs high reactivity are clearly distinct */
export const VIZ_SENSITIVITY_MIN = 0.12;
export const VIZ_SENSITIVITY_MAX = 2.65;
export const VIZ_SENSITIVITY_DEFAULT = 1;

function clampSensitivity(n: number): number {
  return Math.min(VIZ_SENSITIVITY_MAX, Math.max(VIZ_SENSITIVITY_MIN, n));
}

function readStored(): number {
  if (typeof window === 'undefined') return VIZ_SENSITIVITY_DEFAULT;
  try {
    const raw = localStorage.getItem(VIZ_SENSITIVITY_STORAGE_KEY);
    if (raw === null) return VIZ_SENSITIVITY_DEFAULT;
    const v = parseFloat(raw);
    if (Number.isNaN(v)) return VIZ_SENSITIVITY_DEFAULT;
    return clampSensitivity(v);
  } catch {
    return VIZ_SENSITIVITY_DEFAULT;
  }
}

type VizSensitivityContextValue = {
  sensitivity: number;
  setSensitivity: (value: number) => void;
};

const VizSensitivityContext = createContext<VizSensitivityContextValue | undefined>(undefined);

export function VizSensitivityProvider({ children }: { children: ReactNode }) {
  const [sensitivity, setSensitivityState] = useState(VIZ_SENSITIVITY_DEFAULT);

  useEffect(() => {
    setSensitivityState(readStored());
  }, []);

  const setSensitivity = useCallback((value: number) => {
    const next = clampSensitivity(value);
    setSensitivityState(next);
    try {
      localStorage.setItem(VIZ_SENSITIVITY_STORAGE_KEY, String(next));
    } catch {
      /* ignore quota */
    }
  }, []);

  const value = useMemo(
    () => ({ sensitivity, setSensitivity }),
    [sensitivity, setSensitivity]
  );

  return (
    <VizSensitivityContext.Provider value={value}>{children}</VizSensitivityContext.Provider>
  );
}

export function useVizSensitivity(): VizSensitivityContextValue {
  const ctx = useContext(VizSensitivityContext);
  if (ctx === undefined) {
    throw new Error('useVizSensitivity must be used within VizSensitivityProvider');
  }
  return ctx;
}
