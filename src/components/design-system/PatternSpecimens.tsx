import { Eye, EyeOff, MapPin, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { EditTriggerButton } from '../EditableSection';
import {
  editorChromeButtonClass,
  editorDestructiveGhostClass,
  editorIndexBadgeClass,
  editorRowCardClass,
  editorSectionLabelClass,
} from '../../lib/editorStyles';
import { EditorCallout } from '../editor/EditorCallout';
import { Slider } from '../ui/slider';
import { DescentToggleButton } from '../DescentModeToggle';
import { TextLabel } from '../TextLabel';
import { SectionHeader } from '../SectionHeader';
import { MemberTag } from '../MemberTag';
import { TourDateStub } from '../TourDateStub';
import { TourStatusBadge } from '../TourStatusBadge';
import { TourTicketCard } from '../TourTicketCard';
import { SectionNavButton } from '../SectionNavButton';
import { SectionNavRailDot } from '../SectionNavRailDot';
import { MiniPlayerSpecimen } from './MiniPlayerSpecimen';
import { cardTitle, caption, heading, lead, vizCardName } from '../../lib/typography';
import { onDark, overlay, shadow as shadowColors, border as borderTokens } from '../../lib/colors';
import type { SiteContent } from '../../contexts/EditModeContext';
import { OverlayChromeButton } from '../OverlayChromeButton';
import { brandLightboxCaptionClass } from '../../lib/brandClasses';
import {
  brandMenuItemDestructiveClass,
  brandMenuItemSuccessClass,
} from '../../lib/brandClasses';

const DEMO_TOUR_SHOW: SiteContent['tour']['dates'][number] = {
  id: 'ds-demo',
  date: '2026-03-14',
  venue: 'The Crystal Ballroom',
  city: 'Portland, OR',
  ticketUrl: 'https://example.com',
  status: 'upcoming',
};

export function PatternFrame({
  where,
  description,
  children,
  className,
}: {
  where: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-signal-purple/25 bg-card/95 overflow-hidden',
        className
      )}
    >
      <div className="border-b border-signal-purple/15 bg-muted/30 px-4 py-2.5">
        <p className="text-xs font-medium text-neon-green">{where}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function AtomsSpecimens() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PatternFrame where="Atom · eyebrow" description="TextLabel: section eyebrows, viz index">
        <TextLabel>Gallery</TextLabel>
        <TextLabel as="span" className="mt-3 block font-medium">
          Viz 3
        </TextLabel>
      </PatternFrame>

      <PatternFrame where="Atom · date stub" description="TourDateStub: ticket column parts">
        <TourDateStub date="2026-03-14" className="w-20 rounded-lg py-3" />
      </PatternFrame>

      <PatternFrame where="Atom · status pill" description="TourStatusBadge: ticket sale state">
        <div className="flex flex-wrap gap-2">
          <TourStatusBadge status="upcoming" size="sm" />
          <TourStatusBadge status="selling_fast" size="sm" />
          <TourStatusBadge status="sold_out" size="sm" />
        </div>
      </PatternFrame>

      <PatternFrame where="Atom · member tag" description="About lineup pill">
        <ul className="flex flex-wrap gap-2">
          <MemberTag name="Alex" role="vocals" />
        </ul>
      </PatternFrame>

      <PatternFrame where="Atom · meta caption" description="caption token: tour city, album year">
        <p className={caption}>Mar 2026 · Portland</p>
      </PatternFrame>

      <PatternFrame where="Atom · form field" description="Label + Input: newsletter, CMS dialogs">
        <div className="max-w-xs space-y-2">
          <Label htmlFor="atom-email">Email</Label>
          <Input id="atom-email" placeholder="you@example.com" />
        </div>
      </PatternFrame>

      <PatternFrame where="Atom · mobile nav item" description="SectionNavButton: bottom bar labels (lg hidden)">
        <div className="flex gap-1 rounded-lg border border-signal-purple/30 bg-void/95 p-1 max-w-xs">
          <SectionNavButton className="flex-1">About</SectionNavButton>
          <SectionNavButton isActive className="flex-1">
            Listen
          </SectionNavButton>
          <SectionNavButton className="flex-1">Tour</SectionNavButton>
        </div>
      </PatternFrame>

      <PatternFrame
        where="Atom · desktop rail dot"
        description="SectionNavRailDot: fixed right rail, scroll-spy (lg+)"
      >
        <div className="flex items-start gap-6">
          <nav
            aria-label="Section rail demo"
            className="flex flex-col items-center gap-2.5 rounded-xl border border-signal-purple/25 bg-void/60 px-3 py-4"
          >
            {(['Top', 'About', 'Listen', 'Gallery', 'Tour'] as const).map((label, i) => (
              <SectionNavRailDot key={label} label={label} isActive={i === 2} />
            ))}
          </nav>
          <div className="text-[11px] text-muted-foreground space-y-1.5 max-w-[10rem] pt-1">
            <p>
              <span className="text-neon-green font-medium">Active:</span> green fill + glow
            </p>
            <p>
              <span className="text-signal-purple-bright font-medium">Rest:</span> purple dot, grows on hover
            </p>
            <p>Tooltip shows section name. Hidden in Descend, fullscreen, and hero stage.</p>
          </div>
        </div>
      </PatternFrame>

      <PatternFrame where="Atom · venue pin" description="hot-pink MapPin accent on tour rows">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-hot-pink" aria-hidden />
          <p className={cn(heading, 'text-base')}>The Crystal Ballroom</p>
        </div>
      </PatternFrame>
    </div>
  );
}

