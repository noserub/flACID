import { useState } from 'react';
import { MoreHorizontal, Edit3, Eye, Save, Upload, Download, CheckCircle, XCircle, Package, LogIn, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { ComponentLibrary } from './ComponentLibrary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useEditMode } from '../contexts/EditModeContext';
import { useAuth } from '../hooks';
import { DescentModeToggle } from './DescentModeToggle';
import { SignInDialog } from './SignInDialog';

export function SiteHeader() {
  const { isEditMode, isDraft, toggleEditMode, publishChanges, discardDraft, content } = useEditMode();
  const { isAuthenticated, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);

  const handleToggleEditMode = () => {
    if (isEditMode) {
      const confirmed = window.confirm(
        'Exiting edit mode will clear uploaded audio from memory. Continue?'
      );
      if (!confirmed) return;
    }
    toggleEditMode();
  };

  const handleExportJSON = () => {
    // Warn if there are unsaved changes
    if (isDraft && isEditMode) {
      const proceed = window.confirm(
        'You have unsaved changes. The export will include your current draft (unpublished) changes. Continue?'
      );
      if (!proceed) return;
    }
    
    try {
      // Create JSON with all content (excluding large audio data URLs)
      const exportData = {
        ...content,
        musicPlayer: {
          ...content.musicPlayer,
          tracks: content.musicPlayer.tracks.map(track => ({
            ...track,
            url: track.url && track.url.startsWith('data:') ? '' : track.url
          }))
        },
        exportDate: new Date().toISOString(),
        version: '1.0',
        exportedState: isDraft ? 'draft' : 'published'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const stateLabel = isDraft ? 'draft' : 'published';
      link.download = `3i-atlas-${stateLabel}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      
      console.log(`Site data exported successfully (${stateLabel})`);
    } catch (error) {
      console.error('Failed to export JSON:', error);
      alert('Failed to export data. Check console for details.');
    }
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedData = JSON.parse(text);

        if (!importedData.hero || !importedData.about) {
          throw new Error('Invalid data structure');
        }

        const { publishContentToSupabase } = await import('../services/contentSync.service');
        const { isSupabaseConfigured } = await import('../lib/supabase');

        if (isSupabaseConfigured) {
          await publishContentToSupabase(importedData as Parameters<typeof publishContentToSupabase>[0]);
        } else {
          alert('Supabase not configured. Import will sync when configured.');
        }

        alert('Data imported successfully! Refreshing page...');
        window.location.reload();
      } catch (error) {
        console.error('Failed to import JSON:', error);
        alert('Failed to import data. Please ensure the file is a valid FLACID site export.');
      }
    };
    input.click();
  };

  return (
    <header className="fixed top-0 right-0 z-50 p-4">
      <div className="flex items-center gap-3">
        {/* Descent Mode Toggle */}
        <DescentModeToggle />
        
        {/* Draft Status Indicator */}
        {isDraft && isEditMode && (
          <div className="flex items-center gap-2 bg-orange-600/90 backdrop-blur-sm border border-orange-400/50 rounded-lg px-3 py-2 shadow-lg">
            <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" />
            <span className="text-sm text-orange-100 font-medium">Unsaved Changes</span>
          </div>
        )}

        {/* Export Success Indicator */}
        {exportSuccess && (
          <div className="flex items-center gap-2 bg-green-600/90 backdrop-blur-sm border border-green-400/50 rounded-lg px-3 py-2 shadow-lg">
            <CheckCircle className="h-4 w-4 text-green-300" />
            <span className="text-sm text-green-100 font-medium">Exported!</span>
          </div>
        )}

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="bg-background/80 text-cyan-400 border border-cyan-400/30 hover:border-fuchsia-400/50 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">Site menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm">
            <DropdownMenuLabel>Site Manager</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Edit Mode Toggle - requires auth */}
            {isAuthenticated ? (
              <>
                <DropdownMenuItem onClick={handleToggleEditMode}>
                  {isEditMode ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Preview Mode</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      <span>Edit Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => setSignInOpen(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                <span>Admin Sign In</span>
              </DropdownMenuItem>
            )}

            {/* Publish/Discard (only show if in edit mode with changes) */}
            {isDraft && isEditMode && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await publishChanges();
                    } catch (e) {
                      alert('Publish failed. Check console for details.');
                    }
                  }}
                  className="text-green-400"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Publish Changes</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={discardDraft} className="text-red-400">
                  <XCircle className="mr-2 h-4 w-4" />
                  <span>Discard Draft</span>
                </DropdownMenuItem>
              </>
            )}

            {isAuthenticated && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Data Management
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportJSON}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export to JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportJSON}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Import from JSON</span>
                </DropdownMenuItem>
              </>
            )}

            {/* Component Library (Edit Mode Only) */}
            {isEditMode && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Development
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowComponentLibrary(true)}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>Component Library</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Component Library Modal */}
      {showComponentLibrary && (
        <ComponentLibrary onClose={() => setShowComponentLibrary(false)} />
      )}

      {/* Sign In Dialog */}
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </header>
  );
}