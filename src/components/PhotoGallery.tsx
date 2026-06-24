import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { GalleryEditDialog } from './GalleryEditDialog';
import { SectionTitle } from './SectionTitle';
import { SectionAmbient } from './SectionAmbient';
import { VisualizationShowcase } from './VisualizationShowcase';

function isVisualsTab(name: string, id: string): boolean {
  return /visual/i.test(name) || id === 'visuals';
}

export function PhotoGallery() {
  const { content, isEditMode, updateContent } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const [selectedPhoto, setSelectedPhoto] = useState<{ id: string; url: string; caption?: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = content.gallery.tabs;
  const visibleTabs = useMemo(() => {
    const byVisibility = tabs.filter((tab) => tab.visible || isEditMode);
    if (isEditMode) return byVisibility;
    return byVisibility.filter(
      (tab) => tab.images.length > 0 || isVisualsTab(tab.name, tab.id)
    );
  }, [tabs, isEditMode]);
  useEffect(() => {
    if (activeTab >= visibleTabs.length && visibleTabs.length > 0) {
      setActiveTab(0);
    }
  }, [activeTab, visibleTabs.length]);

  const currentTabImages = visibleTabs[activeTab]?.images || [];
  const filteredPhotos = useMemo(() => {
    const seen = new Set<string>();
    return currentTabImages.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [currentTabImages]);

  const handlePrevious = useCallback(() => {
    setSelectedPhoto((prev) => {
      if (!prev) return prev;
      const currentIndex = filteredPhotos.findIndex((p) => p.id === prev.id);
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1;
      return filteredPhotos[previousIndex];
    });
  }, [filteredPhotos]);

  const handleNext = useCallback(() => {
    setSelectedPhoto((prev) => {
      if (!prev) return prev;
      const currentIndex = filteredPhotos.findIndex((p) => p.id === prev.id);
      const nextIndex = currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0;
      return filteredPhotos[nextIndex];
    });
  }, [filteredPhotos]);

  const handleSelectPhoto = useCallback((photo: { id: string; url: string; caption?: string }) => {
    setSelectedPhoto(photo);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    if (!open) handleCloseLightbox();
  }, [handleCloseLightbox]);

  return (
    <EditableSection
      sectionName="Gallery"
      visible={content.gallery.visible}
      onVisibilityChange={(visible) =>
        updateContent('gallery', { ...content.gallery, visible })
      }
    >
      <section className="relative overflow-hidden py-20 px-4">
        <SectionAmbient />

        <div className={cn('relative max-w-7xl mx-auto', sectionLift)}>
          <div className="text-center mb-12">
            <SectionTitle subtitle={content.gallery.subtitle || undefined}>
              {content.gallery.title}
            </SectionTitle>
            {isEditMode && (
              <div className="mt-4 flex justify-center">
                <GalleryEditDialog />
              </div>
            )}
          </div>

          {/* Gallery Tabs */}
          {visibleTabs.length > 0 && (
            <Tabs value={activeTab.toString()} className="mb-8" onValueChange={(value) => setActiveTab(parseInt(value))}>
              <TabsList className={`grid w-full max-w-2xl mx-auto bg-card border border-border`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
                {visibleTabs.map((tab, index) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={index.toString()}
                    className={`data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${!tab.visible && isEditMode ? 'opacity-50' : ''}`}
                  >
                    {tab.name}
                    {!tab.visible && isEditMode && ' (Hidden)'}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

        {visibleTabs[activeTab] && isVisualsTab(visibleTabs[activeTab].name, visibleTabs[activeTab].id) ? (
          <VisualizationShowcase className="mb-8" />
        ) : (
        /* Photo Grid — Masonry needs each photo as a direct child (no AnimatePresence wrapper) */
        <motion.div layout className="mb-8">
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 640: 2, 1024: 3 }}
            gutterBreakPoints={{ 350: '12px', 640: '16px', 1024: '20px' }}
          >
            <Masonry gutter="16px">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => handleSelectPhoto(photo)}
                >
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={photo.url}
                      alt={photo.caption || 'Gallery image'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-fuchsia-500/20 animate-pulse" />
                    </div>
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm drop-shadow-lg">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={handleDialogChange}>
        <DialogContent className="!max-w-[98vw] w-[98vw] h-[98vh] min-h-[80vh] p-0 bg-black/95 border-purple-500/30" hideCloseButton>
          <DialogTitle className="sr-only">
            {selectedPhoto?.caption || 'Photo'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full size view of {selectedPhoto?.caption || 'photo'}
          </DialogDescription>
          <AnimatePresence mode="wait">
            {selectedPhoto && (
              <motion.div
                key={selectedPhoto.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleCloseLightbox();
                }}
              >
                {/* Close Button - lower on mobile to clear browser toolbar */}
                <button
                  onClick={handleCloseLightbox}
                  className="absolute top-16 right-4 sm:top-4 z-[10250] min-w-[44px] min-h-[44px] rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-purple-500/30"
                  aria-label="Close dialog"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Previous Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-purple-500/30"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                {/* Next Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-purple-500/30"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Image */}
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <ImageWithFallback
                    src={selectedPhoto.url}
                    alt={selectedPhoto.caption || 'Gallery image'}
                    decoding="async"
                    className="max-w-full max-h-[calc(98vh-5rem)] w-auto h-auto object-contain rounded-lg shadow-2xl shadow-purple-900/50"
                  />
                  
                  {/* Psychedelic Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-fuchsia-500/10 rounded-lg pointer-events-none" />
                </div>

                {/* Caption */}
                {selectedPhoto.caption && (
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white text-lg drop-shadow-lg bg-black/50 rounded-lg px-4 py-2 inline-block">
                      {selectedPhoto.caption}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
      </section>
    </EditableSection>
  );
}
