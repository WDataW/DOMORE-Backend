const zod = require('zod');
const validator = require('validator');
const { passwordValidator, nameValidator, emailValidator } = require('./userSchema');
const loginSchema = zod.object({
    email: emailValidator,
    password: zod.string()
})
const resetPasswordSchema = zod.object({
    email: emailValidator,
    resetToken: zod.string().regex(/^[a-f0-9]{64}$/, { message: 'Invalid Token' }),
    newPassword: passwordValidator
})
const verifyEmailSchema = zod.object({
    email: emailValidator,
    code: zod.string().length(6).regex(/^[0-9]{6}$/, { message: 'Must be a 6-digit code' }),// had to match the validation in front-end
})

const registerSchema = zod.object({
    email: zod.string().refine((val) => validator.isEmail(val), { message: 'Must be a valid Email Address' }),// had to match the validation in front-end
    password: passwordValidator,
    fullname: nameValidator
})


module.exports = { registerSchema, loginSchema, verifyEmailSchema, resetPasswordSchema }