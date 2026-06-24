/**
 * Portfolio case study: Principal / Director product design + AI builder narrative.
 * Route: /case-study
 */

import { ArrowLeft, ExternalLink, Palette } from 'lucide-react';
import { Button } from '../components/ui/button';
import { TextLabel } from '../components/TextLabel';
import { SpecimenCard } from '../components/design-system/SpecimenCard';
import { useSEO } from '../hooks/useSEO';
import { cn } from '../components/ui/utils';
import { border, shadow } from '../lib/colors';
import {
  body,
  bodySecondary,
  gradientText,
  heading,
  pageTitle,
  titleSectionAccent,
} from '../lib/typography';
import {
  CASE_STUDY,
  CASE_STUDY_AI,
  CASE_STUDY_CONSTRAINTS,
  CASE_STUDY_DECISIONS,
  CASE_STUDY_META,
  CASE_STUDY_NAV,
  CASE_STUDY_OUTCOMES,
  CASE_STUDY_REFLECTION,
  CASE_STUDY_ROLE,
  DESIGN_INTENT,
  EXPERIENCE_MODES,
  INTERACTION_RULES,
} from '../lib/caseStudyContent';

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className={cn(bodySecondary, 'flex gap-2.5')}>
          <span className="text-neon-green shrink-0">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DecisionCard({
  title,
  chosen,
  rejected,
  why,
}: {
  title: string;
  chosen: string;
  rejected: string;
  why: string;
}) {
  return (
    <article
      className={cn(
        'rounded-xl border border-signal-purple/30 bg-muted/10 p-5 sm:p-6',
        border.brandHoverMuted
      )}
    >
      <h3 className={heading}>{title}</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-neon-green mb-1">Chosen</dt>
          <dd className={bodySecondary}>{chosen}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-hot-pink/90 mb-1">Rejected</dt>
          <dd className={bodySecondary}>{rejected}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Why</dt>
          <dd className={body}>{why}</dd>
        </div>
      </dl>
    </article>
  );
}

