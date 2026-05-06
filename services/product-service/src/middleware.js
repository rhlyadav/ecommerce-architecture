const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing bearer token" });
    }

    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, jwtSecret);

    req.auth = {
      token,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name
      }
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  requireAuth
};
