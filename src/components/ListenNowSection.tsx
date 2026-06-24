import { MusicPlayer } from './MusicPlayer';
import { useEditMode } from '../contexts/EditModeContext';
import { SECTION_SCROLL_MARGIN_PX } from '../lib/sectionNav';
import { EditableSection } from './EditableSection';
import { ListenNowEditDialog } from './ListenNowEditDialog';
import { SectionTitle } from './SectionTitle';
import { SectionAmbient } from './SectionAmbient';

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
        className="relative z-0 overflow-hidden py-20 px-4 scroll-mt-28"
        style={{ scrollMarginTop: SECTION_SCROLL_MARGIN_PX }}
      >
        <SectionAmbient />
        <div className="relative">
        <div id="listen-section-head" className="max-w-6xl mx-auto mb-12 text-center scroll-mt-28">
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
        </div>
      </section>
    </EditableSection>
  );
}
