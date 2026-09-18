const { msToMinute } = require('../utils/time');
const CustomError = require('./CustomError');
const { StatusCodes } = require('http-status-codes');
class TooManyRequests extends CustomError {
    constructor(retryAfter) {// retryAfter is in milli-seconds
        super(`Too many request, try again later in ${msToMinute(retryAfter)} minutes`);
        this.statusCode = StatusCodes.TOO_MANY_REQUESTS;
    };
}
module.exports = TooManyRequests;