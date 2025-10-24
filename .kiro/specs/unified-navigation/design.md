# Design Document

## Overview

System ujednolicenia nawigacji polega na usunięciu wszystkich wbudowanych stylów i struktur HTML nawigacji z poszczególnych plików HTML i zastąpieniu ich centralnym komponentem JavaScript. Każda strona będzie ładować ten sam komponent nawigacyjny, co zapewni spójność wizualną i ułatwi konserwację.

## Architecture

### Current State
- Każda strona HTML ma własne wbudowane style nawigacji w tagach `<style>`
- Style nawigacji są duplikowane w każdym pliku (header, nav, nav-links, mobile-menu, etc.)
- Niektóre strony mogą mieć różne implementacje nawigacji
- Trudna konserwacja - zmiany wymagają edycji wielu plików

### Target State
- Wszystkie strony ładują `assets/js/components/navigation.js`
- Wszystkie strony linkują `assets/css/navigation.css`
- Brak wbudowanych stylów nawigacji w plikach HTML
- Brak hardcoded HTML struktur nawigacji
- Jeden punkt zarządzania nawigacją

### Component Flow

```
Page Load
    ↓
Load navigation.css (styles)
    ↓
Load navigation.js (component)
    ↓
navigation.js auto-executes
    ↓
Generates HTML structure
    ↓
Inserts at beginning of <body>
    ↓
Initializes functionality:
    - Active link detection
    - Mobile menu
    - Scroll effects
    - Language switcher
```

## Components and Interfaces

### 1. Navigation Component (`assets/js/components/navigation.js`)

**Responsibilities:**
- Generate complete navigation HTML structure
- Detect current page and set active link
- Handle relative paths for different folder levels
- Initialize mobile menu functionality
- Initialize scroll effects
- Auto-load on DOM ready

**Key Functions:**

```javascript
loadNavigation()
// Main function that generates and inserts navigation HTML
// Called automatically on DOM ready

getRelativePath()
// Returns '' for root pages, '../' for pages in subfolders
// Used to construct correct navigation links

setActiveLink()
// Detects current page from window.location.pathname
// Adds 'active' class to matching navigation link

initMobileMenu()
// Sets up mobile menu toggle, overlay, and close functionality

initScrollEffect()
// Adds 'scrolled' class to header when user scrolls down
```

### 2. Navigation Styles (`assets/css/navigation.css`)

**Sections:**
- Header styles (fixed positioning, backdrop blur, transitions)
- Desktop navigation (nav-links, hover effects, active states)
- Language switcher (button styles, active state)
- Mobile menu (toggle button, slide-in menu, overlay)
- Responsive breakpoints (@media queries)

**Key Classes:**
- `.header` - Fixed header container
- `.nav` - Flex container for logo and links
- `.nav-links` - Desktop navigation list
- `.mobile-menu-toggle` - Hamburger button
- `.mobile-menu` - Slide-in mobile navigation
- `.mobile-menu-overlay` - Dark overlay for mobile menu
- `.lang-switcher` - Language selection buttons

### 3. HTML Pages Integration

**Required Elements in Each Page:**

```html
<head>
  <!-- Navigation CSS -->
  <link rel="stylesheet" href="assets/css/navigation.css">
  <!-- or for project pages: -->
  <link rel="stylesheet" href="../assets/css/navigation.css">
</head>

<body>
  <!-- Navigation will be injected here by navigation.js -->
  
  <!-- Page content -->
  
  <!-- Navigation Component -->
  <script src="assets/js/components/navigation.js"></script>
  <!-- or for project pages: -->
  <script src="../assets/js/components/navigation.js"></script>
</body>
```

## Data Models

### Page Location Detection

```javascript
{
  pathname: string,           // window.location.pathname
  isInSubfolder: boolean,     // true if path includes '/projects/'
  relativePath: string        // '' or '../'
}
```

### Navigation State

```javascript
{
  isScrolled: boolean,        // header scrolled state
  isMobileMenuOpen: boolean,  // mobile menu open/closed
  activePage: string,         // current page identifier
  currentLanguage: string     // 'en', 'pl', or 'nl'
}
```

## Migration Strategy

### Phase 1: Main Pages (Root Level)
Files: `index.html`, `about.html`, `contact.html`, `music.html`

For each file:
1. Verify `navigation.css` link exists in `<head>`
2. Remove all inline `<style>` blocks containing navigation CSS
3. Remove hardcoded navigation HTML (if any)
4. Verify `navigation.js` script is loaded before `</body>`
5. Test page loads correctly with navigation

### Phase 2: Project Pages (Subfolder Level)
Files: All HTML files in `projects/` folder

For each file:
1. Verify `../assets/css/navigation.css` link exists
2. Remove all inline navigation styles
3. Remove hardcoded navigation HTML
4. Verify `../assets/js/components/navigation.js` script is loaded
5. Test navigation links work correctly with `../` prefix

### Phase 3: Verification
1. Test all pages load navigation correctly
2. Verify active link highlighting works
3. Test mobile menu on all pages
4. Verify language switcher integration
5. Test smooth navigation system compatibility

## CSS Cleanup Patterns

### Styles to Remove from HTML Files

**Header & Navigation:**
```css
.header { ... }
.header.scrolled { ... }
.nav { ... }
.logo { ... }
.nav-links { ... }
.nav-links a { ... }
.nav-links a:hover { ... }
.nav-links a::after { ... }
.nav-links a.active { ... }
```

