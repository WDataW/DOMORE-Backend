const mongoose = require('mongoose');
const validator = require('validator');
const hashPassword = require('../utils/hashPassword');
const { dateOfInvocation } = require('../utils/date');

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Please provide a fullname']
    },
    email: {
        type: String,
        unique: true,
        validate: validator.isEmail,
        immutable: true
    },
    createdAt: {
        type: Date,
        default: dateOfInvocation,
        immutable: true
    },
    password: {
        type: String,
        validate: (password) => {
            if (password.length > 24) return false;
            return validator.isStrongPassword(password)
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    highestLogInStreak: {
        type: Number,
        default: 1
    },
    currentLogInStreak: {
        type: Number,
        default: 1
    },
    lastLogIn: {
        type: Date,
        default: dateOfInvocation,
    },

});
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const hashedPassword = await hashPassword(this.password);
        this.password = hashedPassword;
    }
});


const userModel = mongoose.model('User', userSchema);
module.exports = userModel