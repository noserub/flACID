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
    return 'bg-fuchsia-500/20 text-fuchsia-400';
  }
  return 'bg-cyan-500/20 text-cyan-400';
}
