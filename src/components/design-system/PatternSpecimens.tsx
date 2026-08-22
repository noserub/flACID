import type { ReactNode } from 'react';
import { Eye, EyeOff, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
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
import { TextLabel } from '../TextLabel';
import { SectionHeader } from '../SectionHeader';
import { MemberTag } from '../MemberTag';
import { TourTicketCard } from '../TourTicketCard';
import { SectionNavButton } from '../SectionNavButton';
import { SectionNavRailDot } from '../SectionNavRailDot';
import { TabBarSpecimen } from './TabBarSpecimen';
import { cardTitle, caption, lead, vizCardName } from '../../lib/typography';
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

function PatternFrame({
  where,
  children,
  className,
}: {
  where: string;
  children: ReactNode;
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
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function NavigationSpecimens() {
  return (
    <div className="space-y-4">
      <PatternFrame where="Section nav">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">Desktop</p>
            <div className="relative min-h-[12rem] rounded-xl border border-dashed border-signal-purple/30 bg-muted/10">
              <nav
                aria-label="Desktop section rail"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-stretch gap-0.5 py-2 pl-2"
              >
                {(['Home', 'About', 'Listen', 'Gallery'] as const).map((navLabel, i) => (
                  <SectionNavRailDot key={navLabel} label={navLabel} isActive={i === 2} />
                ))}
              </nav>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">Mobile</p>
            <div className="rounded-xl border border-signal-purple/30 bg-void/95 p-1">
              <div className="flex gap-1">
                {['Home', 'About', 'Listen', 'Tour'].map((item, i) => (
                  <SectionNavButton key={item} isActive={i === 2} className="flex-1">
                    {item}
                  </SectionNavButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PatternFrame>

      <TabBarSpecimen />
    </div>
  );
}

export function EditorialSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PatternFrame where="About">
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

      <PatternFrame where="Album">
        <div className="flex max-w-xs gap-4 items-center">
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

export function TourSpecimens() {
  return (
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
  );
}

export function GallerySpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PatternFrame where="Section header">
        <SectionHeader
          eyebrow="Gallery"
          title="Visuals"
          subtitle="Twenty ways to see the signal"
          animate={false}
        />
      </PatternFrame>

      <PatternFrame where="Viz card">
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
    </div>
  );
}

export function OverlaySpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PatternFrame where="Scrim">
        <div className="relative h-36 rounded-lg overflow-hidden border border-border/40">
          <div
            className="absolute inset-0 bg-gradient-to-br from-signal-purple-muted via-void to-neon-green-subtle"
            aria-hidden
          />
          <div className={cn('absolute inset-0', overlay.scrim)} aria-hidden />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
            <p className={cn('text-sm font-medium', onDark.heading)}>Dialog on scrim</p>
            <p className={cn('text-xs', onDark.secondary)}>Copy stays readable</p>
          </div>
        </div>
      </PatternFrame>

      <PatternFrame where="Chrome button">
        <div
          className={cn(
            'relative flex items-center justify-center gap-3 rounded-lg p-6',
            'bg-gradient-to-br from-signal-purple/30 to-void border border-border/40'
          )}
        >
          <OverlayChromeButton size="md" aria-label="Close">
            <Edit2 className="w-5 h-5" />
          </OverlayChromeButton>
        </div>
      </PatternFrame>

      <PatternFrame where="Lightbox" className="lg:col-span-2">
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
      </PatternFrame>

      <PatternFrame where="On dark" className="lg:col-span-2">
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
        </div>
      </PatternFrame>
    </div>
  );
}

export function CmsSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PatternFrame where="Section chrome">
        <div className="relative min-h-[5rem] rounded-lg border border-dashed border-signal-purple/30 bg-muted/20">
          <div className="absolute top-3 right-3 flex gap-2">
            <Button variant="secondary" size="sm" className={editorChromeButtonClass}>
              <Eye className="h-4 w-4 mr-2" />
              Visible
            </Button>
            <div className={editorSectionLabelClass}>Gallery</div>
          </div>
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

      <PatternFrame where="Publish menu">
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

      <PatternFrame where="Edit trigger">
        <EditTriggerButton>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </EditTriggerButton>
      </PatternFrame>

      <PatternFrame where="Dialog row">
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
          <EditorCallout variant="info">Info</EditorCallout>
          <EditorCallout variant="success">Success</EditorCallout>
          <EditorCallout variant="error">Error</EditorCallout>
        </div>
      </PatternFrame>
    </div>
  );
}
