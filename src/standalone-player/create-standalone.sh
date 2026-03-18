#!/bin/bash

# Standalone Music Player Setup Script
# This script helps you create a standalone version of the music player
# Run this from your band website project root

echo "🎵 Standalone Music Player Setup Script"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -d "components" ]; then
    echo "❌ Error: components/ directory not found!"
    echo "Please run this script from your band website project root."
    exit 1
fi

# Create standalone player directory
echo "📁 Creating standalone-player directory..."
mkdir -p standalone-player/ui

# Copy the visualizer (complete, no modifications needed)
echo "✅ Copying PsychedelicVisualizer.tsx..."
cp components/PsychedelicVisualizer.tsx standalone-player/

# Copy UI components
echo "✅ Copying UI components..."
cp components/ui/button.tsx standalone-player/ui/ 2>/dev/null || echo "⚠️  button.tsx not found"
cp components/ui/slider.tsx standalone-player/ui/ 2>/dev/null || echo "⚠️  slider.tsx not found"
cp components/ui/input.tsx standalone-player/ui/ 2>/dev/null || echo "⚠️  input.tsx not found"
cp components/ui/label.tsx standalone-player/ui/ 2>/dev/null || echo "⚠️  label.tsx not found"
cp components/ui/select.tsx standalone-player/ui/ 2>/dev/null || echo "⚠️  select.tsx not found"
cp components/ui/dialog.tsx standalone-player/ui/ 2>/dev/null || echo "⚠️  dialog.tsx not found"
cp components/ui/accordion.tsx standalone-player/ui/ 2>/dev/null || echo "⚠️  accordion.tsx not found"

# Copy the main music player (will need manual modifications)
echo "✅ Copying MusicPlayer.tsx..."
cp components/MusicPlayer.tsx standalone-player/StandaloneMusicPlayer.tsx

# Copy the edit dialog (will need manual modifications)
echo "✅ Copying MusicPlayerEditDialog.tsx..."
cp components/MusicPlayerEditDialog.tsx standalone-player/StandaloneMusicPlayerEditDialog.tsx

# Create types file
echo "✅ Creating types.ts..."
cat > standalone-player/types.ts << 'EOF'
export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  url: string;
  visualizationId?: number;
}

export interface StandaloneMusicPlayerProps {
  tracks: Track[];
  enableEditMode?: boolean;
  onTracksChange?: (tracks: Track[]) => void;
  initialTrackIndex?: number;
  autoPlay?: boolean;
  className?: string;
}
EOF

# Create EditComponents.tsx
echo "✅ Creating EditComponents.tsx stub..."
cat > standalone-player/EditComponents.tsx << 'EOF'
// Extract EditDialog and AudioUpload components from EditableSection.tsx
// See COMPLETE_SETUP.md for instructions

import { ReactNode, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

// TODO: Copy EditDialog component from /components/EditableSection.tsx (lines 76-113)
// TODO: Copy AudioUpload component from /components/EditableSection.tsx (lines 200-301)
// Add inline uploadAudio function to AudioUpload

export function EditDialog() {
  // TO BE IMPLEMENTED
  return null;
}

export function AudioUpload() {
  // TO BE IMPLEMENTED
  return null;
}
EOF

echo ""
echo "✅ Files copied successfully!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Edit standalone-player/StandaloneMusicPlayer.tsx:"
echo "   - Remove 'useEditMode' import"
echo "   - Add StandaloneMusicPlayerProps interface"
echo "   - Replace function signature to accept props"
echo "   - Update edit dialog to use props"
echo ""
echo "2. Edit standalone-player/StandaloneMusicPlayerEditDialog.tsx:"
echo "   - Remove 'useEditMode' import"
echo "   - Add props interface and accept tracks/onTracksChange"
echo "   - Add inline uploadAudio function"
echo ""
echo "3. Complete standalone-player/EditComponents.tsx:"
echo "   - Copy EditDialog from EditableSection.tsx"
echo "   - Copy AudioUpload from EditableSection.tsx"
echo ""
echo "4. Review standalone-player/COMPLETE_SETUP.md for detailed instructions"
echo ""
echo "🎵 When complete, copy the standalone-player/ directory to your Cursor project!"
echo ""
EOF
