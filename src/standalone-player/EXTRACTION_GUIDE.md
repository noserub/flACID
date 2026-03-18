# Extraction Guide

This guide explains how to extract the complete standalone music player from your current project.

## Files to Copy

### 1. PsychedelicVisualizer.tsx

**Source:** `/components/PsychedelicVisualizer.tsx`  
**Destination:** `/standalone-player/PsychedelicVisualizer.tsx`

This file is already self-contained and can be copied as-is. No modifications needed.

```bash
cp components/PsychedelicVisualizer.tsx standalone-player/
```

### 2. Create StandaloneMusicPlayer.tsx

This is a modified version of `MusicPlayer.tsx` that accepts props instead of using EditModeContext.

**Key Changes:**
- Remove `useEditMode` import and usage
- Add props interface for tracks, enableEditMode, onTracksChange callbacks
- Pass tracks as props instead of getting from context
- Make edit mode optional via props

See the template in this directory for the complete implementation.

### 3. Create StandaloneMusicPlayerEditDialog.tsx

Modified version of `MusicPlayerEditDialog.tsx`:
- Remove `useEditMode` dependency
- Accept tracks and onChange as props
- Include inline uploadAudio function

### 4. Create EditComponents.tsx

Extract the reusable edit UI components from `EditableSection.tsx`:
- `EditDialog` component
- `AudioUpload` component (with inline upload logic)

### 5. UI Components Required

Copy these from `/components/ui/`:
- button.tsx
- slider.tsx
- input.tsx
- label.tsx
- select.tsx
- dialog.tsx
- accordion.tsx

### 6. Dependencies

Ensure these are installed in your target project:

```json
{
  "dependencies": {
    "lucide-react": "latest",
    "motion": "latest"
  }
}
```

## Quick Copy Script

You can use this bash script to copy all necessary files:

```bash
#!/bin/bash

# Create destination directory
mkdir -p standalone-player
mkdir -p standalone-player/ui

# Copy visualizer (no changes needed)
cp components/PsychedelicVisualizer.tsx standalone-player/

# Copy UI components
cp components/ui/button.tsx standalone-player/ui/
cp components/ui/slider.tsx standalone-player/ui/
cp components/ui/input.tsx standalone-player/ui/
cp components/ui/label.tsx standalone-player/ui/
cp components/ui/select.tsx standalone-player/ui/
cp components/ui/dialog.tsx standalone-player/ui/
cp components/ui/accordion.tsx standalone-player/ui/

echo "Files copied! Now create the modified components."
```

## Integration Steps

1. Copy all files to your new project
2. Update import paths to match your project structure
3. Ensure Tailwind CSS is configured
4. Import and use the StandaloneMusicPlayer component

```tsx
import { StandaloneMusicPlayer } from './standalone-player/StandaloneMusicPlayer';

function App() {
  const tracks = [...]; // Your tracks
  
  return <StandaloneMusicPlayer tracks={tracks} />;
}
```

## Complete Example

See `README.md` in this directory for full usage examples and API documentation.
