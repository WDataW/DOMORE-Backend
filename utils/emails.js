const { appName } = require("../config/constants");

// email senders
const sendMail = require("../utils/sendEmail");
const createTransporter = require("./createTransporter");

const sendVerificationEmail = async (to, verificationCode) => {
  const mail = emailVerification({ to, verificationCode });
  await sendMail(mail);
}
const sendResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.FRONT_END_URL}/auth/reset-password?email=${to}&token=${resetToken}`
  const mail = passwordReset({ to, resetUrl });
  await sendMail(mail);
}
const sendFakeVerificationEmail = async (to, verificationCode) => {
  const transporter = createTransporter();
  const mail = emailVerification({ to, verificationCode });
  await transporter.sendMail(mail);
}
const sendFakeResetEmail = async (to, resetToken) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONT_END_URL}/auth/reset-password?email=${to}&token=${resetToken}`
  const mail = passwordReset({ to, resetUrl });
  await transporter.sendMail(mail);
}




// email contents
const emailVerification = ({ to, verificationCode }) => ({
  from: process.env.EMAIL_SOURCE,
  to,
  subject: 'Verify your email address',
  text: `
Welcome!

Thanks for creating an account.

Your verification code is:

${verificationCode}

Enter this 6-digit code in the verification screen to verify your email address.

This code will expire soon. If you didn't create an account, you can safely ignore this email.

Thanks!
`.trim(),

  html: `
  <div style="background-color: #f4f4f7; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background-color: #2563eb; padding: 24px 32px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
          Verify your email address
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px; color: #333333; line-height: 1.6; font-size: 15px;">
        <p style="margin: 0 0 16px;">Welcome!</p>

        <p style="margin: 0 0 24px;">
          Thanks for creating an account. Please use the verification code below to verify your email address.
        </p>

        <!-- Code block -->
        <div
          style="
            margin: 0 0 24px;
            padding: 24px;
            background-color: #f3f4f6;
            border: 1px dashed #d1d5db;
            border-radius: 8px;
            text-align: center;
          "
        >
          <span
            style="
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 5px;
              color: #111827;
              font-family: monospace;
            "
          >
            ${verificationCode}
          </span>
        </div>

        <p style="margin: 0 0 24px; text-align: center; color: #666666; font-size: 13px;">
          Enter this 6-digit code in the verification screen to verify your email address.
        </p>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0 0 24px;" />

        <p style="margin: 0; color: #999999; font-size: 13px;">
          This code will expire soon. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #fafafa; padding: 20px 32px; text-align: center;">
        <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
          Sent by ${appName} · This is an automated message
        </p>
      </div>

    </div>
  </div>
`.trim(),
});



const passwordReset = ({ to, resetUrl }) => ({
  from: process.env.EMAIL_SOURCE,
  to,
  subject: 'Reset your password',

  text: `
Hello!

We received a request to reset your password.

Reset your password by clicking the link below:

${resetUrl}

This link will expire soon. If you didn't request a password reset, you can safely ignore this email.

Thanks!
  `.trim(),

  html: `
  <div style="background-color: #f4f4f7; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #2563eb; padding: 24px 32px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
          Reset your password
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px; color: #333333; line-height: 1.6; font-size: 15px;">
        <p style="margin: 0 0 16px;">Hello,</p>

        <p style="margin: 0 0 24px;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 0 0 24px;">
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 14px 32px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 15px;
            "
          >
            Reset Password
          </a>
        </div>

        <p style="margin: 0 0 8px; color: #666666; font-size: 13px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 0 0 24px; word-break: break-all;">
          <a href="${resetUrl}" style="color: #2563eb; font-size: 13px;">${resetUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0 0 24px;" />

        <p style="margin: 0; color: #999999; font-size: 13px;">
          This link will expire soon. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #fafafa; padding: 20px 32px; text-align: center;">
        <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
          Sent by ${appName} · This is an automated message
        </p>
      </div>

    </div>
  </div>
`.trim(),
});


module.exports = { emailVerification, passwordReset, sendFakeResetEmail, sendFakeVerificationEmail, sendResetEmail, sendVerificationEmail }