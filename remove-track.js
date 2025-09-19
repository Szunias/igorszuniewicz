#!/usr/bin/env node

/**
 * Track Removal Script
 * Usage: node remove-track.js <track_id>
 */

const fs = require('fs');

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node remove-track.js <track_id>');
    process.exit(1);
  }

  const trackId = args[0];
  console.log(`🗑️ Removing track: ${trackId}`);

  try {
    // Remove from tracks.json
    const tracksPath = 'assets/js/tracks.json';
    if (fs.existsSync(tracksPath)) {
      let tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf8'));
      const originalLength = tracks.length;
      tracks = tracks.filter(t => t.id !== trackId);
      if (tracks.length === originalLength) {
        console.log(`⚠️ Track "${trackId}" not found in tracks.json`);
      } else {
        fs.writeFileSync(tracksPath, JSON.stringify(tracks, null, 2));
        console.log('✅ Removed from tracks.json');
      }
    }

    // Remove from music.js fallback
    const musicJsPath = 'assets/js/music.js';
    let musicJs = fs.readFileSync(musicJsPath, 'utf8');

    // Find and remove the track entry - more precise pattern
    const lines = musicJs.split('\n');
    const newLines = [];
    let skipNext = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`id:"${trackId}"`) || line.includes(`id:'${trackId}'`)) {
        // Found the track, skip lines until we find the end of this track object
        let braceCount = 0;
        let j = i;
        while (j < lines.length) {
          const currentLine = lines[j];
          braceCount += (currentLine.match(/\{/g) || []).length;
          braceCount -= (currentLine.match(/\}/g) || []).length;
          j++;
          if (braceCount <= 0 && currentLine.includes('}')) {
            // Remove comma if this was followed by one
            if (j < lines.length && lines[j].trim().startsWith(',')) {
              j++;
            }
            break;
          }
        }
        i = j - 1; // Skip to end of track
        continue;
      }
      newLines.push(line);
    }

    const newMusicJs = newLines.join('\n');

    if (newMusicJs !== musicJs) {
      // Update timestamp
      const currentTimestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const updatedMusicJs = newMusicJs.replace(/const __ts__ = '\d+';/, `const __ts__ = '${currentTimestamp}';`);

      fs.writeFileSync(musicJsPath, updatedMusicJs);
      console.log('✅ Removed from music.js');

      // Update music.html
      const musicHtmlPath = 'music.html';
      if (fs.existsSync(musicHtmlPath)) {
        let musicHtml = fs.readFileSync(musicHtmlPath, 'utf8');
        musicHtml = musicHtml.replace(/music\.js\?v=\d+/g, `music.js?v=${currentTimestamp}`);
        fs.writeFileSync(musicHtmlPath, musicHtml);
        console.log('✅ Updated music.html');
      }
    } else {
      console.log(`⚠️ Track "${trackId}" not found in music.js fallback`);
    }

    console.log(`🎉 Track "${trackId}" removed successfully!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (!fs.existsSync('assets/js/tracks.json') && !fs.existsSync('assets/js/music.js')) {
  console.error('❌ Error: Please run this script from the website root directory');
  process.exit(1);
}

main();