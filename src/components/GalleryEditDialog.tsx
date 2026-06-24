import { useState } from 'react';
import { Edit2, Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEditMode } from '../contexts/EditModeContext';
import { EditDialog, EditTriggerButton, ImageUpload } from './EditableSection';
import {
  editorDestructiveGhostClass,
  editorPanelTitleClass,
  editorReorderButtonClass,
  editorRowCardClass,
} from '../lib/editorStyles';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Switch } from './ui/switch';

export function GalleryEditDialog() {
  const { content, updateContent } = useEditMode();
  const [title, setTitle] = useState(content.gallery.title);
  const [subtitle, setSubtitle] = useState(content.gallery.subtitle);
  const [tabs, setTabs] = useState(content.gallery.tabs);

  const handleAddTab = () => {
    const newTab = {
      id: Date.now().toString(),
      name: 'New Gallery',
      visible: true,
      images: [],
    };
    setTabs([...tabs, newTab]);
  };

  const handleRemoveTab = (id: string) => {
    setTabs(tabs.filter((t) => t.id !== id));
  };

  const handleMoveTab = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= tabs.length) return;
    const nextTabs = [...tabs];
    [nextTabs[fromIndex], nextTabs[toIndex]] = [nextTabs[toIndex], nextTabs[fromIndex]];
    setTabs(nextTabs);
  };

  const handleUpdateTab = (id: string, field: string, value: string | number | boolean) => {
    setTabs(
      tabs.map((tab) => (tab.id === id ? { ...tab, [field]: value } : tab))
    );
  };

  const handleAddImage = (tabId: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              images: [
                ...tab.images,
                {
                  id: Date.now().toString(),
                  url: '',
                  caption: '',
                },
              ],
            }
          : tab
      )
    );
  };

  const handleRemoveImage = (tabId: string, imageId: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              images: tab.images.filter((img) => img.id !== imageId),
            }
          : tab
      )
    );
  };

  const handleUpdateImage = (
    tabId: string,
    imageId: string,
    field: string,
    value: string | number | boolean
  ) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              images: tab.images.map((img) =>
                img.id === imageId ? { ...img, [field]: value } : img
              ),
            }
          : tab
      )
    );
  };

  const handleSave = () => {
    updateContent('gallery', {
      ...content.gallery,
      title,
      subtitle,
      tabs,
    });
  };

  const syncFromContent = () => {
    setTitle(content.gallery.title);
    setSubtitle(content.gallery.subtitle);
    setTabs(content.gallery.tabs);
  };

  return (
    <EditDialog
      trigger={
        <EditTriggerButton>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </EditTriggerButton>
      }
      title="Edit Gallery"
      onOpenChange={(open) => {
        if (open) syncFromContent();
      }}
      onSave={handleSave}
    >
      <div className="space-y-4 pb-2">
        <div className="space-y-2">
          <Label>Section title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Gallery" />
        </div>
        <div className="space-y-2">
          <Label>Subtitle</Label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Short line under the title"
          />
        </div>
      </div>

      <Button onClick={handleAddTab} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Gallery Tab
      </Button>

      <Accordion type="single" collapsible className="w-full">
          {tabs.map((tab, index) => (
            <AccordionItem key={tab.id} value={tab.id}>
              <AccordionTrigger className="group">
                <div className="flex items-center gap-2 w-full min-w-0">
                  <div className="flex shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={editorReorderButtonClass}
                      onClick={() => handleMoveTab(index, 'up')}
                      disabled={index === 0}
                      aria-label={`Move ${tab.name} up`}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={editorReorderButtonClass}
                      onClick={() => handleMoveTab(index, 'down')}
                      disabled={index === tabs.length - 1}
                      aria-label={`Move ${tab.name} down`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  {tab.visible ? (
                    <Eye className="h-4 w-4 shrink-0" />
                  ) : (
                    <EyeOff className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {tab.name} ({tab.images.length} images)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tab.visible}
                        onCheckedChange={(checked) =>
                          handleUpdateTab(tab.id, 'visible', checked)
                        }
                      />
                      <Label>Visible in Gallery</Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTab(tab.id)}
                      className={editorDestructiveGhostClass}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Tab
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Tab Name</Label>
                    <Input
                      value={tab.name}
                      onChange={(e) =>
                        handleUpdateTab(tab.id, 'name', e.target.value)
                      }
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={editorPanelTitleClass}>Images</h4>
                      <Button
                        onClick={() => handleAddImage(tab.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {tab.images.map((image, index) => (
                        <div key={image.id} className={editorRowCardClass}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Image {index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveImage(tab.id, image.id)}
                              className={editorDestructiveGhostClass}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <ImageUpload
                            label="Image"
                            currentImage={image.url}
                            onUpload={(url) =>
                              handleUpdateImage(tab.id, image.id, 'url', url)
                            }
                            bucket="photos"
                            pathPrefix="gallery"
                          />

                          <div className="space-y-2">
                            <Label>Caption (optional)</Label>
                            <Input
                              value={image.caption}
                              onChange={(e) =>
                                handleUpdateImage(
                                  tab.id,
                                  image.id,
                                  'caption',
                                  e.target.value
                                )
                              }
                              placeholder="Image caption"
                            />
                          </div>
                        </div>
                      ))}

                      {tab.images.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No images yet. Click "Add Image" to get started.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
    </EditDialog>
  );
}
