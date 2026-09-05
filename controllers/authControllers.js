const { BadRequest, Unauthorized } = require("@root/errors");
const { RP, User } = require('@root/models');
const { StatusCodes } = require('http-status-codes');
const { createTransporter, hashString, generateHex, emailVerification } = require("@root/utils");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { attachAuthCookies, removeAccessCookie } = require("../utils/cookies");
const { passwordReset } = require("../utils/emails");
const { isFutureDate } = require("../utils/date");
const { minute } = require("../utils/time");
const { RT, VE } = require("../models");
const { initSettings } = require("./settingsControllers");
const { initTags } = require("./tagControllers");
const { initInbox } = require("./inboxControllers");
const { updateLogInStreak } = require("./userControllers");
const { NotFound } = require("../errors");

// controllers
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new BadRequest('Invalid Credentials');
    const user = await User.findOne({ email });
    if (!user) throw new Unauthorized('Invalid Email or Password');
    if (!user.isVerified) throw new Unauthorized('Please verify your Email address before logging in')
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        await attachAuthCookies(req, res, { id: user._id, fullname: user.fullname });
        return res.status(StatusCodes.OK).json({ message: 'Logged in succesfully' });
    } else throw new Unauthorized('Invalid Email or Password');
}
const logout = async (req, res) => {
    const { id } = req.user;
    const userAgent = req.get('User-Agent');

    await RT.deleteOne({ userId: id, userAgent });
    removeAccessCookie(res);
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
}
const register = async (req, res) => {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) throw new BadRequest('Invalid Credentials');

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(StatusCodes.CREATED).json("Success");

    const verificationCode = crypto.randomInt(100000, 1000000);
    const newUser = { fullname, email, password };
    const registeredUser = await User.create(newUser);
    await initSettings(registeredUser._id);
    await initTags(registeredUser._id);
    await initInbox(registeredUser._id);

    await VE.create({ email, verificationCode: hashString(String(verificationCode)) });
    await sendVerificationEmail(email, verificationCode);
    res.status(StatusCodes.CREATED).json("Success")
}

const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user.isVerified) return res.status(StatusCodes.OK).json("Email already verified");

    const verificationCode = crypto.randomInt(100000, 1000000);
    await VE.findOneAndReplace({ email }, { email, verificationCode: hashString(String(verificationCode)) }, { upsert: true, returnDocument: 'after' });
    await sendVerificationEmail(email, verificationCode);
    res.status(StatusCodes.OK).json(verificationCode);
}

const verifyEmail = async (req, res) => {
    const { code, email } = req.body
    const user = await User.findOne({ email });
    const verificationRequest = await VE.findOne({ email });
    if (user.isVerified) return res.status(StatusCodes.OK).json("Email already verified");
    if (!verificationRequest) throw new BadRequest('Invalid verification request');
    const hashedCode = hashString(code);
    if (hashedCode !== verificationRequest.verificationCode) throw new BadRequest('Invalid verification request');
    if (!isFutureDate(verificationRequest.expiresAt)) throw new BadRequest('Validation code expired, request a new one');

    await verificationRequest.deleteOne({ email });

    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    await attachAuthCookies(req, res, { id: user._id, fullname: user.fullname });
    return res.status(StatusCodes.OK).json({ message: 'Email verified successfully' });
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) throw new BadRequest('Email must be provided');

    const user = await User.findOne({ email });
    if (!user) res.status(StatusCodes.OK).json('Check your email');

    const resetToken = generateHex(32);
    const hashedResetToken = hashString(resetToken);
    const existingRPrequest = await RP.findOne({ userId: user._id });
    if (existingRPrequest) {// replace existing request
        existingRPrequest.resetToken = hashedResetToken;
        existingRPrequest.expiresAt = new Date(Date.now() + 15 * minute);
        existingRPrequest.isRevoked = false;
        await existingRPrequest.save();
    } else {// create a new request if there is no exisitng one
        await RP.create({ userId: user._id, resetToken: hashedResetToken });
    }
    await sendResetEmail(user.email, resetToken);
    res.status(StatusCodes.OK).json({ message: 'Reset email sent' });
}
const resetPassword = async (req, res) => {
    const { email, resetToken, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new BadRequest('Invalid Credintials');

    const resetRequest = await RP.findOne({ userId: user._id });
    if (!resetRequest || resetRequest.isRevoked) throw new BadRequest('Please click on "forgot passsword" before trying to reset password');

    const hashedResetToken = hashString(resetToken);
    if (!isFutureDate(resetRequest.expiresAt)) throw new BadRequest('request expired');
    if (hashedResetToken !== resetRequest.resetToken) throw new BadRequest('invalid Credintials');
    user.password = newPassword;
    await user.save();
    resetRequest.isRevoked = true;
    resetRequest.resetToken = 'none';
    await resetRequest.save();
    res.status(StatusCodes.OK).json({ message: 'password resetted' });
}

const showMe = async (req, res) => {
    const { id: _id } = req.user;
    const user = await User.findOne({ _id }).select('email fullname lastLogIn highestLogInStreak currentLogInStreak createdAt -_id');
    if (!user) return;
    await updateLogInStreak(user);
    res.status(StatusCodes.OK).json(user)
}
// helper functions
const sendVerificationEmail = async (to, verificationCode) => {
    const transporter = createTransporter();
    const mail = emailVerification({ from: 'domores@wdata.app', to, verificationCode });
    await transporter.sendMail(mail);
}
const sendResetEmail = async (to, resetToken) => {
    const resetUrl = `${process.env.FRONT_END_URL}/auth/reset-password?email=${to}&token=${resetToken}`
    const transporter = createTransporter();
    const mail = passwordReset({ from: 'domores@wdata.app', to, resetUrl });
    await transporter.sendMail(mail);
}

module.exports = { resendVerificationEmail, showMe, login, logout, register, verifyEmail, resetPassword, forgotPassword }