export function CaseStudyPage() {
  useSEO({
    title: 'flACID Case Study | Product Design',
    description:
      'Case study: fan platform, visual instrument, and CMS in one system. Cosmic Signal design system, hero-first playback, and AI-assisted build.',
    keywords: 'product design, design system, case study, flACID, AI builder',
  });

  return (
    <div className="relative min-h-screen bg-void text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-ambient-editorial opacity-40" aria-hidden />
      <div className="pointer-events-none fixed inset-0 section-cosmic-grain opacity-15" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-signal-purple/20 bg-void/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:max-w-4xl sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <a href="/">
              <ArrowLeft className="size-4" />
              Back to site
            </a>
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={CASE_STUDY_META.liveUrl} target="_blank" rel="noopener noreferrer">
                Live site
                <ExternalLink className="size-3.5 opacity-70" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={CASE_STUDY_META.designSystemPath} target="_blank" rel="noopener noreferrer">
                <Palette className="size-3.5" />
                Design system
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 py-10 sm:max-w-4xl sm:px-6 sm:py-14">
        {/* Hero */}
        <header className="mb-10 space-y-4">
          <TextLabel>Case study</TextLabel>
          <h1 className={cn(pageTitle, gradientText)}>{CASE_STUDY_META.title}</h1>
          <p className={cn(titleSectionAccent, '!text-lg sm:!text-xl font-normal opacity-90')}>
            {CASE_STUDY_META.subtitle}
          </p>
          <p className={cn(bodySecondary, 'max-w-2xl leading-relaxed')}>
            A single product for fans, the band, and live visuals, designed, built, and documented in
            production code. Use this page for portfolio reviews; use the design system as technical
            appendix.
          </p>
        </header>

        {/* Sticky nav */}
        <nav
          aria-label="Case study sections"
          className="sticky top-[53px] z-20 -mx-4 mb-10 flex flex-wrap gap-1.5 border-b border-signal-purple/20 bg-void/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6"
        >
          {CASE_STUDY_NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-signal-purple-bright/80 transition-colors hover:bg-muted/50 hover:text-neon-green"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="space-y-8 pb-16">
          <SpecimenCard id="context" eyebrow="01" title="Context" description={CASE_STUDY.problem}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Constraints</p>
                <BulletList items={CASE_STUDY.constraints} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">System bets</p>
                <BulletList items={CASE_STUDY.systemBets} />
              </div>
            </div>
          </SpecimenCard>

          <SpecimenCard id="role" eyebrow="02" title={CASE_STUDY_ROLE.headline}>
            <BulletList items={CASE_STUDY_ROLE.bullets} />
          </SpecimenCard>

          <SpecimenCard
            id="decisions"
            eyebrow="03"
            title="Key decisions"
            description="Options considered, rejected, and why: the Principal-level thread."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {CASE_STUDY_DECISIONS.map((d) => (
                <DecisionCard key={d.id} {...d} />
              ))}
            </div>
          </SpecimenCard>

          <SpecimenCard
            id="system"
            eyebrow="04"
            title={`Visual system: ${DESIGN_INTENT.themeName}`}
            description={DESIGN_INTENT.themeDefinition}
          >
            <ul className="mb-6 space-y-2">
              {DESIGN_INTENT.principles.map((p) => (
                <li key={p} className={cn(bodySecondary, 'flex gap-2')}>
                  <span className="text-neon-green">·</span>
                  {p}
                </li>
              ))}
            </ul>

            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
              Experience modes
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {EXPERIENCE_MODES.map((mode) => (
                <div
                  key={mode.id}
                  className="rounded-lg border border-border/50 bg-muted/10 p-4"
                >
                  <p className="text-sm font-medium text-hot-pink-bright">{mode.name}</p>
                  <p className={cn(bodySecondary, 'mt-1 text-xs')}>{mode.summary}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-6 mb-3">
              Interaction roles
            </p>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20 text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Use</th>
                    <th className="px-3 py-2 font-medium hidden sm:table-cell">Avoid</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERACTION_RULES.map((row) => (
                    <tr key={row.rule} className="border-b border-border/30 last:border-0">
                      <td className="px-3 py-2.5 font-medium text-neon-green whitespace-nowrap">
                        {row.rule}
                      </td>
                      <td className="px-3 py-2.5 text-foreground/80">{row.use}</td>
                      <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">
                        {row.avoid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Button variant="brand" size="sm" asChild>
                <a href={CASE_STUDY_META.designSystemPath} target="_blank" rel="noopener noreferrer">
                  Open full design system appendix
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
          </SpecimenCard>

          <SpecimenCard
            id="constraints"
            eyebrow="05"
            title="Design under constraint"
            description="Judgment calls where the art and the engine fight the UI."
          >
            <div className="space-y-4">
              {CASE_STUDY_CONSTRAINTS.map((c) => (
                <div key={c.title}>
                  <h3 className="text-sm font-medium text-foreground">{c.title}</h3>
                  <p className={cn(bodySecondary, 'mt-1')}>{c.detail}</p>
                </div>
              ))}
            </div>
          </SpecimenCard>

          <SpecimenCard id="ai" eyebrow="06" title={CASE_STUDY_AI.headline}>
            <p className={cn(body, 'mb-4 font-medium text-signal-purple-bright/90')}>
              {CASE_STUDY_AI.principle}
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-neon-green mb-2">What worked</p>
                <BulletList items={CASE_STUDY_AI.wins} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-hot-pink/90 mb-2">
                  What we rejected
                </p>
                <BulletList items={CASE_STUDY_AI.failures} />
              </div>
            </div>
          </SpecimenCard>

          <SpecimenCard id="outcomes" eyebrow="07" title="Outcomes">
            <BulletList items={CASE_STUDY_OUTCOMES} />
            <div
              className={cn(
                'mt-6 flex flex-wrap gap-3 rounded-xl border border-signal-purple/30 bg-muted/10 p-4',
                shadow.card
              )}
            >
              <Button asChild>
                <a href={CASE_STUDY_META.liveUrl} target="_blank" rel="noopener noreferrer">
                  View live site
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={CASE_STUDY_META.stagePath} target="_blank" rel="noopener noreferrer">
                  Stage mode
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
          </SpecimenCard>

          <SpecimenCard id="reflection" eyebrow="08" title={CASE_STUDY_REFLECTION.headline}>
            <BulletList items={CASE_STUDY_REFLECTION.items} />
            <p className={cn(bodySecondary, 'mt-6 border-t border-border/40 pt-4 italic')}>
              {CASE_STUDY_REFLECTION.directorNote}
            </p>
          </SpecimenCard>
        </div>
      </main>
    </div>
  );
}
