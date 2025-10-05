const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Lista PNG-ów do konwersji
const pngFiles = [
    // Covers (20.7MB total)
    'assets/images/covers/dwaadwdw.png',
    'assets/images/covers/GnosienneAlbumCover.png',
    'assets/images/covers/nottoday.png',
    'assets/images/covers/nottodaydar.png',
    'assets/images/covers/richter.png',
    'assets/images/covers/XianClashCover.png',

    // Akantilado (16.6MB total)
    'assets/images/projects-akantilado/jungleviewfromtopshot.png',
    'assets/images/projects-akantilado/junglewithbranchesfromnormalview.png',
    'assets/images/projects-akantilado/orangecatalikecreaturewithgoldenball.png',
    'assets/images/projects-akantilado/orangecatalikecreaturewithgoldenshinyballbegining.png',
    'assets/images/projects-akantilado/pinkcatalikecreature.png',

    // NotToday images (12.9MB total)
    'assets/images/projects/NotTodayGameScreenshot.png',
    'assets/images/projects/amorak.png',
    'assets/images/projects/deserve.png',
    'assets/images/projects/richter.png'
];

function getFileSize(filePath) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return (stats.size / (1024 * 1024)).toFixed(2);
    }
    return 0;
}

async function convertToWebP(pngPath) {
    if (!fs.existsSync(pngPath)) {
        console.log(`⚠️  File not found: ${pngPath}`);
        return { success: false };
    }

    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    const originalSize = getFileSize(pngPath);

    console.log(`\n🖼️  Converting: ${path.basename(pngPath)}`);
    console.log(`   Original: ${originalSize}MB`);

    try {
        await sharp(pngPath)
            .webp({
                quality: 80,
                effort: 6
            })
            .toFile(webpPath);

        const webpSize = getFileSize(webpPath);
        const savings = ((1 - (parseFloat(webpSize) / parseFloat(originalSize))) * 100).toFixed(1);

        console.log(`   ✅ WebP: ${webpSize}MB (${savings}% saved)`);

        return {
            success: true,
            originalSize: parseFloat(originalSize),
            webpSize: parseFloat(webpSize)
        };

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return { success: false };
    }
}

async function main() {
    console.log('🚀 Converting remaining large PNGs to WebP...\n');

    let totalOriginal = 0;
    let totalWebP = 0;
    let successCount = 0;

    for (const pngPath of pngFiles) {
        const result = await convertToWebP(pngPath);

        if (result.success) {
            totalOriginal += result.originalSize;
            totalWebP += result.webpSize;
            successCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Conversion Complete!\n');
    console.log(`Files converted: ${successCount}/${pngFiles.length}`);
    console.log(`Total original size: ${totalOriginal.toFixed(2)}MB`);
    console.log(`Total WebP size: ${totalWebP.toFixed(2)}MB`);
    console.log(`Total savings: ${((1 - (totalWebP / totalOriginal)) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
}

main().catch(console.error);
