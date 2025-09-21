const readline = require('readline');
const { createTrack } = require('./trackFactory');
const { DEFAULT_ARTIST } = require('./constants');

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

function askQuestion(rl, question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function promptForTrackData() {
    console.log('🎵 Track Addition Tool\n');

    const rl = createInterface();

    try {
        const id = await askQuestion(rl, 'Track ID (unique): ');
        const title = await askQuestion(rl, 'Track Title: ');
        const artistInput = await askQuestion(rl, 'Artist (default: Igor Szuniewicz): ');
        const artist = artistInput || DEFAULT_ARTIST;
        const audioFile = await askQuestion(rl, 'Audio file path (in songs/): ');
        const coverFile = await askQuestion(rl, 'Cover image path (in images/): ');
        const tagsInput = await askQuestion(rl, 'Tags (comma-separated, e.g. techno,electronic): ');
        const year = await askQuestion(rl, 'Release year: ');
        const descPL = await askQuestion(rl, 'Description (Polish): ');
        const descEN = await askQuestion(rl, 'Description (English): ');
        const descNL = await askQuestion(rl, 'Description (Dutch): ');

        const track = createTrack({
            id,
            title,
            artist,
            audioFile,
            coverFile,
            tags: tagsInput,
            year,
            descriptions: { pl: descPL, en: descEN, nl: descNL }
        });

        return track;
    } finally {
        rl.close();
    }
}

module.exports = {
    promptForTrackData
};
