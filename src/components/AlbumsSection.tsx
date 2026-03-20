import { memo } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, Music } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentMode } from '../contexts/DescentModeContext';
import { DESCENT_CONTENT_LIFT } from '../lib/descentContentLayer';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { DiscographyEditDialog } from './DiscographyEditDialog';

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
      <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-cyan-900/30">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-cyan-900/20 to-fuchsia-900/20">
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
          <h3 className="text-2xl text-foreground group-hover:text-primary transition-colors">{album.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
  const { isDescentMode } = useDescentMode();
  const albums = content.discography.albums;
  
  return (
    <EditableSection
      sectionName="Journey"
      visible={content.discography.visible}
      onVisibilityChange={(visible) =>
        updateContent('discography', { ...content.discography, visible })
      }
    >
      <section className="py-20 px-4 bg-gradient-to-b from-background to-cyan-950/5">
        <div
          className={cn(
            'max-w-7xl mx-auto',
            isDescentMode ? DESCENT_CONTENT_LIFT : 'relative z-10'
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl mb-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              {content.discography.title}
            </h2>
            <p className="text-muted-foreground text-lg">Chronicles of sound and consciousness</p>
            {isEditMode && (
              <div className="mt-4 flex justify-center">
                <DiscographyEditDialog />
              </div>
            )}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album, index) => (
              <AlbumCard key={album.id} album={album} index={index} />
            ))}
        </div>
      </div>
    </section>
    </EditableSection>
  );
}