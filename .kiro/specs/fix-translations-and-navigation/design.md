# Design Document

## Overview

This design addresses two critical issues affecting the portfolio website:

1. **Missing Translations**: The musicforgames.html page has incomplete translation coverage - only 3 keys are translated while the page contains extensive content that needs localization
2. **Navigation Bug**: After clicking "back to projects" from a project page, users cannot click on other project cards without refreshing

The solution involves expanding the translation system and fixing event listener conflicts in the navigation code.

## Architecture

### Translation System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HTML Pages                            │
│  (musicforgames.html, akantilado.html, etc.)            │
│  - Contains data-i18n attributes                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Translation Loader                          │
│  - Fetches locale JSON files                            │
│  - Caches translations in memory                        │
│  - Handles language switching                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Locale JSON Files                           │
│  locales/musicforgames.json                             │
│  locales/akantilado.json                                │
│  - Structured translation keys                          │
│  - EN, PL, NL language support                          │
└─────────────────────────────────────────────────────────┘
```

### Navigation System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              projects/index.html                         │
│  - Project cards with click handlers                    │
│  - Filter buttons                                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         smooth-navigation.js (DISABLED)                  │
│  - Currently commented out                              │
│  - Causes event listener conflicts                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         Standard Browser Navigation                      │
│  - Direct href navigation                               │
│  - No SPA-style interception                            │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Translation Data Structure

Each locale JSON file follows this structure:

```json
{
  "en": {
    "back": "← Back to Projects",
    "title": "Page Title",
    "subtitle": "Page subtitle",
    "section_name": {
      "title": "Section Title",
      "description": "Section description",
      "nested": {
        "key": "Nested value"
      }
    }
  },
  "pl": { /* Polish translations */ },
  "nl": { /* Dutch translations */ }
}
```

### 2. HTML Translation Attributes

HTML elements use `data-i18n` attributes with dot-notation keys:

```html
<h1 data-i18n="title">Default Text</h1>
<p data-i18n="section_name.description">Default description</p>
<span data-i18n="section_name.nested.key">Default nested</span>
```

### 3. Translation Loader Interface

```javascript
interface TranslationLoader {
  translations: Object;
  currentLang: string;
  
  loadTranslations(): Promise<void>;
  setLanguage(lang: string): void;
  getNestedValue(obj: Object, path: string): string;
}
```

### 4. Navigation Event Flow

```
User clicks project card
  ↓
Browser navigates to project page (standard navigation)
  ↓
Project page loads
  ↓
User clicks "back to projects"
  ↓
Browser navigates back to index (standard navigation)
  ↓
Index page loads fresh
  ↓
Event listeners re-attached
  ↓
Project cards clickable again
```

## Data Models

### Translation Key Structure for musicforgames.html

Based on the HTML content analysis, the following translation keys are needed:

```
musicforgames.json:
├── back (✓ exists)
├── title (✓ exists)
├── subtitle (✓ exists)
├── hero
│   ├── badge
│   └── meta_pills (array of 6 items)
├── audio_themes
│   ├── section_badge
│   ├── section_title
│   └── projects
│       ├── chase
│       │   ├── title
│       │   ├── bpm
│       │   ├── concept
│       │   └── sections (array of 5 items)
│       ├── race
│       │   ├── title
│       │   ├── bpm
│       │   ├── concept
│       │   └── sections (array of 4 items)
│       └── elimination
│           ├── title
│           ├── bpm
│           ├── concept
│           └── sections (array of 4 items)
├── video
│   ├── section_badge
│   └── section_title
└── footer
    ├── composed_by
    └── copyright
