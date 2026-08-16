import { ReactNode, useState } from 'react';
import { Eye, EyeOff, Upload, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useEditMode } from '../contexts/EditModeContext';
import { EDITOR_CHROME_LIFT } from '../lib/descentContentLayer';
import { validateAudioFile } from '../lib/audioOptimization';
import {
  editorChromeButtonClass,
  editorDestructiveGhostClass,
  editorDialogFooterClass,
  editorSectionLabelClass,
} from '../lib/editorStyles';
import { EditorCallout } from './editor/EditorCallout';
import { toast } from '../lib/toast';
import type { ImageUploadPreset } from '../lib/imageOptimization';
import { cn } from './ui/utils';
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
import type { ButtonProps } from './ui/button';

interface EditableSectionProps {
  children: ReactNode;
  sectionName: string;
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  /** Optional edit dialog trigger(s) rendered in the section chrome row (e.g. Edit Hero). */
  editSlot?: ReactNode;
}

export function EditableSection({
  children,
  sectionName,
  visible,
  onVisibilityChange,
  editSlot,
}: EditableSectionProps) {
  const { isEditMode } = useEditMode();

  if (!isEditMode && !visible) {
    return null;
  }

  return (
    <div
      className={cn('relative', !visible && isEditMode && 'opacity-50')}
      data-section={sectionName.toLowerCase()}
    >
      {isEditMode && (
        <div
          className={cn(
            'absolute top-4 right-4 flex gap-2 pointer-events-auto',
            EDITOR_CHROME_LIFT
          )}
        >
          {editSlot}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onVisibilityChange(!visible)}
            className={editorChromeButtonClass}
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
          <div className={editorSectionLabelClass}>{sectionName}</div>
        </div>
      )}
      {children}
    </div>
  );
}

/** Standard edit dialog trigger — glass overlay on section chrome */
export function EditTriggerButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn(editorChromeButtonClass, className)}
      {...props}
    >
      {children}
    </Button>
  );
}

interface EditDialogProps {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  onSave?: () => void;
  /** Fires when the dialog opens or closes (e.g. sync form state from context on open). */
  onOpenChange?: (open: boolean) => void;
}

export function EditDialog({ trigger, title, children, onSave, onOpenChange }: EditDialogProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
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
          <div className={editorDialogFooterClass}>
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
  /** Resize preset — hero background stores up to 4K WebP */
  preset?: ImageUploadPreset;
  /** Editor thumbnail fit. Use contain for artwork that should not be cropped. */
  previewFit?: 'cover' | 'contain';
}

export function ImageUpload({
  label,
  currentImage,
  onUpload,
  aspectRatio,
  bucket = 'covers',
  pathPrefix,
  preset,
  previewFit = 'cover',
}: ImageUploadProps) {
  const { uploadImage } = useEditMode();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      toast.error('Please upload an image file (JPEG, PNG, WebP, or GIF).');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, { bucket, pathPrefix, preset });
      onUpload(url);
    } catch (error) {
      console.error('Upload failed:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to upload image. Try again or use a smaller file.';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {currentImage && (
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-lg bg-muted',
            previewFit === 'contain' ? 'max-h-64' : 'h-40'
          )}
        >
          <img
            src={currentImage}
            alt={label}
            className={
              previewFit === 'contain'
                ? 'h-auto max-h-64 w-full object-contain'
                : 'h-full w-full object-cover'
            }
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
            className={editorDestructiveGhostClass}
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

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid audio file.');
      e.target.value = '';
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
      let errorMessage = error instanceof Error ? error.message : 'Failed to upload audio';
      if (error && typeof error === 'object' && 'status' in error) {
        const e = error as { status?: number; statusCode?: string };
        if (e.status != null || e.statusCode) {
          errorMessage += ` (HTTP ${e.status ?? '?'}${e.statusCode ? `, code ${e.statusCode}` : ''})`;
        }
      }
      const msg = errorMessage.toLowerCase();
      if (
        msg.includes('row-level security') ||
        msg.includes('policy') ||
        msg.includes('permission denied') ||
        msg.includes('not authorized')
      ) {
        errorMessage +=
          ' Sign in as a site admin. Storage uploads require an authenticated admin session.';
      }
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
      
      {error && <EditorCallout variant="error">⚠️ {error}</EditorCallout>}

      {!currentUrl && !error && (
        <EditorCallout variant="info">
          ℹ️ Max 50MB. Formats: MP3, WAV, FLAC, OGG, AAC, M4A (M4A uploads as{' '}
          <code className="text-signal-purple-bright/80">audio/mp4</code>). Bucket:{' '}
          <code className="text-signal-purple-bright/80">audio/*</code> or leave types unrestricted.
        </EditorCallout>
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
            className={editorDestructiveGhostClass}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}