# 🚀 Image Optimization Guide

## Problem Analysis

Your portfolio has **serious performance issues** due to large images:

### 📊 Current State:
- **GIFs**: 11-19MB each (should be <500KB or converted to video)
- **PNGs**: 8-9.5MB each (should be <500KB)
- **Total load time**: Likely 10-30 seconds on slow connections
- **Bandwidth waste**: ~100MB+ per page load

### 🎯 Target State:
- **GIFs → MP4/WebM**: 90-95% size reduction
- **PNG/JPG → WebP**: 60-80% size reduction
- **Total load time**: <3 seconds on 3G
- **Bandwidth usage**: <5MB per page load

---

## 🛠️ Solution: 3-Step Optimization

### Step 1: Convert GIFs to Video (PRIORITY #1)

**Why?**
- GIFs are 5-10x larger than MP4/WebM for the same quality
- Your 15MB NotTodayGIF.gif → ~1-2MB MP4

**How to convert:**

```bash
# Using FFmpeg (recommended)
chmod +x convert-gifs.sh
./convert-gifs.sh
```

**Manual conversion per file:**
```bash
# To MP4 (best browser support)
ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -preset slow -crf 23 -an output.mp4

# To WebM (best compression)
ffmpeg -i input.gif -c:v libvpx-vp9 -crf 30 -b:v 0 -an output.webm
```

**Update HTML:**
```html
<!-- Replace this -->
<img src="assets/images/projects/NotTodayGIF.gif" alt="Not Today">

<!-- With this -->
<video autoplay loop muted playsinline class="project-video">
  <source src="assets/images/projects/NotTodayGIF.webm" type="video/webm">
  <source src="assets/images/projects/NotTodayGIF.mp4" type="video/mp4">
  <img src="assets/images/projects/NotTodayGIF.gif" alt="Not Today"> <!-- fallback -->
</video>
```

---

### Step 2: Optimize PNG/JPG Images

**Option A: Using Node.js Script**

```bash
# Install sharp
npm install sharp

# Run optimization
node optimize-images.js
```

**Option B: Online Tools (No Installation)**

1. **TinyPNG** (https://tinypng.com/)
   - Drag & drop PNG/JPG files
   - Free up to 20 images at a time
   - Usually 60-70% compression

2. **Squoosh** (https://squoosh.app/)
   - Google's image optimizer
   - Convert to WebP format
   - More control over quality

**Option C: Batch with FFmpeg**

```bash
# Convert to WebP
find assets/images -name "*.png" -exec sh -c \
  'ffmpeg -i "$1" -c:v libwebp -quality 80 "${1%.png}.webp"' _ {} \;
```

---

### Step 3: Implement Responsive Images

**Create `<picture>` elements for better optimization:**

```html
<picture>
  <!-- Modern browsers: WebP -->
  <source
    srcset="assets/images/projects/NotTodayPic1.webp 1x,
            assets/images/projects/NotTodayPic1@2x.webp 2x"
    type="image/webp">

  <!-- Fallback: optimized PNG -->
  <img
    src="assets/images/projects/NotTodayPic1-optimized.png"
    alt="Not Today Darling"
    loading="lazy"
    decoding="async">
</picture>
```

---

## 📋 Quick Action Plan

### Immediate Actions (Do Now):

1. **Convert 5 largest GIFs to video:**
   ```bash
   cd "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz"

   # Check if FFmpeg is installed
   ffmpeg -version

   # If not, download from: https://ffmpeg.org/download.html
   # Then run:
   bash convert-gifs.sh
   ```

2. **Optimize largest PNGs** using TinyPNG:
   - Upload: Add Shot 1.png, Add Shot 2.png, Add Shot 3.png
   - Download optimized versions
   - Replace originals

3. **Update HTML** to use optimized files

### Medium Term (This Week):

1. Create WebP versions of all images
2. Implement `<picture>` tags with responsive sources
3. Add better lazy loading strategy
4. Set up build process for future images

### Long Term (Best Practices):

1. **Never upload images >1MB** to production
2. **Always convert GIFs to video** before deploying
3. **Use WebP + fallback** for all images
4. **Implement CDN** for even better performance

---

## 🧪 Testing Performance

### Before Optimization:
```bash
# Check current page size
curl -s https://igorszuniewicz.com/ | wc -c
```

### After Optimization:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page (Ctrl+Shift+R)
4. Check:
   - **Total size** should be <5MB
   - **Load time** should be <3s on Fast 3G
   - **LCP (Largest Contentful Paint)** should be <2.5s

---

## 🎨 CSS for Video Elements

Add to your CSS:

```css
/* Make videos behave like images */
.project-video {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
    object-fit: cover;
}

/* Prevent layout shift */
.project-video-container {
    position: relative;
    aspect-ratio: 16 / 9; /* or whatever your video ratio is */
}
```

---

## 🚨 Critical Files to Optimize First

Priority order based on size and visibility:

1. ✅ **AkantiladoGIF.gif** (19MB) → Convert to MP4
2. ✅ **NotTodayGIF.gif** (15MB) → Convert to MP4
3. ✅ **RayGIF.gif** (15MB) → Convert to MP4
4. ✅ **AmorakGIF.gif** (11MB) → Convert to MP4
5. ✅ **Add Shot 2.png** (9.5MB) → Compress to WebP
6. ✅ **Add Shot 3.png** (9MB) → Compress to WebP
7. ✅ **Add Shot 1.png** (8.3MB) → Compress to WebP

**Expected savings: ~80-100MB total!**

---

## 💡 Tips

- Always keep original files as backup
- Test on slow connection (Chrome DevTools → Network → Slow 3G)
- Use `loading="lazy"` on all images below the fold
- Consider using a CDN like Cloudflare for image optimization
- Set up GitHub Actions to auto-optimize on commit

---

## Need Help?

If you get stuck, I can:
1. Convert specific files for you
2. Update HTML with optimized versions
3. Set up automated optimization pipeline
