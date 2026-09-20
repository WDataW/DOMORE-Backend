const zod = require('zod');
const mongoose = require('mongoose');
const userIdValidator = zod.string().refine((val) => mongoose.Types.ObjectId.isValid(val));
const validator = require('validator');
const passwordValidator = zod.string()
    .max(24)
    .refine((val) => validator.isStrongPassword(val), { message: 'Password not strong enough' })

const passwordSchema = zod.object({
    password: passwordValidator
})
const nameValidator = zod.string().min(1).max(25);
const nameSchema = zod.object({
    name: nameValidator
});
const emailValidator = zod.string().refine((val) => validator.isEmail(val), { message: 'Must be a valid Email Address' })// had to match the validation in front-end
const emailSchema = zod.object({
    email: emailValidator
});
module.exports = { emailSchema, nameSchema, emailValidator, nameValidator, passwordValidator, userIdValidator, passwordSchema }