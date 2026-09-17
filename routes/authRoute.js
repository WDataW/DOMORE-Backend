const { resendVerificationEmail, showMe, login, logout, register, verifyEmail, resetPassword, forgotPassword } = require('@root/controllers');
const authenticator = require('../middleware/authentication');
const router = require('express').Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.get('/showMe', authenticator, showMe);
router.post('/logout', authenticator, logout);
module.exports = router;