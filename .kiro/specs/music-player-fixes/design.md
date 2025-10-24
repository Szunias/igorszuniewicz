# Design Document

## Overview

This design document outlines the technical approach to fixing critical bugs in the music player interface on music.html. The fixes address four main areas: seek functionality (click and drag), time display consistency, progress bar visual glitches, and improved visual clarity of the progress indicator.

The current implementation has a basic click-to-seek feature but lacks drag support, has inconsistent time updates, and suffers from visual glitches due to conflicting CSS animations and update frequencies. The design focuses on creating a smooth, responsive, and visually stable player experience.

## Architecture

### Component Structure

The music player consists of several interconnected components:

```
Music Player System
├── Audio Element (HTML5 <audio>)
├── Player Bar UI
│   ├── Track Info Display
│   ├── Control Buttons
│   ├── Progress System ⭐ (Primary focus)
│   │   ├── Progress Bar Container
│   │   ├── Progress Fill
│   │   ├── Hover Preview
│   │   ├── Time Tooltip
│   │   └── Drag Handle
│   └── Volume Control
└── Event Management System
    ├── Audio Events
    ├── User Interaction Events
    └── State Management
```

### State Management

The player will maintain the following state variables:

```javascript
{
  isPlaying: boolean,
  isDragging: boolean,           // NEW: Track drag state
  currentTrackIndex: number,
  tracks: Array<Track>,
  audio: HTMLAudioElement,
  lastUpdateTime: number,        // NEW: Throttle updates
  dragStartX: number,            // NEW: Drag tracking
  hoverPosition: number | null   // NEW: Hover preview
}
```

## Components and Interfaces

### 1. Enhanced Progress Bar Component

#### HTML Structure (Modifications)

```html
<div class="player-progress-container">
  <span class="player-time" id="player-current-time">0:00</span>
  <div class="player-progress-bar" id="player-progress-bar">
    <div class="player-progress-fill" id="player-progress-fill">
      <div class="player-progress-handle"></div> <!-- NEW -->
    </div>
    <div class="player-progress-hover" id="player-progress-hover"></div> <!-- NEW -->
    <div class="player-progress-tooltip" id="player-progress-tooltip">0:00</div> <!-- NEW -->
  </div>
  <span class="player-time" id="player-total-time">0:00</span>
</div>
```

#### CSS Enhancements

**Key Changes:**
1. Add visible borders and background to progress bar
2. Add hover handle that appears on progress fill
3. Add hover preview indicator
4. Add time tooltip
5. Optimize animations to prevent flickering
6. Use `will-change` for GPU acceleration

```css
.player-progress-bar {
  /* Enhanced visibility */
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.05);
}

.player-progress-fill {
  /* Optimize for performance */
  will-change: width;
  transition: width 0.1s linear;
  /* Remove during drag */
}

.player-progress-fill.dragging {
  transition: none; /* Instant updates while dragging */
}

.player-progress-handle {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%) scale(0);
  width: 16px;
  height: 16px;
  background: radial-gradient(circle, #fff, #ec4899);
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(236, 72, 153, 0.8);
  transition: transform 0.2s ease;
  pointer-events: none;
}

.player-progress-bar:hover .player-progress-handle,
.player-progress-fill.dragging .player-progress-handle {
  transform: translateY(-50%) scale(1);
}

.player-progress-hover {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(236, 72, 153, 0.2);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  will-change: width, opacity;
}

.player-progress-bar:hover .player-progress-hover {
  opacity: 1;
}

.player-progress-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: rgba(15, 23, 42, 0.95);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
  border: 1px solid rgba(236, 72, 153, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.player-progress-bar:hover .player-progress-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.player-time {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  /* Prevent layout shift */
}
```

### 2. Seek Functionality System

#### Click-to-Seek (Enhanced)

**Current Implementation Issues:**
- Only works when audio has valid duration
- No visual feedback during seek
- Doesn't handle edge cases

**Enhanced Implementation:**

```javascript
function handleProgressBarClick(e) {
  // Prevent if audio not ready
  if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) {
    return;
  }
  
  const rect = progressBar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const newTime = percent * audio.duration;
  
  // Immediate visual feedback
  updateProgressUI(percent);
  
  // Seek audio
  audio.currentTime = newTime;
  
  // Update time display immediately
  currentTimeEl.textContent = formatTime(newTime);
}
```

#### Drag-to-Seek (New Feature)

**Implementation Strategy:**

