/** Dispatched to reopen the Descend intro popover (e.g. from Site menu). */
export const OPEN_DESCENT_HELP_EVENT = 'flacid:open-descent-help';

/** Delay so the site menu can fully close before opening the popover (avoids instant outside-dismiss). */
const OPEN_HELP_DELAY_MS = 220;

export function requestDescentHelp(): void {
  if (typeof window === 'undefined') return;
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(OPEN_DESCENT_HELP_EVENT));
  }, OPEN_HELP_DELAY_MS);
}
