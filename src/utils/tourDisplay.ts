import type { SiteContent } from '../contexts/EditModeContext';

export type TourDateStatus = SiteContent['tour']['dates'][number]['status'];

/** Format stored YYYY-MM-DD (or ISO) for display without UTC shift. */
export function formatTourDateDisplay(isoDate: string): string {
  if (!isoDate) return '';
  const normalized = isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Ticket-stub date parts (local calendar, no UTC shift). */
export function formatTourDateParts(isoDate: string): {
  day: string;
  month: string;
  weekday: string;
  year: string;
} {
  if (!isoDate) {
    return { day: '—', month: '—', weekday: '—', year: '—' };
  }
  const normalized = isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    return { day: '—', month: '—', weekday: '—', year: '—' };
  }
  return {
    day: d.toLocaleDateString(undefined, { day: '2-digit' }),
    month: d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
    year: d.toLocaleDateString(undefined, { year: 'numeric' }),
  };
}

export function tourStatusLabel(status: TourDateStatus): string {
  switch (status) {
    case 'sold_out':
      return 'Sold Out';
    case 'selling_fast':
      return 'Selling Fast';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'On Sale';
  }
}

export function tourStatusBadgeClass(status: TourDateStatus): string {
  if (status === 'sold_out' || status === 'cancelled') {
    return 'bg-muted text-muted-foreground';
  }
  if (status === 'selling_fast') {
    return 'bg-hot-pink/15 text-hot-pink';
  }
  return 'bg-signal-purple/15 text-signal-purple-bright';
}