**Language Switcher:**
```css
.lang-switcher { ... }
.lang-btn { ... }
.lang-btn:hover { ... }
.lang-btn.active { ... }
```

**Mobile Menu:**
```css
.mobile-menu-toggle { ... }
.mobile-menu-toggle span { ... }
.mobile-menu-toggle.active span { ... }
.mobile-menu { ... }
.mobile-menu.active { ... }
.mobile-menu-overlay { ... }
.mobile-menu-overlay.active { ... }
.mobile-nav-links { ... }
.mobile-nav-links a { ... }
.mobile-lang-switcher { ... }
```

**Responsive:**
```css
@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-menu-toggle { display: flex; }
  /* etc. */
}
```

## Error Handling

### Component Load Failures

**Problem:** `navigation.js` fails to load
**Solution:** 
- Component logs errors to console
- Graceful degradation - page content still visible
- User can manually navigate using browser back/forward

**Problem:** `document.body` is null when component tries to inject HTML
**Solution:**
- Component waits for DOMContentLoaded event
- Uses setTimeout to ensure body exists
- Logs error if body still unavailable

### Path Resolution Issues

**Problem:** Navigation links don't work from subfolder pages
**Solution:**
- `getRelativePath()` detects folder level
- Automatically adds `../` prefix for subfolder pages
- Tested on both root and project pages

### Mobile Menu Issues

**Problem:** Mobile menu doesn't close
**Solution:**
- Multiple close triggers: overlay click, link click
- Toggle button has active state management
- Event listeners properly attached

## Testing Strategy

### Unit Testing (Manual)
1. **Component Load Test**
   - Open each page
   - Verify navigation appears
   - Check console for errors

2. **Active Link Test**
   - Navigate to each page
   - Verify correct link is highlighted
   - Test from both root and subfolder pages

3. **Mobile Menu Test**
   - Resize browser to mobile width
   - Click hamburger button
   - Verify menu slides in
   - Click overlay to close
   - Verify menu slides out

4. **Scroll Effect Test**
   - Scroll down page
   - Verify header gets 'scrolled' class
   - Verify visual changes (padding, shadow)

### Integration Testing
1. **Translation System**
   - Verify `data-i18n` attributes present
   - Test language switching
   - Verify navigation text updates

2. **Smooth Navigation**
   - Click navigation links
   - Verify smooth page transitions
   - Verify no white flash

3. **Cross-Page Navigation**
   - Navigate from root to project page
   - Navigate from project to root page
   - Verify all links work correctly

### Browser Testing
- Chrome (desktop & mobile)
- Firefox (desktop & mobile)
- Safari (desktop & mobile)
- Edge (desktop)

### Regression Testing
- Verify existing functionality still works:
  - Page animations
  - Scroll reveal effects
  - Music player (on music page)
  - Contact form (on contact page)
  - Project modals/interactions

## Performance Considerations

### Load Order
1. Critical inline styles (prevent flash)
2. `preload-lang.js` (language detection)
3. `simple-smooth-nav.js` (smooth transitions)
4. `navigation.css` (navigation styles)
5. Page content
6. `navigation.js` (component injection)

### Optimization
- Navigation CSS is cached by browser
- Component JavaScript is minimal (~5KB)
- Auto-execution prevents layout shift
- No external dependencies

## Accessibility

### Keyboard Navigation
- All links focusable with Tab
- Mobile menu toggle has aria-label
- Proper focus management in mobile menu

### Screen Readers
- Semantic HTML structure (header, nav, ul, li)
- aria-label on mobile toggle button
- Proper heading hierarchy maintained

### Visual
- High contrast text colors
- Clear hover states
- Active link indication
- Mobile-friendly touch targets (min 44x44px)

## Dependencies

### Existing Systems
- **Translation System** (`assets/js/translations.js`)
  - Navigation uses `data-i18n` attributes
  - Language switcher buttons trigger translation updates
  
- **Smooth Navigation** (`assets/js/simple-smooth-nav.js`)
  - Navigation links work with smooth page transitions
  - No conflicts expected

### External Libraries
- None - vanilla JavaScript implementation

### Browser APIs
- `window.location.pathname` - page detection
- `document.body.insertAdjacentHTML` - HTML injection
- `window.addEventListener('scroll')` - scroll effects
- `document.querySelector/querySelectorAll` - DOM manipulation

## Rollback Plan

If issues occur during migration:

1. **Single Page Issue**
   - Restore inline styles for that page
   - Keep navigation.js loaded for future migration
   
2. **Component Failure**
   - Add fallback static HTML navigation
   - Keep styles in navigation.css
   - Debug component separately

3. **Complete Rollback**
   - Restore all inline styles from git history
   - Remove navigation.js script tags
   - Keep navigation.css for future use

## Future Enhancements

1. **Dynamic Active State**
   - Use intersection observer for section-based highlighting
   
2. **Dropdown Menus**
   - Add submenu support for project categories
   
3. **Search Integration**
   - Add search bar to navigation
   
4. **Breadcrumbs**
   - Add breadcrumb navigation for project pages

5. **Animation Improvements**
   - Add smooth transitions for active link indicator
   - Enhance mobile menu slide animation
