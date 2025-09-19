#!/usr/bin/env node

/**
 * List Tracks Script
 * Usage: node list-tracks.js [tag]
 */

const fs = require('fs');

function main() {
  const args = process.argv.slice(2);
  const filterTag = args[0];

  try {
    const tracksPath = 'assets/js/tracks.json';
    if (!fs.existsSync(tracksPath)) {
      console.log('❌ tracks.json not found');
      return;
    }

    const tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf8'));

    let filteredTracks = tracks;
    if (filterTag) {
      filteredTracks = tracks.filter(t => t.tags && t.tags.includes(filterTag));
      console.log(`🎵 Tracks with tag "${filterTag}":\n`);
    } else {
      console.log(`🎵 All tracks (${tracks.length} total):\n`);
    }

    if (filteredTracks.length === 0) {
      console.log('No tracks found');
      return;
    }

    filteredTracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title}`);
      console.log(`   ID: ${track.id}`);
      console.log(`   Artist: ${track.artist || 'Unknown'}`);
      console.log(`   Tags: ${(track.tags || []).join(', ')}`);
      console.log(`   Year: ${track.year || 'Unknown'}`);
      console.log(`   Audio: ${(track.sources && track.sources[0] && track.sources[0].url) || track.url || 'No audio'}`);
      console.log(`   Cover: ${track.cover || 'No cover'}`);
      console.log('');
    });

    // Show tag statistics
    const allTags = new Set();
    tracks.forEach(t => {
      if (t.tags) t.tags.forEach(tag => allTags.add(tag));
    });

    console.log(`📊 Available tags: ${Array.from(allTags).sort().join(', ')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (!fs.existsSync('assets/js/tracks.json')) {
  console.error('❌ Error: Please run this script from the website root directory');
  process.exit(1);
}

main();