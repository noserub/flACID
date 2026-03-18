import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEditMode } from '../contexts/EditModeContext';
import { EditDialog, ImageUpload } from './EditableSection';

export function HeroEditDialog() {
  const { content, updateContent } = useEditMode();
  const [subtitle, setSubtitle] = useState(content.hero.subtitle);
  const [tagline, setTagline] = useState(content.hero.tagline);
  const [backgroundImage, setBackgroundImage] = useState(content.hero.backgroundImage);
  const [logoImage, setLogoImage] = useState(content.hero.logoImage);

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
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Hero
        </Button>
      }
      title="Edit Hero Section"
      onSave={handleSave}
    >
      <ImageUpload
        label="Logo Image"
        currentImage={logoImage}
        onUpload={setLogoImage}
        aspectRatio="16:9 or larger"
        bucket="covers"
        pathPrefix="hero"
      />

      <ImageUpload
        label="Background Image"
        currentImage={backgroundImage}
        onUpload={setBackgroundImage}
        aspectRatio="1920x1080 or larger"
        bucket="covers"
        pathPrefix="hero"
      />

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Transcendence through sound"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Live from the basement"
        />
      </div>
    </EditDialog>
  );
}
