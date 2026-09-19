const { StatusCodes } = require("http-status-codes");
const CustomError = require("./CustomError");

class ValidationError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.BAD_REQUEST;
    }
}


module.exports = ValidationError;