import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { subscribeToNewsletter } from '../services/newsletter.service';

type Phase = 'form' | 'submitting' | 'success' | 'error';

interface NewsletterSignupProps {
  triggerClassName?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

export function NewsletterSignup({
  triggerClassName,
  triggerVariant = 'outline',
}: NewsletterSignupProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [wasAlreadySubscribed, setWasAlreadySubscribed] = useState(false);

  const reset = useCallback(() => {
    setPhase('form');
    setErrorMessage('');
    setWasAlreadySubscribed(false);
    setEmail('');
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(reset, 200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPhase('submitting');
    const result = await subscribeToNewsletter(email);
    if (result.ok) {
      setWasAlreadySubscribed(!!result.alreadySubscribed);
      setPhase('success');
      return;
    }
    setErrorMessage(result.message);
    setPhase('error');
  };

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        className={
          triggerClassName ??
          'border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10 hover:border-fuchsia-500/50 hover:text-fuchsia-100 shadow-sm shadow-cyan-900/20'
        }
        onClick={() => setOpen(true)}
      >
        <Mail className="w-4 h-4 mr-2 opacity-90" />
        Join mailing list
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md border border-cyan-500/25 bg-gradient-to-b from-background via-background to-cyan-950/20 shadow-xl shadow-cyan-950/40 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(217,70,239,0.08),transparent)]" />

          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-semibold tracking-tight bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
              Stay in the loop
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Tour drops, releases, and rare transmissions — no spam, unsubscribe anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 mt-2">
            <AnimatePresence mode="wait">
              {phase === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center gap-4 py-4"
                  role="status"
                  aria-live="polite"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl scale-150" />
                    <CheckCircle2 className="relative w-16 h-16 text-cyan-400" strokeWidth={1.25} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      {wasAlreadySubscribed ? "You're already on the list" : "You're in"}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      {wasAlreadySubscribed
                        ? 'This email was already registered. We only send the good stuff when it matters.'
                        : "We'll only email you when there's something worth the signal — tours, releases, and announcements."}
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-fuchsia-400/80" aria-hidden />
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2 w-full bg-muted/80"
                    onClick={() => handleOpenChange(false)}
                  >
                    Close
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="newsletter-email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="newsletter-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={phase === 'submitting'}
                      className="border-border/80 bg-background/80 focus-visible:ring-cyan-500/40"
                      aria-invalid={phase === 'error' && !!errorMessage}
                      aria-describedby={errorMessage ? 'newsletter-error' : undefined}
                    />
                  </div>

                  <AnimatePresence>
                    {phase === 'error' && errorMessage && (
                      <motion.div
                        id="newsletter-error"
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={phase === 'submitting' || !email.trim()}
                    className="w-full bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white shadow-lg shadow-fuchsia-950/30"
                  >
                    {phase === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subscribing…
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Confirm subscription
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By subscribing you agree we may contact you about FLACID. We never sell your email.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
