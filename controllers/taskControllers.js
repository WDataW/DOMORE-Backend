const { BadRequest, NotFound } = require('@root/errors');
const { StatusCodes } = require('http-status-codes');
const { Task } = require('@root/models');
const checkUpdates = require('@root/utils/checkUpdates');




const createTask = async (req, res) => {
    const { dueDate, title, description, priority, tags } = req.body;
    if (!dueDate || !title || !priority) throw new BadRequest('Please complete required fields');

    const { id: userId } = req.user;
    const task = { dueDate, title, description, priority, tags, userId };
    const mongoTask = await Task.create(task);
    res.status(StatusCodes.CREATED).json(mongoTask);
}
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const { id: userId } = req.user;
    const deletedTask = await Task.findOneAndDelete({ id: taskId, userId });
    if (!deletedTask) return res.status(StatusCodes.OK).json({ message: "Task already deleted" });
    res.status(StatusCodes.OK).json(deletedTask);
}

const editTask = async (req, res) => {
    const possibleUpdates = { dueDate, title, description, priority, tags, pinned } = req.body;
    const { taskId } = req.params;
    const { id: userId } = req.user;
    const updates = checkUpdates(possibleUpdates);
    const editedTask = await Task.findOneAndUpdate({ id: taskId, userId }, updates, { returnDocument: 'after', runValidators: true, context: 'query' });
    if (!editedTask) throw new BadRequest('Task is inexistent');
    res.status(StatusCodes.OK).json(editedTask);
}

const getTask = async (req, res) => {
    const { taskId: id } = req.params;
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
function quickSort(array, start, end, partition) {
    if (end <= start) {
        return;
    }

    const pivot = partition(array, start, end);
    quickSort(array, start, pivot - 1, partition);
    quickSort(array, pivot + 1, end, partition);

}
function partitionDate(array, start, end) {
    let i = start - 1;
    const pivot = new Date(array[end].dueDate).getTime();

    for (let j = start; j < end; j++) {
        if (new Date(array[j].dueDate).getTime() < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]]
        }
    }
    i++;
    [array[i], array[end]] = [array[end], array[i]];
    return i;

}
module.exports = { createTask, deleteTask, editTask, getTask, getAllTasks }