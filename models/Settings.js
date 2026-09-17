const mongoose = require('mongoose');
const validator = require('validator');
const settingsSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        immutable: true
    },
    language: {
        type: String,
        enum: ['en', 'ar'],
    },
    theme: {
        base: {
            type: String,
            enum: ['light', 'dark'],
        },
        lightAccentColor: {
            type: String,
            validate: {
                validator: validator.isHexColor,
                message: 'Please provide a valid hex color'
            }
        },
        lightSecondaryColor: {
            type: String,
            validate: {
                validator: validator.isHexColor,
                message: 'Please provide a valid hex color'
            }
        },
        darkAccentColor: {
            type: String,
            validate: {
                validator: validator.isHexColor,
                message: 'Please provide a valid hex color'
            }
        },
        darkSecondaryColor: {
            type: String,
            validate: {
                validator: validator.isHexColor,
                message: 'Please provide a valid hex color'
            }
        }
    }
});
const settingsModel = mongoose.model('Settings', settingsSchema);
module.exports = settingsModel;