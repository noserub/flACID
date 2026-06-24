/**
 * Live design system reference — public, linked from site overflow menu.
 * Route: /design-system
 * Embed: /design-system?embed=1, minimal chrome for screenshots
 */

import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { DesignSystemContent } from '../components/design-system/DesignSystemContent';
import { Button } from '../components/ui/button';

function useEmbedMode(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('embed') === '1';
  }, []);
}

export function DesignSystemPage() {
  const embed = useEmbedMode();

  return (
    <div className="relative min-h-screen bg-void text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-ambient-default opacity-25" aria-hidden />
      <div className="pointer-events-none fixed inset-0 section-cosmic-grain opacity-20" aria-hidden />
      {!embed && (
        <header className="sticky top-0 z-30 border-b border-signal-purple/20 bg-void/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-6">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">
                <ArrowLeft className="size-4" />
                Back to site
              </a>
            </Button>
          </div>
        </header>
      )}

      <main>
        <DesignSystemContent embed={embed} />
      </main>
    </div>
  );
}
