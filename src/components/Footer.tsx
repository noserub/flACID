import { Facebook, Instagram, Twitter, Youtube, Music } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentSectionLiftClass } from '../hooks/useDescentSectionStacking';
import { brandSectionWashClass } from '../lib/brandClasses';
import { cn } from './ui/utils';
import { FooterEditDialog } from './FooterEditDialog';

const socialHoverClass =
  'w-10 h-10 rounded-full bg-muted hover:bg-gradient-to-r hover:from-signal-purple hover:to-hot-pink-bright flex items-center justify-center transition-all group';

export function Footer() {
  const { content, isEditMode } = useEditMode();
  const sectionLift = useDescentSectionLiftClass();
  const footer = content.footer;

  return (
    <footer className={cn('py-12 px-4 border-t border-border relative', brandSectionWashClass)}>
      <div className={cn('max-w-6xl mx-auto', sectionLift)}>
        {isEditMode && (
          <div className="absolute top-4 right-4">
            <FooterEditDialog />
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-hero text-2xl bg-gradient-to-r from-signal-purple-bright via-hot-pink to-neon-green bg-clip-text text-transparent mb-4">
              {footer.bandName}
            </h3>
            <p className="text-muted-foreground">
              {footer.description}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-foreground font-hero tracking-wide">Connect</h4>
            <div className="space-y-2 text-muted-foreground">
              <a href={`mailto:${footer.email}`} className="block hover:text-neon-green transition-colors">
                {footer.email}
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-foreground font-hero tracking-wide">Follow Us</h4>
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

        <div className="pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
