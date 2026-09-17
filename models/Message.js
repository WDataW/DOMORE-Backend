const mongoose = require('mongoose');
const { dateOfInvocation } = require('../utils/date');
const messageSchema = mongoose.Schema({
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
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    receivedAt: {
        type: Date,
        default: dateOfInvocation
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },


});
const messageModel = mongoose.model('Message', messageSchema);
module.exports = messageModel;