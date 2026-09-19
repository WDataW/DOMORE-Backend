const zod = require('zod');
const validator = require('validator');
const loginSchema = zod.object({
    email: zod.string().refine((val) => validator.isEmail(val), { message: 'Must be a valid Email Address' }),// had to match the validation in front-end
    password: zod.string()
})

const emailSchema = zod.object({
    email: zod.string().refine((val) => validator.isEmail(val), { message: 'Must be a valid Email Address' }),// had to match the validation in front-end
})
const resetPasswordSchema = zod.object({
    email: zod.string().refine((val) => validator.isEmail(val), { message: 'Must be a valid Email Address' }),// had to match the validation in front-end
    resetToken: zod.string().regex(/^[a-f0-9]{64}$/, { message: 'Invalid Token' }),
    newPassword: zod.string().refine((val) => validator.isStrongPassword(val)),
})
const verifyEmailSchema = zod.object({
    email: zod.string().refine((val) => validator.isEmail(val), { message: 'Must be a valid Email Address' }),// had to match the validation in front-end
    code: zod.string().length(6).regex(/^[0-9]{6}$/, { message: 'Must be a 6-digit code' }),// had to match the validation in front-end
})

const registerSchema = zod.object({
    email: zod.string().refine((val) => validator.isEmail(val), { message: 'Must be a valid Email Address' }),// had to match the validation in front-end
    password: zod.string().refine((val) => validator.isStrongPassword(val), { message: 'Password not strong enough' }),
    fullname: zod.string().min(1).max(50)
})


module.exports = { registerSchema, loginSchema, emailSchema, verifyEmailSchema, resetPasswordSchema }