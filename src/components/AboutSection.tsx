import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { brandSectionWashClass } from '../lib/brandClasses';
import { parseAboutContent } from '../lib/parseAboutContent';
import { SECTION_SCROLL_MARGIN_PX } from '../lib/sectionNav';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { AboutEditDialog } from './AboutEditDialog';
import { SectionTitle } from './SectionTitle';

const FALLBACK_ABOUT_IMAGE =
  'https://images.unsplash.com/photo-1709731191876-899e32264420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMHN0YWdlfGVufDF8fHx8MTc2MDIyOTk5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

export function AboutSection() {
  const { content, isEditMode, updateContent } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const parsed = useMemo(
    () => parseAboutContent(content.about.content),
    [content.about.content]
  );

  const imageSrc = content.about.image?.trim() || FALLBACK_ABOUT_IMAGE;

  return (
    <EditableSection
      sectionName="About"
      visible={content.about.visible}
      onVisibilityChange={(visible) =>
        updateContent('about', { ...content.about, visible })
      }
    >
      <section
        className="relative scroll-mt-28"
        style={{ scrollMarginTop: SECTION_SCROLL_MARGIN_PX }}
      >
        <div className={cn('pointer-events-none absolute inset-0', brandSectionWashClass)} />

        <div
          className={cn(
            'relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-14',
            'lg:flex-row lg:items-start lg:gap-12 lg:py-16 xl:gap-16',
            sectionLift
          )}
        >
          {/* Band photo — fills frame + archive treatment */}
          <div className="mx-auto w-full max-w-[20rem] shrink-0 sm:max-w-[23rem] lg:mx-0 lg:max-w-[26rem] lg:pt-7 xl:max-w-[28rem]">
          <motion.figure
            className={cn(
              'relative z-0 w-full overflow-hidden rounded-2xl',
              'border border-signal-purple/25 bg-void shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
              'aspect-[3/2]'
            )}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <ImageWithFallback
              src={imageSrc}
              alt="Band performance"
              loading="lazy"
              decoding="async"
              width={560}
              height={373}
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-center',
                'saturate-[0.88] contrast-[1.06] brightness-[0.97]'
              )}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-signal-purple/12 mix-blend-soft-light"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 about-photo-grain" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(5,5,8,0.5) 100%)',
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-signal-purple/15"
              aria-hidden
            />
          </motion.figure>
          </div>

          {/* Copy — editorial column */}
          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-start">
              {isEditMode && (
                <div className="mb-6 flex justify-end lg:justify-start">
                  <AboutEditDialog />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-signal-purple-bright/80">
                  About
                </p>
                <SectionTitle variant="clean" align="left" className="text-3xl sm:text-4xl md:text-5xl">
                  {content.about.title}
                </SectionTitle>
              </motion.div>

              <motion.div
                className="mt-8 space-y-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {parsed.lead && (
                  <p className="text-xl font-light leading-relaxed text-foreground/92 sm:text-2xl">
                    {parsed.lead}
                  </p>
                )}

                {parsed.body && (
                  <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {parsed.body}
                  </div>
                )}

                {!parsed.lead && !parsed.body && (
                  <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {content.about.content}
                  </div>
                )}

                {parsed.members.length > 0 && (
                  <div className="pt-2">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-signal-purple-bright/70">
                      The band
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {parsed.members.map((member) => (
                        <li
                          key={`${member.name}-${member.role}`}
                          className="rounded-full border border-signal-purple/30 bg-card/80 px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium text-foreground">{member.name}</span>
                          {member.role && (
                            <span className="text-muted-foreground"> · {member.role}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
          </div>
        </div>
      </section>
    </EditableSection>
  );
}
