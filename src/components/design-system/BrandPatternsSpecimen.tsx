import { Loader2, Play } from 'lucide-react';
import { cn } from '../ui/utils';
import { TokenName } from './TokenName';
import { BRAND_PATTERNS } from '../../lib/designSystemRegistry';

function PatternTile({
  token,
  label,
  children,
}: {
  token: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-2 overflow-hidden">
      <TokenName name={token} />
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="flex min-h-[3.5rem] items-center justify-center rounded-md border border-border/30 bg-card/50 p-3">
        {children}
      </div>
    </div>
  );
}

function renderBrandPatternPreview(key: string, classes: string) {
  switch (key) {
    case 'brandTabListClass':
      return (
        <div className={classes}>
          <span className="rounded-md px-3 py-1.5 text-xs text-muted-foreground">Photos</span>
          <span className="rounded-md bg-signal-purple/20 px-3 py-1.5 text-xs text-neon-green">
            Visuals
          </span>
        </div>
      );
    case 'brandTabTriggerClass':
      return <span className={cn(classes, 'data-[state=active]:text-neon-green')} data-state="active">Visuals</span>;
    case 'sectionNavRailDotActiveClass':
      return <span className={cn(classes, 'block rounded-full')} aria-hidden />;
    case 'sectionNavRailDotRestClass':
      return <span className={cn(classes, 'block rounded-full')} aria-hidden />;
    case 'brandToggleActiveClass':
      return (
        <button type="button" className={cn(classes, 'rounded-lg px-3 py-1.5 text-xs')}>
          Descend
        </button>
      );
    case 'miniPlayerChipWidthClass':
      return (
        <div className={cn(classes, 'rounded-lg border border-dashed border-signal-purple/40 py-2 text-center text-[10px] text-muted-foreground')}>
          chip width
        </div>
      );
    case 'brandPrimaryButtonClass':
      return (
        <button type="button" className={cn(classes, 'rounded-lg px-3 py-1.5 text-xs inline-flex items-center gap-1.5')}>
          <Play className="size-3.5" />
          Play
        </button>
      );
    case 'brandControlClass':
      return <div className={cn(classes, 'rounded-lg px-3 py-1.5 text-xs')}>Control</div>;
    case 'brandHoverInteractiveClass':
      return (
        <button type="button" className={cn(classes, 'rounded-lg px-2 py-1 text-xs')}>
          Hover me
        </button>
      );
    case 'brandIconButtonClass':
      return (
        <button type="button" className={cn(classes, 'rounded-lg p-2')} aria-label="Icon">
          <Play className="size-4" />
        </button>
      );
    case 'brandMenuItemSuccessClass':
    case 'brandMenuItemDestructiveClass':
      return (
        <button type="button" className={cn(classes, 'w-full rounded-md px-2 py-1.5 text-xs text-left')}>
          {key === 'brandMenuItemSuccessClass' ? 'Publish' : 'Discard'}
        </button>
      );
    case 'brandVizSurfaceClass':
    case 'brandSectionWashClass':
      return <div className={cn(classes, 'h-12 w-full rounded-md border border-border/30')} aria-hidden />;
    case 'brandSpinnerClass':
      return (
        <span className={cn(classes, 'inline-flex items-center gap-1.5 text-xs')}>
          <Loader2 className="size-3.5 animate-spin" />
          Loading
        </span>
      );
    case 'brandActiveAccentClass':
      return <span className={cn(classes, 'text-sm font-medium')}>AirPlay</span>;
    default:
      return <span className="text-xs text-muted-foreground">Preview</span>;
  }
}

export function BrandPatternsSpecimen() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {BRAND_PATTERNS.map(({ key, label, classes }) => (
        <PatternTile key={key} token={key} label={label}>
          {renderBrandPatternPreview(key, classes)}
        </PatternTile>
      ))}
    </div>
  );
}
