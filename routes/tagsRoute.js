const { authenticator } = require('@root/middleware');
const { getAllTags, createTag, getTag, editTag, deleteTag } = require('@root/controllers');
const createLimiter = require('../utils/createLimiter');
const { minute } = require('../utils/time');

const router = require('express').Router();


const tagsLimiter = createLimiter({
    windowMs: 15 * minute,
    max: 150
});
router.get('/', tagsLimiter, getAllTags)
router.put('/create-tag', tagsLimiter, createTag)
router.get('/:tagId', tagsLimiter, getTag)
router.patch('/:tagId', tagsLimiter, editTag)
router.delete('/:tagId', tagsLimiter, deleteTag)
module.exports = router;