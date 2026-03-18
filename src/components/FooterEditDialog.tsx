import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useEditMode } from '../contexts/EditModeContext';
import { EditDialog } from './EditableSection';

export function FooterEditDialog() {
  const { content, updateContent } = useEditMode();
  const [bandName, setBandName] = useState(content.footer.bandName);
  const [description, setDescription] = useState(content.footer.description);
  const [email, setEmail] = useState(content.footer.email);
  const [socialLinks, setSocialLinks] = useState(content.footer.socialLinks);
  const [copyright, setCopyright] = useState(content.footer.copyright);

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handleSave = () => {
    updateContent('footer', {
      bandName,
      description,
      email,
      socialLinks,
      copyright,
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
      title="Edit Footer"
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="bandName">Band Name</Label>
        <Input
          value={bandName}
          onChange={(e) => setBandName(e.target.value)}
          placeholder="FLACID"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Heavy post-rock and stoner doom..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Contact Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contact@3iatlas.com"
        />
      </div>

      <div className="space-y-4">
        <Label>Social Media Links</Label>
        
        <div className="space-y-2">
          <Label htmlFor="facebook" className="text-sm text-muted-foreground">
            Facebook
          </Label>
          <Input
            id="facebook"
            value={socialLinks.facebook}
            onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
            placeholder="https://facebook.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram" className="text-sm text-muted-foreground">
            Instagram
          </Label>
          <Input
            id="instagram"
            value={socialLinks.instagram}
            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter" className="text-sm text-muted-foreground">
            Twitter / X
          </Label>
          <Input
            id="twitter"
            value={socialLinks.twitter}
            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
            placeholder="https://twitter.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube" className="text-sm text-muted-foreground">
            YouTube
          </Label>
          <Input
            id="youtube"
            value={socialLinks.youtube}
            onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
            placeholder="https://youtube.com/@..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="spotify" className="text-sm text-muted-foreground">
            Spotify
          </Label>
          <Input
            id="spotify"
            value={socialLinks.spotify}
            onChange={(e) => handleSocialLinkChange('spotify', e.target.value)}
            placeholder="https://open.spotify.com/artist/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bandcamp" className="text-sm text-muted-foreground">
            Bandcamp
          </Label>
          <Input
            id="bandcamp"
            value={socialLinks.bandcamp}
            onChange={(e) => handleSocialLinkChange('bandcamp', e.target.value)}
            placeholder="https://bandcamp.com/..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="copyright">Copyright Text</Label>
        <Input
          id="copyright"
          value={copyright}
          onChange={(e) => setCopyright(e.target.value)}
          placeholder="© 2025 FLACID. All rights reserved."
        />
      </div>
    </EditDialog>
  );
}