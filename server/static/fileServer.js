const fs = require('fs');
const path = require('path');
const mimeTypes = require('../mimeTypes');

function serveStaticFile(pathname, res, options = {}) {
    const rootDir = options.rootDir || path.join(__dirname, '..', '..');
    const defaultFile = options.defaultFile || 'index.html';

    const requestedPath = pathname === '/' ? defaultFile : pathname;
    const filePath = path.join(rootDir, requestedPath);

    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        const ext = path.extname(filePath);
        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': mimeType });
        fs.createReadStream(filePath).pipe(res);
    });
}

module.exports = {
    serveStaticFile
};
