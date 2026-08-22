/**
 * Design system registry: production vs foundation splits for artifact page.
 */
import * as typography from './typography';
import { ambientClass, border, gradient, interactive, onDark, overlay, shadow, surface, text } from './colors';
import {
  brandInputClass,
  brandLightboxCaptionClass,
  brandLightboxSurfaceClass,
  brandOverlayChromeButtonClass,
  brandOverlayScrimClass,
  brandSliderRangeClass,
  brandSliderThumbClass,
  sectionNavRailDotActiveClass,
  sectionNavRailDotRestClass,
  brandActiveAccentClass,
  brandControlClass,
  brandHoverInteractiveClass,
  brandIconButtonClass,
  brandMenuItemDestructiveClass,
  brandMenuItemSuccessClass,
  brandPrimaryButtonClass,
  brandSectionWashClass,
  brandSpinnerClass,
  brandTabListClass,
  brandTabTriggerClass,
  brandToggleActiveClass,
  brandVizSurfaceClass,
} from './brandClasses';
import { miniPlayerChipWidthClass } from './miniPlayerStyles';
import { motion, spacing, zIndex } from './layoutTokens';
import {
  editorChromeButtonClass,
  editorDestructiveGhostClass,
  editorIndexBadgeClass,
  editorRowCardClass,
} from './editorStyles';

export const DESIGN_SYSTEM_SOURCE_FILES = [
  'src/styles/globals.css',
  'src/lib/colors.ts',
  'src/lib/typography.ts',
  'src/lib/brandClasses.ts',
  'src/lib/editorStyles.ts',
  'src/lib/layoutTokens.ts',
  'src/components/OverlayChromeButton.tsx',
  'src/components/TextLabel.tsx',
  'src/components/TourStatusBadge.tsx',
  'src/components/TourDateStub.tsx',
  'src/components/SectionNavRailDot.tsx',
  'src/components/ui/button.tsx',
] as const;

export const DESIGN_INTENT = {
  product:
    'Music-first band site: fullscreen viz, editorial About, tour tickets, and gallery.',
  themeName: 'Cosmic Signal',
  themeDefinition:
    'Cosmic Signal is flACID’s visual language: void depth, purple signal, neon green life, and gradient voice on a music-driven canvas.',
  principles: [
    'Void base: depth without flat gray',
    'Syne (display) + Instrument Sans (body). See TYPE_FONTS: fluid clamp scale in globals.css',
    'Purple at rest → green on hover: one interactive language',
    'Gradient reserved for Gallery title + footer wordmark; other section titles use pink accent',
  ],
} as const;

/** Font stacks loaded in index.html and referenced via CSS variables */
export const TYPE_FONTS = [
  {
    role: 'Display',
    family: 'Syne',
    cssVar: '--font-hero',
    utility: 'font-hero',
    weights: '400, 500, 600',
    source: 'Google Fonts',
    use: 'Section titles, headings, viz card names, ticket numerals',
  },
  {
    role: 'Body & UI',
    family: 'Instrument Sans',
    cssVar: '--font-body',
    utility: 'font-body',
    weights: '400, 500, 600',
    source: 'Google Fonts',
    use: 'About prose, captions, subtitles, player artist/album lines',
  },
] as const;

/** Case-study framing for reviewers and portfolio readers */
export const CASE_STUDY = {
  problem:
    'flACID needed a single site that works as a fan destination, a self-serve CMS for the band, and a live visual instrument for shows, without three separate products.',
  constraints: [
    'Readable UI over EQ-reactive visualization and busy hero art',
    'Band edits tour, gallery, tracks, and copy without a developer',
    'Performance on mobile; Descent and Stage tuned for desktop / venue setups',
    'One interaction language across player, nav, gallery, and CMS',
  ],
  systemBets: [
    'Semantic tokens (colors.ts → brandClasses.ts) instead of ad-hoc Tailwind per screen',
    'Three interaction roles: CTA fill, nav active, control rest, enforced site-wide',
    'Experience modes with explicit chrome visibility and z-index stacking',
    'Live specimens in this doc, pulled from production components',
  ],
  shipped: [
    'Public band site with hero-stage playback, discography track lists, and 20 audio-reactive visualizations',
    'Descent Mode (desktop psychedelic overlay) and Stage Mode (/stage) for venues',
    'Authenticated edit workflow with draft/publish and section visibility',
    'This design system: reviewer path + Foundation token reference',
  ],
} as const;

