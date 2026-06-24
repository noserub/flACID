import { lazy, Suspense } from 'react';
import { HeroSection } from './components/HeroSection';
import { useSEO } from './hooks/useSEO';
import { Analytics } from './components/Analytics';
import { EditModeProvider, useEditMode } from './contexts/EditModeContext';
import { DescentModeProvider } from './contexts/DescentModeContext';
import { DescentIntensityProvider } from './contexts/DescentIntensityContext';
import { PlaybackProvider } from './contexts/PlaybackContext';
import { PlaybackAnalyserBridge } from './components/PlaybackAnalyserBridge';
import { HeroViewportBridge } from './components/HeroViewportBridge';
import { VizSensitivityProvider } from './contexts/VizSensitivityContext';
import { DescentModeWrapper } from './components/DescentModeEffects';
import { SiteHeader } from './components/SiteHeader';
import { SectionNavRail } from './components/SectionNavRail';
import { SectionNavMobile } from './components/SectionNavMobile';
import { StagePage } from './pages/StagePage';
import { VizCapturePage } from './pages/VizCapturePage';
import { DesignSystemPage } from './pages/DesignSystemPage';

// Lazy load below-the-fold sections
const VercelAnalytics = lazy(() =>
  import('@vercel/analytics/react').then((m) => ({ default: m.Analytics }))
);
const AboutSection = lazy(() => import('./components/AboutSection').then(m => ({ default: m.AboutSection })));
const ListenNowSection = lazy(() => import('./components/ListenNowSection').then(m => ({ default: m.ListenNowSection })));
const AlbumsSection = lazy(() => import('./components/AlbumsSection').then(m => ({ default: m.AlbumsSection })));
const PhotoGallery = lazy(() => import('./components/PhotoGallery').then(m => ({ default: m.PhotoGallery })));
const TourSection = lazy(() => import('./components/TourSection').then(m => ({ default: m.TourSection })));
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));

// Skeleton loading fallback for lazy sections
function SectionLoader() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-12 w-64 bg-accent/50 animate-pulse rounded-lg mx-auto" />
        <div className="h-4 w-96 bg-accent/30 animate-pulse rounded mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-accent/30 animate-pulse rounded-lg" />
              <div className="h-6 w-3/4 bg-accent/30 animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-accent/20 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_SEO = {
  title: 'flACID | Band',
  description: 'Official flACID band page. Listen to music, view tour dates, and more.',
  keywords: 'flACID, band, music',
};

function AboutSectionFallback() {
  return (
    <div className="py-20 px-4" aria-hidden>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-muted/40 animate-pulse rounded-lg mx-auto md:mx-0" />
        <div className="h-32 w-full bg-muted/25 animate-pulse rounded-lg" />
        <div className="h-24 w-full bg-muted/20 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

function AppContent() {
  const { loading } = useEditMode();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <PlaybackProvider>
    <PlaybackAnalyserBridge />
    <HeroViewportBridge />
    <div className="min-h-screen bg-background text-foreground pb-[var(--mobile-page-bottom-padding)] lg:pb-0">
            <Analytics pageName="home" />
            {/* Descent Mode Effects Overlay */}
            <DescentModeWrapper />
            
            {/* Site Header with Menu */}
            <SiteHeader />
            <SectionNavRail />
            <SectionNavMobile />
            
            {/* Hero Section */}
            <HeroSection />

            <Suspense fallback={<AboutSectionFallback />}>
              <AboutSection />
            </Suspense>

            {/* Listen Now Section - Lazy Loaded */}
            <Suspense fallback={<SectionLoader />}>
              <ListenNowSection />
            </Suspense>

            {/* Discography Section - Lazy Loaded */}
            <Suspense fallback={<SectionLoader />}>
              <AlbumsSection />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
              <PhotoGallery />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
              <TourSection />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
              <Footer />
            </Suspense>

            {/* Portal target for fullscreen player — last child so it paints above z-0 sections but below Descend (9990+) */}
            <div id="fullscreen-portal-root" aria-hidden="true" />
          </div>
    </PlaybackProvider>
  );
}

export default function App() {
  useSEO(DEFAULT_SEO);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <VizSensitivityProvider>
      {pathname === '/stage' ? (
        <StagePage />
      ) : pathname === '/capture-viz' ? (
        <VizCapturePage />
      ) : pathname === '/design-system' ? (
        <DesignSystemPage />
      ) : (
        <>
          <EditModeProvider>
            <DescentModeProvider>
              <DescentIntensityProvider>
                <AppContent />
              </DescentIntensityProvider>
            </DescentModeProvider>
          </EditModeProvider>
          <Suspense fallback={null}>
            <VercelAnalytics />
          </Suspense>
        </>
      )}
    </VizSensitivityProvider>
  );
}