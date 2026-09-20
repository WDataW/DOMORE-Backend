const { fromError } = require("zod-validation-error");
const { ValidationError } = require("@root/errors")
const { loginSchema, registerSchema, verifyEmailSchema, resetPasswordSchema } = require("./authSchemas");
const { createTaskSchema, taskIdSchema, updateTaskSchema } = require("./taskSchemas");
const { passwordSchema, emailSchema, userIdValidator, nameSchema } = require("./userSchema");
const { tagIdSchema, updateTagSchema, createTagSchema } = require("./tagSchemas");
const { messageIdSchema, fromSchema } = require("./messageSchemas");
const schemas = {
    login: loginSchema,
    register: registerSchema,
    email: emailSchema,
    verifyEmail: verifyEmailSchema,
    resetPassword: resetPasswordSchema,
    createTask: createTaskSchema,
    taskId: taskIdSchema,
    updateTask: updateTaskSchema,
    userId: userIdValidator,
    tagId: tagIdSchema,
    createTag: createTagSchema,
    updateTag: updateTagSchema,
    password: passwordSchema,
    name: nameSchema,
    messageId: messageIdSchema,
    from: fromSchema
}


const validate = (schemaKey, data) => {
    const schema = schemas[schemaKey];
    const result = schema.safeParse(data);
    if (!result.success) {
        const validationError = fromError(result.error);
        throw new ValidationError(validationError.toString().replaceAll(';', '\n'));
    } else return result.data
}
module.exports = validate;