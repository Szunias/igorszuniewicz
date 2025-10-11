#!/usr/bin/env node

const { ensureProjectRoot } = require('./track-utils/validation');
const { loadTracks, saveTracks, assertUniqueTrackId } = require('./track-utils/trackStorage');
const { appendTrackToFallback } = require('./track-utils/fallback');
const { updateMusicHtmlTimestamp } = require('./track-utils/html');
const { createTrack, parseTags } = require('./track-utils/trackFactory');

function printUsage() {
  console.log('Usage: node quick-add-track.js <id> <title> <audioFile> <coverFile> <tags> <year> [descEN]');
  console.log('Example: node quick-add-track.js "newtrack" "My New Track" "songs/newtrack.wav" "images/newcover.png" "electronic,techno" "2023" "Amazing track"');
}

function buildTrackFromArgs(args) {
  if (args.length < 6) {
    printUsage();
    process.exit(1);
  }

  const [id, title, audioFile, coverFile, tagsInput, year, descEN = ''] = args;
  const tags = parseTags(tagsInput);
  const autoDesc = descEN || `${tags.join(' ')} track with unique sound and atmosphere.`;

  return createTrack({
    id,
    title,
    audioFile,
    coverFile,
    tags,
    year,
    descriptions: { pl: autoDesc, en: autoDesc, nl: autoDesc }
  });
}

function main() {
  try {
    ensureProjectRoot();

    const track = buildTrackFromArgs(process.argv.slice(2));

    console.log(`🎵 Adding track: ${track.title}`);

    const tracks = loadTracks();
    assertUniqueTrackId(tracks, track.id);
    tracks.push(track);
    saveTracks(tracks);
    console.log('✅ Updated tracks.json');

    const timestamp = appendTrackToFallback(track);
    console.log('✅ Updated music.js');

    if (updateMusicHtmlTimestamp(timestamp)) {
      console.log('✅ Updated music.html');
    }

    console.log('🎉 Track added successfully!');
    console.log(`📂 ID: ${track.id}, 🎵 Title: ${track.title}, 🏷️ Tags: ${track.tags.join(', ')}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
