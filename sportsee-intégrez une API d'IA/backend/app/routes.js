// backend/app/routes.js
const express = require("express");
const jwt = require("jsonwebtoken");

const users = require("./data.json");
const { authenticateToken, generateToken } = require("./middleware");

const router = express.Router();

const SECRET_KEY = "your-secret-key-12345"; // idéalement en env var

const getUserById = (userId) => users.find((user) => user.id === userId);

const resolveWeeklyGoal = (user) => {
  const candidates = [
    user?.weeklyGoal,
    user?.goal,
    user?.userInfos?.weeklyGoal,
    user?.userInfos?.goal,
  ];
  const found = candidates.find(
    (v) => typeof v === "number" && Number.isFinite(v) && v >= 0
  );
  return typeof found === "number" ? found : 0;
};

// ✅ Normalisation gender pour l'UI (male/female -> Homme/Femme)
function normalizeGender(gender) {
  if (!gender) return null;

  const g = String(gender).toLowerCase();

  if (g === "male" || g === "m") return "Homme";
  if (g === "female" || g === "f") return "Femme";

  // fallback : on renvoie la valeur telle quelle (ou null si tu préfères)
  return gender;
}

/**
 * POST /login ✅ (aligné avec le README)
 * Returns a token for the user
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  const user = users.find((u) => u.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.id);
  return res.json({ token, userId: user.id });
});

/**
 * GET /api/user-info ✅
 * Returns user information including profile, goals, and statistics
 */
router.get("/api/user-info", authenticateToken, (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, SECRET_KEY);
  } catch (e) {
    return res.status(403).json({ message: "Invalid token" });
  }

  const user = getUserById(decodedToken.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const runningData = Array.isArray(user.runningData) ? user.runningData : [];

  // Calculate overall statistics
  const totalDistance = runningData
    .reduce((sum, session) => sum + (Number(session.distance) || 0), 0)
    .toFixed(1);

  const totalSessions = runningData.length;

  const totalDuration = runningData.reduce(
    (sum, session) => sum + (Number(session.duration) || 0),
    0
  );

  // Extract user profile information
  const userProfile = {
    firstName: user.userInfos.firstName,
    lastName: user.userInfos.lastName,
    createdAt: user.userInfos.createdAt,
    age: user.userInfos.age,
    weight: user.userInfos.weight,
    height: user.userInfos.height,
    gender: normalizeGender(user.userInfos.gender), // ✅ ici
    profilePicture: user.userInfos.profilePicture,
  };

  const weeklyGoal = resolveWeeklyGoal(user);

  return res.json({
    profile: userProfile,
    statistics: {
      totalDistance,
      totalSessions,
      totalDuration,
      weeklyGoal,
    },
  });
});

/**
 * GET /api/user-activity ✅
 * Returns running sessions between startWeek and endWeek
 */
router.get("/api/user-activity", authenticateToken, (req, res) => {
  const { startWeek, endWeek } = req.query;

  if (!startWeek || !endWeek) {
    return res.status(400).json({ message: "startWeek and endWeek are required" });
  }

  const user = getUserById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const runningData = Array.isArray(user.runningData) ? user.runningData : [];

  const startDate = new Date(startWeek);
  const endDate = new Date(endWeek);
  const now = new Date();

  const filteredSessions = runningData.filter((session) => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startDate && sessionDate <= endDate && sessionDate <= now;
  });

  filteredSessions.sort((a, b) => new Date(a.date) - new Date(b.date));

  return res.json(filteredSessions);
});

module.exports = router;
