const fs = require('fs');
const { MUSIC_JS_PATH } = require('./constants');
const { getCurrentTimestamp, applyMusicJsTimestamp } = require('./timestamp');

function safeStringify(value) {
    return JSON.stringify(value);
}

function formatSources(sources = []) {
    if (!sources.length) {
        return '[]';
    }

    const serialized = sources
        .map(source => `{ url:${safeStringify(source.url)}, type:${safeStringify(source.type)} }`)
        .join(', ');

    return `[ ${serialized} ]`;
}

function formatTrackForFallback(track) {
    const sources = Array.isArray(track.sources) ? track.sources : [];

    return (
        `        { id:${safeStringify(track.id)},` +
        ` title:${safeStringify(track.title)},` +
        ` artist:${safeStringify(track.artist)},` +
        ` cover:${safeStringify(track.cover)},` +
        ` tags:${safeStringify(track.tags)},` +
        ` length: ${track.length || 0},` +
        ` date:${safeStringify(track.date)},` +
        ` year: ${track.year},` +
        ` desc:{ pl:${safeStringify(track.desc.pl)}, en:${safeStringify(track.desc.en)}, nl:${safeStringify(track.desc.nl)} },` +
        ` sources:${formatSources(sources)} }`
    );
}

function appendTrackToFallback(track) {
    const musicJs = fs.readFileSync(MUSIC_JS_PATH, 'utf8');
    const insertionPoint = musicJs.lastIndexOf('      ];');

    if (insertionPoint === -1) {
        throw new Error('Could not find fallback tracks array in music.js');
    }

    const fallbackTrack = formatTrackForFallback(track);
    const before = musicJs.substring(0, insertionPoint);
    const after = musicJs.substring(insertionPoint);
    const updatedMusicJs = `${before},\n${fallbackTrack}\n${after}`;

    const timestamp = getCurrentTimestamp();
    const finalContent = applyMusicJsTimestamp(updatedMusicJs, timestamp);
    fs.writeFileSync(MUSIC_JS_PATH, finalContent);

    return timestamp;
}

function removeTrackFromFallback(trackId) {
    const musicJs = fs.readFileSync(MUSIC_JS_PATH, 'utf8');
    const lines = musicJs.split('\n');
    const newLines = [];
    let removed = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const normalizedId = JSON.stringify(trackId);
        if (
            line.includes(`id:"${trackId}"`) ||
            line.includes(`id:'${trackId}'`) ||
            line.includes(`id:${normalizedId}`)
        ) {
            removed = true;
            let braceCount = 0;
            let j = i;

            while (j < lines.length) {
                const currentLine = lines[j];
                braceCount += (currentLine.match(/\{/g) || []).length;
                braceCount -= (currentLine.match(/\}/g) || []).length;
                j++;

                if (braceCount <= 0 && currentLine.includes('}')) {
                    if (j < lines.length && lines[j].trim().startsWith(',')) {
                        j++;
                    }
                    break;
                }
            }

            i = j - 1;
            continue;
        }

        newLines.push(line);
    }

    if (!removed) {
        return { removed: false };
    }

    const timestamp = getCurrentTimestamp();
    const updatedMusicJs = applyMusicJsTimestamp(newLines.join('\n'), timestamp);
    fs.writeFileSync(MUSIC_JS_PATH, updatedMusicJs);

    return { removed: true, timestamp };
}

module.exports = {
    appendTrackToFallback,
    removeTrackFromFallback,
    formatTrackForFallback
};
