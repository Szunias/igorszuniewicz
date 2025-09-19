#!/usr/bin/env node

/**
 * Automated Track Addition Script
 * Usage: node add-track.js
 *
 * This script safely adds tracks to both tracks.json and music.js fallback
 * without manual editing and escaping issues.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function safeStringify(str) {
  return JSON.stringify(str);
}

function escapeForJS(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

async function main() {
  console.log('🎵 Track Addition Tool\n');

  try {
    // Collect track data
    const id = await ask('Track ID (unique): ');
    const title = await ask('Track Title: ');
    const artist = await ask('Artist (default: Igor Szuniewicz): ') || 'Igor Szuniewicz';
    const audioFile = await ask('Audio file path (in songs/): ');
    const coverFile = await ask('Cover image path (in images/): ');
    const tagsInput = await ask('Tags (comma-separated, e.g. techno,electronic): ');
    const year = await ask('Release year: ');
    const descPL = await ask('Description (Polish): ');
    const descEN = await ask('Description (English): ');
    const descNL = await ask('Description (Dutch): ');

    rl.close();

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const date = `${year}-01-01`;

    // Create track object
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
        pl: descPL,
        en: descEN,
        nl: descNL
      },
      sources: [{ url: audioFile, type: 'audio/wav' }]
    };

    console.log('\n📝 Adding track to tracks.json...');

    // Read and update tracks.json
    const tracksPath = 'assets/js/tracks.json';
    let tracks = [];

    if (fs.existsSync(tracksPath)) {
      tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf8'));
    }

    // Check for duplicate ID
    if (tracks.find(t => t.id === id)) {
      throw new Error(`Track with ID "${id}" already exists!`);
    }

    tracks.push(track);

    // Write tracks.json
    fs.writeFileSync(tracksPath, JSON.stringify(tracks, null, 2));
    console.log('✅ Updated tracks.json');

    console.log('📝 Adding track to music.js fallback...');

    // Update music.js fallback
    const musicJsPath = 'assets/js/music.js';
    let musicJs = fs.readFileSync(musicJsPath, 'utf8');

    // Generate fallback track entry
    const fallbackTrack = `        { id:${safeStringify(id)}, title:${safeStringify(title)}, artist:${safeStringify(artist)}, cover:${safeStringify(coverFile)}, tags:${JSON.stringify(tags)}, length: 0, date:${safeStringify(date)}, year: ${parseInt(year)}, desc:{ pl:${safeStringify(descPL)}, en:${safeStringify(descEN)}, nl:${safeStringify(descNL)} }, sources:[ { url:${safeStringify(audioFile)}, type:'audio/wav' } ] }`;

    // Find insertion point (before the closing bracket of fallbackTracks array)
    const insertionPoint = musicJs.lastIndexOf('      ];');
    if (insertionPoint === -1) {
      throw new Error('Could not find fallback tracks array in music.js');
    }

    // Insert the new track
    const before = musicJs.substring(0, insertionPoint);
    const after = musicJs.substring(insertionPoint);

    const newMusicJs = before + ',\n' + fallbackTrack + '\n' + after;

    // Update timestamp
    const currentTimestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const updatedMusicJs = newMusicJs
      .replace(/const __ts__ = '\d+';/, `const __ts__ = '${currentTimestamp}';`)
      .replace(/music\.js\?v=\d+/g, `music.js?v=${currentTimestamp}`);

    fs.writeFileSync(musicJsPath, updatedMusicJs);
    console.log('✅ Updated music.js fallback');

    // Update music.html timestamp
    console.log('📝 Updating music.html timestamp...');
    const musicHtmlPath = 'music.html';
    if (fs.existsSync(musicHtmlPath)) {
      let musicHtml = fs.readFileSync(musicHtmlPath, 'utf8');
      musicHtml = musicHtml.replace(/music\.js\?v=\d+/g, `music.js?v=${currentTimestamp}`);
      fs.writeFileSync(musicHtmlPath, musicHtml);
      console.log('✅ Updated music.html');
    }

    console.log('\n🎉 Track added successfully!');
    console.log(`📂 Track ID: ${id}`);
    console.log(`🎵 Title: ${title}`);
    console.log(`🏷️  Tags: ${tags.join(', ')}`);
    console.log(`🖼️  Cover: ${coverFile}`);
    console.log(`🎧 Audio: ${audioFile}`);
    console.log('\n💡 Refresh your browser to see the new track!');

    // Verify files exist
    console.log('\n🔍 Verifying files...');
    if (!fs.existsSync(audioFile)) {
      console.log(`⚠️  Warning: Audio file ${audioFile} not found`);
    } else {
      console.log(`✅ Audio file exists: ${audioFile}`);
    }

    if (!fs.existsSync(coverFile)) {
      console.log(`⚠️  Warning: Cover file ${coverFile} not found`);
    } else {
      console.log(`✅ Cover file exists: ${coverFile}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Verify we're in the right directory
if (!fs.existsSync('assets/js/tracks.json') && !fs.existsSync('assets/js/music.js')) {
  console.error('❌ Error: Please run this script from the website root directory');
  process.exit(1);
}

main();