const { Tag } = require('@root/models');
const { StatusCodes } = require('http-status-codes');
const checkUpdates = require('../utils/checkUpdates');
const { Task } = require('../models');
const getTag = async (req, res) => {
    const { tagId: id } = req.params;
    const { id: userId } = req.user;
    const tag = await Tag.findOne({ id, userId });
    if (!tag) throw new NotFound('Tag not found');

    res.status(StatusCodes.OK).json(tag);
}
const getAllTags = async (req, res) => {
    const { id: userId } = req.user;
    const tags = await Tag.find({ userId }).select('-userId');

    res.status(StatusCodes.OK).json(tags);
}
const createTag = async (req, res) => {
    const newTag = { title, color, home = false, id, pinned = false, builtIn } = req.body;
    if (!title || !color) throw new BadRequest('Please complete required fields');

    const { id: userId } = req.user;
    const tag = { ...newTag, userId, icon: `bg-[${color}]` };
    const mongoTag = await Tag.create(tag);
    res.status(StatusCodes.CREATED).json(mongoTag);
}
const editTag = async (req, res) => {
    const possibleUpdates = { title, color, pinned, home } = req.body;
    const { tagId } = req.params;
    const { id: userId } = req.user;
    const updates = checkUpdates(possibleUpdates);
    const editedTag = await Tag.findOneAndUpdate({ id: tagId, userId }, updates, { returnDocument: 'after', runValidators: true, context: 'query' });
    if (!editedTag) throw new BadRequest('Tag is inexistent');
    res.status(StatusCodes.OK).json(editedTag);
}
const deleteTag = async (req, res) => {
    const { tagId } = req.params;
    const { id: userId } = req.user;
    const deletedTag = await Tag.findOneAndDelete({ id: tagId, userId });
    if (!deletedTag) return res.status(StatusCodes.OK).json({ message: "Tag already deleted" });
    res.status(StatusCodes.OK).json(deletedTag);
}

const defaultTags = [{
    "title": "All",
    "icon": "bg-[#878787]",
    "color": "#878787",
    "builtIn": true,
    "pinned": true,
    "home": true
},
{
    "title": "active",
    "icon": "bg-[#5a9afa]",
    "color": "#5a9afa",
    "builtIn": true,
    "pinned": true,
    "home": true
},
{
    "title": "today",
    "icon": "bg-[#8affb3]",
    "color": "#8affb3",
    "builtIn": true,
    "pinned": false,
    "home": false
},
{
    "title": "tomorrow",
    "icon": "bg-[#ffe88d]",
    "color": "#ffe88d",
    "builtIn": true,
    "pinned": false,
    "home": false
},
{
    "title": "overdue",
    "icon": "bg-[#fca5a5]",
    "color": "#fca5a5",
    "builtIn": true,
    "pinned": false,
    "home": true
},
{
    "title": "High Priority",
    "icon": "bg-[#ef4444]",
    "color": "#ef4444",
    "builtIn": true,
    "pinned": false,
    "home": false
},
{
    "title": "Medium Priority",
    "icon": "bg-[#ffae00]",
    "color": "#ffae00",
    "builtIn": true,
    "pinned": false,
    "home": false
},
{
    "title": "Low Priority",
    "icon": "bg-[#9ca3af]",
    "color": "#9ca3af",
    "builtIn": true,
    "pinned": false,
    "home": false
},
{
    "title": "completed",
    "icon": "bg-[#e12afb]",
    "color": "#e12afb",
    "builtIn": true,
    "pinned": false,
    "home": false
},
{
    "title": "pinned",
    "icon": "bg-[#ff00c8]",
    "color": "#ff00c8",
    "builtIn": true,
    "pinned": true,
    "home": false
}]
const initTags = (userId) => {
    const defaultTagsWithUserId = defaultTags.map((tag) => ({ ...tag, userId }));
    Tag.create(defaultTagsWithUserId);
}
module.exports = { initTags, getTag, getAllTags, editTag, deleteTag, createTag }