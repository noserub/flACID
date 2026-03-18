import { useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Masonry from 'react-responsive-masonry';
import { useEditMode } from '../contexts/EditModeContext';
import { EditableSection } from './EditableSection';
import { GalleryEditDialog } from './GalleryEditDialog';

interface Photo {
  id: number;
  src: string;
  alt: string;
  category: 'band' | 'albums' | 'live' | 'backstage';
}

const photos: Photo[] = [
  // Band Photos
  { id: 1, src: 'https://images.unsplash.com/photo-1709731191876-899e32264420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc2MDIzMTI3Mnww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Band performing live', category: 'band' },
  { id: 2, src: 'https://images.unsplash.com/photo-1718376749317-07f75817c7ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBwbGF5ZXIlMjBsaXZlfGVufDF8fHx8MTc2MDIzMTI3Mnww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Guitarist on stage', category: 'band' },
  { id: 3, src: 'https://images.unsplash.com/photo-1678654309451-d7f82c03bc72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnVtbWVyJTIwY29uY2VydHxlbnwxfHx8fDE3NjAyMzEyNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Drummer in action', category: 'band' },
  { id: 4, src: 'https://images.unsplash.com/photo-1542359649-4b2b0be4e263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMHJlY29yZGluZ3xlbnwxfHx8fDE3NjAyMzEyNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Recording session', category: 'band' },
  
  // Album Photos
  { id: 5, src: 'https://images.unsplash.com/photo-1564178413634-1ec30062c5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtfGVufDF8fHx8MTc2MDIyOTk5N3ww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Album artwork', category: 'albums' },
  { id: 6, src: 'https://images.unsplash.com/photo-1644963779122-caa4c3d3e81c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGd1aXRhciUyMGNsb3NlfGVufDF8fHx8MTc2MDIzMTI3M3ww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Guitar detail shot', category: 'albums' },
  { id: 7, src: 'https://images.unsplash.com/photo-1615991732584-c0d3c4c6e5b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFtcGxpZmllcnxlbnwxfHx8fDE3NjAyMzEyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Amplifier close-up', category: 'albums' },
  
  // Live Photos
  { id: 8, src: 'https://images.unsplash.com/photo-1736969580483-363ced9b89ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzYwMjMxMjcyfDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Stage lights', category: 'live' },
  { id: 9, src: 'https://images.unsplash.com/photo-1736969580483-363ced9b89ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzYwMjMxMjcyfDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Festival crowd', category: 'live' },
  { id: 10, src: 'https://images.unsplash.com/photo-1736969580483-363ced9b89ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzYwMjMxMjcyfDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Live performance', category: 'live' },
  { id: 11, src: 'https://images.unsplash.com/photo-1709731191876-899e32264420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc2MDIzMTI3Mnww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Stage energy', category: 'live' },
  
  // Backstage Photos
  { id: 12, src: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5kJTIwYmFja3N0YWdlfGVufDF8fHx8MTc2MDIzMTI3M3ww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Backstage moment', category: 'backstage' },
  { id: 13, src: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NjAyMzEyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Equipment setup', category: 'backstage' },
  { id: 14, src: 'https://images.unsplash.com/photo-1542359649-31e03cd4d909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5kJTIwcmVoZWFyc2FsfGVufDF8fHx8MTc2MDIzMTI3M3ww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Rehearsal space', category: 'backstage' },
  { id: 15, src: 'https://images.unsplash.com/photo-1542359649-4b2b0be4e263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMHJlY29yZGluZ3xlbnwxfHx8fDE3NjAyMzEyNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Studio vibes', category: 'backstage' },
];

export function PhotoGallery() {
  const { content, isEditMode, updateContent } = useEditMode();
  const [selectedPhoto, setSelectedPhoto] = useState<{ id: string; url: string; caption?: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = content.gallery.tabs;
  const visibleTabs = useMemo(
    () => tabs.filter((tab) => tab.visible || isEditMode),
    [tabs, isEditMode]
  );
  const currentTabImages = visibleTabs[activeTab]?.images || [];
  const filteredPhotos = currentTabImages;

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
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/10 to-background" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl md:text-6xl mb-4 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              {content.gallery.title}
            </h2>
            <p className="text-muted-foreground text-lg">Captured moments from our journey</p>
            {isEditMode && (
              <div className="mt-4 flex justify-center">
                <GalleryEditDialog />
              </div>
            )}
          </motion.div>

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

        {/* Photo Grid */}
        <motion.div
          layout
          className="mb-8"
        >
          <Masonry columnsCount={3} gutter="16px" className="md:block hidden">
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
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
                    
                    {/* Hover Overlay with Psychedelic Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 animate-pulse" />
                    </div>
                    
                    {/* Info Overlay */}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm drop-shadow-lg">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </Masonry>

          {/* Mobile Grid (2 columns) */}
          <Masonry columnsCount={2} gutter="12px" className="md:hidden block">
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <ImageWithFallback
                    src={photo.url}
                    alt={photo.caption || 'Gallery image'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent" />
                </motion.div>
              ))}
            </AnimatePresence>
          </Masonry>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-purple-500/30">
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
              >
                {/* Close Button */}
                <button
                  onClick={handleCloseLightbox}
                  className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-purple-500/30"
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
                    className="max-w-full max-h-[calc(90vh-8rem)] w-auto h-auto object-contain rounded-lg shadow-2xl shadow-purple-900/50"
                  />
                  
                  {/* Psychedelic Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-lg pointer-events-none" />
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
