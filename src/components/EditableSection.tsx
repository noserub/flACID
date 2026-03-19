import { ReactNode, useState } from 'react';
import { Edit2, Eye, EyeOff, Upload, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useEditMode } from '../contexts/EditModeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';

interface EditableSectionProps {
  children: ReactNode;
  sectionName: string;
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

export function EditableSection({
  children,
  sectionName,
  visible,
  onVisibilityChange,
}: EditableSectionProps) {
  const { isEditMode } = useEditMode();

  if (!isEditMode && !visible) {
    return null;
  }

  return (
    <div
      className={`relative ${!visible && isEditMode ? 'opacity-50' : ''}`}
      data-section={sectionName.toLowerCase()}
    >
      {isEditMode && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onVisibilityChange(!visible)}
            className="bg-black/50 hover:bg-black/70"
          >
            {visible ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Visible
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hidden
              </>
            )}
          </Button>
          <div className="px-2 py-1 bg-black/50 rounded text-xs text-white">
            {sectionName}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

interface EditDialogProps {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  onSave?: () => void;
}

export function EditDialog({ trigger, title, children, onSave }: EditDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>{trigger}</div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              Edit {title.toLowerCase()} content
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" key={open ? 'open' : 'closed'}>
          {children}
        </div>
        {onSave && (
          <div className="border-t border-border px-6 py-4 bg-card">
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ImageUploadProps {
  label: string;
  currentImage: string;
  onUpload: (url: string) => void;
  aspectRatio?: string;
  /** Storage bucket: 'covers' for album/hero/about, 'photos' for gallery */
  bucket?: 'covers' | 'photos';
  /** Path prefix within bucket (e.g. 'hero', 'albums', 'gallery') - avoids bucket/path duplication */
  pathPrefix?: string;
}

export function ImageUpload({ label, currentImage, onUpload, aspectRatio, bucket = 'covers', pathPrefix }: ImageUploadProps) {
  const { uploadImage } = useEditMode();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      alert('Please upload an image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, { bucket, pathPrefix });
      onUpload(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {currentImage && (
        <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden">
          <img
            src={currentImage}
            alt={label}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="relative overflow-hidden"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </Button>
        {currentImage && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onUpload('')}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
      {aspectRatio && (
        <p className="text-xs text-muted-foreground">Recommended: {aspectRatio}</p>
      )}
    </div>
  );
}

interface AudioUploadProps {
  label: string;
  currentUrl: string;
  onUpload: (dataUrl: string) => void;
}

export function AudioUpload({ label, currentUrl, onUpload }: AudioUploadProps) {
  const { uploadAudio } = useEditMode();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setError(null);

    // Check file type
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3, WAV, OGG, etc.)');
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      setError(`File too large (${fileSizeMB}MB). Maximum size is 50MB. Consider compressing your audio file.`);
      // Clear the file input
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await uploadAudio(file);
      onUpload(dataUrl);
      setError(null);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload audio';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {currentUrl && (
        <audio controls className="w-full">
          <source src={currentUrl} />
        </audio>
      )}
      
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-xs text-red-300">⚠️ {error}</p>
        </div>
      )}
      
      {/* File size info */}
      {!currentUrl && !error && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
          <p className="text-xs text-blue-300">
            ℹ️ Maximum file size: 50MB. Supported formats: MP3, WAV, OGG, FLAC, M4A
          </p>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="relative overflow-hidden"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Audio'}
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
          />
        </Button>
        {currentUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onUpload('');
              setError(null);
            }}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}