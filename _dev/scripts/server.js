const http = require('http');
const url = require('url');
const { handleAnalyticsRequest } = require('./server/analytics/api');
const { serveStaticFile } = require('./server/static/fileServer');

const PORT = 8000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (handleAnalyticsRequest(req, res, parsedUrl)) {
        return;
    }

    serveStaticFile(parsedUrl.pathname, res, { rootDir: __dirname });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Analytics: http://localhost:${PORT}/analytics.html`);
});
