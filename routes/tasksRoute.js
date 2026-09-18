const { authenticator } = require('@root/middleware');
const { deleteTask, createTask, editTask, getTask, getAllTasks } = require('@root/controllers');
const { minute } = require('../utils/time');
const createLimiter = require('../utils/createLimiter');

const router = require('express').Router();

const tasksLimiter = createLimiter({
    windowMs: 15 * minute,
    max: 150
});

router.get('/', authenticator, tasksLimiter, getAllTasks)
router.put('/create-task', authenticator, tasksLimiter, createTask)
router.get('/:taskId', authenticator, tasksLimiter, getTask)
router.patch('/:taskId', authenticator, tasksLimiter, editTask)
router.delete('/:taskId', authenticator, tasksLimiter, deleteTask)
module.exports = router;