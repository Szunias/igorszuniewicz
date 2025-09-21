#!/usr/bin/env node

const { ensureProjectRoot } = require('./track-utils/validation');
const { loadTracks, saveTracks, assertUniqueTrackId } = require('./track-utils/trackStorage');
const { appendTrackToFallback } = require('./track-utils/fallback');
const { updateMusicHtmlTimestamp } = require('./track-utils/html');
const { verifyTrackFiles } = require('./track-utils/verification');
const { promptForTrackData } = require('./track-utils/prompts');

async function main() {
  try {
    ensureProjectRoot();

    const track = await promptForTrackData();

    console.log('\n📝 Adding track to tracks.json...');
    const tracks = loadTracks();
    assertUniqueTrackId(tracks, track.id);
    tracks.push(track);
    saveTracks(tracks);
    console.log('✅ Updated tracks.json');

    console.log('📝 Adding track to music.js fallback...');
    const timestamp = appendTrackToFallback(track);
    console.log('✅ Updated music.js fallback');

    console.log('📝 Updating music.html timestamp...');
    updateMusicHtmlTimestamp(timestamp);
    console.log('✅ Updated music.html');

    console.log('\n🎉 Track added successfully!');
    console.log(`📂 Track ID: ${track.id}`);
    console.log(`🎵 Title: ${track.title}`);
    console.log(`🏷️  Tags: ${track.tags.join(', ')}`);
    console.log(`🖼️  Cover: ${track.cover}`);
    const primarySource = (track.sources || [])[0];
    if (primarySource) {
      console.log(`🎧 Audio: ${primarySource.url}`);
    }
    console.log('\n💡 Refresh your browser to see the new track!');

    verifyTrackFiles(track);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
