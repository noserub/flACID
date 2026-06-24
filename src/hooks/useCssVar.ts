import { useEffect, useState } from 'react';

/** Read a resolved CSS custom property from :root (live computed value). */
export function getCssVar(name: string, el: HTMLElement = document.documentElement): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(el).getPropertyValue(`--${name}`).trim();
}

/** Re-read CSS variables after mount (color-mix resolves in computed style). */
export function useCssVar(name: string): string {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(getCssVar(name));
  }, [name]);

  return value;
}

/** Batch-read CSS variables for swatch grids. */
export function useCssVars(names: readonly string[]): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const name of names) {
      next[name] = getCssVar(name);
    }
    setValues(next);
  }, [names]);

  return values;
}
