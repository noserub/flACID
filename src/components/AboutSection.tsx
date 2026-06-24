import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { brandSectionWashClass } from '../lib/brandClasses';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { AboutEditDialog } from './AboutEditDialog';
import { SectionTitle } from './SectionTitle';

function buildAboutSubtitle(
  tagline: string | undefined,
  heroSubtitle: string | undefined
): string | undefined {
  const parts = [
    tagline?.trim() || undefined,
    heroSubtitle?.trim() || undefined,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function AboutSection() {
  const { content, isEditMode, updateContent } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const aboutSubtitle = buildAboutSubtitle(content.hero.tagline, content.hero.subtitle);

  return (
    <EditableSection
      sectionName="About"
      visible={content.about.visible}
      onVisibilityChange={(visible) =>
        updateContent('about', { ...content.about, visible })
      }
    >
      <section className="py-20 px-4 relative overflow-hidden">
        <div className={cn('absolute inset-0', brandSectionWashClass)} />
        
        <div className={cn('max-w-6xl mx-auto', sectionLift)}>
          {isEditMode && (
            <div className="flex justify-center mb-4">
              <AboutEditDialog />
            </div>
          )}
          
          <div className="text-center mb-8 md:mb-12">
            <SectionTitle subtitle={aboutSubtitle}>{content.about.title}</SectionTitle>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-[rgba(88,28,135,0.25)]">
                <ImageWithFallback
                  src={content.about.image || "https://images.unsplash.com/photo-1709731191876-899e32264420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMHN0YWdlfGVufDF8fHx8MTc2MDIyOTk5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
                  alt="Band performance"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {content.about.content}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </EditableSection>
  );
}