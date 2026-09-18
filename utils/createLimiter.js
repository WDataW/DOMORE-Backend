const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { TooManyRequests } = require('../errors');

const createLimiter = ({ windowMs, max }) =>
    rateLimit({
        windowMs,
        max,
        keyGenerator: (req) => req?.user?.id || ipKeyGenerator(req.ip),
        handler: () => {
            throw new TooManyRequests(windowMs);
        }
    });

module.exports = createLimiter;