export function MoleculesSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PatternFrame
        where="Molecule · descend toggle"
        description="brandControlClass rest, brandToggleActiveClass on"
      >
        <div className="flex flex-wrap items-center gap-3">
          <DescentToggleButton isDescentMode={false} onClick={() => {}} />
          <DescentToggleButton isDescentMode onClick={() => {}} />
        </div>
      </PatternFrame>

      <PatternFrame
        where="Molecule · slider row"
        description="Glass control strip: volume / viz sensitivity"
      >
        <div className="flex items-center gap-2 rounded-lg bg-background/40 px-3 py-2 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground shrink-0">Vol</span>
          <Slider value={[65]} max={100} className="flex-1 cursor-default" aria-label="Volume demo" />
        </div>
      </PatternFrame>

      <PatternFrame
        where="Molecule · section navigation"
        description="SectionNavRail (desktop dots) + SectionNavMobile (bottom labels), same scroll-spy language"
        className="lg:col-span-2"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
              Desktop · lg+
            </p>
            <div className="relative min-h-[12rem] rounded-xl border border-dashed border-signal-purple/30 bg-muted/10">
              <nav
                aria-label="Desktop section rail"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5"
              >
                {(['Top', 'About', 'Listen', 'Gallery'] as const).map((label, i) => (
                  <SectionNavRailDot key={label} label={label} isActive={i === 2} />
                ))}
              </nav>
              <p className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground max-w-[8rem]">
                Fixed right rail. Component: SectionNavRail
              </p>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
              Mobile · below lg
            </p>
            <div className="rounded-xl border border-signal-purple/30 bg-void/95 p-1">
              <div className="flex gap-1">
                {['Top', 'About', 'Listen', 'Tour'].map((item, i) => (
                  <SectionNavButton key={item} isActive={i === 2} className="flex-1">
                    {item}
                  </SectionNavButton>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Component: SectionNavMobile</p>
          </div>
        </div>
      </PatternFrame>

      <PatternFrame
        where="Molecule · tour list stack"
        description="space-y-4 vertical rhythm, TourSection"
        className="lg:col-span-2"
      >
        <div className="space-y-4 max-w-lg">
          <TourTicketCard show={DEMO_TOUR_SHOW} />
          <TourTicketCard
            show={{
              ...DEMO_TOUR_SHOW,
              id: 'ds-demo-2',
              date: '2026-04-02',
              venue: 'Neptune Theater',
              city: 'Seattle, WA',
              status: 'selling_fast',
            }}
          />
        </div>
      </PatternFrame>
    </div>
  );
}

export function OrganismsSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PatternFrame
        where="Organism · section header"
        description="Eyebrow + gradient H1 + subtitle"
      >
        <SectionHeader
          eyebrow="Gallery"
          title="Visuals"
          subtitle="Twenty ways to see the signal"
          animate={false}
        />
      </PatternFrame>

      <PatternFrame
        where="Organism · about block"
        description="Editorial H1 + lead + member list"
      >
        <SectionHeader
          eyebrow="About"
          title="The Journey"
          layout="editorial"
          size="editorial"
          animate={false}
        />
        <p className={cn(lead, 'mt-4')}>Sound from the void.</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          <MemberTag name="Alex" role="vocals" />
        </ul>
      </PatternFrame>

      <PatternFrame
        where="Organism · viz grid card"
        description="Index label + Syne name, purple border → green hover"
      >
        <div
          className={cn(
            'group relative max-w-[11rem] aspect-[4/3] overflow-hidden rounded-xl',
            'border border-signal-purple/40 bg-void',
            shadowColors.card,
            borderTokens.brandHover
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-signal-purple-muted to-neon-green-subtle opacity-80" />
          <div className="relative flex h-full flex-col justify-end p-3">
            <TextLabel as="span" className="mb-0.5 font-medium">
              Viz 3
            </TextLabel>
            <span className={vizCardName}>Lite Brite Magic</span>
          </div>
        </div>
      </PatternFrame>

      <PatternFrame where="Organism · ticket stub" description="TourTicketCard production component">
        <TourTicketCard show={DEMO_TOUR_SHOW} />
      </PatternFrame>

      <PatternFrame
        where="Organism · mini player"
        description="Primary transport: hero dock on viz, chrome dock in header / bottom bar"
        className="lg:col-span-2"
      >
        <MiniPlayerSpecimen />
      </PatternFrame>

      <PatternFrame
        where="Organism · album card"
        description="Art + H3 title + caption meta"
        className="lg:col-span-2"
      >
        <div className="group flex max-w-xs gap-4 items-center">
          <div
            className={cn(
              'size-16 shrink-0 rounded-lg bg-gradient-to-br from-signal-purple-muted to-neon-green-subtle',
              'border border-border'
            )}
          />
          <div>
            <p className={cardTitle}>Chronicles Vol. I</p>
            <p className={cn(caption, 'mt-1')}>2024 · 8 tracks</p>
          </div>
        </div>
      </PatternFrame>
    </div>
  );
}

export function OverlaySpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PatternFrame
        where="Overlay · scrim"
        description="void-scrim on modals and dialogs, brandOverlayScrimClass"
      >
        <div className="relative h-36 rounded-lg overflow-hidden border border-border/40">
          <div
            className="absolute inset-0 bg-gradient-to-br from-signal-purple-muted via-void to-neon-green-subtle"
            aria-hidden
          />
          <div className={cn('absolute inset-0', overlay.scrim)} aria-hidden />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
            <p className={cn('text-sm font-medium', onDark.heading)}>Dialog on scrim</p>
            <p className={cn('text-xs', onDark.secondary)}>50% void mix. Content stays readable on top</p>
          </div>
        </div>
      </PatternFrame>

      <PatternFrame
        where="Overlay · chrome button"
        description="OverlayChromeButton: gallery lightbox close / prev / next"
      >
        <div
          className={cn(
            'relative flex items-center justify-center gap-3 rounded-lg p-6',
            'bg-gradient-to-br from-signal-purple/30 to-void border border-border/40'
          )}
        >
          <OverlayChromeButton size="md" aria-label="Close">
            <Edit2 className="w-5 h-5" />
          </OverlayChromeButton>
          <OverlayChromeButton size="lg" aria-label="Next">
            <MapPin className="w-6 h-6" />
          </OverlayChromeButton>
        </div>
      </PatternFrame>

      <PatternFrame
        where="Overlay · lightbox surface"
        description="overlay.panel + border at gallery scale (production uses 98vh via brandLightboxSurfaceClass)"
        className="lg:col-span-2"
      >
        <div
          className={cn(
            'relative mx-auto flex max-w-md flex-col overflow-hidden rounded-xl border',
            overlay.panel,
            borderTokens.brandSoft,
            'min-h-[12rem]'
          )}
        >
          <div
            className="flex-1 min-h-[9rem] bg-gradient-to-br from-signal-purple-muted via-void to-neon-green-subtle"
            aria-hidden
          />
          <div className="flex justify-center border-t border-signal-purple/20 p-4">
            <span className={brandLightboxCaptionClass}>Neon Tunnel · Portland 2026</span>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Full-screen dialog applies{' '}
          <code className="text-signal-purple-bright">brandLightboxSurfaceClass</code> (98vw × 98vh) in
          PhotoGallery. Not inlined here.
        </p>
      </PatternFrame>

      <PatternFrame
        where="On dark · type ramp"
        description="onDark.* tokens for player, stage, lightbox copy"
        className="lg:col-span-2"
      >
        <div
          className={cn(
            'rounded-lg border border-signal-purple/25 p-4 space-y-1',
            'bg-gradient-to-b from-void via-signal-purple/15 to-void'
          )}
        >
          <p className={onDark.heading}>Heading on viz</p>
          <p className={onDark.body}>Body on viz</p>
          <p className={onDark.secondary}>Secondary meta</p>
          <p className={onDark.muted}>Muted caption</p>
          <p className={onDark.faint}>Faint hint</p>
          <p className={onDark.accent}>Accent link</p>
        </div>
      </PatternFrame>
    </div>
  );
}

