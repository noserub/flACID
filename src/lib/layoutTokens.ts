/**
 * Layout, motion, and z-index tokens — class strings for consistent spatial system.
 */
export const motion = {
  fast: 'duration-150',
  base: 'duration-300',
  slow: 'duration-500',
  transition: 'transition-all duration-300',
} as const;

export const spacing = {
  sectionY: 'py-20',
  sectionX: 'px-4',
  section: 'py-20 px-4',
} as const;

export const zIndex = {
  nav: 'z-40',
  overlay: 'z-50',
  modal: 'z-[60]',
  fullscreen: 'z-[9980]',
  fullscreenChrome: 'z-[10100]',
  lightboxChrome: 'z-[10250]',
} as const;
