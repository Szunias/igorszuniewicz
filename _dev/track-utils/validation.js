const fs = require('fs');
const { TRACKS_PATH, MUSIC_JS_PATH } = require('./constants');

function ensureProjectRoot() {
    if (!fs.existsSync(TRACKS_PATH) && !fs.existsSync(MUSIC_JS_PATH)) {
        throw new Error('Please run this script from the website root directory');
    }
}

module.exports = {
    ensureProjectRoot
};
