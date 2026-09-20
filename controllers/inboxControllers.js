const { StatusCodes } = require("http-status-codes");
const { Message, Settings, SystemMessage } = require("../models");
const validate = require("../validators/validateInput");
const { NotFound } = require("../errors");

const getInbox = async (req, res) => {
    const { id: userId } = req.user;

    const settings = await Settings.findOne({ userId });
    const messages = await Message.find({ userId }).lean();
    const systemMessages = await SystemMessage.find({ userId }).lean();
    const resolvedMessages = resolveSystemMessages({ sysMessages: systemMessages, lang: settings.language ?? "en" });
    const allMessages = [...messages, ...resolvedMessages];
    res.status(StatusCodes.OK).json(allMessages);
}

const markMessageAsRead = async (req, res) => {
    const { from } = validate('from', req.body);
    const { messageId } = validate('messageId', req.params);
    const { id: userId } = req.user;
    let messageToEdit;
    if (from == "system") messageToEdit = await SystemMessage.findOne({ userId, id: messageId });
    else messageToEdit = await Message.findOne({ userId, id: messageId });
    if (!messageToEdit) throw new NotFound('Message is inexistent')
    messageToEdit.read = true;
    await messageToEdit.save();
    res.status(StatusCodes.OK).json(messageToEdit);
}

// helper functions
const initInbox = (userId) => {
    return SystemMessage.create({
        key: "welcome",
        userId,
    });
}
const resolveSystemMessages = ({ lang, sysMessages }) => {
    if (!sysMessages || sysMessages?.length == 0) return [];
    const resolvedMessages = [];
    for (const msg of sysMessages) {
        const locale = require(`@root/messages/locales/${lang}.json`);
        const key = locale[msg.key];
        const resolvedMessage = {
            ...msg,
            title: key.title,
            content: key.content
        }
        resolvedMessages.push(resolvedMessage);
    }

    return resolvedMessages;
}

module.exports = { initInbox, getInbox, markMessageAsRead }