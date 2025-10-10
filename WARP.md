# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a professional portfolio website for Igor Szuniewicz, showcasing his work as a composer, audio engineer, and software developer. The site features:
- Multi-language support (EN, PL, NL)
- Interactive project showcase with slider
- Music streaming platform with custom player
- Performance-optimized media handling
- Static HTML site with extensive JavaScript enhancements

## Common Development Commands

### Image Optimization (Critical for Performance)
```bash
# Convert GIFs to video (high priority - saves 80-90% file size)
bash convert-gifs.sh

# Optimize PNG/JPG images using Node.js
npm install sharp
node optimize-images.js

# Quick batch conversion of PNGs to WebP using FFmpeg
Get-ChildItem *.png | ForEach-Object { ffmpeg -i $_.FullName -c:v libwebp -quality 80 ($_.BaseName + ".webp") }
```

### Development Workflow
```bash
# Install dependencies
npm install

# Launch development server (if using live-server)
npx live-server --port=8080 --no-browser

# Open specific pages for testing
start "" "index.html"          # Homepage
start "" "music.html"          # Music player
start "" "about.html"          # About page
start "" "projects/index.html" # Projects overview
```

### Performance Testing
```bash
# Check file sizes before optimization
Get-ChildItem assets/images/projects/*.gif | Sort-Object Length -Descending | Select-Object Name, @{Name="Size(MB)";Expression={[Math]::Round($_.Length/1MB,2)}}

# Test page load performance in Chrome DevTools
# Network tab -> Disable cache -> Reload -> Check total transfer size
```

## Architecture & Structure

### High-Level Architecture
This is a **performance-optimized static website** with extensive client-side enhancements:

1. **Static HTML Foundation**: Each page is a complete HTML document with embedded styles and structured data
2. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced features load conditionally
3. **Module-Based JavaScript**: ES6 modules loaded dynamically based on page context
4. **Multi-Language System**: Client-side translation with localStorage persistence
5. **Performance-First Media**: Extensive image/video optimization pipeline for web delivery

### Key Directories
```
├── assets/
│   ├── css/           # Modular stylesheets with versioning
│   ├── js/            # ES6 modules organized by function
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Page-specific features
│   │   ├── i18n/          # Translation system
│   │   ├── pages/         # Page-specific logic
│   │   └── utils/         # Utility functions
│   ├── images/        # Media assets (needs optimization)
│   └── icons/         # Favicon and app icons
├── projects/          # Project detail pages
├── api/              # Server-side analytics (PHP)
└── *.html            # Main site pages
```

### Critical Performance Considerations
**This site has MAJOR performance bottlenecks** that require immediate attention:

1. **Unoptimized Media Files**:
   - GIF files: 11-19MB each (should be <500KB as MP4/WebM)
   - PNG files: 8-9.5MB each (should be <500KB as WebP)
   - Total page load can exceed 100MB

2. **Optimization Pipeline Ready**:
   - `convert-gifs.sh`: Automated GIF→MP4/WebM conversion
   - `optimize-images.js`: PNG/JPG→WebP conversion with Sharp
   - HTML already updated with `<video>` and `<picture>` elements

3. **Before making changes**: Always run image optimization first

### JavaScript Architecture
- **Bootstrap System**: `assets/js/bootstrap.js` handles initialization and conditional loading
- **Translation System**: Full i18n with `assets/js/i18n/translate.js`
- **Component-Based**: Slider, reveal animations, music player as separate modules
- **Performance Monitoring**: Web vitals tracking and analytics integration

### HTML Structure Patterns
- **SEO-Optimized**: Rich structured data, proper meta tags, canonical URLs
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Progressive Enhancement**: Works without JS, enhanced with JS
- **Multi-Language**: Data attributes for translation (`data-i18n`)

### CSS Organization
- **Modular Stylesheets**: Separate files for themes, animations, components
- **Performance CSS**: Preload critical styles, lazy load non-critical
- **Custom Properties**: CSS variables for consistent theming
- **Responsive Design**: Mobile-first with progressive enhancement

### Media Handling Strategy
The site implements sophisticated media optimization:
1. **GIFs as Video**: Automatic fallback from WebM→MP4→GIF
2. **Responsive Images**: WebP with PNG/JPG fallbacks via `<picture>`
3. **Lazy Loading**: All non-critical images load on scroll
4. **Service Worker**: Caches optimized media for repeat visits

## Development Notes

### Adding New Projects
1. Create HTML file in `projects/` directory
2. Add project data to relevant JavaScript files
3. Optimize all media before adding (run optimization scripts)
4. Update navigation and sitemap

### Adding New Languages
1. Create translation object in `assets/js/i18n/`
2. Add language option to all pages' language selector
3. Test all pages with new language

### Performance Requirements
- Total page size must be <5MB after optimization
- LCP (Largest Contentful Paint) <2.5s
- All images optimized to WebP format with fallbacks
- GIFs converted to video format

### Critical File Relationships
- `index.html` ↔ `assets/js/pages/home.js` (homepage functionality)
- `music.html` ↔ `assets/js/pages/music.js` (music player)
- Any `.html` file ↔ `assets/js/bootstrap.js` (initialization)
- All pages depend on the translation system in `assets/js/i18n/`

### Deployment Checklist
1. Run image optimization scripts
2. Test all pages in multiple languages
3. Verify WebP/video fallbacks work in older browsers
4. Check Google PageSpeed Insights score (target: >90)
5. Validate HTML and check for broken links

This codebase prioritizes performance and user experience above all else. Always optimize media files before making other changes.