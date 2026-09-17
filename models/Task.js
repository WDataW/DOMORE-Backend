const mongoose = require('mongoose');
const { dateOfInvocation } = require('../utils/date');
const taskSchema = mongoose.Schema({
    id: {
        type: String,
        default: () => 'task:' + crypto.randomUUID(),
        immutable: true
    },
    userId: {
        type: String,
        required: true,
        immutable: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    tags: {
        type: [String]
    },
    status: {
        type: String,
        enum: ['completed', 'active'],
        default: 'active'

    },
    pinned: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: dateOfInvocation,
        immutable: true
    }
});
const taskModel = mongoose.model('Task', taskSchema);
module.exports = taskModel;