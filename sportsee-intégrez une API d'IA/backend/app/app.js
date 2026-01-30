// backend/app/app.js

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const chatRoutes = require("./chatRoutes");

const app = express();

/* Configuration CORS - autorise les appels depuis le frontend */ 
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000'],
  credentials: true
}));

/* transforme les requêtes JSON */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logs de requêtes en développement
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/* Configuration du serveur */
app.use('/images', express.static('images'));
app.use("/", chatRoutes);
app.use("/", routes);
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

module.exports = app;
