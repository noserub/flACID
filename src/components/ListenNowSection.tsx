import { MusicPlayer } from './MusicPlayer';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentMode } from '../contexts/DescentModeContext';
import { DESCENT_CONTENT_LIFT } from '../lib/descentContentLayer';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { ListenNowEditDialog } from './ListenNowEditDialog';

export function ListenNowSection() {
  const { content, updateContent, isEditMode } = useEditMode();
  const { isDescentMode } = useDescentMode();

  return (
    <EditableSection
      sectionName="Listen Now"
      visible={content.listenNow.visible}
      onVisibilityChange={(visible) =>
        updateContent('listenNow', { ...content.listenNow, visible })
      }
    >
      <section id="music-player" className="py-20 px-4 bg-gradient-to-b from-background via-fuchsia-950/5 to-background">
        <div
          className={cn(
            'max-w-6xl mx-auto mb-12 text-center',
            isDescentMode && DESCENT_CONTENT_LIFT
          )}
        >
          <h2 className="text-5xl md:text-6xl mb-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
            {content.listenNow.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {content.listenNow.description}
          </p>
          {isEditMode && (
            <div className="mt-4 flex justify-center">
              <ListenNowEditDialog />
            </div>
          )}
        </div>
        <MusicPlayer />
      </section>
    </EditableSection>
  );
}