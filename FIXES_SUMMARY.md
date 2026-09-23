# Mobile-Specific Bug Fixes Summary

## 1. Fixed Home Screen Text Vanishing (`src/pages/Home.tsx`)
**Issue**: Subtitles under Quick Access buttons (CPR, Bleeding, etc.) disappeared on mobile phones.

**Fix Applied**:
- Removed `hidden sm:block` Tailwind classes from all subtitle `<p>` tags
- Changed text styling to use `text-[9px] sm:text-[10px]` with `leading-tight` for proper wrapping
- Affected cards: CPR, Bleeding, Choking, Pregnancy

**Files Modified**:
- `src/pages/Home.tsx` (lines 160, 171, 182, 193)

## 2. Restored AR Hand Body Tracking (`src/pages/ArFirstAid.tsx`)
**Issue**: The `target` variable was hardcoded to `0.5, 0.4`, causing AR hand to freeze.

**Fix Applied**:
- Added new state: `const [sternumPoint, setSternumPoint] = useState<{x: number, y: number} | null>(null);`
- Updated `PoseDetectionCamera` to calculate sternum mid-point from live MediaPipe pose data:
  ```tsx
  <PoseDetectionCamera
    videoRef={videoRef}
    onPoseDetected={(poseData) => {
      updateTracker(poseData);
      if (poseData.leftShoulder && poseData.rightShoulder) {
        setSternumPoint({
          x: (poseData.leftShoulder.x + poseData.rightShoulder.x) / 2,
          y: (poseData.leftShoulder.y + poseData.rightShoulder.y) / 2 + 0.15 // Drop anatomically to sternum
        });
      }
    }}
    onError={handleCameraError}
    className="absolute inset-0"
  />
  ```

**Files Modified**:
- `src/pages/ArFirstAid.tsx` (added state on line 29, updated PoseDetectionCamera on lines 97-108)

## 3. Fixed Audio Metronome Failing to Start (`src/components/ar/CPRMetronome.tsx`)
**Issue**: Audio metronome failed to start automatically due to manual button requirement.

**Fix Applied**:
- Removed manual "Start CPR Pacing" button and `pacingEnabled` state
- Metronome now starts automatically when `isActive` is true and haptic feedback available
- Simplified component to always display the metronome when active
- Maintained proper cleanup in useEffect return function

**Files Modified**:
- `src/components/ar/CPRMetronome.tsx` (removed pacingEnabled state and button, simplified return logic)

## Verification
All fixes address the specific mobile-specific bugs mentioned:
1. Text visibility on small viewports ✓
2. Live AR hand tracking via MediaPipe pose data ✓
3. Automatic audio metronome startup ✓

These changes maintain offline functionality, zero network calls, and zero TypeScript errors as required by the project constraints.