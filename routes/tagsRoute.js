const { authenticator } = require('@root/middleware');
const { getAllTags, createTag, getTag, editTag, deleteTag } = require('@root/controllers');
const createLimiter = require('../utils/createLimiter');
const { minute } = require('../utils/time');

const router = require('express').Router();


const tagsLimiter = createLimiter({
    windowMs: 15 * minute,
    max: 150
});
router.get('/', authenticator, tagsLimiter, getAllTags)
router.put('/create-tag', authenticator, tagsLimiter, createTag)
router.get('/:tagId', authenticator, tagsLimiter, getTag)
router.patch('/:tagId', authenticator, tagsLimiter, editTag)
router.delete('/:tagId', authenticator, tagsLimiter, deleteTag)
module.exports = router;