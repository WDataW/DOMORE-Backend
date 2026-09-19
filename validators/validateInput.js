const { ValidationError, fromError } = require("zod-validation-error");
const { loginSchema, registerSchema, emailSchema, verifyEmailSchema, resetPasswordSchema } = require("./authSchemas");
const schemas = {
    login: loginSchema,
    register: registerSchema,
    email: emailSchema,
    verifyEmail: verifyEmailSchema,
    resetPassword: resetPasswordSchema
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