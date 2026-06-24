import { useState } from 'react';
import { Play } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { cn } from '../ui/utils';
import { TextLabel } from '../TextLabel';
import { SpecimenCard } from './SpecimenCard';
import { TokenName } from './TokenName';
import {
  AtomsSpecimens,
  CmsSpecimens,
  MoleculesSpecimens,
  OrganismsSpecimens,
  OverlaySpecimens,
} from './PatternSpecimens';
import { TabBarSpecimen } from './TabBarSpecimen';
import { InteractionSpecimens } from './InteractionSpecimens';
import { SpecimenSubsection } from './SpecimenSubsection';
import { ExperienceModesSpecimen } from './ExperienceModesSpecimen';
import { MotionLayoutSpecimen } from './MotionLayoutSpecimen';
import { ContextCompositesSpecimen } from './ContextCompositesSpecimen';
import { BrandPatternsSpecimen } from './BrandPatternsSpecimen';
import { DescentToggleButton } from '../DescentModeToggle';
import { getCssVar } from '../../hooks/useCssVar';
import { gradientText, displayWordmark, pageTitle, specimenTitle, titleSection, titleSectionAccent, titleSectionGradient } from '../../lib/typography';
import {
  ACCESSIBILITY_NOTES,
  ADMIN_BUTTON_VARIANTS,
  CASE_STUDY,
  COLOR_ROLE_NOTES,
  DESIGN_INTENT,
  DESIGN_SYSTEM_SOURCE_FILES,
  EDITOR_PATTERNS,
  FOUNDATION_COLOR_GROUPS,
  FOUNDATION_NAV,
  FOUNDATION_TYPE_SCALE,
  COMPONENT_SUBNAV,
  LAYOUT_TOKENS,
  OVERLAY_PATTERNS,
  PRODUCTION_BRAND_COLORS,
  PRODUCTION_BUTTON_VARIANTS,
  PRODUCTION_ELEVATION,
  PRODUCTION_GRADIENTS,
  PRODUCTION_NAV,
  RADIUS_TOKENS,
  SEMANTIC_COLOR_MAPS,
  TYPE_FONTS,
  TYPE_RAMP_HIERARCHY,
} from '../../lib/designSystemRegistry';

type ViewMode = 'production' | 'foundation';

const GRADIENT_TYPE_TOKENS = new Set(['displayWordmark', 'titleSectionGradient', 'titleEditorialGradient']);

