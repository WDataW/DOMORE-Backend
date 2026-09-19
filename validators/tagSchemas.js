const zod = require('zod');
const validator = require('validator');

const tagIdValidator =
    zod.string()
        .refine((val) => val.startsWith('tag:'))
        .transform((val) => val.replace('tag:', ''))
        .pipe(zod.uuid())
        .transform((val) => 'tag:' + val);

const createTagSchema = zod.object({
    title: zod.string().min(1).max(25),
    color: zod.string().refine((val) => validator.isHexColor(val)),
    home: zod.boolean(),
    pinned: zod.boolean().default(false),
    builtIn: zod.boolean()
});
const updateTagSchema = createTagSchema.omit({ builtIn: true });
const tagIdSchema = zod.object({
    tagId: tagIdValidator
});
module.exports = { updateTagSchema, createTagSchema, tagIdSchema, tagIdValidator }