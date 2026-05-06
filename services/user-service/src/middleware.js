const { verifyToken } = require("./auth");
const { getUserById } = require("./models");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing bearer token" });
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyToken(token);
    const userId = Number(payload.sub);
    const user = await getUserById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found for token" });
    }

    req.auth = {
      token,
      user
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  requireAuth
};
