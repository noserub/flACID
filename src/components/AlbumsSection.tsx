import { memo } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, Music } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { DiscographyEditDialog } from './DiscographyEditDialog';
import { SectionTitle } from './SectionTitle';
import { SectionAmbient } from './SectionAmbient';
import { cardTitle, caption } from '../lib/typography';
import { border, gradient, shadow } from '../lib/colors';

const defaultAlbumImage = 'https://images.unsplash.com/photo-1564178413634-1ec30062c5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtfGVufDF8fHx8MTc2MDIyOTk5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

interface AlbumCardProps {
  album: { id: string; title: string; year: string; coverImage: string; description: string; tracks: string[] };
  index: number;
}

const AlbumCard = memo(function AlbumCard({ album, index }: AlbumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        className={cn(
          'group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 shadow-lg',
          border.brandCardHover,
          shadow.hoverPurple
        )}
      >
        <div className={cn('relative aspect-square overflow-hidden', gradient.albumCover)}>
          <ImageWithFallback
            src={album.coverImage || defaultAlbumImage}
            alt={album.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center mb-2 mx-auto">
                <Music className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-white">Listen Now</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <h3 className={cardTitle}>{album.title}</h3>
          <div className={cn('flex items-center gap-4', caption)}>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{album.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Music className="w-4 h-4" />
              <span>{album.tracks.length} tracks</span>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{album.description}</p>
        </div>
      </div>
    </motion.div>
  );
});

export function AlbumsSection() {
  const { content, isEditMode, updateContent } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const albums = content.discography.albums;
  
  return (
    <EditableSection
      sectionName="Journey"
      visible={content.discography.visible}
      onVisibilityChange={(visible) =>
        updateContent('discography', { ...content.discography, visible })
      }
    >
      <section className="relative overflow-hidden py-20 px-4">
        <SectionAmbient />
        <div className="relative">
        <div className={cn('max-w-7xl mx-auto', sectionLift)}>
          <div id="journey-section-head" className="text-center mb-16 scroll-mt-28">
            <SectionTitle subtitle="Chronicles of sound and consciousness">
              {content.discography.title}
            </SectionTitle>
            {isEditMode && (
              <div className="mt-4 flex justify-center">
                <DiscographyEditDialog />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album, index) => (
              <AlbumCard key={album.id} album={album} index={index} />
            ))}
          </div>
        </div>
        </div>
      </section>
    </EditableSection>
  );
}