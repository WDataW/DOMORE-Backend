const { StatusCodes } = require('http-status-codes');
const notFound = async (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        message: 'Resource Not Found'
    });
}
module.exports = notFound;