function typeSampleClasses(token: string, classes: string) {
  if (token === 'gradientText') return cn(displayWordmark, gradientText);
  if (token === 'titleSection') return cn(titleSection, 'text-foreground');
  return cn(classes, GRADIENT_TYPE_TOKENS.has(token) && gradientText);
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

interface DesignSystemContentProps {
  embed?: boolean;
}

export function DesignSystemContent({ embed = false }: DesignSystemContentProps) {
  const [view, setView] = useState<ViewMode>('production');
  const nav = view === 'production' ? PRODUCTION_NAV : FOUNDATION_NAV;

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
        <p className="text-sm font-hero text-signal-purple-bright/90 max-w-xl">
          {DESIGN_INTENT.themeName}
        </p>
        <p className="text-xs text-muted-foreground max-w-2xl">{DESIGN_INTENT.themeDefinition}</p>
      </header>

      <div
        className={cn(
          'sticky z-20 -mx-4 mb-8 space-y-3 border-b border-signal-purple/20 bg-void/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6',
          embed ? 'top-0' : 'top-[53px]'
        )}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView('production')}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
              view === 'production'
                ? 'bg-neon-green/15 text-neon-green border border-neon-green/40'
                : 'text-signal-purple-bright border border-signal-purple/30 hover:text-foreground'
            )}
          >
            On the site
          </button>
          <button
            type="button"
            onClick={() => setView('foundation')}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
              view === 'foundation'
                ? 'bg-signal-purple/20 text-signal-purple-bright border border-signal-purple/40'
                : 'text-muted-foreground border border-border/50 hover:text-foreground'
            )}
          >
            Foundation
          </button>
        </div>

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

      {view === 'production' ? (
        <div className="space-y-8">
          <section
            id="start"
            className="scroll-mt-36 rounded-2xl border border-signal-purple/30 bg-card/95 p-6 sm:p-8 shadow-card relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-0 section-cosmic-grain opacity-30" aria-hidden />
            <div className="relative">
            <TextLabel className="mb-3">Overview</TextLabel>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <p className={cn(titleSection, gradientText)}>Start here</p>
                  <p className="text-sm text-foreground/75 mt-2">{DESIGN_INTENT.product}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Portfolio narrative:{' '}
                    <a
                      href="/case-study"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-green hover:underline"
                    >
                      Read the case study
                    </a>
                    {' (decisions, AI builder process, and outcomes).'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">The problem</p>
                  <p className="text-sm text-foreground/80">{CASE_STUDY.problem}</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Constraints</p>
                  <ul className="space-y-1.5">
                    {CASE_STUDY.constraints.map((c) => (
                      <li key={c} className="flex gap-2 text-xs text-foreground/75">
                        <span className="text-neon-green">·</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">System bets</p>
                  <ul className="space-y-1.5">
                    {CASE_STUDY.systemBets.map((b) => (
                      <li key={b} className="flex gap-2 text-xs text-foreground/75">
                        <span className="text-neon-green">·</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">What shipped</p>
                  <ul className="space-y-1.5">
                    {CASE_STUDY.shipped.map((s) => (
                      <li key={s} className="flex gap-2 text-xs text-foreground/75">
                        <span className="text-neon-green">·</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <ol className="space-y-2 text-sm text-foreground/75 list-decimal list-inside border-t border-border/40 pt-4">
                  <li>
                    <a href="#experience-modes" className="text-neon-green hover:underline">
                      Experience modes
                    </a>
                    {' (browse, fullscreen, Descent, Stage)'}
                  </li>
                  <li>
                    <a href="#color" className="text-neon-green hover:underline">
                      Color
                    </a>
                    {' (brand hues, roles, accessibility)'}
                  </li>
                  <li>
                    <a href="#type-ramp" className="text-neon-green hover:underline">
                      Typography
                    </a>
                    {' (hierarchy and samples)'}
                  </li>
                  <li>
                    <a href="#interaction" className="text-neon-green hover:underline">
                      Interaction
                    </a>
                    {' (CTA vs nav vs control)'}
                  </li>
                  <li>
                    <a href="#components" className="text-neon-green hover:underline">
                      Components
                    </a>
                    {' (in-context composites through overlays)'}
                  </li>
                </ol>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
                  Brand at a glance
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PRODUCTION_BRAND_COLORS.slice(0, 4).map(({ var: v, label: l }) => (
                    <CompactSwatch key={v} cssVar={v} label={l} />
                  ))}
                </div>
                <p className={cn(titleSection, gradientText, 'mt-5')}>Visuals</p>
                <TextLabel className="mt-2">Section eyebrow</TextLabel>
                <ul className="mt-6 space-y-1.5 border-t border-border/40 pt-4">
                  {DESIGN_INTENT.principles.map((p) => (
                    <li key={p} className="flex gap-2 text-xs text-foreground/75">
                      <span className="text-neon-green">·</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </div>
          </section>

          <SpecimenCard
            id="experience-modes"
            eyebrow="Product"
            title="Experience modes"
            description="The site is one product with four layers. Chrome visibility, tokens, and z-index change per mode."
          >
            <ExperienceModesSpecimen />
          </SpecimenCard>

          <SpecimenCard
            id="color"
            eyebrow="Brand"
            title="Color"
            description="Eight brand hues plus semantic roles. Start here before judging components."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PRODUCTION_BRAND_COLORS.map(({ var: v, label: l }) => (
                <CompactSwatch key={v} cssVar={v} label={l} />
              ))}
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {COLOR_ROLE_NOTES.map((row) => (
                <div
                  key={row.role}
                  className="flex gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{row.role}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{row.where}</p>
                  </div>
                  <TokenName name={row.token} className="shrink-0 self-start" />
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1.5">Section title (accent)</p>
                <p className={titleSectionAccent}>Discography</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1.5">Section title (gradient)</p>
                <p className={titleSectionGradient}>Gallery</p>
              </div>
              {PRODUCTION_GRADIENTS.filter((g) => g.key !== 'brandText').map(({ key, label: l, classes }) => (
                <div key={key}>
                  <p className="text-[11px] text-muted-foreground mb-1.5">{l}</p>
                  <div className={cn('h-14 rounded-lg border border-border/40', classes)} />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Accessibility</p>
              {ACCESSIBILITY_NOTES.map(({ topic, detail }) => (
                <div
                  key={topic}
                  className="rounded-lg border border-neon-green/20 bg-neon-green/5 px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-foreground">{topic}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{detail}</p>
                </div>
              ))}
            </div>
          </SpecimenCard>

          <SpecimenCard
            id="type-ramp"
            eyebrow="Brand"
            title="Typography"
            description="Font stacks (Google Fonts) + semantic tokens in typography.ts. Section pages use h2 for H1 visually (one h1 per document on the live site)."
          >
            <div className="mb-6 overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Family</th>
                    <th className="px-3 py-2 font-medium">CSS var</th>
                    <th className="px-3 py-2 font-medium hidden sm:table-cell">Utility</th>
                    <th className="px-3 py-2 font-medium hidden md:table-cell">Weights</th>
                    <th className="px-3 py-2 font-medium hidden lg:table-cell">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {TYPE_FONTS.map((font) => (
                    <tr key={font.cssVar} className="border-b border-border/30 last:border-0 align-top">
                      <td className="px-3 py-3 font-medium text-neon-green whitespace-nowrap">{font.role}</td>
                      <td className="px-3 py-3 font-hero text-foreground">{font.family}</td>
                      <td className="px-3 py-3 font-mono text-xs text-signal-purple-bright/90">{font.cssVar}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">
                        {font.utility}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell">{font.weights}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground hidden lg:table-cell max-w-[14rem]">
                        {font.use}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/40 bg-muted/15 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Display sample</p>
                <p className={cn('font-hero type-display-section tracking-tight text-hot-pink-bright')}>
                  Discography
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Syne · titleSectionAccent</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-muted/15 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Body sample</p>
                <p className="font-body type-body text-foreground">
                  Sound from the void — editorial body in Instrument Sans.
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Instrument Sans · body</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Level</th>
                    <th className="px-3 py-2 font-medium">HTML</th>
                    <th className="px-3 py-2 font-medium">Token</th>
                    <th className="px-3 py-2 font-medium hidden sm:table-cell">Where</th>
                    <th className="px-3 py-2 font-medium">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {TYPE_RAMP_HIERARCHY.map((row) => (
                    <tr key={row.token} className="border-b border-border/30 last:border-0 align-top">
                      <td className="px-3 py-3 font-medium text-neon-green whitespace-nowrap">{row.level}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.html}</td>
                      <td className="px-3 py-3 font-mono text-xs text-signal-purple-bright/90 whitespace-nowrap">
                        {row.token}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground hidden sm:table-cell max-w-[12rem]">
                        {row.where}
                      </td>
                      <td className="px-3 py-3 min-w-[10rem]">
                        <span className={typeSampleClasses(row.token, row.classes)}>
                          {row.token === 'gradientText' ? 'flACID' : row.sample}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SpecimenCard>

          <SpecimenCard
            id="interaction"
            eyebrow="Interaction model"
            title="When to use what"
            description="Three roles on the live site. Primary fill is for CTAs only. Selection and controls use nav and purple language."
          >
            <InteractionSpecimens />
          </SpecimenCard>

          <SpecimenCard
            id="motion-layout"
            eyebrow="Layout"
            title="Motion & responsive"
            description="Duration tokens, reduced-motion policy, breakpoint decisions, and z-index stacking across modes."
          >
            <MotionLayoutSpecimen />
          </SpecimenCard>

          <SpecimenCard
            id="components"
            eyebrow="Components"
            title="Production library"
            description="Everything on the public site, grouped for review. Jump to a group below."
          >
            <nav aria-label="Component groups" className="flex flex-wrap gap-1.5 mb-2">
              {COMPONENT_SUBNAV.map(({ id: subId, label: subLabel }) => (
                <a
                  key={subId}
                  href={`#${subId}`}
                  className="rounded-md px-2.5 py-1 text-[11px] font-medium text-signal-purple-bright/80 hover:bg-muted/50 hover:text-neon-green transition-colors"
                >
                  {subLabel}
                </a>
              ))}
            </nav>

            <div className="space-y-2">
              <SpecimenSubsection
                id="components-in-context"
                title="In context"
                description="Annotated composites: hero, gallery viz card, fullscreen player, as shipped on the live site."
              >
                <ContextCompositesSpecimen />
              </SpecimenSubsection>

              <SpecimenSubsection
                id="components-building-blocks"
                title="Building blocks"
                description="Atoms and micro-components composed into larger patterns."
              >
                <AtomsSpecimens />
              </SpecimenSubsection>

              <SpecimenSubsection
                id="components-controls"
                title="Controls"
                description="Toggles, sliders, section navigation. Gallery tab bar is under Tabs."
              >
                <MoleculesSpecimens />
              </SpecimenSubsection>

              <SpecimenSubsection
                id="components-sections"
                title="Sections"
                description="Full sections and cards as they appear on the live site, including the mini player."
              >
                <OrganismsSpecimens />
              </SpecimenSubsection>

              <SpecimenSubsection
                id="components-buttons"
                title="Buttons & forms"
                description="Button variants, mode toggle, elevation, and branded input/slider primitives."
              >
                <div className="space-y-6">
                  {PRODUCTION_BUTTON_VARIANTS.map((variant) => (
                    <div key={variant}>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                        {variant}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant={variant} size="sm">
                          Small
                        </Button>
                        <Button variant={variant}>Default</Button>
                        <Button variant={variant} disabled>
                          Disabled
                        </Button>
                        {variant === 'default' && (
                          <Button variant={variant}>
                            <Play className="size-4" />
                            Play
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-border/40 pt-6">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
                    Descend toggle
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <DescentToggleButton isDescentMode={false} onClick={() => {}} />
                    <DescentToggleButton isDescentMode onClick={() => {}} />
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {PRODUCTION_ELEVATION.map(({ key, label: l, classes }) => (
                    <div
                      key={key}
                      className={cn(
                        'flex h-16 min-w-[7rem] flex-1 items-center justify-center rounded-lg border border-signal-purple/20 bg-card px-2',
                        classes
                      )}
                    >
                      <span className="text-[10px] text-center text-muted-foreground">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-border/40 pt-6">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
                    Branded primitives
                  </p>
                  <div className="max-w-xs space-y-2">
                    <Label htmlFor="ds-input">Input</Label>
                    <Input id="ds-input" placeholder="you@example.com" />
                  </div>
                  <div className="mt-4 max-w-xs">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Slider (control, not CTA)
                    </Label>
                    <Slider value={[40]} max={100} aria-label="Demo slider" />
                  </div>
                </div>
              </SpecimenSubsection>

              <SpecimenSubsection
                id="components-tabs"
                title="Tabs"
                description="Purple rest, green active. Same component as Gallery section. Nav language, not CTA."
              >
                <TabBarSpecimen />
              </SpecimenSubsection>

              <SpecimenSubsection
                id="components-overlays"
                title="Overlays"
                description="void-scrim tokens replace ad-hoc bg-black/50. onDark.* for copy on viz and stage."
              >
                <OverlaySpecimens />
                <div className="mt-6 grid gap-2 sm:grid-cols-2 border-t border-border/40 pt-6">
                  {OVERLAY_PATTERNS.map(({ key, label: l }) => (
                    <div key={key} className="text-xs">
                      <TokenName name={key} />
                      <p className="text-muted-foreground mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </SpecimenSubsection>
            </div>
          </SpecimenCard>
        </div>
      ) : (
        <div className="space-y-8">
          <SpecimenCard
            id="foundation-cms"
            eyebrow="Foundation"
            title="CMS & editor patterns"
            description="Edit-mode chrome, overflow menu, and dialog triggers. Not shown to visitors."
          >
            <CmsSpecimens />
            <div className="mt-6 space-y-4 border-t border-border/40 pt-6">
              <p className="text-xs text-muted-foreground">Editor tokens (editorStyles.ts)</p>
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
              <p className="text-xs text-muted-foreground pt-2">Admin button variants</p>
              <div className="flex flex-wrap gap-2">
                {ADMIN_BUTTON_VARIANTS.map((variant) => (
                  <Button key={variant} variant={variant} size="sm">
                    {variant}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">Newsletter form</p>
              <div className="max-w-xs space-y-2">
                <Label htmlFor="foundation-email">Email</Label>
                <Input id="foundation-email" placeholder="you@example.com" />
              </div>
              <p className="text-xs text-muted-foreground pt-2">brandClasses.ts</p>
              <BrandPatternsSpecimen />
            </div>
          </SpecimenCard>

          <SpecimenCard
            id="foundation-color"
            eyebrow="Foundation"
            title="Extended color tokens"
            description="Derived fills and glow sources. Used in CSS, rarely named in UI."
          >
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

          <SpecimenCard
            id="foundation-type"
            eyebrow="Foundation"
            title="Niche typography"
            description="Tokens used in admin or hover-only contexts."
          >
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

          <SpecimenCard
            id="foundation-tokens"
            eyebrow="Foundation"
            title="Token API"
            description="Class maps from colors.ts, for implementation reference."
          >
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

          <SpecimenCard
            id="provenance"
            eyebrow="Source"
            title="Provenance"
            description="globals.css → TypeScript tokens → components"
          >
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
      )}
    </div>
  );
}
