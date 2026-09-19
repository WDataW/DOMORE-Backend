const Unauthorized = require('./Unauthorized');
const BadRequest = require('./BadRequest');
const NotFound = require('./NotFound');
const TooManyRequests = require('./TooManyRequests');
const ValidationError = require('./ValidationError');

module.exports = {
    ValidationError, Unauthorized, BadRequest, NotFound, TooManyRequests
}