const zod = require('zod');
const { tagIdValidator } = require('./tagSchemas');

const createTaskSchema = zod.object({
    dueDate: zod.iso.datetime(),
    title: zod.string().max(100),
    description: zod.string().max(500),
    priority: zod.enum(['high', 'medium', 'low']),
    tags: zod.array(tagIdValidator)
});
const updateTaskSchema = createTaskSchema.extend({
    pinned: zod.boolean(),
    status: zod.enum(['completed', 'active'])
}).partial()
const taskIdValidator =
    zod.string()
        .refine((val) => val.startsWith('task:'))
        .transform((val) => val.replace('task:', ''))
        .pipe(zod.uuid())
        .transform((val) => 'task:' + val);

const taskIdSchema = zod.object({
    taskId: taskIdValidator
})
module.exports = { taskIdSchema, createTaskSchema, updateTaskSchema }