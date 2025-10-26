const fs = require('fs');
const { MUSIC_HTML_PATH } = require('./constants');
const { applyMusicHtmlTimestamp } = require('./timestamp');

function updateMusicHtmlTimestamp(timestamp) {
    if (!fs.existsSync(MUSIC_HTML_PATH)) {
        return false;
    }

    const content = fs.readFileSync(MUSIC_HTML_PATH, 'utf8');
    const updated = applyMusicHtmlTimestamp(content, timestamp);
    fs.writeFileSync(MUSIC_HTML_PATH, updated);
    return true;
}

module.exports = {
    updateMusicHtmlTimestamp
};
