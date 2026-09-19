const zod = require('zod');
const mongoose = require('mongoose');
const userIdSchema = zod.string().refine((val) => mongoose.Types.ObjectId.isValid(val));

module.exports = { userIdSchema }