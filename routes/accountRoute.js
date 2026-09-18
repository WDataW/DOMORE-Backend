const { updateFullname, getAllSettings, editSettings, uploadPFP, removePFP, getPFP } = require('@root/controllers');
const { deleteAccount, logout } = require('../controllers');
const { getInbox, markMessageAsRead } = require('../controllers/inboxControllers');
const createLimiter = require('../utils/createLimiter');
const { minute } = require('../utils/time');
const looseLimiter = createLimiter({
    windowMs: 15 * minute,
    max: 150,
});
const strictLimiter = createLimiter({
    windowMs: 15 * minute,
    max: 10,
});

const router = require('express').Router();
router.get('/pfp', looseLimiter, getPFP)
router.post('/pfp', strictLimiter, uploadPFP)
router.delete('/pfp', strictLimiter, removePFP)

router.get('/inbox', looseLimiter, getInbox);
router.patch('/inbox/read/:messageId', looseLimiter, markMessageAsRead);

router.get('/settings', looseLimiter, getAllSettings)
router.patch('/settings', looseLimiter, editSettings)
router.patch('/name', looseLimiter, updateFullname)
router.post('/delete-account', strictLimiter, deleteAccount)
module.exports = router;