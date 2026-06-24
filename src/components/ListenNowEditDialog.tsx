import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useEditMode } from '../contexts/EditModeContext';
import { EditDialog, EditTriggerButton } from './EditableSection';

export function ListenNowEditDialog() {
  const { content, updateContent } = useEditMode();
  const [title, setTitle] = useState(content.listenNow.title);
  const [description, setDescription] = useState(content.listenNow.description);

  const handleSave = () => {
    updateContent('listenNow', {
      ...content.listenNow,
      title,
      description,
    });
  };

  return (
    <EditDialog
      trigger={
        <EditTriggerButton>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Section
        </EditTriggerButton>
      }
      title="Edit Listen Now Section"
      onSave={handleSave}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Section Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Listen Now"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Experience our latest tracks..."
          />
        </div>
      </div>
    </EditDialog>
  );
}
