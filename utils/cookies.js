const { RT } = require("@root/models");
const { signJWT } = require("./jwt");
const { day, minute } = require("./time");
const { isFutureDate } = require("./date");

const attachCookie = ({ res, name, value, expires }) => {
    res.cookie(name, value, {
        httpOnly: true,
        expires: expires,
        signed: true,
        secure: process.env.NODE_ENV == 'production',
        path: '/'
    })
}

const attachAuthCookies = async (req, res, user) => {
    // creating access token (overwritten if exists)
    attachAccessCookie(res, user);

    const { ip } = req;
    const userAgent = req.get('User-Agent');
    const existingRefreshToken = await RT.findOne({ userId: user.id, userAgent });
    if (!existingRefreshToken || existingRefreshToken.isRevoked || !isFutureDate(existingRefreshToken.expiresAt)) {// invalid token
        const sessionId = crypto.randomUUID();
        const refreshToken = attachRefreshCookie(res, user, sessionId);
        await RT.create({ userId: user.id, sessionId, ip, userAgent, refreshToken, expiresAt: new Date(Date.now() + 30 * day) });
    } else {// refresh token is still valid
        existingRefreshToken.expiresAt = new Date(Date.now() + 30 * day);// extend it
        existingRefreshToken.save();
        attachCookie({ res, name: 'refreshToken', value: existingRefreshToken.refreshToken, expires: new Date(existingRefreshToken.expiresAt) })
    }
}
const attachRefreshCookie = (res, user, sessionId) => {
    const refreshToken = signJWT({ id: user.id, sessionId, fullname: user.fullname }, { expiresIn: '30d' });
    attachCookie({ res, name: 'refreshToken', value: refreshToken, expires: new Date(Date.now() + 30 * day) });
    return refreshToken;
}
const attachAccessCookie = (res, user) => {
    // creating access token
    const accessToken = signJWT({ id: user.id, fullname: user.fullname }, { expiresIn: '15m' });
    attachCookie({ res, name: 'accessToken', value: accessToken, expires: new Date(Date.now() + 15 * minute) });
    return accessToken;
}
const removeAccessCookie = (res) => {
    // remove access token
    const accessToken = signJWT({}, { expiresIn: '0s' });
    attachCookie({ res, name: 'accessToken', value: accessToken, expires: new Date(Date.now()) });
    return accessToken;
}
module.exports = { attachCookie, attachAccessCookie, attachAuthCookies, attachRefreshCookie, removeAccessCookie }