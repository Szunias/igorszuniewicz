const fs = require('fs');
const path = require('path');

const ANALYTICS_FILE = path.join(__dirname, '..', '..', 'analytics.json');

function initializeStorage() {
    if (!fs.existsSync(ANALYTICS_FILE)) {
        fs.writeFileSync(
            ANALYTICS_FILE,
            JSON.stringify(
                {
                    events: [],
                    dailyStats: {},
                    totalVisits: 0
                },
                null,
                2
            )
        );
    }
}

function readAnalytics() {
    try {
        return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
    } catch (error) {
        return { events: [], dailyStats: {}, totalVisits: 0 };
    }
}

function writeAnalytics(data) {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

initializeStorage();

module.exports = {
    ANALYTICS_FILE,
    readAnalytics,
    writeAnalytics
};
