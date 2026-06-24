import { Facebook, Instagram, Twitter, Youtube, Music } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { ambientClass } from '../lib/colors';
import { brandSectionWashClass } from '../lib/brandClasses';
import { caption, gradientText, displayWordmark, subheading, bodySecondary } from '../lib/typography';
import { cn } from './ui/utils';
import { FooterEditDialog } from './FooterEditDialog';

const socialHoverClass =
  'w-10 h-10 rounded-full bg-muted hover:bg-gradient-to-r hover:from-signal-purple hover:to-hot-pink-bright flex items-center justify-center transition-all group';

export function Footer() {
  const { content, isEditMode } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const footer = content.footer;

  return (
    <footer className="relative overflow-hidden border-t border-signal-purple/35 px-4 py-16 sm:py-20">
      <div className={cn('pointer-events-none absolute inset-0', brandSectionWashClass)} aria-hidden />
      <div className="pointer-events-none absolute inset-0 section-cosmic-grain" aria-hidden />
      <div className={cn('pointer-events-none absolute inset-0', ambientClass.editorial)} aria-hidden />
      <div className={cn('relative mx-auto max-w-6xl', sectionLift)}>
        {isEditMode && (
          <div className="absolute top-4 right-4">
            <FooterEditDialog />
          </div>
        )}
        
        <div className="mb-10 grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="space-y-4">
            <h3 className={cn(displayWordmark, gradientText)}>{footer.bandName}</h3>
            <p className={cn(bodySecondary, 'max-w-sm leading-relaxed')}>{footer.description}</p>
          </div>

          <div>
            <h4 className={cn(subheading, 'mb-4')}>Connect</h4>
            <div className={cn('space-y-2', caption)}>
              <a href={`mailto:${footer.email}`} className="block hover:text-neon-green transition-colors">
                {footer.email}
              </a>
            </div>
          </div>

          <div>
            <h4 className={cn(subheading, 'mb-4')}>Follow Us</h4>
            <div className="flex gap-4 flex-wrap">
              {footer.socialLinks.facebook && (
                <a
                  href={footer.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialHoverClass}
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                </a>
              )}
              {footer.socialLinks.instagram && (
                <a
                  href={footer.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialHoverClass}
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                </a>
              )}
              {footer.socialLinks.twitter && (
                <a
                  href={footer.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialHoverClass}
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                </a>
              )}
              {footer.socialLinks.youtube && (
                <a
                  href={footer.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialHoverClass}
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                </a>
              )}
              {footer.socialLinks.spotify && (
                <a
                  href={footer.socialLinks.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialHoverClass}
                  aria-label="Spotify"
                >
                  <Music className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                </a>
              )}
              {footer.socialLinks.bandcamp && (
                <a
                  href={footer.socialLinks.bandcamp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialHoverClass}
                  aria-label="Bandcamp"
                >
                  <Music className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={cn('pt-8 border-t border-border text-center', caption)}>
          <p>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
