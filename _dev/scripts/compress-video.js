const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

const videoPath = 'assets/images/projects-daw2/DigitalAudioWorkstation2.mp4';
const outputPath = 'assets/images/projects-daw2/DigitalAudioWorkstation2-compressed.mp4';

function getFileSize(filePath) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return (stats.size / (1024 * 1024)).toFixed(2);
    }
    return 0;
}

console.log('🎬 Compressing video...');
console.log(`Original size: ${getFileSize(videoPath)}MB`);

ffmpeg(videoPath)
    .outputOptions([
        '-movflags faststart',
        '-pix_fmt yuv420p',
        '-c:v libx264',
        '-preset slow',
        '-crf 28',  // Higher CRF = more compression (was 23)
        '-vf scale=-2:720',  // Scale down to 720p
        '-c:a aac',
        '-b:a 128k'
    ])
    .output(outputPath)
    .on('end', () => {
        const compressedSize = getFileSize(outputPath);
        const originalSize = parseFloat(getFileSize(videoPath));
        const savings = ((1 - (parseFloat(compressedSize) / originalSize)) * 100).toFixed(1);

        console.log(`✅ Compressed: ${compressedSize}MB`);
        console.log(`💾 Saved: ${savings}%`);
        console.log('\nReplace original? Run:');
        console.log(`mv "${outputPath}" "${videoPath}"`);
    })
    .on('error', (err) => {
        console.error(`❌ Error: ${err.message}`);
    })
    .run();
