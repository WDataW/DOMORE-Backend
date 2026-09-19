const zod = require('zod');

const tagIdValidator =
    zod.string()
        .refine((val) => val.startsWith('tag:'))
        .transform((val) => val.replace('tag:', ''))
        .pipe(zod.uuid())
        .transform((val) => 'tag:' + val);

module.exports = { tagIdValidator }