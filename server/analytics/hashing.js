const crypto = require('crypto');

function createVisitorHash(userAgent, acceptLanguage) {
    return crypto
        .createHash('sha256')
        .update(`${userAgent}${acceptLanguage}${new Date().toDateString()}`)
        .digest('hex');
}

function createIpHash(ipAddress) {
    return crypto
        .createHash('sha256')
        .update(`${ipAddress}${new Date().toDateString()}`)
        .digest('hex');
}

module.exports = {
    createVisitorHash,
    createIpHash
};
