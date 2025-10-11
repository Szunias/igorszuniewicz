/**
 * Image Optimization Script
 * Converts large images to WebP and GIFs to MP4 for better performance
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const QUALITY = {
    webp: 80,
    jpeg: 85,
    png: 90
};

const MAX_WIDTH = 1920; // Max width for images
const OPTIMIZE_DIRS = [
    'assets/images/projects',
    'assets/images/covers',
    'assets/images/projects-ray',
    'assets/images/projects-amorak',
    'assets/images/projects-akantilado',
    'assets/images/projects-audioq',
    'assets/images/projects-environments'
];

/**
 * Get file size in MB
 */
function getFileSizeMB(filePath) {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
}

/**
 * Optimize single image
 */
async function optimizeImage(inputPath, outputDir) {
    const ext = path.extname(inputPath).toLowerCase();
    const basename = path.basename(inputPath, ext);
    const originalSize = getFileSizeMB(inputPath);

    // Skip GIFs (handle separately)
    if (ext === '.gif') {
        console.log(`⏭️  Skipping GIF: ${basename}${ext} (use FFmpeg for conversion)`);
        return;
    }

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Resize if too large
        let pipeline = image;
        if (metadata.width > MAX_WIDTH) {
            pipeline = pipeline.resize(MAX_WIDTH, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }

        // Create WebP version
        const webpPath = path.join(outputDir, `${basename}.webp`);
        await pipeline
            .clone()
            .webp({ quality: QUALITY.webp, effort: 6 })
            .toFile(webpPath);

        const webpSize = getFileSizeMB(webpPath);
        const savings = ((1 - (webpSize / originalSize)) * 100).toFixed(1);

        console.log(`✅ ${basename}${ext}`);
        console.log(`   Original: ${originalSize}MB → WebP: ${webpSize}MB (${savings}% smaller)`);

        // Also create optimized original format as fallback
        if (ext === '.png') {
            const fallbackPath = path.join(outputDir, `${basename}-optimized.png`);
            await pipeline
                .clone()
                .png({ quality: QUALITY.png, compressionLevel: 9 })
                .toFile(fallbackPath);
        } else if (ext === '.jpg' || ext === '.jpeg') {
            const fallbackPath = path.join(outputDir, `${basename}-optimized${ext}`);
            await pipeline
                .clone()
                .jpeg({ quality: QUALITY.jpeg, mozjpeg: true })
                .toFile(fallbackPath);
        }

    } catch (error) {
        console.error(`❌ Error optimizing ${basename}${ext}:`, error.message);
    }
}

/**
 * Process directory
 */
async function processDirectory(dir) {
    console.log(`\n📁 Processing: ${dir}`);

    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
        console.log(`   ⚠️  Directory not found, skipping...`);
        return;
    }

    // Create optimized subdirectory
    const optimizedDir = path.join(fullPath, 'optimized');
    if (!fs.existsSync(optimizedDir)) {
        fs.mkdirSync(optimizedDir, { recursive: true });
    }

    const files = fs.readdirSync(fullPath);
    const imageFiles = files.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });

    console.log(`   Found ${imageFiles.length} images to optimize`);

    for (const file of imageFiles) {
        const filePath = path.join(fullPath, file);
        await optimizeImage(filePath, optimizedDir);
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting Image Optimization...\n');
    console.log('This will:');
    console.log('  • Convert PNG/JPG to WebP (80% quality)');
    console.log('  • Resize images larger than 1920px width');
    console.log('  • Create optimized fallback versions');
    console.log('  • List GIFs that need FFmpeg conversion\n');

    for (const dir of OPTIMIZE_DIRS) {
        await processDirectory(dir);
    }

    console.log('\n✨ Optimization complete!\n');
    console.log('📋 Next steps:');
    console.log('  1. Convert GIFs to MP4 using FFmpeg (see convert-gifs.sh)');
    console.log('  2. Update HTML to use <picture> tags with WebP + fallback');
    console.log('  3. Use <video> tags instead of GIFs for animations');
}

// Check if sharp is installed
try {
    require.resolve('sharp');
    main().catch(console.error);
} catch (e) {
    console.error('❌ Sharp is not installed. Run: npm install sharp');
    console.log('\nOr use this simpler approach:');
    console.log('  1. Use online tools like TinyPNG, Squoosh.app');
    console.log('  2. Use FFmpeg to convert GIFs to MP4');
    console.log('  3. Manual optimization per image');
}
