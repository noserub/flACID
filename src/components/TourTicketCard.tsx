import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import type { SiteContent } from '../contexts/EditModeContext';
import { caption, heading } from '../lib/typography';
import { border, shadow } from '../lib/colors';
import { TourDateStub } from './TourDateStub';
import { TourStatusBadge } from './TourStatusBadge';

type TourShow = SiteContent['tour']['dates'][number];

function resolveTicketHref(ticketUrl: string | undefined): string | null {
  const trimmed = ticketUrl?.trim();
  if (!trimmed || trimmed === '#') return null;
  return trimmed;
}

interface TourTicketCardProps {
  show: TourShow;
}

export function TourTicketCard({ show }: TourTicketCardProps) {
  const href = resolveTicketHref(show.ticketUrl);
  const canAttemptTicket = show.status !== 'sold_out' && show.status !== 'cancelled';
  const ticketActive = canAttemptTicket && href != null;
  const isInactive = show.status === 'sold_out' || show.status === 'cancelled';

  return (
    <article
      className={cn(
        'group relative flex overflow-hidden rounded-xl border bg-card/90 backdrop-blur-sm transition-all duration-300',
        border.brandSubtle,
        shadow.card,
        'hover:border-signal-purple/45',
        shadow.hoverPurple,
        isInactive && 'opacity-75'
      )}
    >
      {/* Perforation notches */}
      <div
        className="pointer-events-none absolute left-[5.75rem] sm:left-[6.25rem] top-0 bottom-0 w-px border-l border-dashed border-border/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[5.75rem] sm:left-[6.25rem] top-0 -translate-x-1/2 -translate-y-1/2 size-3 rounded-full bg-background"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[5.75rem] sm:left-[6.25rem] bottom-0 -translate-x-1/2 translate-y-1/2 size-3 rounded-full bg-background"
        aria-hidden
      />

      <TourDateStub
        date={show.date}
        className="w-[5.75rem] sm:w-[6.25rem] shrink-0 border-r border-dashed border-border/60 px-2 py-5"
      />

      {/* Show details */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-hot-pink" aria-hidden />
            <div className="min-w-0">
              <p className={cn(heading, 'group-hover:text-signal-purple-bright transition-colors truncate sm:whitespace-normal')}>
                {show.venue}
              </p>
              <p className={caption}>{show.city}</p>
            </div>
          </div>
          <p className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground/80 font-mono pl-6">
            <Calendar className="size-3" aria-hidden />
            ADMIT ONE · flACID LIVE
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end shrink-0">
          <TourStatusBadge status={show.status} />
          {ticketActive ? (
            <Button
              asChild
              size="sm"
              className={cn('bg-primary hover:bg-signal-purple-bright text-primary-foreground shadow-md', shadow.glowPurpleMd)}
            >
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Ticket className="size-4" aria-hidden />
                Tickets
              </a>
            </Button>
          ) : (
            <Button
              size="sm"
              disabled
              className="bg-primary text-primary-foreground disabled:opacity-50 disabled:pointer-events-none"
            >
              <Ticket className="size-4" aria-hidden />
              {show.status === 'sold_out'
                ? 'Sold out'
                : show.status === 'cancelled'
                  ? 'Cancelled'
                  : 'Tickets'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
