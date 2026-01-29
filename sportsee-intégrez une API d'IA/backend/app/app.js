// backend/app/app.js

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const chatRoutes = require("./chatRoutes");

const app = express();

// Middleware CORS - IMPORTANT pour permettre les appels depuis le frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000'], // Autorise les deux ports
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logs des requêtes (pour debug)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

app.use('/images', express.static('images'));
// ✅ Routes du chatbot - AVANT les autres routes pour éviter les conflits
app.use("/", chatRoutes);

// Routes existantes (auth + user data)
app.use("/", routes);

// Route de santé (health check)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found" });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

module.exports = app;