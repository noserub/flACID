/**
 * Shared typography tokens — maps to .type-* utilities in globals.css.
 * Color class strings for gradients live in colors.ts.
 */
import { cn } from '../components/ui/utils';
import { gradient, onDark } from './colors';

/** Brand gradient class — pair with display tokens */
export const gradientText = gradient.brandText;

/** Footer wordmark, compact brand moments */
export const displayWordmark = 'font-hero type-display-wordmark tracking-tight';

/** Display font — section titles, headings, viz names */
export const titleSection = 'font-hero type-display-section tracking-tight';

/** Section H1 — hot pink accent (default live site sections) */
export const titleSectionAccent =
  'font-hero type-display-section tracking-tight text-hot-pink-bright';

/** Section H1 — full brand gradient (reserve for Visuals + wordmark moments) */
export const titleSectionGradient = cn(titleSection, gradient.brandText);

/** Section H1 — editorial layout (About) */
export const titleEditorial = 'font-hero type-display-editorial tracking-tight';

/** About title — pink accent to match live editorial header */
export const titleEditorialAccent =
  'font-hero type-display-editorial tracking-tight text-hot-pink-bright';

/** About / editorial — full brand gradient (rare) */
export const titleEditorialGradient = cn(titleEditorial, gradient.brandText);

/** H2 — modals, tour venue, empty states */
export const heading = 'font-hero type-heading text-foreground';

/** H3 — album / discography cards */
export const cardTitle =
  'font-hero type-card-title text-foreground transition-colors group-hover:text-signal-purple-bright';

/** H4 — footer columns */
export const subheading = 'font-hero type-subheading text-foreground';

/** Eyebrows, viz index, ticket weekday */
export const label = 'type-label text-neon-green';

/** Ticket date stub — weekday abbreviation (Syne) */
export const dateWeekday = 'font-hero type-label text-neon-green';

/** Ticket date stub — day numeral */
export const dateDay =
  'font-hero type-date-day text-signal-purple-bright tabular-nums';

/** Ticket date stub — month abbreviation */
export const dateMonth = 'font-hero type-label text-hot-pink';

/** About intro */
export const lead = 'font-body type-lead text-foreground';

/** Primary body copy */
export const body = 'font-body type-body text-foreground';

/** De-emphasized prose — subtitles, secondary paragraphs */
export const bodySecondary = 'font-body type-body-secondary text-foreground/70';

/** Inline meta — member roles, hints */
export const inlineSecondary = 'type-inline-secondary text-foreground/70';

/** Dates, cities, album year */
export const caption = 'type-caption text-muted-foreground';

/** Visuals grid card title */
export const vizCardName = 'font-hero type-viz-name text-foreground';

/** Viz card hover hint */
export const vizCardHint =
  'type-caption text-foreground/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100';

/** Mini player chip — track title */
export const miniPlayerTitle = 'text-sm font-semibold truncate leading-tight text-foreground';

/** Mini player chip — on hero viz */
export const miniPlayerTitleOnDark = 'text-sm font-semibold truncate leading-tight text-white';

/** Mini player chip — album / artist line */
export const miniPlayerMeta = 'text-xs truncate leading-snug text-muted-foreground';

/** Mini player chip — meta on hero viz */
export const miniPlayerMetaOnDark = 'text-xs truncate leading-snug text-white/55';

/** Player overlay — compact chrome */
export const playerTrackTitle = cn('font-hero type-player-title', onDark.heading);

/** Player overlay — fullscreen */
export const playerTrackTitleLarge = cn('font-hero type-player-title-fs', onDark.heading);

/** Player artist — compact */
export const playerArtist = cn('font-body type-caption', onDark.muted);

/** Player artist — fullscreen */
export const playerArtistLarge = cn('font-body type-player-artist-fs', onDark.muted);

/** Player album — compact */
export const playerAlbum = cn('font-body type-caption', onDark.faint, 'mt-1');

/** Player album — fullscreen */
export const playerAlbumLarge = cn('font-body type-player-album-fs', onDark.faint, 'mt-1');

/** Design system / admin page title */
export const pageTitle = 'font-hero type-display-editorial tracking-tight';

/** Specimen card section headings on design system page */
export const specimenTitle = 'font-hero type-heading text-foreground';