/** How the product changes between experience layers */
export const EXPERIENCE_MODES = [
  {
    id: 'browse',
    name: 'Browse',
    summary: 'Scroll the site: hero viz, About, tour, gallery.',
    chrome: 'Header, section nav, mini player in the header once you leave the hero.',
  },
  {
    id: 'hero-stage',
    name: 'Hero stage',
    summary: 'Playback on the visualizer. The dock sits on the viz, not in the header.',
    chrome: 'Logo hides. Track rows in Discography play here.',
  },
  {
    id: 'descent',
    name: 'Descent',
    summary: 'Desktop psychedelic layer, synced to the music.',
    chrome: 'Most chrome hides. Toggle uses green (nav active), not the CTA fill.',
  },
  {
    id: 'stage',
    name: 'Stage',
    summary: 'Venue projection from mic or line-in, at /stage.',
    chrome: 'Separate control surface and projection surface.',
  },
] as const;

export const RESPONSIVE_BEHAVIOR = [
  {
    pattern: 'Section navigation',
    mobile: 'Labeled bar at the bottom.',
    desktop: 'Dots on the right edge, labels from the CMS.',
    hidden: 'Descent, or while the hero is in view.',
  },
  {
    pattern: 'Mini player',
    mobile: 'Full-width strip above the section bar.',
    desktop: 'Chip in the header after the hero; dock on the viz in hero stage.',
    hidden: 'Header chip and hero dock never together.',
  },
  {
    pattern: 'Descend',
    mobile: 'Hidden on phones.',
    desktop: 'Overflow menu, and in the header when supported.',
    hidden: 'N/A',
  },
] as const;

export const ACCESSIBILITY_NOTES = [
  {
    topic: 'CTA contrast',
    detail: 'Primary CTA uses darkened fuchsia (#a21caf) for WCAG AA with white foreground. See globals.css --primary.',
  },
  {
    topic: 'Focus rings',
    detail: 'Interactive controls use neon-green focus-visible rings (tabs, toggles, overlay chrome, branded inputs).',
  },
  {
    topic: 'On-dark copy',
    detail: 'onDark.* tokens keep hierarchy on viz, lightbox, and fullscreen player (white/90 → white/45).',
  },
  {
    topic: 'Motion',
    detail: 'globals.css collapses animation/transition duration when prefers-reduced-motion: reduce. Descent effects respect the same cascade.',
  },
  {
    topic: 'Touch targets',
    detail: 'Overlay chrome buttons min 44×44px; section nav buttons sized for thumb reach on mobile bar.',
  },
] as const;

export const MOTION_POLICY = {
  summary: 'Hovers and tabs use 300ms. Logo stutter and Descent are decorative.',
  tokens: [
    { name: 'motion.fast', use: 'Small state changes' },
    { name: 'motion.base', use: 'Hover, tabs, buttons' },
    { name: 'motion.slow', use: 'Section entrances' },
  ],
  reducedMotion: 'Decorative motion turns off when the OS asks for reduced motion.',
} as const;

/** When to use which interactive language */
export const INTERACTION_RULES = [
  {
    rule: 'Primary CTA fill',
    token: 'primary / default button',
    use: 'Play, tickets, newsletter. One per view.',
    avoid: 'Tabs, sliders, nav, Descend on',
  },
  {
    rule: 'Nav active',
    token: 'neon-green + purple wash',
    use: 'Tabs, section nav, Descend on',
    avoid: 'Solid primary fill',
  },
  {
    rule: 'Control rest',
    token: 'signal-purple-bright',
    use: 'Ghost buttons, menus, links',
    avoid: 'Gray as the default interactive color',
  },
] as const;

