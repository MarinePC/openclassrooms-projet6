// backend/app/middleware.js
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./config");

/* vérif token */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

/* générer token */
const generateToken = (userId) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "24h" });
};

module.exports = {
  authenticateToken,
  generateToken,
};
