const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Function to convert WAV to MP3 using system ffmpeg
async function convertWavToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const command = `ffmpeg -i "${inputPath}" -acodec libmp3lame -b:a 192k "${outputPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Function to check if ffmpeg is installed
function checkFFmpeg() {
    return new Promise((resolve) => {
        exec('ffmpeg -version', (error) => {
            resolve(!error);
        });
    });
}

// Main conversion function
async function convertAllWavFiles() {
    const songsDir = './songs';

    // Check if ffmpeg is available
    const hasFFmpeg = await checkFFmpeg();
    if (!hasFFmpeg) {
        console.log('❌ FFmpeg not found. Installing...');
        console.log('Please install FFmpeg:');
        console.log('1. Download from: https://ffmpeg.org/download.html');
        console.log('2. Add to PATH');
        console.log('3. Or install via: npm install @ffmpeg-installer/ffmpeg');
        return;
    }

    console.log('🎵 Starting WAV to MP3 conversion...');

    // Read all files in songs directory
    const files = fs.readdirSync(songsDir);
    const wavFiles = files.filter(file => file.toLowerCase().endsWith('.wav'));

    if (wavFiles.length === 0) {
        console.log('❌ No WAV files found in songs directory');
        return;
    }

    console.log(`Found ${wavFiles.length} WAV files to convert:`);
    wavFiles.forEach(file => console.log(`  - ${file}`));

    let converted = 0;
    let failed = 0;

    for (const wavFile of wavFiles) {
        const inputPath = path.join(songsDir, wavFile);
        const outputPath = path.join(songsDir, wavFile.replace(/\.wav$/i, '.mp3'));

        // Skip if MP3 already exists
        if (fs.existsSync(outputPath)) {
            console.log(`⏭️  ${wavFile} → Already exists as MP3`);
            continue;
        }

        try {
            console.log(`🔄 Converting: ${wavFile}`);
            await convertWavToMp3(inputPath, outputPath);

            // Check file sizes
            const originalSize = fs.statSync(inputPath).size;
            const convertedSize = fs.statSync(outputPath).size;
            const compression = Math.round((1 - convertedSize / originalSize) * 100);

            console.log(`✅ ${wavFile} → ${wavFile.replace(/\.wav$/i, '.mp3')} (${compression}% smaller)`);
            converted++;

        } catch (error) {
            console.log(`❌ Failed to convert ${wavFile}: ${error.message}`);
            failed++;
        }
    }

    console.log(`\n🎉 Conversion complete!`);
    console.log(`✅ Converted: ${converted} files`);
    console.log(`❌ Failed: ${failed} files`);
    console.log(`📁 MP3 files saved in: ${path.resolve(songsDir)}`);
}

// Alternative: Use online converter service
function generateDownloadScript() {
    const songsDir = './songs';
    const files = fs.readdirSync(songsDir);
    const wavFiles = files.filter(file => file.toLowerCase().endsWith('.wav'));

    console.log('\n🌐 Alternative: Online Converter URLs');
    console.log('If FFmpeg fails, use these online converters:');
    console.log('');

    wavFiles.forEach(file => {
        console.log(`${file}:`);
        console.log(`  - https://convertio.co/wav-mp3/`);
        console.log(`  - https://cloudconvert.com/wav-to-mp3`);
        console.log(`  - https://www.zamzar.com/convert/wav-to-mp3/`);
        console.log('');
    });
}

// Check if running as script
if (require.main === module) {
    console.log('🎵 WAV to MP3 Converter for Igor Szuniewicz');
    console.log('=====================================');

    convertAllWavFiles().catch(error => {
        console.error('❌ Conversion failed:', error.message);
        console.log('\nTrying alternative methods...');
        generateDownloadScript();
    });
}

module.exports = { convertAllWavFiles, convertWavToMp3 };