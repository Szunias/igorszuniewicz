#!/bin/bash

# GIF to MP4 Conversion Script
# Converts large GIFs to optimized MP4 videos for web

echo "🎬 Converting GIFs to MP4..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed"
    echo "Install from: https://ffmpeg.org/download.html"
    exit 1
fi

# Directory containing GIFs
PROJECTS_DIR="assets/images/projects"

# Find all GIF files
GIF_FILES=(
    "$PROJECTS_DIR/AkantiladoGIF.gif"
    "$PROJECTS_DIR/NotTodayGIF.gif"
    "$PROJECTS_DIR/RayGIF.gif"
    "$PROJECTS_DIR/AmorakGIF.gif"
    "$PROJECTS_DIR/AudioLabGif.gif"
)

# Function to convert GIF to MP4
convert_gif() {
    local input="$1"
    local basename=$(basename "$input" .gif)
    local output="${input%.gif}.mp4"
    local webm_output="${input%.gif}.webm"

    if [ ! -f "$input" ]; then
        echo "⚠️  File not found: $input"
        return
    fi

    echo -e "${BLUE}📹 Converting: $basename.gif${NC}"

    # Get original size
    original_size=$(du -h "$input" | cut -f1)

    # Convert to MP4 (better browser support)
    ffmpeg -i "$input" \
        -movflags faststart \
        -pix_fmt yuv420p \
        -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
        -c:v libx264 \
        -preset slow \
        -crf 23 \
        -an \
        "$output" \
        -y -loglevel error

    # Convert to WebM (better compression)
    ffmpeg -i "$input" \
        -c:v libvpx-vp9 \
        -crf 30 \
        -b:v 0 \
        -an \
        "$webm_output" \
        -y -loglevel error

    # Get new sizes
    mp4_size=$(du -h "$output" | cut -f1)
    webm_size=$(du -h "$webm_output" | cut -f1)

    echo -e "${GREEN}✅ Done!${NC}"
    echo "   Original GIF: $original_size"
    echo "   MP4 output:   $mp4_size"
    echo "   WebM output:  $webm_size"
    echo ""
}

# Convert each GIF
for gif in "${GIF_FILES[@]}"; do
    convert_gif "$gif"
done

echo "✨ All GIFs converted!"
echo ""
echo "📋 Next steps:"
echo "  1. Replace <img> tags with <video> tags in HTML"
echo "  2. Use both .webm and .mp4 for browser compatibility"
echo "  3. Test autoplay and loop attributes"
echo ""
echo "Example HTML:"
echo '<video autoplay loop muted playsinline>'
echo '  <source src="path/to/video.webm" type="video/webm">'
echo '  <source src="path/to/video.mp4" type="video/mp4">'
echo '  <img src="path/to/fallback.gif" alt="fallback">'
echo '</video>'
