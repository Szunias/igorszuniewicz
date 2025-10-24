# Design Document

## Overview

This design implements a comprehensive translation system for music.html and adds a modern, non-intrusive track information modal inspired by Spotify and Tidal. The solution maintains the existing player functionality while adding rich track details accessible through an info button on each playlist item.

## Architecture

### Component Structure

```
music.html
├── Translation System (existing assets/js/translations.js)
├── Track Info Modal (new component)
│   ├── Modal Overlay
│   ├── Modal Content
│   └── Close Handlers
└── Enhanced Playlist Items
    ├── Track Cover
    ├── Track Info
    ├── Duration
    └── Info Button (new)
```

### Data Flow

1. **Page Load**: Load translations from `locales/music.json` → Apply to all `[data-i18n]` elements
2. **Track Click**: Load track → Start playback (existing behavior)
3. **Info Button Click**: Open modal → Display track details → Keep player running
4. **Language Switch**: Update all translations including modal content if open

## Components and Interfaces

### 1. Translation System Extension

**File**: `locales/music.json`

Add missing translation keys:

```json
{
  "en": {
    "page_title": "Music Catalog",
    "page_description": "Original compositions spanning film scores, electronic music, and experimental sound design.",
    "playlist_title": "All Tracks",
    "filter_all": "All",
    "filter_film": "Film",
    "filter_electronic": "Electronic",
    "filter_metal": "Metal",
    "filter_techno": "Techno",
    "filter_single": "Singles",
    "track_info_title": "Track Information",
    "track_info_close": "Close",
    "track_info_no_description": "No description available for this track.",
    "track_info_year": "Year",
    "track_info_duration": "Duration",
    "track_info_tags": "Tags"
  },
  "pl": { /* Polish translations */ },
  "nl": { /* Dutch translations */ }
}
```

### 2. Track Info Modal Component

**HTML Structure** (injected dynamically):

```html
<div class="track-info-modal" id="track-info-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="track-info-backdrop" id="track-info-backdrop"></div>
  <div class="track-info-content">
    <button class="track-info-close" id="track-info-close" aria-label="Close">×</button>
    <div class="track-info-header">
      <img class="track-info-cover" id="modal-cover" src="" alt="">
      <div class="track-info-meta">
        <h2 class="track-info-track-title" id="modal-title"></h2>
        <p class="track-info-artist" id="modal-artist"></p>
      </div>
    </div>
    <div class="track-info-body">
      <div class="track-info-description" id="modal-description"></div>
      <div class="track-info-details">
        <div class="track-info-detail">
          <span class="track-info-label" data-i18n="track_info_year">Year</span>
          <span class="track-info-value" id="modal-year"></span>
        </div>
        <div class="track-info-detail">
          <span class="track-info-label" data-i18n="track_info_duration">Duration</span>
          <span class="track-info-value" id="modal-duration"></span>
        </div>
      </div>
      <div class="track-info-tags" id="modal-tags"></div>
    </div>
  </div>
</div>
```

**CSS Styling**:

```css
.track-info-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: none;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.track-info-modal.visible {
  display: flex;
  opacity: 1;
}

.track-info-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.track-info-content {
  position: relative;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(236, 72, 153, 0.3);
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .track-info-content {
    width: 95%;
    padding: 1.5rem;
  }
}
```

**JavaScript Interface**:

```javascript
const TrackInfoModal = {
  modal: null,
  backdrop: null,
  
  init() {
    // Create modal DOM structure
    // Attach event listeners
    // Setup keyboard navigation
  },
  
  open(trackIndex) {
    // Populate modal with track data
    // Apply current language translations
    // Show modal with animation
    // Trap focus
  },
  
  close() {
    // Hide modal with animation
    // Release focus trap
    // Continue playback
  },
  
  updateLanguage(lang) {
    // Re-translate modal content if open
  }
};
```

### 3. Enhanced Playlist Items

Add info button to each playlist item:

```html
<div class="playlist-item">
  <div class="playlist-cover">...</div>
  <div class="playlist-info">...</div>
  <div class="playlist-duration">...</div>
  <button class="playlist-info-btn" aria-label="Track information">ℹ️</button>
</div>
```

**CSS for Info Button**:

```css
.playlist-info-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ec4899;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.playlist-info-btn:hover {
  background: rgba(236, 72, 153, 0.2);
  border-color: rgba(236, 72, 153, 0.5);
  transform: scale(1.1);
}
```

