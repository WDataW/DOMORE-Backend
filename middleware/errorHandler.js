const errorHandler = async (err, req, res, next) => {
    const customError = new Error('Something unexpected happened. Try again later');
    customError.statusCode = 500;
    if (err.message) customError.message = err.message;
    if (err.statusCode) customError.statusCode = err.statusCode
    res.status(customError.statusCode).json({
        message: err.message
    })
}
module.exports = errorHandler