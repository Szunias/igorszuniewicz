function getCurrentTimestamp() {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function applyMusicJsTimestamp(content, timestamp) {
    return content
        .replace(/const __ts__ = '\\d+';/, `const __ts__ = '${timestamp}';`)
        .replace(/music\\.js\\?v=\\d+/g, `music.js?v=${timestamp}`);
}

function applyMusicHtmlTimestamp(content, timestamp) {
    return content.replace(/music\\.js\\?v=\\d+/g, `music.js?v=${timestamp}`);
}

module.exports = {
    getCurrentTimestamp,
    applyMusicJsTimestamp,
    applyMusicHtmlTimestamp
};
