const { StatusCodes } = require("http-status-codes");
const { Settings } = require("../models");
const checkUpdates = require("../utils/checkUpdates");

const getAllSettings = async (req, res) => {
    const { id: userId } = req.user;
    const settings = await Settings.findOne({ userId }).select('-userId -_id -__v');
    res.status(StatusCodes.OK).json(settings);
}
const editSettings = async (req, res) => {
    const { id: userId } = req.user;
    const { language, theme } = req.body;
    const existingSettings = await Settings.findOne({ userId }).select('-userId -_id -__v').lean();
    if (language) existingSettings.language = language;
    if (theme) {
        let themeUpdates = checkUpdates(theme);
        existingSettings.theme = { ...existingSettings.theme, ...themeUpdates };
    }
    const settings = await Settings.findOneAndUpdate({ userId }, existingSettings, { returnDocument: 'after', runValidators: true, context: 'query' });
    res.status(StatusCodes.OK).json(settings);
}
const initSettings = (userId) => {
    return Settings.create({ userId });
}


module.exports = { getAllSettings, initSettings, editSettings }