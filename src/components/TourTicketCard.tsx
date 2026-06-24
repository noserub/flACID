import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import type { SiteContent } from '../contexts/EditModeContext';
import {
  formatTourDateParts,
  tourStatusBadgeClass,
  tourStatusLabel,
} from '../utils/tourDisplay';

type TourShow = SiteContent['tour']['dates'][number];

interface TourTicketCardProps {
  show: TourShow;
}

export function TourTicketCard({ show }: TourTicketCardProps) {
  const href =
    show.ticketUrl && show.ticketUrl !== '#' && show.ticketUrl.trim().length > 0
      ? show.ticketUrl.trim()
      : null;
  const canAttemptTicket = show.status !== 'sold_out' && show.status !== 'cancelled';
  const ticketActive = canAttemptTicket && !!href;
  const dateParts = formatTourDateParts(show.date);
  const isInactive = show.status === 'sold_out' || show.status === 'cancelled';

  return (
    <article
      className={cn(
        'group relative flex overflow-hidden rounded-xl border bg-card/90 backdrop-blur-sm transition-all duration-300',
        'border-signal-purple/25 shadow-lg shadow-[rgba(0,0,0,0.35)]',
        'hover:border-signal-purple/45 hover:shadow-[rgba(88,28,135,0.18)]',
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

      {/* Date stub */}
      <div className="flex w-[5.75rem] sm:w-[6.25rem] shrink-0 flex-col items-center justify-center gap-0.5 border-r border-dashed border-border/60 bg-[rgba(88,28,135,0.12)] px-2 py-5 text-center">
        <span className="font-hero text-[10px] tracking-[0.2em] text-neon-green/80">
          {dateParts.weekday}
        </span>
        <span className="font-hero text-3xl sm:text-4xl font-medium leading-none text-signal-purple-bright tabular-nums">
          {dateParts.day}
        </span>
        <span className="font-hero text-xs tracking-[0.25em] text-hot-pink">
          {dateParts.month}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">{dateParts.year}</span>
      </div>

      {/* Show details */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-hot-pink" aria-hidden />
            <div className="min-w-0">
              <p className="font-hero text-lg leading-tight text-foreground group-hover:text-signal-purple-bright transition-colors truncate sm:whitespace-normal">
                {show.venue}
              </p>
              <p className="text-sm text-muted-foreground">{show.city}</p>
            </div>
          </div>
          <p className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground/80 font-mono pl-6">
            <Calendar className="size-3" aria-hidden />
            ADMIT ONE · flACID LIVE
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end shrink-0">
          <span
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full tracking-wide',
              tourStatusBadgeClass(show.status)
            )}
          >
            {tourStatusLabel(show.status)}
          </span>
          {ticketActive ? (
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-signal-purple-bright text-primary-foreground shadow-md shadow-[rgba(147,51,234,0.25)]"
            >
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Ticket className="size-4" aria-hidden />
                Tickets
              </a>
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!canAttemptTicket}
              className="bg-primary hover:bg-signal-purple-bright text-primary-foreground disabled:opacity-50"
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
