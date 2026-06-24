import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { parseAboutContent } from '../lib/parseAboutContent';
import { SECTION_SCROLL_MARGIN_PX } from '../lib/sectionNav';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { AboutEditDialog } from './AboutEditDialog';
import { SectionAmbient } from './SectionAmbient';
import { SectionHeader } from './SectionHeader';
import { TextLabel } from './TextLabel';
import { MemberTag } from './MemberTag';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { OverlayChromeButton } from './OverlayChromeButton';
import { body, lead } from '../lib/typography';
import { border, gradient, shadow } from '../lib/colors';
import { brandLightboxCaptionClass, brandLightboxSurfaceClass } from '../lib/brandClasses';
import { zIndex } from '../lib/layoutTokens';

const FALLBACK_ABOUT_IMAGE =
  'https://images.unsplash.com/photo-1709731191876-899e32264420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMHN0YWdlfGVufDF8fHx8MTc2MDIyOTk5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

export function AboutSection() {
  const { content, isEditMode, updateContent } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const parsed = useMemo(
    () => parseAboutContent(content.about.content),
    [content.about.content]
  );

  const imageSrc = content.about.image?.trim() || FALLBACK_ABOUT_IMAGE;
  const imageAlt = content.about.title?.trim() || 'Band performance';

  return (
    <EditableSection
      sectionName="About"
      visible={content.about.visible}
      onVisibilityChange={(visible) =>
        updateContent('about', { ...content.about, visible })
      }
    >
      <section
        className="relative overflow-hidden scroll-mt-28"
        style={{ scrollMarginTop: SECTION_SCROLL_MARGIN_PX }}
      >
        <SectionAmbient variant="editorial" />

        <div
          className={cn(
            'relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-14',
            'lg:flex-row lg:items-start lg:gap-12 lg:py-16 xl:gap-16',
            sectionLift
          )}
        >
          <div className="mx-auto w-full max-w-[20rem] shrink-0 sm:max-w-[23rem] lg:mx-0 lg:max-w-[26rem] lg:pt-7 xl:max-w-[28rem]">
            <motion.figure
              className={cn(
                'group relative z-0 w-full overflow-hidden rounded-2xl',
                'border border-signal-purple/40 bg-void',
                shadow.elevated,
                'transition-shadow duration-500',
                border.brandHoverMuted,
                shadow.hoverGreenLg,
                'aspect-[3/2]'
              )}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                aria-label={`View larger: ${imageAlt}`}
              >
                <span className="sr-only">View larger image</span>
              </button>
              <ImageWithFallback
                src={imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                width={560}
                height={373}
                className={cn(
                  'absolute inset-0 h-full w-full object-cover object-center',
                  'saturate-[0.92] contrast-[1.08] brightness-[0.98]',
                  'transition-transform duration-700 group-hover:scale-[1.02]'
                )}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-signal-purple/10 mix-blend-soft-light"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 about-photo-grain" aria-hidden />
              <div className="pointer-events-none absolute inset-0 bg-void-vignette" aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-signal-purple/20"
                aria-hidden
              />
              <div
                className={cn(
                  'pointer-events-none absolute right-3 top-3 flex size-9 items-center justify-center rounded-full',
                  'border border-signal-purple/30 bg-void/80 text-signal-purple-bright opacity-0 backdrop-blur-sm',
                  'transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100'
                )}
                aria-hidden
              >
                <ZoomIn className="size-4" />
              </div>
            </motion.figure>
          </div>

          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-start">
            {isEditMode && (
              <div className="mb-6 flex justify-end lg:justify-start">
                <AboutEditDialog />
              </div>
            )}

            <SectionHeader
              eyebrow="About"
              title={content.about.title}
              layout="editorial"
              size="editorial"
            />

            <motion.div
              className="mt-8 space-y-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {parsed.lead && <p className={lead}>{parsed.lead}</p>}

              {parsed.body && (
                <div className={cn('whitespace-pre-wrap', body)}>{parsed.body}</div>
              )}

              {!parsed.lead && !parsed.body && (
                <div className={cn('whitespace-pre-wrap', body)}>{content.about.content}</div>
              )}

              {parsed.members.length > 0 && (
                <div className="pt-4">
                  <TextLabel className="mb-4">The band</TextLabel>
                  <ul className="flex flex-wrap gap-2.5">
                    {parsed.members.map((member) => (
                      <MemberTag
                        key={`${member.name}-${member.role}`}
                        name={member.name}
                        role={member.role}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className={brandLightboxSurfaceClass} hideCloseButton>
            <DialogTitle className="sr-only">{imageAlt}</DialogTitle>
            <DialogDescription className="sr-only">Full size band photo</DialogDescription>
            <AnimatePresence mode="wait">
              {lightboxOpen && (
                <motion.div
                  key="about-lightbox"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="relative flex h-full w-full items-center justify-center p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setLightboxOpen(false);
                  }}
                >
                  <OverlayChromeButton
                    onClick={() => setLightboxOpen(false)}
                    className={cn('absolute top-16 right-4 sm:top-4', zIndex.lightboxChrome)}
                    aria-label="Close dialog"
                  >
                    <X className="w-6 h-6" />
                  </OverlayChromeButton>

                  <div className="relative flex max-h-full max-w-full items-center justify-center">
                    <ImageWithFallback
                      src={imageSrc}
                      alt={imageAlt}
                      decoding="async"
                      className={cn(
                        'max-h-[calc(98vh-5rem)] w-auto max-w-full rounded-lg object-contain',
                        shadow.card
                      )}
                    />
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-0 rounded-lg opacity-10',
                        gradient.brandSurface
                      )}
                      aria-hidden
                    />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className={brandLightboxCaptionClass}>{imageAlt}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      </section>
    </EditableSection>
  );
}
