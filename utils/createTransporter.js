const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const createTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: process.env.NODE_ENV == 'production',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
module.exports = createTransporter;