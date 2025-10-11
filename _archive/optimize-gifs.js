const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

// Lista GIF-ów do konwersji
const gifFiles = [
    { path: 'assets/images/projects/AkantiladoGIF.gif', name: 'AkantiladoGIF' },
    { path: 'assets/images/projects/NotTodayGIF.gif', name: 'NotTodayGIF' },
    { path: 'assets/images/projects/RayGIF.gif', name: 'RayGIF' },
    { path: 'assets/images/projects/AmorakGIF.gif', name: 'AmorakGIF' },
    { path: 'assets/images/projects/AudioLabGif.gif', name: 'AudioLabGif' },
    { path: 'assets/images/projects-pausedeserve/pausedeservegif.gif', name: 'pausedeservegif' },
    { path: 'assets/images/projects-daw2/richtergif.gif', name: 'richtergif' }
];

function getFileSize(filePath) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return (stats.size / (1024 * 1024)).toFixed(2);
    }
    return 0;
}

function convertToMP4(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`   Converting to MP4...`);

        ffmpeg(inputPath)
            .outputOptions([
                '-movflags faststart',
                '-pix_fmt yuv420p',
                '-c:v libx264',
                '-preset slow',
                '-crf 23',
                '-an'
            ])
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}

function convertToWebM(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`   Converting to WebM...`);

        ffmpeg(inputPath)
            .outputOptions([
                '-c:v libvpx-vp9',
                '-crf 30',
                '-b:v 0',
                '-an'
            ])
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}

async function convertGIF(gifInfo) {
    const { path: gifPath, name } = gifInfo;

    if (!fs.existsSync(gifPath)) {
        console.log(`\n⚠️  File not found: ${gifPath}`);
        return { success: false };
    }

    const dir = path.dirname(gifPath);
    const mp4Path = path.join(dir, `${name}.mp4`);
    const webmPath = path.join(dir, `${name}.webm`);

    const originalSize = getFileSize(gifPath);
    console.log(`\n🎬 Converting: ${name}.gif`);
    console.log(`   Original size: ${originalSize}MB`);

    try {
        // Convert to MP4
        await convertToMP4(gifPath, mp4Path);
        const mp4Size = getFileSize(mp4Path);
        console.log(`   ✅ MP4 created: ${mp4Size}MB`);

        // Convert to WebM
        await convertToWebM(gifPath, webmPath);
        const webmSize = getFileSize(webmPath);
        console.log(`   ✅ WebM created: ${webmSize}MB`);

        const mp4Savings = ((1 - (parseFloat(mp4Size) / parseFloat(originalSize))) * 100).toFixed(1);
        const webmSavings = ((1 - (parseFloat(webmSize) / parseFloat(originalSize))) * 100).toFixed(1);

        console.log(`   💾 MP4 saved: ${mp4Savings}%`);
        console.log(`   💾 WebM saved: ${webmSavings}%`);

        return {
            success: true,
            originalSize: parseFloat(originalSize),
            mp4Size: parseFloat(mp4Size),
            webmSize: parseFloat(webmSize)
        };

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return { success: false };
    }
}

async function main() {
    console.log('🚀 Starting GIF to MP4/WebM conversion...\n');
    console.log('This may take a few minutes...\n');

    let totalOriginal = 0;
    let totalMP4 = 0;
    let totalWebM = 0;
    let successCount = 0;

    for (const gifInfo of gifFiles) {
        const result = await convertGIF(gifInfo);

        if (result.success) {
            totalOriginal += result.originalSize;
            totalMP4 += result.mp4Size;
            totalWebM += result.webmSize;
            successCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Conversion Complete!\n');
    console.log(`Files converted: ${successCount}/${gifFiles.length}`);
    console.log(`Total original size: ${totalOriginal.toFixed(2)}MB`);
    console.log(`Total MP4 size: ${totalMP4.toFixed(2)}MB`);
    console.log(`Total WebM size: ${totalWebM.toFixed(2)}MB`);
    console.log(`MP4 savings: ${((1 - (totalMP4 / totalOriginal)) * 100).toFixed(1)}%`);
    console.log(`WebM savings: ${((1 - (totalWebM / totalOriginal)) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
}

main().catch(console.error);
