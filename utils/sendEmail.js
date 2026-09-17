const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_SECRET_KEY);
const sendMail = async (email) => {
    const { data, error } = await resend.emails.send(email);
    console.log(error);
    console.log(data);
    if (error) throw new Error(error);
    return data;
}
module.exports = sendMail;