## Data Models

### Track Data Structure (existing)

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
  sources: Array<{
    url: string;
    type: string;
  }>;
}
```

### Translation Data Structure

```typescript
interface MusicTranslations {
  en: TranslationKeys;
  pl: TranslationKeys;
  nl: TranslationKeys;
}

interface TranslationKeys {
  page_title: string;
  page_description: string;
  playlist_title: string;
  filter_all: string;
  filter_film: string;
  filter_electronic: string;
  filter_metal: string;
  filter_techno: string;
  filter_single: string;
  track_info_title: string;
  track_info_close: string;
  track_info_no_description: string;
  track_info_year: string;
  track_info_duration: string;
  track_info_tags: string;
  // Navigation keys from shared.json
  nav_home: string;
  nav_about: string;
  nav_projects: string;
  nav_music: string;
  nav_contact: string;
}
```

## Error Handling

### Missing Translations

- **Fallback Chain**: Current language → English → Hardcoded string
- **Console Warning**: Log missing keys in development
- **User Experience**: Always show content, never blank elements

### Missing Track Data

- **No Description**: Show default message from translations
- **No Year**: Display "—" placeholder
- **No Duration**: Show "—" or hide field
- **No Tags**: Hide tags section

### Modal Errors

- **Failed to Open**: Log error, don't break page
- **Focus Trap Issues**: Fallback to simple close button
- **Keyboard Navigation**: Ensure Escape always works

## Testing Strategy

### Unit Tests (Optional)

- Translation key resolution
- Modal open/close state management
- Focus trap functionality
- Language switching with modal open

### Integration Tests

1. **Translation System**
   - Load page → Verify all elements translated
   - Switch language → Verify updates within 200ms
   - Open modal → Switch language → Verify modal updates

2. **Track Info Modal**
   - Click info button → Modal opens
   - Verify player continues playback
   - Click backdrop → Modal closes
   - Press Escape → Modal closes
   - Tab navigation → Focus stays in modal

3. **Responsive Behavior**
   - Test on mobile (< 768px)
   - Test on tablet (768px - 1024px)
   - Test on desktop (> 1024px)

### Manual Testing Checklist

- [ ] All static text translates correctly (EN/PL/NL)
- [ ] Filter tags translate correctly
- [ ] Modal displays track info in selected language
- [ ] Player continues during modal interaction
- [ ] Modal closes on backdrop click
- [ ] Modal closes on Escape key
- [ ] Info button doesn't trigger track playback
- [ ] Keyboard navigation works (Tab, Shift+Tab, Escape)
- [ ] Screen reader announces modal correctly
- [ ] Mobile layout displays correctly
- [ ] No console errors

## Design Decisions

### Why Modal Instead of Expandable Rows?

- **Cleaner UI**: Doesn't disrupt playlist layout
- **More Space**: Can show full descriptions without scrolling
- **Industry Standard**: Spotify, Tidal, Apple Music use modals
- **Mobile Friendly**: Better UX on small screens

### Why Info Button Instead of Right-Click Menu?

- **Discoverability**: Visible affordance for users
- **Touch Friendly**: Works on mobile devices
- **Accessibility**: Keyboard and screen reader compatible
- **Consistency**: Matches existing UI patterns

### Why Extend Existing Translation System?

- **No Duplication**: Reuse proven translation logic
- **Consistency**: Same language switching behavior
- **Maintainability**: Single source of truth for translations
- **Performance**: Already loaded and initialized

### Why Not Interrupt Playback?

- **User Expectation**: Industry standard behavior
- **Use Case**: Users want to read while listening
- **Technical Simplicity**: No need to pause/resume logic
- **Better UX**: Seamless information access

## Implementation Notes

### Performance Considerations

- Modal DOM created once on page load (hidden)
- Track data populated on demand (not pre-rendered)
- Translations applied via existing system (no extra overhead)
- CSS animations use GPU-accelerated properties (opacity, transform)

### Accessibility Considerations

- ARIA roles and labels for screen readers
- Focus trap when modal open
- Keyboard navigation (Tab, Shift+Tab, Escape)
- Sufficient color contrast (WCAG AA)
- Touch targets minimum 44x44px

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS backdrop-filter with fallback
- ES6+ JavaScript (already used in existing code)
- No IE11 support (consistent with existing site)