export const PRODUCTION_NAV = [
  { id: 'color', label: 'Color' },
  { id: 'type-ramp', label: 'Typography' },
  { id: 'interaction', label: 'Interaction' },
  { id: 'experience-modes', label: 'Experience' },
  { id: 'motion-layout', label: 'Motion' },
  { id: 'playback', label: 'Playback' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'tour', label: 'Tour' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'overlays', label: 'Overlays' },
] as const;

export const FOUNDATION_NAV = [
  { id: 'foundation-cms', label: 'CMS' },
  { id: 'foundation-color', label: 'Colors' },
  { id: 'foundation-type', label: 'Type' },
  { id: 'foundation-tokens', label: 'Tokens' },
  { id: 'foundation-classes', label: 'Classes' },
  { id: 'source', label: 'Source' },
] as const;

/** Hierarchy a reviewer needs. Niche tokens live in Foundation. */
export const TYPE_RAMP_HIERARCHY = [
  {
    level: 'Wordmark',
    token: 'displayWordmark',
    classes: typography.displayWordmark,
    sample: 'flACID',
    where: 'Footer',
  },
  {
    level: 'H1',
    token: 'titleSectionAccent',
    classes: typography.titleSectionAccent,
    sample: 'Discography',
    where: 'Section titles. Gallery uses the gradient instead.',
  },
  {
    level: 'H2',
    token: 'heading',
    classes: typography.heading,
    sample: 'Neon Tunnel',
    where: 'Modals, venue names',
  },
  {
    level: 'H3',
    token: 'cardTitle',
    classes: typography.cardTitle,
    sample: 'Chronicles Vol. I',
    where: 'Album cards',
  },
  {
    level: 'H4',
    token: 'subheading',
    classes: typography.subheading,
    sample: 'Connect',
    where: 'Footer columns',
  },
  {
    level: 'Label',
    token: 'label',
    classes: typography.label,
    sample: 'GALLERY',
    where: 'Eyebrows',
  },
  {
    level: 'Lead',
    token: 'lead',
    classes: typography.lead,
    sample: 'Sound from the void.',
    where: 'About intro',
  },
  {
    level: 'Body',
    token: 'body',
    classes: typography.body,
    sample: 'Editorial body for the band story.',
    where: 'About',
  },
  {
    level: 'Caption',
    token: 'caption',
    classes: typography.caption,
    sample: 'Mar 2026 · Portland',
    where: 'Dates, album year',
  },
] as const;

export const PRODUCTION_BRAND_COLORS = [
  { var: 'void', label: 'Void' },
  { var: 'signal-purple', label: 'Signal purple' },
  { var: 'signal-purple-bright', label: 'Purple bright' },
  { var: 'neon-green', label: 'Neon green' },
  { var: 'hot-pink', label: 'Hot pink' },
  { var: 'background', label: 'Background' },
  { var: 'foreground', label: 'Foreground' },
  { var: 'primary', label: 'CTA' },
] as const;

export const COLOR_ROLE_NOTES = [
  { role: 'Labels & nav active', token: 'neon-green', where: 'Eyebrows, section nav, tabs, Descend on' },
  { role: 'Interactive rest', token: 'signal-purple-bright', where: 'Header, player chrome, links' },
  { role: 'Interactive hover', token: 'neon-green', where: 'Buttons, menus, cards' },
  { role: 'CTAs', token: 'primary', where: 'Play, tickets, newsletter' },
  { role: 'Titles', token: 'hot-pink-bright', where: 'Section titles. Gallery uses the gradient.' },
  { role: 'Meta', token: 'muted-foreground', where: 'Dates, captions' },
] as const;

