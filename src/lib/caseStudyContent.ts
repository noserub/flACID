/**
 * Portfolio case study narrative: Principal / Director product design + AI builder framing.
 * Live page: /case-study
 */
import { CASE_STUDY, DESIGN_INTENT, EXPERIENCE_MODES, INTERACTION_RULES } from './designSystemRegistry';

export { CASE_STUDY, DESIGN_INTENT, EXPERIENCE_MODES };

export const CASE_STUDY_META = {
  title: 'flACID: Fan platform, visual instrument, and CMS in one system',
  subtitle: 'Product design + build · Cosmic Signal design system',
  liveUrl: 'https://flacid.vercel.app',
  designSystemPath: '/design-system',
  stagePath: '/stage',
} as const;

export const CASE_STUDY_ROLE = {
  headline: 'End-to-end product owner',
  bullets: [
    'Problem framing, IA, visual system, interaction design, and production implementation',
    'Design system encoded in code (tokens → brandClasses → live specimens)',
    'AI-assisted asset pipeline with human-owned layout, hierarchy, and quality bar',
  ],
} as const;

export const CASE_STUDY_DECISIONS = [
  {
    id: 'hero-first',
    title: 'Hero-first playback',
    chosen:
      'The hero is the primary listening surface: poster when idle, full visualizer when playing. Discography plays in place; only explicit “Listen now” and viz showcase scroll to the stage.',
    rejected: 'A dedicated Listen Now section that hijacked scroll on every track tap.',
    why: 'Fans browse discography while listening. Forced scroll feels like a demo, not a product. Hero-stage is opt-in; chrome mini player preserves control when scrolled away.',
  },
  {
    id: 'interaction-model',
    title: 'Three interaction roles',
    chosen:
      'Primary fill for CTAs (Play, tickets). Neon green for nav-active (tabs, section nav, Descend on). Purple-bright for control rest, green on hover.',
    rejected: 'Gradient CTAs everywhere and cyan/fuchsia template accents on every surface.',
    why: 'One scan path on a busy psychedelic canvas. Gradients reserved for Gallery title and footer wordmark so emphasis stays rare.',
  },
  {
    id: 'experience-modes',
    title: 'Four experience modes, one product',
    chosen:
      'Browse, Hero stage, Descent (desktop overlay), and Stage (/stage for venues), each with explicit chrome visibility and z-index rules.',
    rejected: 'Treating fullscreen player, Descent, and Stage as unrelated features bolted onto a band template.',
    why: 'Principal-level framing: same audio engine, different surfaces. Documented in the design system so engineering and design share one model.',
  },
  {
    id: 'visual-system',
    title: 'Cosmic Signal identity',
    chosen:
      'Void base, hot-pink section titles, green eyebrows, custom hero/album art thread. Syne display + Instrument Sans body.',
    rejected: 'Generic synthwave gradient on every heading; stock photography below a strong custom hero.',
    why: 'Art leads the brand. UI supports legibility on illustration (logo scrim, chest dock, no cover overlay on baked-in album type).',
  },
] as const;

export const CASE_STUDY_CONSTRAINTS = [
  {
    title: 'Legibility on illustration',
    detail:
      'Hero logo uses a static scrim; stutter animation affects the wordmark only. Custom hero backgrounds use object-position and chest-level dock placement.',
  },
  {
    title: 'Mutually exclusive chrome',
    detail:
      'Hero dock and header mini player never show together. Pause returns hero to poster + Listen now while keeping session for off-hero transport.',
  },
  {
    title: 'Mobile vs venue',
    detail:
      'Descent hidden on touch-primary devices. Stage mode and mic-driven viz target desktop / projection setups without compromising mobile browse.',
  },
] as const;

export const CASE_STUDY_AI = {
  headline: 'AI as production tool, not art director',
  wins: [
    'Upscayl 4× upscale from a found ~1K master: conservative, faithful enlargement for hero and album covers',
    'CMS + draft/publish so the band updates copy, tour, and media without a developer',
    '20 audio-reactive viz modes + WebGL tunnel as a reusable visual engine',
  ],
  failures: [
    'Gemini “optimize for 4K” re-drew the hero: added grain, softened lines. Rejected; human pipeline won.',
    'Auto-scroll on catalog play: removed after UX review; in-place playback respects user control.',
  ],
  principle:
    'Use AI for scale and iteration; keep IA, interaction rules, and quality bar in human judgment. Document failures; they prove taste.',
} as const;

export const CASE_STUDY_OUTCOMES = [
  'Live production site with hero-stage playback, discography track lists, and viz gallery tied to catalog order',
  'Band self-serves content via authenticated edit mode (draft → publish, section visibility)',
  'Stage mode for venue projection; Descent mode for desktop immersion',
  'Public design system (/design-system) synced to production tokens and components',
  'Cosmic Signal: semantic color/type tokens, interaction rules, and experience-mode spec in code',
] as const;

export const CASE_STUDY_REFLECTION = {
  headline: 'What I’d do next',
  items: [
    'Stable discography ↔ catalog track IDs (replace string matching)',
    'Git-connected Vercel prod deploys on merge to main',
    'Accessibility audit on green-on-void labels and hero contrast at all breakpoints',
    'Lighter section atmosphere where custom art already carries density',
  ],
  directorNote:
    'At team scale: this system splits cleanly. Tokens and interaction rules for design ops, experience modes for eng onboarding, CMS patterns for content design.',
} as const;

export const CASE_STUDY_NAV = [
  { id: 'context', label: 'Context' },
  { id: 'role', label: 'Role' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'system', label: 'Visual system' },
  { id: 'constraints', label: 'Constraints' },
  { id: 'ai', label: 'AI builder' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'reflection', label: 'Reflection' },
] as const;

/** Re-export for decision diagrams */
export { INTERACTION_RULES };
