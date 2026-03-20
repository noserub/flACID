/** Dispatched to reopen the Descend intro popover (e.g. from Site menu). */
export const OPEN_DESCENT_HELP_EVENT = 'flacid:open-descent-help';

/** Dispatched when user clicks "Try Descend" — MusicPlayer shows play hint in fullscreen. */
export const TRY_DESCENT_CLICKED_EVENT = 'flacid:try-descent-clicked';

/** Delay so the site menu can fully close before opening the popover (avoids instant outside-dismiss). */
const OPEN_HELP_DELAY_MS = 220;

export function requestDescentHelp(): void {
  if (typeof window === 'undefined') return;
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(OPEN_DESCENT_HELP_EVENT));
  }, OPEN_HELP_DELAY_MS);
}