```

### Navigation State Model

```javascript
interface NavigationState {
  isNavigating: boolean;
  currentUrl: string;
  pageCache: Map<string, PageData>;
  eventListenersAttached: boolean;
}
```

## Error Handling

### Translation Errors

1. **Missing Translation File**
   - Fallback to English
   - Log warning to console
   - Display default HTML content

2. **Missing Translation Key**
   - Display default HTML content
   - Log warning with missing key path
   - Continue with other translations

3. **Invalid JSON**
   - Catch parse error
   - Fallback to empty translations object
   - Log error to console

### Navigation Errors

1. **Event Listener Conflicts**
   - Remove smooth-navigation.js initialization
   - Use standard browser navigation
   - Ensure clean event listener attachment on page load

2. **Broken Back Button**
   - Verify href points to correct path
   - Ensure no preventDefault() calls interfering
   - Test with browser back button

## Testing Strategy

### Translation Testing

1. **Visual Testing**
   - Load each project page
   - Switch between EN/PL/NL languages
   - Verify all text updates correctly
   - Check for missing translations (default text showing)

2. **Content Quality Testing**
   - Review Polish translations with native speaker perspective
   - Review Dutch translations with native speaker perspective
   - Ensure natural, human-sounding language
   - Verify technical terms are appropriate

3. **Edge Cases**
   - Test with slow network (translation loading)
   - Test with missing locale files
   - Test with malformed JSON
   - Test language persistence across pages

### Navigation Testing

1. **Click Flow Testing**
   ```
   Test Case 1: Basic Navigation
   1. Go to projects/index.html
   2. Click on any project card
   3. Verify project page loads
   4. Click "back to projects"
   5. Verify index page loads
   6. Click on different project card
   7. Verify project page loads ✓
   
   Test Case 2: Multiple Back/Forward
   1. Navigate to project A
   2. Back to index
   3. Navigate to project B
   4. Back to index
   5. Navigate to project C
   6. Verify all transitions work ✓
   
   Test Case 3: Browser Back Button
   1. Navigate through several projects
   2. Use browser back button
   3. Verify navigation works correctly
   4. Use browser forward button
   5. Verify navigation works correctly ✓
   ```

2. **Event Listener Testing**
   - Verify no duplicate listeners attached
   - Check console for errors
   - Monitor memory for leaks
   - Test rapid clicking

3. **Cross-Browser Testing**
   - Chrome
   - Firefox
   - Safari
   - Edge

## Implementation Approach

### Phase 1: Expand Translation Coverage

1. Analyze musicforgames.html for all translatable content
2. Create comprehensive translation keys in musicforgames.json
3. Add data-i18n attributes to all translatable elements
4. Write natural, human-sounding translations for PL and NL
5. Test translation switching

### Phase 2: Fix Navigation Bug

1. Investigate smooth-navigation.js event listener conflicts
2. Verify smooth-navigation.js is properly disabled
3. Ensure standard navigation works correctly
4. Remove any preventDefault() calls on project cards
5. Test back button functionality
6. Verify project cards are clickable after navigation

### Phase 3: Quality Assurance

1. Review all translations for natural language quality
2. Test complete navigation flow multiple times
3. Verify no console errors
4. Check performance (translation loading speed)
5. Cross-browser testing

## Design Decisions and Rationales

### Decision 1: Keep smooth-navigation.js Disabled

**Rationale**: The smooth-navigation.js system is currently commented out and causes event listener conflicts. Rather than debugging complex SPA-style navigation, we'll rely on standard browser navigation which is more reliable and requires less maintenance.

**Trade-offs**:
- ✓ More reliable navigation
- ✓ Simpler debugging
- ✓ Better browser compatibility
- ✗ No smooth page transitions
- ✗ Full page reloads

### Decision 2: Nested Translation Keys

**Rationale**: Using nested objects in JSON (e.g., `audio_themes.projects.chase.title`) provides better organization and prevents key naming conflicts.

**Trade-offs**:
- ✓ Better organization
- ✓ Clearer structure
- ✓ Easier to maintain
- ✗ Slightly more complex key paths
- ✗ Requires dot-notation parsing

### Decision 3: Human-First Translation Approach

**Rationale**: Translations should sound natural and human, not machine-generated. This requires careful review and rewriting of AI-generated translations to use natural idioms and sentence structures.

**Trade-offs**:
- ✓ Better user experience
- ✓ More professional presentation
- ✓ Authentic language feel
- ✗ More time-consuming
- ✗ Requires native speaker review

### Decision 4: Fallback to English

**Rationale**: If translations fail to load or keys are missing, fall back to English content rather than showing empty strings or error messages.

**Trade-offs**:
- ✓ Graceful degradation
- ✓ Content always visible
- ✓ Better user experience
- ✗ May not be obvious when translations are broken
- ✗ Requires default English in HTML

## Technical Constraints

1. **Browser Compatibility**: Must work in all modern browsers (Chrome, Firefox, Safari, Edge)
2. **Performance**: Translation loading should not block page rendering
3. **Maintainability**: Translation structure should be easy to extend for new pages
4. **Accessibility**: Language switching should be keyboard accessible
5. **SEO**: Default HTML content should be in English for search engines

## Future Considerations

1. **Translation Management**: Consider using a translation management system for larger scale
2. **Smooth Navigation**: Could revisit smooth-navigation.js after fixing core issues
3. **Language Detection**: Auto-detect user's browser language
4. **Translation Caching**: Cache translations in localStorage for faster loading
5. **RTL Support**: Consider right-to-left language support if needed
