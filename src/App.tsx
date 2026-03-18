import { lazy, Suspense } from 'react';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { useSEO } from './hooks/useSEO';
import { Analytics } from './components/Analytics';
import { EditModeProvider, useEditMode } from './contexts/EditModeContext';
import { DescentModeProvider } from './contexts/DescentModeContext';
import { DescentIntensityProvider } from './contexts/DescentIntensityContext';
import { DescentModeWrapper } from './components/DescentModeEffects';
import { SiteHeader } from './components/SiteHeader';
import heroBackground from 'figma:asset/39f8e6db34bf477fef67b4d63027e0f5debf29fb.png';
import logoImage from 'figma:asset/64ba7001cc82a53524d3d0f758edddb6dafba520.png';

// Lazy load below-the-fold sections
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
    <div className="min-h-screen bg-background text-foreground">
            <Analytics pageName="home" />
            {/* Descent Mode Effects Overlay */}
            <DescentModeWrapper />
            
            {/* Site Header with Menu */}
            <SiteHeader />
            
            {/* Hero Section */}
            <HeroSection />

            {/* About Section */}
            <AboutSection />

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
          </div>
  );
}

export default function App() {
  useSEO(DEFAULT_SEO);

  return (
    <EditModeProvider>
      <DescentModeProvider>
        <DescentIntensityProvider>
          <AppContent />
        </DescentIntensityProvider>
      </DescentModeProvider>
    </EditModeProvider>
  );
}