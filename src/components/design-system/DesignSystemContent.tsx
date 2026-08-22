import { useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { TextLabel } from '../TextLabel';
import { SpecimenCard } from './SpecimenCard';
import { TokenName } from './TokenName';
import {
  CmsSpecimens,
  EditorialSpecimens,
  GallerySpecimens,
  NavigationSpecimens,
  OverlaySpecimens,
  TourSpecimens,
} from './PatternSpecimens';
import { InteractionSpecimens } from './InteractionSpecimens';
import { MotionLayoutSpecimen } from './MotionLayoutSpecimen';
import { PlaybackSpecimens } from './ContextCompositesSpecimen';
import { BrandPatternsSpecimen } from './BrandPatternsSpecimen';
import { LawsSpecimen } from './LawsSpecimen';
import { PressureSequence } from './PressureSequence';
import { getCssVar } from '../../hooks/useCssVar';
import { gradientText, displayWordmark, pageTitle } from '../../lib/typography';
import {
  ADMIN_BUTTON_VARIANTS,
  COLOR_ROLE_NOTES,
  DESIGN_INTENT,
  DESIGN_SYSTEM_SOURCE_FILES,
  EDITOR_PATTERNS,
  FOUNDATION_COLOR_GROUPS,
  FOUNDATION_NAV,
  FOUNDATION_TYPE_SCALE,
  LAYOUT_TOKENS,
  PRODUCTION_BRAND_COLORS,
  PRODUCTION_BUTTON_VARIANTS,
  PRODUCTION_NAV,
  RADIUS_TOKENS,
  SEMANTIC_COLOR_MAPS,
  TYPE_RAMP_HIERARCHY,
} from '../../lib/designSystemRegistry';

function typeSampleClasses(token: string, classes: string) {
  if (token === 'displayWordmark') return cn(displayWordmark, gradientText);
  return classes;
}

function CompactSwatch({ cssVar, label: swatchLabel }: { cssVar: string; label: string }) {
  const resolved = getCssVar(cssVar);
  return (
    <div className="group flex flex-col gap-1.5">
      <div
        className="h-10 w-full rounded-lg border border-border/50 sm:h-12"
        style={{ background: `var(--${cssVar})` }}
        title={resolved}
      />
      <p className="text-[10px] font-medium text-foreground/90">{swatchLabel}</p>
      <p className="font-mono text-[9px] text-muted-foreground truncate">{resolved || 'n/a'}</p>
    </div>
  );
}

function SemanticMapTable({
  title,
  entries,
}: {
  title: string;
  entries: readonly { key: string; classes: string }[];
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium uppercase tracking-wide text-signal-purple-bright">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-border/50 text-xs">
        <table className="w-full">
          <tbody>
            {entries.map(({ key, classes }) => (
              <tr key={key} className="border-b border-border/30 last:border-0">
                <td className="px-3 py-2 font-mono text-neon-green/90 whitespace-nowrap">{key}</td>
                <td className="px-3 py-2 font-mono text-foreground/60 break-all">{classes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function viewHref(foundation: boolean, embed: boolean) {
  const params = new URLSearchParams();
  if (embed) params.set('embed', '1');
  if (foundation) params.set('foundation', '1');
  const query = params.toString();
  return query ? `/design-system?${query}` : '/design-system';
}

interface DesignSystemContentProps {
  embed?: boolean;
}

export function DesignSystemContent({ embed = false }: DesignSystemContentProps) {
  const foundation = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('foundation') === '1';
  }, []);

  const nav = foundation ? FOUNDATION_NAV : PRODUCTION_NAV;

  return (
    <div
      className={cn(
        'relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12',
        !embed && 'lg:max-w-6xl'
      )}
    >
      <header className="mb-6 space-y-3">
        <TextLabel>Design system</TextLabel>
        <h1 className={cn(pageTitle, gradientText)}>flACID</h1>
        <p className="text-sm font-hero text-signal-purple-bright/90">{DESIGN_INTENT.themeName}</p>
        <p className="text-sm text-foreground/75 max-w-xl">{DESIGN_INTENT.product}</p>
        <div className="pt-2 flex flex-wrap gap-2" role="tablist" aria-label="Design system view">
            <a
              href={viewHref(false, embed)}
              role="tab"
              aria-selected={!foundation}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wide border transition-colors',
                !foundation
                  ? 'bg-neon-green/15 text-neon-green border-neon-green/40'
                  : 'text-signal-purple-bright border-signal-purple/30 hover:text-foreground'
              )}
            >
              How it works
            </a>
            <a
              href={viewHref(true, embed)}
              role="tab"
              aria-selected={foundation}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wide border transition-colors',
                foundation
                  ? 'bg-signal-purple/20 text-signal-purple-bright border-signal-purple/40'
                  : 'text-muted-foreground border-border/50 hover:text-foreground'
              )}
            >
              The UI
            </a>
        </div>
      </header>

      <div
        className={cn(
          'sticky z-20 -mx-4 mb-8 border-b border-signal-purple/20 bg-void/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6',
          embed ? 'top-0' : 'top-[53px]'
        )}
      >
        <nav aria-label="Sections" className="flex flex-wrap gap-1.5">
          {nav.map(({ id, label: navLabel }) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-signal-purple-bright/80 hover:bg-muted/50 hover:text-neon-green transition-colors"
            >
              {navLabel}
            </a>
          ))}
        </nav>
      </div>

      {foundation ? (
        <div className="space-y-8">
          <SpecimenCard id="foundation-buttons" title="Buttons">
            <div className="space-y-3">
              {PRODUCTION_BUTTON_VARIANTS.map((variant) => (
                <div key={variant} className="flex flex-wrap items-center gap-2">
                  <span className="w-16 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {variant}
                  </span>
                  <Button variant={variant} size="sm">
                    Small
                  </Button>
                  <Button variant={variant}>Default</Button>
                  <Button variant={variant} disabled>
                    Disabled
                  </Button>
                </div>
              ))}
            </div>
          </SpecimenCard>

          <SpecimenCard id="foundation-color" title="Colors">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
              {PRODUCTION_BRAND_COLORS.map(({ var: v, label: l }) => (
                <CompactSwatch key={v} cssVar={v} label={l} />
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 mb-6">
              {COLOR_ROLE_NOTES.map((row) => (
                <div key={row.role} className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                  <p className="text-sm font-medium text-foreground">{row.role}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{row.where}</p>
                </div>
              ))}
            </div>
            {FOUNDATION_COLOR_GROUPS.map((group) => (
              <div key={group.group} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-foreground mb-3">{group.group}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.vars.map((v) => (
                    <CompactSwatch key={v} cssVar={v} label={v} />
                  ))}
                </div>
              </div>
            ))}
          </SpecimenCard>

          <SpecimenCard id="foundation-type" title="Type">
            <div className="overflow-x-auto rounded-lg border border-border/40 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Level</th>
                    <th className="px-3 py-2 font-medium">Sample</th>
                    <th className="px-3 py-2 font-medium hidden sm:table-cell">Where</th>
                  </tr>
                </thead>
                <tbody>
                  {TYPE_RAMP_HIERARCHY.map((row) => (
                    <tr key={row.token} className="border-b border-border/30 last:border-0 align-middle">
                      <td className="px-3 py-3 font-medium text-neon-green whitespace-nowrap">{row.level}</td>
                      <td className="px-3 py-3 min-w-[10rem]">
                        <span className={typeSampleClasses(row.token, row.classes)}>{row.sample}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        {row.where}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-4">
              {FOUNDATION_TYPE_SCALE.map(({ key, classes, sample, role }) => (
                <div key={key} className="flex flex-col gap-1 border-b border-border/30 pb-3 last:border-0">
                  <TokenName name={key} />
                  <p className={classes}>{sample}</p>
                  <p className="text-[11px] text-muted-foreground">{role}</p>
                </div>
              ))}
            </div>
          </SpecimenCard>

          <SpecimenCard id="foundation-motion" title="Motion">
            <MotionLayoutSpecimen />
          </SpecimenCard>

          <SpecimenCard id="foundation-surfaces" title="The site">
            <div className="space-y-10">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Playback</h3>
                <PlaybackSpecimens />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Navigation</h3>
                <NavigationSpecimens />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Editorial</h3>
                <EditorialSpecimens />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Tour</h3>
                <TourSpecimens />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Gallery</h3>
                <GallerySpecimens />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Overlays</h3>
                <OverlaySpecimens />
              </div>
            </div>
          </SpecimenCard>

          <SpecimenCard id="foundation-cms" title="Edit mode">
            <CmsSpecimens />
            <div className="mt-6 space-y-4 border-t border-border/40 pt-6">
              <div className="flex flex-wrap gap-2">
                {EDITOR_PATTERNS.map(({ key, label: l, classes }) => (
                  <button
                    key={key}
                    type="button"
                    className={cn('rounded-lg px-3 py-1.5 text-xs font-medium', classes)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {ADMIN_BUTTON_VARIANTS.map((variant) => (
                  <Button key={variant} variant={variant} size="sm">
                    {variant}
                  </Button>
                ))}
              </div>
            </div>
          </SpecimenCard>

          <SpecimenCard id="foundation-tokens" title="Tokens">
            <Accordion type="multiple" className="w-full">
              {(['surface', 'overlay', 'onDark', 'border', 'shadow', 'gradient', 'interactive', 'text'] as const).map(
                (mapKey) => (
                  <AccordionItem key={mapKey} value={mapKey}>
                    <AccordionTrigger className="text-sm font-medium capitalize">
                      {mapKey}
                    </AccordionTrigger>
                    <AccordionContent>
                      <SemanticMapTable title={mapKey} entries={SEMANTIC_COLOR_MAPS[mapKey]} />
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
            <div className="mt-6 flex flex-wrap gap-4">
              {RADIUS_TOKENS.map(({ var: cssVar, label: l, tailwind }) => (
                <div key={cssVar} className="text-center">
                  <div className={cn('mx-auto size-10 bg-signal-purple/25 border border-signal-purple/40', tailwind)} />
                  <p className="mt-1 text-[10px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {LAYOUT_TOKENS.zIndex.map(({ key, classes }) => (
                <div key={key} className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                  <TokenName name={key} />
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">{classes}</p>
                </div>
              ))}
            </div>
          </SpecimenCard>

          <SpecimenCard id="foundation-classes" title="Classes">
            <BrandPatternsSpecimen />
          </SpecimenCard>

          <SpecimenCard id="source" title="Files">
            <ul className="space-y-1.5 font-mono text-xs text-foreground/75">
              {DESIGN_SYSTEM_SOURCE_FILES.map((file) => (
                <li key={file} className="flex gap-2">
                  <span className="text-neon-green">→</span>
                  {file}
                </li>
              ))}
            </ul>
          </SpecimenCard>
        </div>
      ) : (
        <div className="space-y-8">
          <SpecimenCard id="laws" title="Rules">
            <LawsSpecimen />
          </SpecimenCard>

          <SpecimenCard id="interaction" title="The fill">
            <InteractionSpecimens />
          </SpecimenCard>

          <SpecimenCard id="modes" title="Same chrome">
            <PressureSequence />
          </SpecimenCard>
        </div>
      )}
    </div>
  );
}
