const mongoose = require('mongoose');
const validator = require('validator');
const refreshTokenSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        immutable: true
    },
    ip: {
        type: String,
        validate: validator.isIP,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        validate: validator.isUUID,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    }
});
const RTModel = mongoose.model("RT", refreshTokenSchema);
module.exports = RTModel;