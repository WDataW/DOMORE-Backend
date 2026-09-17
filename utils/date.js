const isFutureDate = (date) => date > new Date();
const dateOfInvocation = () => new Date();

const getToday = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today;
}

const getYesterday = () => {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}
const normalize = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
module.exports = { normalize, getYesterday, getToday, isFutureDate, dateOfInvocation }