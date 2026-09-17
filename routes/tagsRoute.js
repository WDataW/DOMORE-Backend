const { authenticator } = require('@root/middleware');
const { getAllTags, createTag, getTag, editTag, deleteTag } = require('@root/controllers');

const router = require('express').Router();

router.get('/', authenticator, getAllTags)
router.put('/create-tag', authenticator, createTag)
router.get('/:tagId', authenticator, getTag)
router.patch('/:tagId', authenticator, editTag)
router.delete('/:tagId', authenticator, deleteTag)
module.exports = router;