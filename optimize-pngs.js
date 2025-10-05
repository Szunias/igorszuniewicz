const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Lista PNG-ów do konwersji
const pngFiles = [
    'assets/images/projects/Add Shot 1.png',
    'assets/images/projects/Add Shot 2.png',
    'assets/images/projects/Add Shot 3.png',
    'assets/images/projects/amorak.png',
    'assets/images/projects/NotTodayPic1.png',
    'assets/images/projects/deserve.png',
    'assets/images/projects/richter.png'
];

async function optimizePNG(inputPath) {
    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const webpPath = path.join(dir, `${basename}.webp`);

    try {
        // Get original size
        const stats = fs.statSync(inputPath);
        const originalSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`\n📸 Converting: ${basename}${ext}`);
        console.log(`   Original size: ${originalSizeMB}MB`);

        // Convert to WebP
        await sharp(inputPath)
            .webp({ quality: 80, effort: 6 })
            .toFile(webpPath);

        // Get new size
        const webpStats = fs.statSync(webpPath);
        const webpSizeMB = (webpStats.size / (1024 * 1024)).toFixed(2);
        const savings = ((1 - (webpStats.size / stats.size)) * 100).toFixed(1);

        console.log(`   ✅ WebP size: ${webpSizeMB}MB`);
        console.log(`   💾 Saved: ${savings}%`);

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }
}

async function main() {
    console.log('🚀 Starting PNG to WebP conversion...\n');

    let totalOriginal = 0;
    let totalWebP = 0;
    let successCount = 0;

    for (const file of pngFiles) {
        if (fs.existsSync(file)) {
            const statsBefore = fs.statSync(file);
            totalOriginal += statsBefore.size;

            await optimizePNG(file);

            const webpFile = file.replace('.png', '.webp');
            if (fs.existsSync(webpFile)) {
                const statsAfter = fs.statSync(webpFile);
                totalWebP += statsAfter.size;
                successCount++;
            }
        } else {
            console.log(`\n⚠️  File not found: ${file}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Conversion Complete!\n');
    console.log(`Files converted: ${successCount}/${pngFiles.length}`);
    console.log(`Total original size: ${(totalOriginal / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`Total WebP size: ${(totalWebP / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`Total saved: ${((1 - (totalWebP / totalOriginal)) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
}

main().catch(console.error);
