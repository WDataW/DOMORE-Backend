const { BadRequest, NotFound } = require('@root/errors');
const { StatusCodes } = require('http-status-codes');
const { Task } = require('@root/models');
const checkUpdates = require('@root/utils/checkUpdates');
const validate = require('../validators/validateInput');
const { quickSort, partitionDate } = require('../utils/quickSort');




const createTask = async (req, res) => {
    const { dueDate, title, description, priority, tags } = validate('createTask', req.body);
    if (!dueDate || !title || !priority) throw new BadRequest('Please complete required fields');

    const { id: userId } = req.user;
    const task = { dueDate, title, description, priority, tags, userId };
    const mongoTask = await Task.create(task);
    res.status(StatusCodes.CREATED).json(mongoTask);
}
const deleteTask = async (req, res) => {
    const { taskId } = validate('taskId', req.params);
    const { id: userId } = req.user;
    const deletedTask = await Task.findOneAndDelete({ id: taskId, userId });
    if (!deletedTask) return res.status(StatusCodes.OK).json({ message: "Task already deleted" });
    res.status(StatusCodes.OK).json(deletedTask);
}

const editTask = async (req, res) => {
    const possibleUpdates = { status, dueDate, title, description, priority, tags, pinned } = validate('updateTask', req.body);
    const { taskId } = validate('taskId', req.params);
    const { id: userId } = req.user;
    const updates = checkUpdates(possibleUpdates);
    const editedTask = await Task.findOneAndUpdate({ id: taskId, userId }, updates, { returnDocument: 'after', runValidators: true, context: 'query' });
    if (!editedTask) throw new BadRequest('Task is inexistent');
    res.status(StatusCodes.OK).json(editedTask);
}

const getTask = async (req, res) => {
    const { taskId: id } = validate('taskId', req.params);
    const { id: userId } = req.user;
    const task = await Task.findOne({ id, userId });
    if (!task) throw new NotFound('Task not found');

    res.status(StatusCodes.OK).json(task);
}
const getAllTasks = async (req, res) => {
    const { id: userId } = req.user;
    const tasks = await Task.find({ userId }).select('-userId -__v').lean();
    const sortedTasks = sortTasksByDate(tasks);

    res.status(StatusCodes.OK).json(sortedTasks);
}

// helper functions
function sortTasksByDate(tasks) {
    const newTasks = [...tasks].filter((task) => !task.pinned);
    const pinnedTasks = [...tasks].filter((task) => task.pinned);
    quickSort(newTasks, 0, newTasks.length - 1, partitionDate);
    return [...pinnedTasks, ...newTasks];
}

module.exports = { createTask, deleteTask, editTask, getTask, getAllTasks }