export const CTA_CONTRAST_NOTE =
  'Primary CTA is darkened fuchsia so white type meets contrast.';

export const FOUNDATION_COLOR_GROUPS = [
  {
    group: 'Derived fills',
    vars: [
      'signal-purple-subtle',
      'signal-purple-muted',
      'signal-purple-wash',
      'neon-green-subtle',
      'neon-green-muted',
      'success-muted',
    ],
  },
  {
    group: 'Glow sources',
    vars: ['signal-purple-glow', 'neon-green-glow', 'hot-pink-glow'],
  },
  {
    group: 'Extended brand',
    vars: ['neon-green-dim', 'hot-pink-bright', 'card', 'muted', 'destructive', 'success'],
  },
] as const;

type TypographyKey = keyof typeof typography;

const TYPOGRAPHY_META: Record<TypographyKey, { sample: string; role: string; production?: boolean }> = {
  gradientText: { sample: 'n/a', role: 'Brand gradient layer', production: false },
  displayWordmark: { sample: 'flACID', role: 'Footer wordmark', production: true },
  titleSection: { sample: 'Gallery', role: 'Section H1 base size', production: false },
  titleSectionAccent: { sample: 'Discography', role: 'Section H1, centered (default)', production: true },
  titleSectionGradient: { sample: 'Gallery', role: 'Gallery title only', production: false },
  titleEditorial: { sample: 'The Journey', role: 'Section H1 base, About', production: false },
  titleEditorialAccent: { sample: 'flACID', role: 'About title', production: false },
  titleEditorialGradient: { sample: 'The Journey', role: 'About title, gradient (rare)', production: false },
  heading: { sample: 'Neon Tunnel', role: 'H2, modals and tour venue', production: true },
  cardTitle: { sample: 'Album title', role: 'H3, discography cards', production: true },
  subheading: { sample: 'Connect', role: 'H4, footer columns', production: true },
  label: { sample: 'ABOUT', role: 'Eyebrows, viz index', production: true },
  dateWeekday: { sample: 'FRI', role: 'Ticket stub weekday', production: false },
  dateDay: { sample: '14', role: 'Ticket stub day', production: false },
  dateMonth: { sample: 'MAR', role: 'Ticket stub month', production: false },
  lead: { sample: 'Sound from the void.', role: 'About intro', production: true },
  body: { sample: 'Body copy for editorial sections.', role: 'About prose', production: true },
  bodySecondary: { sample: 'Subtitle under section titles.', role: 'Section subtitles', production: false },
  inlineSecondary: { sample: 'vocals', role: 'Member tag role', production: false },
  caption: { sample: 'Mar 2026 · Portland', role: 'Tour meta, album year', production: true },
  vizCardName: { sample: 'Lite Brite Magic', role: 'Visuals grid', production: false },
  vizCardHint: { sample: 'Preview', role: 'Viz card hover', production: false },
  miniPlayerTitle: { sample: 'Neon Tunnel', role: 'Mini player track title', production: false },
  miniPlayerTitleOnDark: { sample: 'Neon Tunnel', role: 'Mini player title on viz', production: false },
  miniPlayerMeta: { sample: 'Chronicles Vol. I', role: 'Mini player subtitle', production: false },
  miniPlayerMetaOnDark: { sample: 'Chronicles Vol. I', role: 'Mini player meta on viz', production: false },
  playerTrackTitle: { sample: 'Track title', role: 'Legacy player overlay, compact', production: false },
  playerTrackTitleLarge: { sample: 'Track title', role: 'Player overlay, fullscreen', production: false },
  playerArtist: { sample: 'flACID', role: 'Player artist, compact', production: false },
  playerArtistLarge: { sample: 'flACID', role: 'Player artist, fullscreen', production: false },
  playerAlbum: { sample: 'Album name', role: 'Player album, compact', production: false },
  playerAlbumLarge: { sample: 'Album name', role: 'Player album, fullscreen', production: false },
  pageTitle: { sample: 'Cosmic Signal', role: 'Design system page title', production: false },
  specimenTitle: { sample: 'Type ramp', role: 'DS specimen card heading', production: false },
};

