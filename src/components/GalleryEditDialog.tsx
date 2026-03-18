import { useState } from 'react';
import { Edit2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEditMode } from '../contexts/EditModeContext';
import { EditDialog, ImageUpload } from './EditableSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Switch } from './ui/switch';

export function GalleryEditDialog() {
  const { content, updateContent } = useEditMode();
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
      tabs,
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
      title="Edit Gallery"
      onSave={handleSave}
    >
      <Button onClick={handleAddTab} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Gallery Tab
      </Button>

      <Accordion type="single" collapsible className="w-full">
          {tabs.map((tab) => (
            <AccordionItem key={tab.id} value={tab.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  {tab.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  {tab.name} ({tab.images.length} images)
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
                      className="text-red-500 hover:text-red-600"
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
                      <h4 className="font-medium">Images</h4>
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
                        <div
                          key={image.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Image {index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveImage(tab.id, image.id)}
                              className="text-red-500 hover:text-red-600"
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
