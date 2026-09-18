const { deleteTask, createTask, editTask, getTask, getAllTasks } = require('@root/controllers');
const { minute } = require('../utils/time');
const createLimiter = require('../utils/createLimiter');

const router = require('express').Router();

const tasksLimiter = createLimiter({
    windowMs: 15 * minute,
    max: 150
});

router.get('/', tasksLimiter, getAllTasks)
router.put('/create-task', tasksLimiter, createTask)
router.get('/:taskId', tasksLimiter, getTask)
router.patch('/:taskId', tasksLimiter, editTask)
router.delete('/:taskId', tasksLimiter, deleteTask)
module.exports = router;