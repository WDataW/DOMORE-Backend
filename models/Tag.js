const mongoose = require('mongoose');
const { dateOfInvocation } = require('../utils/date');
const validator = require('validator');
const crypto = require('crypto');
const tagSchema = mongoose.Schema({
    id: {
        type: String,
        default: () => 'tag:' + crypto.randomUUID(),
        immutable: true
    },
    userId: {
        type: String,
        required: true,
        immutable: true
    },
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true,
        validate: {
            validator: validator.isHexColor,
            message: 'Please provide a valid hex color'
        }
    },
    icon: {
        type: String,
        required: true,
    },
    home: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: dateOfInvocation,
        immutable: true
    },
    pinned: {
        type: Boolean,
        required: true,
        default: false
    },
    builtIn: {
        type: Boolean,
        required: true,
        default: false
    }
});
const tagModel = mongoose.model('Tag', tagSchema);
module.exports = tagModel;