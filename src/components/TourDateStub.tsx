import { cn } from './ui/utils';
import { caption, dateDay, dateMonth, dateWeekday } from '../lib/typography';
import { surface } from '../lib/colors';
import { formatTourDateParts } from '../utils/tourDisplay';

interface TourDateStubProps {
  date: string;
  showYear?: boolean;
  className?: string;
}

/** Ticket-stub date column: weekday, day, month, optional year. */
export function TourDateStub({ date, showYear = true, className }: TourDateStubProps) {
  const parts = formatTourDateParts(date);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 text-center',
        surface.purpleSubtle,
        className
      )}
    >
      <span className={dateWeekday}>{parts.weekday}</span>
      <span className={dateDay}>{parts.day}</span>
      <span className={dateMonth}>{parts.month}</span>
      {showYear && (
        <span className={cn(caption, 'text-[10px] tabular-nums')}>{parts.year}</span>
      )}
    </div>
  );
}
