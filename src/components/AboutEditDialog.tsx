import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useEditMode } from '../contexts/EditModeContext';
import { EditDialog, ImageUpload } from './EditableSection';

export function AboutEditDialog() {
  const { content, updateContent } = useEditMode();
  const [title, setTitle] = useState(content.about.title);
  const [aboutContent, setAboutContent] = useState(content.about.content);
  const [image, setImage] = useState(content.about.image);

  const handleSave = () => {
    updateContent('about', {
      ...content.about,
      title,
      content: aboutContent,
      image,
    });
  };

  return (
    <EditDialog
      trigger={
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/70"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </Button>
      }
      title="Edit About Section"
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="The Journey"
        />
      </div>

      <ImageUpload
        label="About Image"
        currentImage={image}
        onUpload={setImage}
        aspectRatio="1:1 or 4:3"
      />

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={aboutContent}
          onChange={(e) => setAboutContent(e.target.value)}
          rows={10}
          placeholder="Write about the band..."
        />
      </div>
    </EditDialog>
  );
}
