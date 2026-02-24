const { verifyToken } = require("../lib/jwt");

function requireAuth(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: "Invalid token" });

    req.userId = payload.userId;
    next();
}

module.exports = requireAuth;
