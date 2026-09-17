const { verifyJWT, attachAccessCookie } = require("@root/utils");
const { Unauthorized } = require("../errors");
const { RT } = require("../models");

const authenticator = async (req, res, next) => {
    const { accessToken } = req.signedCookies;
    let payload;
    if (accessToken) {
        try {
            payload = verifyJWT(accessToken);
        } catch (error) {
            console.log(error?.message);
        }
    }
    if (!payload) {
        payload = await checkRefreshToken(req, res);
    }
    if (!payload) throw new Unauthorized('Please log in first');
    req.user = payload;
    next();
}

const checkRefreshToken = async (req, res) => {
    const { refreshToken } = req.signedCookies;
    if (!refreshToken) throw new Unauthorized('Please log in first');
    // provided credintials
    const { id, sessionId, fullname } = verifyJWT(refreshToken);

    const userAgent = req.get('User-Agent');
    const storedToken = await RT.findOne({ userId: id, userAgent, sessionId, refreshToken });
    if (!storedToken || storedToken.isRevoked) return;

    attachAccessCookie(res, { id, fullname });
    return { id, fullname };
}
module.exports = authenticator;