export const PRODUCTION_TYPE_SCALE = (
  Object.keys(typography) as TypographyKey[]
)
  .filter((key) => TYPOGRAPHY_META[key].production)
  .map((key) => ({
    key,
    classes: typography[key],
    sample: TYPOGRAPHY_META[key].sample,
    role: TYPOGRAPHY_META[key].role,
  }));

export const FOUNDATION_TYPE_SCALE = (
  Object.keys(typography) as TypographyKey[]
)
  .filter((key) => !TYPOGRAPHY_META[key].production)
  .map((key) => ({
    key,
    classes: typography[key],
    sample: TYPOGRAPHY_META[key].sample,
    role: TYPOGRAPHY_META[key].role,
  }));

export const PRODUCTION_BUTTON_VARIANTS = ['default', 'brand', 'outline', 'ghost', 'link'] as const;
export const ADMIN_BUTTON_VARIANTS = ['secondary', 'destructive'] as const;

export const OVERLAY_PATTERNS = [
  { key: 'brandOverlayScrimClass', label: 'Modal scrim', classes: brandOverlayScrimClass },
  { key: 'brandLightboxSurfaceClass', label: 'Lightbox surface', classes: brandLightboxSurfaceClass },
  { key: 'brandOverlayChromeButtonClass', label: 'Overlay chrome btn', classes: brandOverlayChromeButtonClass },
  { key: 'brandLightboxCaptionClass', label: 'Lightbox caption', classes: brandLightboxCaptionClass },
] as const;

export const PRIMITIVE_PATTERNS = [
  { key: 'brandInputClass', label: 'Input focus', classes: brandInputClass },
  { key: 'brandSliderRangeClass', label: 'Slider fill', classes: brandSliderRangeClass },
  { key: 'brandSliderThumbClass', label: 'Slider thumb', classes: brandSliderThumbClass },
] as const;

export const LAYOUT_TOKENS = {
  motion: Object.entries(motion).map(([key, classes]) => ({ key, classes })),
  spacing: Object.entries(spacing).map(([key, classes]) => ({ key, classes })),
  zIndex: Object.entries(zIndex).map(([key, classes]) => ({ key, classes })),
} as const;

export const EDITOR_PATTERNS = [
  { key: 'editorChromeButtonClass', label: 'Chrome button', classes: editorChromeButtonClass },
  { key: 'editorRowCardClass', label: 'Dialog row card', classes: editorRowCardClass },
  { key: 'editorIndexBadgeClass', label: 'List index badge', classes: editorIndexBadgeClass },
  { key: 'editorDestructiveGhostClass', label: 'Remove action', classes: editorDestructiveGhostClass },
] as const;

export const PRODUCTION_PATTERNS = [
  {
    id: 'gallery',
    where: 'Gallery · section header',
    description: 'Gradient title (Gallery only), green eyebrow, muted subtitle',
  },
  {
    id: 'about',
    where: 'About · editorial',
    description: 'Smaller gradient title, lead + body, member tags',
  },
  {
    id: 'visuals',
    where: 'Gallery · Visuals tab',
    description: 'Viz index label, Syne name, purple border → green hover',
  },
  {
    id: 'tour',
    where: 'Tour · ticket stub',
    description: 'Date stub colors, status pills, ticket CTA',
  },
  {
    id: 'player',
    where: 'Hero · mini player',
    description: 'Chip transport on viz + header chrome: ghost skip, primary play, now playing panel',
  },
  {
    id: 'listen',
    where: 'Discography · album track rows',
    description: 'Play affordance when audio exists; title + duration; active track highlight; no scroll hijack',
  },
  {
    id: 'section-nav',
    where: 'Section navigation',
    description: 'Desktop: SectionNavRail dots + labels (right). Mobile: SectionNavMobile labeled bar (bottom). Green active, purple rest.',
  },
] as const;

