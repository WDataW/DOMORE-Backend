const zod = require('zod');
const messageIdValidator =
    zod.string()
        .refine((val) => val.startsWith('message:'))
        .transform((val) => val.replace('message:', ''))
        .pipe(zod.uuid())
        .transform((val) => 'message:' + val);

const messageIdSchema = zod.object({
    messageId: messageIdValidator
})
const fromSchema = zod.object({
    from: zod.string().min(1).max(25)
})
module.exports = { messageIdSchema, fromSchema }