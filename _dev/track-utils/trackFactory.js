const { DEFAULT_ARTIST, DEFAULT_SOURCE_TYPE } = require('./constants');

function parseTags(input) {
    if (Array.isArray(input)) {
        return input;
    }

    if (!input) {
        return [];
    }

    return input
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
}

function createTrack({
    id,
    title,
    artist = DEFAULT_ARTIST,
    audioFile,
    coverFile,
    tags = [],
    year,
    descriptions = {},
    sourceType = DEFAULT_SOURCE_TYPE
}) {
    const numericYear = parseInt(year, 10);
    const safeYear = Number.isNaN(numericYear) ? new Date().getFullYear() : numericYear;
    const date = `${safeYear}-01-01`;
    const parsedTags = parseTags(tags);

    return {
        id,
        title,
        artist: artist || DEFAULT_ARTIST,
        cover: coverFile,
        tags: parsedTags,
        length: 0,
        date,
        year: safeYear,
        desc: {
            pl: descriptions.pl || '',
            en: descriptions.en || '',
            nl: descriptions.nl || ''
        },
        sources: [
            {
                url: audioFile,
                type: sourceType
            }
        ]
    };
}

module.exports = {
    createTrack,
    parseTags
};
