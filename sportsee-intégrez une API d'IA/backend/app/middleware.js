const jwt = require("jsonwebtoken");

const SECRET_KEY = "your-secret-key-12345"; // In a real app, this would be in environment variables

const handleNoUserData = (res, userData) => {
  if (!userData) {
    res.statusCode = 404;
    return res.json("can not get user");
  }

  return res.json({ data: userData });
};

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

const generateToken = (userId) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "24h" });
};

module.exports = {
  handleNoUserData,
  authenticateToken,
  generateToken,
};
