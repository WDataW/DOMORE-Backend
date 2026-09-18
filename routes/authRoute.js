const { resendVerificationEmail, showMe, login, logout, register, verifyEmail, resetPassword, forgotPassword } = require('@root/controllers');
const authenticator = require('../middleware/authentication');
const { minute } = require('../utils/time');
const rateLimiter = require('../utils/rateLimit');
const router = require('express').Router();
const authLimiter = rateLimiter({
    windowMs: 15 * minute,
    max: 5,
})
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification-email', authLimiter, resendVerificationEmail);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/forgot-password', authLimiter, forgotPassword);
router.get('/showMe', authenticator, showMe);
router.post('/logout', authenticator, logout);
module.exports = router;