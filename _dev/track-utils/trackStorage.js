const { TRACKS_PATH } = require('./constants');
const { readJsonFile, writeJsonFile } = require('./json');

function loadTracks() {
    return readJsonFile(TRACKS_PATH, []);
}

function saveTracks(tracks) {
    writeJsonFile(TRACKS_PATH, tracks);
}

function assertUniqueTrackId(tracks, trackId) {
    if (tracks.find(track => track.id === trackId)) {
        throw new Error(`Track with ID "${trackId}" already exists!`);
    }
}

module.exports = {
    loadTracks,
    saveTracks,
    assertUniqueTrackId
};
