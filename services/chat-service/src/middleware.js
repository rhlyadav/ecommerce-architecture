const { verifyToken } = require("./auth");

function getBearerToken(header = "") {
  if (!header.startsWith("Bearer ")) {
    return "";
  }

  return header.slice("Bearer ".length);
}

function mapUserFromPayload(payload) {
  return {
    id: Number(payload.sub),
    email: payload.email,
    name: payload.name
  };
}

function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req.headers.authorization || "");

    if (!token) {
      return res.status(401).json({ message: "Missing bearer token" });
    }

    const payload = verifyToken(token);
    req.auth = {
      token,
      user: mapUserFromPayload(payload)
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Missing auth token"));
    }

    const payload = verifyToken(token);
    socket.user = mapUserFromPayload(payload);
    return next();
  } catch (error) {
    return next(new Error("Invalid or expired token"));
  }
}

module.exports = {
  requireAuth,
  authenticateSocket
};
