const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  verifyToken
};
