const fs = require('fs');

function logFileStatus(label, filePath) {
    if (!filePath) {
        console.log(`⚠️  Warning: ${label} path not provided`);
        return;
    }

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Warning: ${label} file ${filePath} not found`);
    } else {
        console.log(`✅ ${label} file exists: ${filePath}`);
    }
}

function verifyTrackFiles(track) {
    console.log('\n🔍 Verifying files...');

    const primarySource = (track.sources || [])[0];
    logFileStatus('Audio', primarySource ? primarySource.url : undefined);
    logFileStatus('Cover', track.cover);
}

module.exports = {
    verifyTrackFiles
};
