const mongoose = require('mongoose');
const { minute } = require('../utils/time');
const { isFutureDate } = require('../utils/date');
const verifyEmailSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        immutable: true,
        unique: true
    },
    verificationCode: {
        type: String,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * minute),
        required: true,
        validate: {
            validator: isFutureDate,
            message: 'Expiration date must be a future date'
        }
    }
});
const VEModel = mongoose.model("VE", verifyEmailSchema);
module.exports = VEModel;