#!/usr/bin/env node

const { ensureProjectRoot } = require('./track-utils/validation');
const { loadTracks, saveTracks } = require('./track-utils/trackStorage');
const { removeTrackFromFallback } = require('./track-utils/fallback');
const { updateMusicHtmlTimestamp } = require('./track-utils/html');

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node remove-track.js <track_id>');
    process.exit(1);
  }

  const trackId = args[0];
  console.log(`🗑️ Removing track: ${trackId}`);

  try {
    ensureProjectRoot();

    const tracks = loadTracks();
    const originalLength = tracks.length;
    const filteredTracks = tracks.filter(track => track.id !== trackId);

    if (filteredTracks.length === originalLength) {
      console.log(`⚠️ Track "${trackId}" not found in tracks.json`);
    } else {
      saveTracks(filteredTracks);
      console.log('✅ Removed from tracks.json');
    }

    const { removed, timestamp } = removeTrackFromFallback(trackId);
    if (removed) {
      console.log('✅ Removed from music.js');
      if (timestamp && updateMusicHtmlTimestamp(timestamp)) {
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

main();
