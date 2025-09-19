#!/usr/bin/env node

/**
 * Quick Track Addition Script
 * Usage: node quick-add-track.js <id> <title> <audioFile> <coverFile> <tags> <year> [descEN]
 *
 * Example:
 * node quick-add-track.js "newtrack" "My New Track" "songs/newtrack.wav" "images/newcover.png" "electronic,techno" "2023" "Amazing electronic track"
 */

const fs = require('fs');

function safeStringify(str) {
  return JSON.stringify(str);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 6) {
    console.log('Usage: node quick-add-track.js <id> <title> <audioFile> <coverFile> <tags> <year> [descEN]');
    console.log('Example: node quick-add-track.js "newtrack" "My New Track" "songs/newtrack.wav" "images/newcover.png" "electronic,techno" "2023" "Amazing track"');
    process.exit(1);
  }

  const [id, title, audioFile, coverFile, tagsInput, year, descEN = ''] = args;
  const artist = 'Igor Szuniewicz';
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  const date = `${year}-01-01`;

  // Auto-generate descriptions if not provided
  const autoDesc = descEN || `${tags.join(' ')} track with unique sound and atmosphere.`;

  const track = {
    id,
    title,
    artist,
    cover: coverFile,
    tags,
    length: 0,
    date,
    year: parseInt(year),
    desc: {
      pl: autoDesc,
      en: autoDesc,
      nl: autoDesc
    },
    sources: [{ url: audioFile, type: 'audio/wav' }]
  };

  try {
    console.log(`🎵 Adding track: ${title}`);

    // Update tracks.json
    const tracksPath = 'assets/js/tracks.json';
    let tracks = [];

    if (fs.existsSync(tracksPath)) {
      tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf8'));
    }

    if (tracks.find(t => t.id === id)) {
      throw new Error(`Track with ID "${id}" already exists!`);
    }

    tracks.push(track);
    fs.writeFileSync(tracksPath, JSON.stringify(tracks, null, 2));
    console.log('✅ Updated tracks.json');

    // Update music.js fallback
    const musicJsPath = 'assets/js/music.js';
    let musicJs = fs.readFileSync(musicJsPath, 'utf8');

    const fallbackTrack = `        { id:${safeStringify(id)}, title:${safeStringify(title)}, artist:${safeStringify(artist)}, cover:${safeStringify(coverFile)}, tags:${JSON.stringify(tags)}, length: 0, date:${safeStringify(date)}, year: ${parseInt(year)}, desc:{ pl:${safeStringify(autoDesc)}, en:${safeStringify(autoDesc)}, nl:${safeStringify(autoDesc)} }, sources:[ { url:${safeStringify(audioFile)}, type:'audio/wav' } ] }`;

    const insertionPoint = musicJs.lastIndexOf('      ];');
    if (insertionPoint === -1) {
      throw new Error('Could not find fallback tracks array in music.js');
    }

    const before = musicJs.substring(0, insertionPoint);
    const after = musicJs.substring(insertionPoint);
    const newMusicJs = before + ',\n' + fallbackTrack + '\n' + after;

    // Update timestamp
    const currentTimestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const updatedMusicJs = newMusicJs.replace(/const __ts__ = '\d+';/, `const __ts__ = '${currentTimestamp}';`);

    fs.writeFileSync(musicJsPath, updatedMusicJs);
    console.log('✅ Updated music.js');

    // Update music.html
    const musicHtmlPath = 'music.html';
    if (fs.existsSync(musicHtmlPath)) {
      let musicHtml = fs.readFileSync(musicHtmlPath, 'utf8');
      musicHtml = musicHtml.replace(/music\.js\?v=\d+/g, `music.js?v=${currentTimestamp}`);
      fs.writeFileSync(musicHtmlPath, musicHtml);
      console.log('✅ Updated music.html');
    }

    console.log('🎉 Track added successfully!');
    console.log(`📂 ID: ${id}, 🎵 Title: ${title}, 🏷️ Tags: ${tags.join(', ')}`);

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