export function CmsSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PatternFrame
        where="CMS · section edit chrome"
        description="EditableSection: visibility toggle + section label pill"
      >
        <div className="relative min-h-[5rem] rounded-lg border border-dashed border-signal-purple/30 bg-muted/20">
          <div className="absolute top-3 right-3 flex gap-2">
            <Button variant="secondary" size="sm" className={editorChromeButtonClass}>
              <Eye className="h-4 w-4 mr-2" />
              Visible
            </Button>
            <div className={editorSectionLabelClass}>Gallery</div>
          </div>
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Section content area
          </p>
        </div>
        <div className="mt-3 relative min-h-[4rem] rounded-lg border border-dashed border-signal-purple/20 bg-muted/10 opacity-60">
          <div className="absolute top-3 right-3 flex gap-2">
            <Button variant="secondary" size="sm" className={editorChromeButtonClass}>
              <EyeOff className="h-4 w-4 mr-2" />
              Hidden
            </Button>
            <div className={editorSectionLabelClass}>Tour</div>
          </div>
        </div>
      </PatternFrame>

      <PatternFrame
        where="CMS · overflow menu rows"
        description="Publish (green) and discard (destructive) menu items"
      >
        <div className="max-w-xs rounded-lg border border-border bg-card p-1 shadow-card">
          <button type="button" className={cn('w-full rounded-md px-2 py-1.5 text-sm text-left', brandMenuItemSuccessClass)}>
            Publish changes
          </button>
          <button
            type="button"
            className={cn('w-full rounded-md px-2 py-1.5 text-sm text-left', brandMenuItemDestructiveClass)}
          >
            Discard draft
          </button>
        </div>
      </PatternFrame>

      <PatternFrame
        where="CMS · edit dialog trigger"
        description="EditTriggerButton: editorChromeButtonClass on section chrome"
        className="lg:col-span-2"
      >
        <EditTriggerButton>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </EditTriggerButton>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Opens section-specific dialog: gallery tab reorder, tour rows, player tracks, etc.
        </p>
      </PatternFrame>

      <PatternFrame
        where="CMS · dialog patterns"
        description="Row cards, index badges, callouts, destructive remove"
      >
        <div className={editorRowCardClass}>
          <div className="flex items-center justify-between gap-2">
            <span className={editorIndexBadgeClass}>Viz 3</span>
            <span className="text-sm truncate">Neon Tunnel · 4:12</span>
            <Button variant="ghost" size="sm" className={editorDestructiveGhostClass}>
              Remove
            </Button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <EditorCallout variant="info">Info callout</EditorCallout>
          <EditorCallout variant="success">Success callout</EditorCallout>
          <EditorCallout variant="error">Error callout</EditorCallout>
        </div>
      </PatternFrame>
    </div>
  );
}