export const PRODUCTION_ELEVATION = [
  { key: 'card', label: 'Cards & viz grid', classes: shadow.card },
  { key: 'glowGreenMd', label: 'Nav active · hover', classes: shadow.glowGreenSm },
  { key: 'glowPurpleLg', label: 'Primary CTA', classes: shadow.glowPurpleLg },
] as const;

export const PRODUCTION_GRADIENTS = [
  { key: 'brandText', label: 'Section titles', classes: gradient.brandText },
  { key: 'sectionWash', label: 'Section ambient', classes: gradient.sectionWash },
  { key: 'brandSurface', label: 'Viz / player surface', classes: gradient.brandSurface },
] as const;

export const SEMANTIC_COLOR_MAPS = {
  surface: Object.entries(surface).map(([key, classes]) => ({ key, classes })),
  overlay: Object.entries(overlay).map(([key, classes]) => ({ key, classes })),
  onDark: Object.entries(onDark).map(([key, classes]) => ({ key, classes })),
  border: Object.entries(border).map(([key, classes]) => ({ key, classes })),
  shadow: Object.entries(shadow).map(([key, classes]) => ({ key, classes })),
  gradient: Object.entries(gradient).map(([key, classes]) => ({ key, classes })),
  interactive: Object.entries(interactive).map(([key, classes]) => ({ key, classes })),
  text: Object.entries(text).map(([key, classes]) => ({ key, classes })),
  ambient: Object.entries(ambientClass).map(([key, classes]) => ({ key, classes })),
} as const;

export const BRAND_PATTERNS = [
  { key: 'brandTabListClass', label: 'Tab bar', classes: brandTabListClass },
  { key: 'brandTabTriggerClass', label: 'Tab trigger', classes: brandTabTriggerClass },
  { key: 'sectionNavRailDotActiveClass', label: 'Rail dot active', classes: sectionNavRailDotActiveClass },
  { key: 'sectionNavRailDotRestClass', label: 'Rail dot rest', classes: sectionNavRailDotRestClass },
  { key: 'brandToggleActiveClass', label: 'Toggle on', classes: brandToggleActiveClass },
  { key: 'miniPlayerChipWidthClass', label: 'Mini player width', classes: miniPlayerChipWidthClass },
  { key: 'brandPrimaryButtonClass', label: 'Primary CTA', classes: brandPrimaryButtonClass },
  { key: 'brandControlClass', label: 'Glass control', classes: brandControlClass },
  { key: 'brandHoverInteractiveClass', label: 'Interactive hover', classes: brandHoverInteractiveClass },
  { key: 'brandIconButtonClass', label: 'Icon button', classes: brandIconButtonClass },
  { key: 'brandMenuItemSuccessClass', label: 'Menu publish', classes: brandMenuItemSuccessClass },
  { key: 'brandMenuItemDestructiveClass', label: 'Menu discard', classes: brandMenuItemDestructiveClass },
  { key: 'brandVizSurfaceClass', label: 'Viz surface', classes: brandVizSurfaceClass },
  { key: 'brandSectionWashClass', label: 'Section wash', classes: brandSectionWashClass },
  { key: 'brandSpinnerClass', label: 'Spinner', classes: brandSpinnerClass },
  { key: 'brandActiveAccentClass', label: 'AirPlay active', classes: brandActiveAccentClass },
] as const;

export const RADIUS_TOKENS = [
  { var: 'radius', label: 'Base', tailwind: 'rounded-lg' },
  { var: 'radius-md', label: 'Medium', tailwind: 'rounded-md' },
  { var: 'radius-xl', label: 'XL', tailwind: 'rounded-xl' },
] as const;
