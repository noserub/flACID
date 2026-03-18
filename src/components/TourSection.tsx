import { useCallback } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Button } from './ui/button';
import { useEditMode } from '../contexts/EditModeContext';
import { EditableSection } from './EditableSection';
import { VirtualizedList } from './VirtualizedList';

const tourDates = [
  {
    id: 1,
    date: 'March 15, 2025',
    venue: 'The Void Underground',
    city: 'Portland, OR',
    status: 'On Sale',
  },
  {
    id: 2,
    date: 'March 22, 2025',
    venue: 'Cosmic Temple',
    city: 'Seattle, WA',
    status: 'On Sale',
  },
  {
    id: 3,
    date: 'March 29, 2025',
    venue: 'Psychedelic Dungeon',
    city: 'San Francisco, CA',
    status: 'Selling Fast',
  },
  {
    id: 4,
    date: 'April 5, 2025',
    venue: 'Desert Ritual',
    city: 'Phoenix, AZ',
    status: 'On Sale',
  },
  {
    id: 5,
    date: 'April 12, 2025',
    venue: 'Monolith Arena',
    city: 'Denver, CO',
    status: 'On Sale',
  },
  {
    id: 6,
    date: 'April 19, 2025',
    venue: 'Doom Cathedral',
    city: 'Austin, TX',
    status: 'Sold Out',
  },
];

const VIRTUAL_SCROLL_THRESHOLD = 20;
const TOUR_ITEM_HEIGHT = 100;

export function TourSection() {
  const { content, updateContent } = useEditMode();
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
            <p className="text-muted-foreground text-lg">Join us on our journey through the void</p>
          </motion.div>

          {useVirtualScroll ? (
            <VirtualizedList
              items={tourDates}
              itemHeight={TOUR_ITEM_HEIGHT}
              containerHeight={400}
              getItemKey={(show) => show.id}
              renderItem={(show) => (
                <div className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-cyan-900/20">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-3 md:w-48">
                      <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-foreground">{show.date}</span>
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
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          (show as { status?: string }).status === 'Sold Out'
                            ? 'bg-muted text-muted-foreground'
                            : (show as { status?: string }).status === 'Selling Fast'
                            ? 'bg-fuchsia-500/20 text-fuchsia-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        {(show as { status?: string }).status ?? 'On Sale'}
                      </span>
                      <Button
                        disabled={(show as { status?: string }).status === 'Sold Out'}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Ticket className="w-4 h-4 mr-2" />
                        {(show as { status?: string }).status === 'Sold Out' ? 'Sold Out' : 'Tickets'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                  <div className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-cyan-900/20">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-3 md:w-48">
                        <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <span className="text-foreground">{show.date}</span>
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
                        <span
                          className={`text-sm px-3 py-1 rounded-full ${
                            (show as { status?: string }).status === 'Sold Out'
                              ? 'bg-muted text-muted-foreground'
                              : (show as { status?: string }).status === 'Selling Fast'
                              ? 'bg-fuchsia-500/20 text-fuchsia-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}
                        >
                          {(show as { status?: string }).status ?? 'On Sale'}
                        </span>
                        <Button
                          disabled={(show as { status?: string }).status === 'Sold Out'}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Ticket className="w-4 h-4 mr-2" />
                          {(show as { status?: string }).status === 'Sold Out' ? 'Sold Out' : 'Tickets'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-6">More dates to be announced soon</p>
          <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
            Join Mailing List
          </Button>
        </motion.div>
        </div>
      </section>
    </EditableSection>
  );
}