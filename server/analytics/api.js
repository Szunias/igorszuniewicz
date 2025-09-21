const { readAnalytics, writeAnalytics } = require('./storage');
const { createVisitorHash, createIpHash } = require('./hashing');
const { buildDashboardResponse } = require('./summary');

const ANALYTICS_ROUTE = '/api/analytics.php';

function isAnalyticsRequest(pathname) {
    return pathname === ANALYTICS_ROUTE;
}

function sendJson(res, statusCode, body, extraHeaders = {}) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...extraHeaders
    });
    res.end(JSON.stringify(body));
}

function handleOptions(res) {
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
}

function ensureDailyStatsEntry(analytics, today) {
    const existing = analytics.dailyStats[today];
    if (!existing) {
        return { visitors: new Set(), pageviews: 0 };
    }

    const visitors = new Set(Array.isArray(existing.visitors) ? existing.visitors : []);
    return {
        visitors,
        pageviews: existing.pageviews || 0
    };
}

function handlePost(req, res, body) {
    try {
        const data = JSON.parse(body);
        const analytics = readAnalytics();

        const visitorHash = createVisitorHash(req.headers['user-agent'] || '', req.headers['accept-language'] || '');
        const ipHash = createIpHash(req.connection.remoteAddress || '');

        const event = {
            ...data,
            timestamp: Date.now(),
            visitor_hash: visitorHash,
            ip_hash: ipHash
        };

        analytics.events.push(event);

        if (data.event === 'page_view') {
            analytics.totalVisits = (analytics.totalVisits || 0) + 1;

            const today = new Date().toISOString().split('T')[0];
            const dailyStats = ensureDailyStatsEntry(analytics, today);

            dailyStats.visitors.add(event.visitor_hash);
            dailyStats.pageviews++;

            analytics.dailyStats[today] = {
                visitors: Array.from(dailyStats.visitors),
                pageviews: dailyStats.pageviews
            };
        }

        writeAnalytics(analytics);

        sendJson(res, 200, { status: 'success' });
    } catch (error) {
        sendJson(res, 400, { error: 'Invalid data' });
    }
}

function handleGet(res, query) {
    const analytics = readAnalytics();

    if (query.counter) {
        sendJson(res, 200, {
            visits: analytics.totalVisits,
            formatted: (analytics.totalVisits || 0).toLocaleString()
        });
        return;
    }

    const range = query.range || '7d';
    const response = buildDashboardResponse(analytics, range);

    sendJson(res, 200, response);
}

function handleAnalyticsRequest(req, res, parsedUrl) {
    if (!isAnalyticsRequest(parsedUrl.pathname)) {
        return false;
    }

    if (req.method === 'OPTIONS') {
        handleOptions(res);
        return true;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => handlePost(req, res, body));
        return true;
    }

    if (req.method === 'GET') {
        handleGet(res, parsedUrl.query || {});
        return true;
    }

    sendJson(res, 405, { error: 'Method not allowed' }, { 'Allow': 'GET, POST, OPTIONS' });
    return true;
}

module.exports = {
    handleAnalyticsRequest
};
