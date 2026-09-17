const mongoose = require('mongoose');
const { dateOfInvocation } = require('../utils/date');
const systemMessageSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        immutable: true
    },
    id: {
        type: String,
        default: () => 'message:' + crypto.randomUUID(),
        immutable: true
    },
    from: {
        type: String,
        default: "system",
        immutable: true
    },
    read: {
        type: Boolean,
        default: false
    },
    receivedAt: {
        type: Date,
        default: dateOfInvocation
    },
    key: {
        type: String,
        required: true
    },

});
const systemMessageModel = mongoose.model('SystemMessage', systemMessageSchema);
module.exports = systemMessageModel;