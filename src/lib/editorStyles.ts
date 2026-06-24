/**
 * CMS / edit-mode patterns — shared across EditableSection and section edit dialogs.
 * Documented in design system foundation · CMS & admin.
 */
import { cn } from '../components/ui/utils';
import { overlay } from './colors';
import { border, surface } from './colors';
import { brandIconButtonClass } from './brandClasses';
import { subheading } from './typography';

/** Overlay controls on photos, viz, and section chrome */
export const editorChromeButtonClass = cn(
  overlay.scrim,
  'text-white border border-white/10',
  'hover:bg-void-scrim-heavy hover:text-white'
);

/** Section name pill beside visibility toggle */
export const editorSectionLabelClass = cn(
  'px-2 py-1 rounded text-xs text-white',
  overlay.scrim
);

/** Nested row card inside edit dialogs (tour date, gallery image, etc.) */
export const editorRowCardClass = cn(
  'rounded-lg border p-4 space-y-3',
  border.brandSubtle,
  surface.cardTranslucent
);

/** Edit dialog sticky footer */
export const editorDialogFooterClass = 'border-t border-border px-6 py-4 bg-card';

/** Sub-panel title inside dialogs (Tour dates, Images, etc.) */
export const editorPanelTitleClass = cn(subheading, 'text-base');

/** List remove / destructive row actions */
export const editorDestructiveGhostClass = cn(
  'text-destructive hover:text-destructive hover:bg-destructive/15'
);

/** Accordion reorder chevrons */
export const editorReorderButtonClass = cn(brandIconButtonClass, 'h-7 w-7 disabled:opacity-30');

/** Track / list index badge (nav language, not CTA) */
export const editorIndexBadgeClass = cn(
  'text-xs font-medium px-2 py-1 rounded shrink-0',
  'bg-signal-purple/20 text-neon-green'
);

export const editorCalloutInfoClass = cn(
  'rounded-lg p-3 bg-signal-purple/10 border border-signal-purple/30'
);
export const editorCalloutInfoTextClass = 'text-xs text-signal-purple-bright';

export const editorCalloutErrorClass = cn(
  'rounded-lg p-3 bg-destructive/10 border border-destructive/30'
);
export const editorCalloutErrorTextClass = 'text-xs text-destructive';

export const editorCalloutSuccessClass = cn(
  'rounded-lg p-3 bg-success-muted border border-neon-green/30'
);
export const editorCalloutSuccessTextClass = 'text-xs text-neon-green';
