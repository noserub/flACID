import { useState } from 'react';
import {
  MoreHorizontal,
  Edit3,
  Eye,
  Save,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Package,
  LogIn,
  LogOut,
  CircleHelp,
  Mic,
  Smartphone,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
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
import { useDescentMode } from '../contexts/DescentModeContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { useAuth, useInstallPwa } from '../hooks';
import { DESCENT_CHROME_LIFT, DESCENT_MENU_PORTAL_LIFT } from '../lib/descentContentLayer';
import {
  brandMenuItemDestructiveClass,
  brandMenuItemSuccessClass,
} from '../lib/brandClasses';
import { cn } from './ui/utils';
import { DescentModeToggle } from './DescentModeToggle';
import { SignInDialog } from './SignInDialog';
import { MiniPlayer } from './MiniPlayer';
import { requestDescentHelp } from '../lib/descentHelp';

export function SiteHeader() {
  const { isEditMode, isDraft, toggleEditMode, publishChanges, discardDraft, content } = useEditMode();
  const { isDescentMode, descentSupported } = useDescentMode();
  const { isFullscreen } = usePlayback();
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [installIosOpen, setInstallIosOpen] = useState(false);
  const { isStandalone, canUseBrowserInstall, showIosAddToHome, promptInstall } = useInstallPwa();

  if (isFullscreen) return null;

  const handleToggleEditMode = () => {
    if (isEditMode && isDraft) {
      setExitConfirmOpen(true);
      return;
    }
    toggleEditMode();
  };

  const handleDiscardAndExit = () => {
    discardDraft();
    toggleEditMode();
    setExitConfirmOpen(false);
  };

  const handleDiscardDraftClick = () => {
    setDiscardConfirmOpen(true);
  };

  const handleConfirmDiscard = () => {
    discardDraft();
    setDiscardConfirmOpen(false);
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
    <header
      className={cn(
        'fixed top-0 left-0 right-0 pointer-events-none [&>*]:pointer-events-auto',
        /* PWA / iOS: clear notch + Dynamic Island; horizontal insets in landscape */
        'pt-[max(1rem,env(safe-area-inset-top,0px))]',
        'pl-[max(1rem,env(safe-area-inset-left,0px))]',
        'pr-[max(1rem,env(safe-area-inset-right,0px))]',
        'pb-4',
        isDescentMode ? DESCENT_CHROME_LIFT : 'z-50'
      )}
    >
      {/* lg+: mini in header with balanced flex; below lg mini stays bottom-fixed so Descend + ⋯ never wrap */}
      <div className="relative flex w-full min-h-[44px] lg:min-h-[52px] flex-row items-center justify-end lg:justify-start">
        <div className="hidden min-w-0 flex-1 lg:block" aria-hidden />
        <div className="flex min-w-0 shrink-0 items-center justify-center self-center lg:h-11">
          <MiniPlayer dock="chrome" />
        </div>
        <div className="relative flex min-w-0 flex-1 flex-row flex-nowrap items-center justify-end gap-3 self-center pl-2 sm:gap-4 lg:pl-4">
          {exportSuccess && (
            <div className="flex shrink-0 items-center gap-2 bg-green-600/90 backdrop-blur-sm border border-green-400/50 rounded-lg px-3 py-2 shadow-lg">
              <CheckCircle className="h-4 w-4 text-green-300" />
              <span className="text-sm text-green-100 font-medium">Exported!</span>
            </div>
          )}

          <div className="flex shrink-0 flex-nowrap items-center gap-3 sm:gap-4">
            <DescentModeToggle />
            <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="brand"
              size="icon"
              className="size-11 min-h-11 min-w-11 touch-manipulation"
            >
              <MoreHorizontal className="h-6 w-6" aria-hidden />
              <span className="sr-only">Site menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              'w-56 bg-card/95 backdrop-blur-sm',
              isDescentMode && DESCENT_MENU_PORTAL_LIFT
            )}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {descentSupported && (
              <DropdownMenuItem onClick={() => requestDescentHelp()}>
                <CircleHelp className="mr-2 h-4 w-4 shrink-0" />
                <span>What is Descend?</span>
              </DropdownMenuItem>
            )}

            {!isStandalone && (canUseBrowserInstall || showIosAddToHome) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">App</DropdownMenuLabel>
                {canUseBrowserInstall ? (
                  <DropdownMenuItem
                    onClick={() => {
                      void promptInstall();
                    }}
                  >
                    <Smartphone className="mr-2 h-4 w-4 shrink-0" />
                    <span>Install app</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setInstallIosOpen(true)}>
                    <Smartphone className="mr-2 h-4 w-4 shrink-0" />
                    <span>Add to Home Screen</span>
                  </DropdownMenuItem>
                )}
              </>
            )}

            <DropdownMenuSeparator />
            
            {/* Edit Mode Toggle - site admins only (see site_admins table) */}
            {isAuthenticated && isAdmin && (
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
            )}
            {isAuthenticated && (
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            )}
            {!isAuthenticated && (
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
                      const msg = e instanceof Error ? e.message : String(e);
                      console.error(e);
                      alert(`Publish failed: ${msg}`);
                    }
                  }}
                  className={brandMenuItemSuccessClass}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Publish Changes</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDiscardDraftClick} className={brandMenuItemDestructiveClass}>
                  <XCircle className="mr-2 h-4 w-4" />
                  <span>Discard Draft</span>
                </DropdownMenuItem>
              </>
            )}

            {isAuthenticated && isAdmin && (
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

            {/* Stage / Live Mode — venue projection, signed-in only */}
            {isAuthenticated && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Venue
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <a href="/stage" target="_blank" rel="noopener noreferrer">
                    <Mic className="mr-2 h-4 w-4" />
                    <span>Stage / Live Mode</span>
                  </a>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isDraft && isEditMode && (
            <div className="absolute right-0 top-full z-10 mt-1.5 flex justify-end lg:right-full lg:top-1/2 lg:mt-0 lg:mr-3 lg:-translate-y-1/2">
              <div className="flex items-center gap-2 bg-signal-purple/90 backdrop-blur-sm border border-signal-purple-bright/40 rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse shrink-0" />
                <span className="text-sm text-primary-foreground font-medium">Unsaved Changes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Library Modal */}
      {showComponentLibrary && (
        <ComponentLibrary onClose={() => setShowComponentLibrary(false)} />
      )}

      {/* Sign In Dialog */}
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />

      {/* Exit with unsaved changes */}
      <AlertDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes will be lost if you exit without publishing. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in edit mode</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardAndExit}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard & exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard draft confirmation */}
      <AlertDialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard all unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Your draft will revert to the last published state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={installIosOpen} onOpenChange={setInstallIosOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add flACID to your Home Screen</AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3">
              <span className="block">
                On iPhone and iPad, every browser uses Apple&apos;s WebKit. There is no &quot;Download&quot; or
                Play Store–style install like on Android. You add the site manually:
              </span>
              <span className="block">
                <strong className="text-foreground">Safari:</strong> tap{' '}
                <strong className="text-foreground">Share</strong> (square with arrow), then{' '}
                <strong className="text-foreground">Add to Home Screen</strong>.
              </span>
              <span className="block">
                <strong className="text-foreground">Chrome:</strong> tap <strong className="text-foreground">Share</strong>{' '}
                in the toolbar, then <strong className="text-foreground">Add to Home Screen</strong> (you may need to scroll
                the actions list). If it doesn&apos;t appear, open this page in Safari and use Share there—Apple is stricter
                in third-party browsers.
              </span>
              <span className="block text-muted-foreground">
                The home screen icon opens full screen without the browser chrome—best for mirroring to a TV.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setInstallIosOpen(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}