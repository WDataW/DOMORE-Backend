const second = 1000; // ms
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const month = 30 * day;
const msToMinute = (ms) => ms / 60000;
module.exports = {
    second, minute, hour, day, month, msToMinute
} 
