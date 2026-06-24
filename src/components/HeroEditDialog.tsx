import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEditMode } from '../contexts/EditModeContext';
import { EditDialog, EditTriggerButton, ImageUpload } from './EditableSection';
import { EditorCallout } from './editor/EditorCallout';

export function HeroEditDialog() {
  const { content, updateContent } = useEditMode();
  const [subtitle, setSubtitle] = useState(content.hero.subtitle);
  const [tagline, setTagline] = useState(content.hero.tagline);
  const [backgroundImage, setBackgroundImage] = useState(content.hero.backgroundImage);
  const [logoImage, setLogoImage] = useState(content.hero.logoImage);

  const syncFromContent = () => {
    setSubtitle(content.hero.subtitle);
    setTagline(content.hero.tagline);
    setBackgroundImage(content.hero.backgroundImage);
    setLogoImage(content.hero.logoImage);
  };

  const handleSave = () => {
    updateContent('hero', {
      ...content.hero,
      subtitle,
      tagline,
      backgroundImage,
      logoImage,
    });
  };

  return (
    <EditDialog
      trigger={
        <EditTriggerButton type="button">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Hero
        </EditTriggerButton>
      }
      title="Edit Hero Section"
      onOpenChange={(open) => {
        if (open) syncFromContent();
      }}
      onSave={handleSave}
    >
      <EditorCallout variant="info">
        Subtitle and phonetic tagline appear under the About section title (not on the hero poster).
      </EditorCallout>

      <ImageUpload
        label="Logo Image"
        currentImage={logoImage}
        onUpload={setLogoImage}
        aspectRatio="1600×900 or larger"
        preset="heroLogo"
        bucket="covers"
        pathPrefix="hero"
      />

      <ImageUpload
        label="Background Image"
        currentImage={backgroundImage}
        onUpload={setBackgroundImage}
        aspectRatio="3840×2160 recommended (4K)"
        preset="heroBackground"
        bucket="covers"
        pathPrefix="hero"
      />

      <div className="space-y-2">
        <Label htmlFor="hero-subtitle">Subtitle</Label>
        <Input
          id="hero-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="The Fragile Sphere"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hero-tagline">Phonetic / tagline</Label>
        <Input
          id="hero-tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="/flæs'id/"
        />
      </div>
    </EditDialog>
  );
}
