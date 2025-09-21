const fs = require('fs');

function readJsonFile(filePath, defaultValue) {
    if (!fs.existsSync(filePath)) {
        return defaultValue;
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
    readJsonFile,
    writeJsonFile
};
