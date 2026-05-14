const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";

function authenticateHeader(header = "") {
  if (!header.startsWith("Bearer ")) {
    const error = new Error("Missing bearer token");
    error.status = 401;
    throw error;
  }

  const token = header.slice("Bearer ".length);
  const payload = jwt.verify(token, jwtSecret);

  return {
    token,
    user: {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    }
  };
}

function requireAuth(req, res, next) {
  try {
    req.auth = authenticateHeader(req.headers.authorization || "");

    return next();
  } catch (error) {
    return res.status(401).json({ message: error.status === 401 ? error.message : "Invalid or expired token" });
  }
}

module.exports = {
  authenticateHeader,
  requireAuth
};
