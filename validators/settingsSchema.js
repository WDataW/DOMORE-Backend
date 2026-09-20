const zod = require('zod');
const validator = require('validator');
const languageValidator = zod.enum(['en', 'ar'], { message: 'Language must either be EN or AR' });
const languageSchema = zod.object({
    language: languageValidator.optional()
})
const baseThemeValidator = zod.enum(['dark', 'light'], { message: 'Theme must either be dark or light' });
const colorValidator = zod.string().refine((val) => validator.isHexColor(val));
const themeSchema = zod.object({
    theme: zod.object({
        base: baseThemeValidator,
        lightAccentColor: colorValidator,
        lightSecondaryColor: colorValidator,
        darkAccentColor: colorValidator,
        darkSecondaryColor: colorValidator,
    }).partial().optional()
})
module.exports = { languageSchema, themeSchema }