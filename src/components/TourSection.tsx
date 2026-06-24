import { useCallback } from 'react';
import { motion } from 'motion/react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { VirtualizedList } from './VirtualizedList';
import { TourEditDialog } from './TourEditDialog';
import { NewsletterSignup } from './NewsletterSignup';
import { SectionTitle } from './SectionTitle';
import { SectionAmbient } from './SectionAmbient';
import { TourTicketCard } from './TourTicketCard';
import { bodySecondary, heading } from '../lib/typography';
import { border, shadow } from '../lib/colors';

const VIRTUAL_SCROLL_THRESHOLD = 20;
const TOUR_ITEM_HEIGHT = 124;

export function TourSection() {
  const { content, updateContent, isEditMode } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const tourDates = content.tour.dates;

  const handleVisibilityChange = useCallback(
    (visible: boolean) => {
      updateContent('tour', { ...content.tour, visible });
    },
    [content.tour, updateContent]
  );

  const useVirtualScroll = tourDates.length > VIRTUAL_SCROLL_THRESHOLD;

  return (
    <EditableSection
      sectionName="Tour"
      visible={content.tour.visible}
      onVisibilityChange={handleVisibilityChange}
    >
      <section className="relative overflow-hidden py-20 px-4 sm:py-24">
        <SectionAmbient variant="editorial" />
        <div className={cn('relative max-w-5xl mx-auto', sectionLift)}>
          <div className="mb-14 sm:mb-16 text-center">
            <SectionTitle subtitle={content.tour.subtitle || undefined}>
              {content.tour.title}
            </SectionTitle>
            {isEditMode && (
              <div className="mt-4 flex justify-center">
                <TourEditDialog />
              </div>
            )}
          </div>

          {useVirtualScroll ? (
            <VirtualizedList
              items={tourDates}
              itemHeight={TOUR_ITEM_HEIGHT}
              containerHeight={400}
              getItemKey={(show) => show.id}
              renderItem={(show) => <TourTicketCard show={show} />}
            />
          ) : tourDates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-md rounded-2xl border border-dashed border-signal-purple/40 bg-card/60 px-8 py-12 text-center"
            >
              <p className={heading}>No shows on the horizon</p>
              <p className={cn('mt-3 text-sm sm:text-base', bodySecondary)}>
                {content.tour.footerNote ||
                  'Check back soon, or join the list below for when we surface from the void.'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {tourDates.map((show, index) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <TourTicketCard show={show} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-14 sm:mt-16"
          >
            <div
              className={cn(
                'mx-auto max-w-2xl rounded-2xl border border-signal-purple/40 bg-card/80 px-6 py-8 text-center backdrop-blur-sm sm:px-10 sm:py-10',
                shadow.card,
                border.brandHoverMuted
              )}
            >
              {content.tour.footerNote && tourDates.length > 0 && (
                <p className={cn(bodySecondary, 'mb-6')}>{content.tour.footerNote}</p>
              )}
              {tourDates.length === 0 && (
                <p className={cn(bodySecondary, 'mb-6')}>
                  {content.tour.footerNote ||
                    'No dates posted yet — join the list and we’ll surface from the void when something drops.'}
                </p>
              )}
              <div className="flex justify-center">
                <NewsletterSignup triggerVariant="default" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </EditableSection>
  );
}
