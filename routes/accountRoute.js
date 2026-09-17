const { updateFullname, getAllSettings, editSettings, uploadPFP, removePFP, getPFP } = require('@root/controllers');
const { deleteAccount, logout } = require('../controllers');
const { getInbox, markMessageAsRead } = require('../controllers/inboxControllers');

const router = require('express').Router();
router.get('/pfp', getPFP)
router.post('/pfp', uploadPFP)
router.delete('/pfp', removePFP)

router.get('/inbox', getInbox);
router.patch('/inbox/read/:messageId', markMessageAsRead);

router.get('/settings', getAllSettings)
router.patch('/settings', editSettings)
router.patch('/name', updateFullname)
router.post('/delete-account', deleteAccount)
module.exports = router;