```javascript
let isDragging = false;
let wasPlayingBeforeDrag = false;

function handleProgressBarMouseDown(e) {
  if (!audio.duration || isNaN(audio.duration)) return;
  
  isDragging = true;
  wasPlayingBeforeDrag = !audio.paused;
  
  // Add dragging class for styling
  progressFill.classList.add('dragging');
  
  // Attach global listeners
  document.addEventListener('mousemove', handleProgressBarDrag);
  document.addEventListener('mouseup', handleProgressBarMouseUp);
  
  // Handle initial position
  handleProgressBarDrag(e);
  
  // Prevent text selection
  e.preventDefault();
}

function handleProgressBarDrag(e) {
  if (!isDragging) return;
  
  const rect = progressBar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  
  // Update UI immediately
  updateProgressUI(percent);
  
  // Update time display
  const previewTime = percent * audio.duration;
  currentTimeEl.textContent = formatTime(previewTime);
  
  // Don't seek yet - wait for mouseup
}

function handleProgressBarMouseUp(e) {
  if (!isDragging) return;
  
  isDragging = false;
  progressFill.classList.remove('dragging');
  
  // Remove global listeners
  document.removeEventListener('mousemove', handleProgressBarDrag);
  document.removeEventListener('mouseup', handleProgressBarMouseUp);
  
  // Final seek
  const rect = progressBar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = percent * audio.duration;
  
  // Resume playback if was playing
  if (wasPlayingBeforeDrag) {
    audio.play();
  }
}

// Helper function
function updateProgressUI(percent) {
  progressFill.style.width = (percent * 100) + '%';
}
```

### 3. Time Display System

#### Current Issues:
- Updates can be inconsistent
- No monospaced font causing layout shifts
- Doesn't handle edge cases (NaN, Infinity)

#### Enhanced Implementation:

```javascript
// Throttled update system
let lastTimeUpdate = 0;
const TIME_UPDATE_INTERVAL = 100; // ms

function handleAudioTimeUpdate() {
  const now = Date.now();
  
  // Throttle updates
  if (now - lastTimeUpdate < TIME_UPDATE_INTERVAL) {
    return;
  }
  lastTimeUpdate = now;
  
  // Skip if dragging (user is controlling time)
  if (isDragging) {
    return;
  }
  
  // Validate duration
  if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) {
    return;
  }
  
  // Update progress bar
  const progress = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = progress + '%';
  
  // Update time display
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

function handleAudioLoadedMetadata() {
  if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
    totalTimeEl.textContent = formatTime(audio.duration);
  } else {
    totalTimeEl.textContent = '0:00';
  }
}

// Enhanced format function
function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
    return '0:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### 4. Hover Preview System

#### Implementation:

```javascript
function handleProgressBarMouseMove(e) {
  // Only show preview if not dragging and audio is ready
  if (isDragging || !audio.duration || isNaN(audio.duration)) {
    return;
  }
  
  const rect = progressBar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  
  // Update hover indicator
  progressHover.style.width = (percent * 100) + '%';
  
  // Update tooltip
  const hoverTime = percent * audio.duration;
  progressTooltip.textContent = formatTime(hoverTime);
  progressTooltip.style.left = (e.clientX - rect.left) + 'px';
}

function handleProgressBarMouseLeave() {
  // Hide hover elements
  progressHover.style.opacity = '0';
  progressTooltip.style.opacity = '0';
}

function handleProgressBarMouseEnter() {
  if (!isDragging && audio.duration) {
    progressHover.style.opacity = '1';
    progressTooltip.style.opacity = '1';
  }
}
```

## Data Models

### Track Model (Existing - No Changes)

```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  tags: string[];
  length: number;
  date: string;
  year: number;
  desc?: {
    pl: string;
    en: string;
    nl: string;
  };
  sources: AudioSource[];
}

interface AudioSource {
  url: string;
  type: string; // 'audio/mpeg' | 'audio/wav'
}
```

### Player State Model (Enhanced)

```typescript
interface PlayerState {
  // Existing
  isPlaying: boolean;
  currentTrackIndex: number;
  volume: number;
  
  // New
  isDragging: boolean;
  wasPlayingBeforeDrag: boolean;
  lastTimeUpdate: number;
  hoverPosition: number | null;
}
```

## Error Handling

### Audio Loading Errors

```javascript
audio.addEventListener('error', (e) => {
  console.error('Audio error:', e);
  
  // Reset UI to safe state
  progressFill.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  totalTimeEl.textContent = '0:00';
  
  // Stop dragging if active
  if (isDragging) {
    isDragging = false;
    progressFill.classList.remove('dragging');
    document.removeEventListener('mousemove', handleProgressBarDrag);
    document.removeEventListener('mouseup', handleProgressBarMouseUp);
  }
  
  // Pause playback
  pause();
  
  // Try next track after delay
  if (tracks.length > 1) {
    setTimeout(() => nextTrack(), 1000);
  }
});
```

### Invalid Duration Handling

```javascript
function isValidDuration(duration) {
  return duration && 
         !isNaN(duration) && 
         isFinite(duration) && 
         duration > 0;
}

