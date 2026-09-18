const { rateLimit } = require('express-rate-limit');
const { TooManyRequests } = require('../errors');

const rateLimiter = ({ windowMs, max }) =>
    rateLimit({
        windowMs,
        max,
        handler: () => {
            throw new TooManyRequests(windowMs);
        }
    });

module.exports = rateLimiter;