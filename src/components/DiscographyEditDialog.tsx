import { useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useEditMode } from '../contexts/EditModeContext';
import { EditDialog, EditTriggerButton, ImageUpload } from './EditableSection';
import { editorDestructiveGhostClass } from '../lib/editorStyles';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export function DiscographyEditDialog() {
  const { content, updateContent } = useEditMode();
  const [title, setTitle] = useState(content.discography.title);
  const [albums, setAlbums] = useState(content.discography.albums);

  const handleAddAlbum = () => {
    const newAlbum = {
      id: Date.now().toString(),
      title: 'New Album',
      year: new Date().getFullYear().toString(),
      coverImage: '',
      description: '',
      tracks: [],
    };
    setAlbums([...albums, newAlbum]);
  };

  const handleRemoveAlbum = (id: string) => {
    setAlbums(albums.filter((a) => a.id !== id));
  };

  const handleUpdateAlbum = (id: string, field: string, value: string | number | boolean | string[]) => {
    setAlbums(
      albums.map((album) =>
        album.id === id ? { ...album, [field]: value } : album
      )
    );
  };

  const handleUpdateTracks = (id: string, tracksText: string) => {
    // Don't filter during editing to allow multi-line input
    const tracks = tracksText.split('\n');
    handleUpdateAlbum(id, 'tracks', tracks);
  };

  const handleSave = () => {
    // Filter out empty tracks when saving
    const cleanedAlbums = albums.map(album => ({
      ...album,
      tracks: album.tracks.filter((t) => t.trim())
    }));
    
    updateContent('discography', {
      ...content.discography,
      title,
      albums: cleanedAlbums,
    });
  };

  return (
    <EditDialog
      trigger={
        <EditTriggerButton>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </EditTriggerButton>
      }
      title="Edit Discography"
      onSave={handleSave}
    >
      <div className="space-y-4 mb-4">
        <div className="space-y-2">
          <Label>Section Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Journey"
          />
        </div>
      </div>

      <Button onClick={handleAddAlbum} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Album
      </Button>

      <Accordion type="single" collapsible className="w-full">
          {albums.map((album, index) => (
            <AccordionItem key={album.id} value={album.id}>
              <AccordionTrigger>
                {album.title} ({album.year})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAlbum(album.id)}
                      className={editorDestructiveGhostClass}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Album
                    </Button>
                  </div>

                  <ImageUpload
                    label="Album Cover"
                    currentImage={album.coverImage}
                    onUpload={(url) => handleUpdateAlbum(album.id, 'coverImage', url)}
                    aspectRatio="any; shown in full (not cropped)"
                    previewFit="contain"
                    bucket="covers"
                    pathPrefix="albums"
                  />

                  <div className="space-y-2">
                    <Label>Album Title</Label>
                    <Input
                      value={album.title}
                      onChange={(e) =>
                        handleUpdateAlbum(album.id, 'title', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      value={album.year}
                      onChange={(e) =>
                        handleUpdateAlbum(album.id, 'year', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={album.description}
                      onChange={(e) =>
                        handleUpdateAlbum(album.id, 'description', e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tracks (one per line)</Label>
                    <Textarea
                      value={album.tracks.join('\n')}
                      onChange={(e) => handleUpdateTracks(album.id, e.target.value)}
                      rows={8}
                      className="min-h-32 resize-y"
                      placeholder="Track 1&#10;Track 2&#10;Track 3"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
    </EditDialog>
  );
}