// Use throughout codebase
if (!isValidDuration(audio.duration)) {
  // Disable seek functionality
  progressBar.style.cursor = 'not-allowed';
  return;
}
```

### Drag State Cleanup

```javascript
// Ensure drag state is cleaned up on page unload or errors
window.addEventListener('beforeunload', () => {
  if (isDragging) {
    isDragging = false;
    document.removeEventListener('mousemove', handleProgressBarDrag);
    document.removeEventListener('mouseup', handleProgressBarMouseUp);
  }
});

// Also clean up on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isDragging) {
    handleProgressBarMouseUp(new MouseEvent('mouseup'));
  }
});
```

## Testing Strategy

### Unit Testing Focus Areas

1. **Time Formatting**
   - Test with valid durations (0, 30, 90, 3600)
   - Test with invalid values (NaN, Infinity, null, undefined, negative)
   - Verify monospaced output format

2. **Progress Calculation**
   - Test percentage calculation with various positions
   - Test boundary conditions (0%, 100%, out of bounds)
   - Verify clamping works correctly

3. **State Management**
   - Test drag state transitions
   - Verify cleanup on errors
   - Test concurrent state changes

### Integration Testing Focus Areas

1. **Seek Functionality**
   - Click at various positions
   - Drag from start to end
   - Drag while playing vs paused
   - Rapid seeking
   - Seek near boundaries

2. **Time Display**
   - Load track and verify duration appears
   - Play and verify current time updates
   - Seek and verify immediate time update
   - Test with tracks of various lengths

3. **Visual Feedback**
   - Hover over progress bar
   - Drag progress bar
   - Verify no flickering during playback
   - Test animations are smooth

### Performance Testing

1. **Update Frequency**
   - Verify timeupdate throttling works
   - Measure FPS during playback
   - Test with multiple tracks

2. **Memory Leaks**
   - Verify event listeners are cleaned up
   - Test repeated play/pause/seek cycles
   - Monitor memory usage over time

### Browser Compatibility Testing

- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

### 1. Throttling Time Updates

```javascript
const TIME_UPDATE_INTERVAL = 100; // 10 updates per second max
let lastTimeUpdate = 0;

audio.addEventListener('timeupdate', () => {
  const now = Date.now();
  if (now - lastTimeUpdate < TIME_UPDATE_INTERVAL) {
    return;
  }
  lastTimeUpdate = now;
  
  // Actual update logic
  handleAudioTimeUpdate();
});
```

### 2. GPU Acceleration

```css
.player-progress-fill {
  will-change: width;
  transform: translateZ(0); /* Force GPU layer */
}

.player-progress-hover {
  will-change: width, opacity;
  transform: translateZ(0);
}
```

### 3. Debouncing Hover Updates

```javascript
let hoverUpdateFrame = null;

function handleProgressBarMouseMove(e) {
  if (hoverUpdateFrame) {
    cancelAnimationFrame(hoverUpdateFrame);
  }
  
  hoverUpdateFrame = requestAnimationFrame(() => {
    updateHoverPreview(e);
  });
}
```

### 4. Conditional Animation Removal

```javascript
// Remove transitions during drag for instant feedback
function startDrag() {
  progressFill.classList.add('dragging');
  progressFill.style.transition = 'none';
}

function endDrag() {
  progressFill.classList.remove('dragging');
  progressFill.style.transition = '';
}
```

## Implementation Notes

### Order of Implementation

1. **Phase 1: Visual Improvements** (Low Risk)
   - Enhanced CSS for progress bar visibility
   - Add hover handle and tooltip HTML/CSS
   - Improve time display styling

2. **Phase 2: Time Display Fixes** (Medium Risk)
   - Implement throttling
   - Add validation for duration
   - Fix format function edge cases

3. **Phase 3: Drag Functionality** (Higher Risk)
   - Implement mousedown/mousemove/mouseup handlers
   - Add drag state management
   - Integrate with existing seek logic

4. **Phase 4: Polish & Testing** (Low Risk)
   - Add hover preview functionality
   - Performance optimizations
   - Cross-browser testing

### Backward Compatibility

All changes are additive and don't break existing functionality:
- Existing click-to-seek continues to work
- Existing time display continues to work
- New features gracefully degrade if JavaScript fails

### Accessibility Considerations

- Progress bar remains keyboard accessible
- ARIA labels maintained
- Visual feedback doesn't rely solely on color
- Touch device support for drag (touchstart/touchmove/touchend)
