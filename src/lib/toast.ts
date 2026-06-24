import { toast as sonner } from 'sonner';

/** App-wide toast helpers (Sonner). Prefer over `alert()` for admin and playback feedback. */
export const toast = {
  success(message: string) {
    sonner.success(message);
  },
  error(message: string) {
    sonner.error(message);
  },
  info(message: string) {
    sonner.info(message);
  },
};
