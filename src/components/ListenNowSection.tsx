import { MusicPlayer } from './MusicPlayer';
import { useEditMode } from '../contexts/EditModeContext';
import { brandSectionWashClass } from '../lib/brandClasses';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { ListenNowEditDialog } from './ListenNowEditDialog';
import { SectionTitle } from './SectionTitle';

export function ListenNowSection() {
  const { content, updateContent, isEditMode } = useEditMode();

  return (
    <EditableSection
      sectionName="Listen Now"
      visible={content.listenNow.visible}
      onVisibilityChange={(visible) =>
        updateContent('listenNow', { ...content.listenNow, visible })
      }
    >
      {/* Intentionally no DESCENT_CONTENT_LIFT: whole section stays under Descend effects (z-9990+) */}
      <section
        id="music-player"
        className={cn('relative z-0 py-20 px-4', brandSectionWashClass)}
      >
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <SectionTitle subtitle={content.listenNow.description}>
            {content.listenNow.title}
          </SectionTitle>
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
