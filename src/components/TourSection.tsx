import { useCallback } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Button } from './ui/button';
import { useEditMode } from '../contexts/EditModeContext';
import { EditableSection } from './EditableSection';
import { VirtualizedList } from './VirtualizedList';
import { TourEditDialog } from './TourEditDialog';
import { NewsletterSignup } from './NewsletterSignup';
import type { SiteContent } from '../contexts/EditModeContext';
import { formatTourDateDisplay, tourStatusBadgeClass, tourStatusLabel } from '../utils/tourDisplay';

const VIRTUAL_SCROLL_THRESHOLD = 20;
const TOUR_ITEM_HEIGHT = 100;

type TourShow = SiteContent['tour']['dates'][number];

function TourDateCard({ show }: { show: TourShow }) {
  const href =
    show.ticketUrl && show.ticketUrl !== '#' && show.ticketUrl.trim().length > 0
      ? show.ticketUrl.trim()
      : null;
  const canAttemptTicket = show.status !== 'sold_out' && show.status !== 'cancelled';
  const ticketActive = canAttemptTicket && !!href;

  return (
    <div className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-cyan-900/20">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:w-48">
          <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <span className="text-foreground">{formatTourDateDisplay(show.date)}</span>
        </div>
        <div className="hidden md:block w-px h-12 bg-border" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-foreground group-hover:text-primary transition-colors">{show.venue}</div>
              <div className="text-muted-foreground text-sm">{show.city}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 md:justify-end">
          <span className={`text-sm px-3 py-1 rounded-full ${tourStatusBadgeClass(show.status)}`}>
            {tourStatusLabel(show.status)}
          </span>
          {ticketActive ? (
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Ticket className="w-4 h-4 mr-2" />
                Tickets
              </a>
            </Button>
          ) : (
            <Button
              disabled={!canAttemptTicket}
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              <Ticket className="w-4 h-4 mr-2" />
              {show.status === 'sold_out'
                ? 'Sold out'
                : show.status === 'cancelled'
                  ? 'Cancelled'
                  : 'Tickets'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TourSection() {
  const { content, updateContent, isEditMode } = useEditMode();
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
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/5 to-background" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl mb-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              {content.tour.title}
            </h2>
            {content.tour.subtitle && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto whitespace-pre-wrap">
                {content.tour.subtitle}
              </p>
            )}
            {isEditMode && (
              <div className="mt-4 flex justify-center">
                <TourEditDialog />
              </div>
            )}
          </motion.div>

          {useVirtualScroll ? (
            <VirtualizedList
              items={tourDates}
              itemHeight={TOUR_ITEM_HEIGHT}
              containerHeight={400}
              getItemKey={(show) => show.id}
              renderItem={(show) => <TourDateCard show={show} />}
            />
          ) : (
            <div className="space-y-4">
              {tourDates.map((show, index) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <TourDateCard show={show} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 text-center space-y-6"
          >
            {content.tour.footerNote && (
              <p className="text-muted-foreground">{content.tour.footerNote}</p>
            )}
            <div className="flex justify-center">
              <NewsletterSignup />
            </div>
          </motion.div>
        </div>
      </section>
    </EditableSection>
  );
}
