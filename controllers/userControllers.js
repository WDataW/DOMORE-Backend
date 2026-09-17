const { StatusCodes } = require("http-status-codes");
const { User, Task, Settings, RT, RP, Tag, VE } = require("../models");
const bcrypt = require("bcrypt");
const { removeAccessCookie } = require("../utils/cookies");
const { normalize, getToday, getYesterday } = require("../utils/date");

const updateFullname = async (req, res) => {
    const { id: _id } = req.user;
    const { name } = req.body
    const user = await User.findOne({ _id });
    user.fullname = name;
    await user.save({ validateBeforeSave: false });
    res.status(StatusCodes.OK).json(user);
}

const deleteAccount = async (req, res) => {
    const { id: _id } = req.user;
    const user = await User.findOne({ _id });
    const { password } = req.body;
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        await User.deleteOne({ _id });
        await Task.deleteMany({ userId: _id });
        await Settings.deleteMany({ userId: _id });
        await RT.deleteMany({ userId: _id });
        await RP.deleteOne({ userId: _id });
        await Tag.deleteMany({ userId: _id });
        await VE.deleteOne({ userId: _id });
        removeAccessCookie(res);
    }
    res.status(StatusCodes.OK).json("account deleted along with all its data")
}

const updateLogInStreak = async (user) => {
    const lastLogIn = normalize(new Date(user.lastLogIn));
    const today = getToday();
    const yesterday = getYesterday();
    if (lastLogIn.getTime() === today.getTime()) return;
    if (lastLogIn.getTime() === yesterday.getTime()) await incrementLogInStreak(user);
    else await resetLogInStreak(user);
}
const resetLogInStreak = async (user) => {
    user.lastLogIn = new Date();
    user.currentLogInStreak = 1;
    await user.save({ runValidators: false });
    return user;

}
const incrementLogInStreak = async (user) => {
    user.lastLogIn = new Date();
    user.currentLogInStreak = ++user.currentLogInStreak;
    if (user.currentLogInStreak > user.highestLogInStreak) user.highestLogInStreak = user.currentLogInStreak;
    await user.save({ runValidators: false });
    return user;
}
module.exports = { updateLogInStreak, updateFullname, deleteAccount }