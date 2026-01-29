// backend/app/chatRoutes.js
const express = require("express");
const { authenticateToken } = require("./middleware");
const { SYSTEM_PROMPT } = require("./systemPrompt");

const router = express.Router();

/**
 * GET /api/prompt/system
 * Sert le prompt système au backend NextJS
 * (pas de données sensibles, c'est du texte statique)
 */
router.get("/api/prompt/system", (req, res) => {
  return res.json({ systemPrompt: SYSTEM_PROMPT });
});

// Configuration Mistral AI
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";

// Limites de sécurité
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_LENGTH = 10;
const MAX_TOKENS = 500;
const REQUEST_TIMEOUT = 30000;

function sanitizeInput(text) {
  if (typeof text !== "string") return "";
  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, MAX_MESSAGE_LENGTH);
}

function validateHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (msg) =>
        msg &&
        typeof msg === "object" &&
        (msg.role === "user" || msg.role === "assistant") &&
        typeof msg.content === "string"
    )
    .slice(-MAX_HISTORY_LENGTH)
    .map((msg) => ({
      role: msg.role,
      content: sanitizeInput(msg.content),
    }));
}

async function callMistralAPI(messages) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Mistral API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error?.name === "AbortError") {
      throw new Error("Request timeout - l'API Mistral met trop de temps à répondre");
    }
    throw error;
  }
}

// ✅ Route avec authentification optionnelle
// Si le token est présent, on le valide, sinon on continue quand même
router.post("/api/chat", async (req, res) => {
  const startTime = Date.now();

  try {
    // Vérification de la clé API
    if (!MISTRAL_API_KEY) {
      console.error("[CHAT] Missing MISTRAL_API_KEY in environment variables");
      return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    // Extraction et validation du message
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      console.warn("[CHAT] Invalid message format");
      return res.status(400).json({ error: "Message invalide" });
    }

    const sanitizedMessage = sanitizeInput(message);

    if (!sanitizedMessage) {
      console.warn("[CHAT] Empty message after sanitization");
      return res.status(400).json({ error: "Message vide ou invalide" });
    }

    const validatedHistory = validateHistory(history);

    // Construction des messages pour Mistral
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...validatedHistory,
      { role: "user", content: sanitizedMessage },
    ];

    console.log("[CHAT] Calling Mistral API...");

    // Appel à l'API Mistral
    const mistralResponse = await callMistralAPI(messages);

    const reply = mistralResponse?.choices?.[0]?.message?.content || "";
    
    if (!reply) {
      console.error("[CHAT] Empty response from Mistral API");
      return res.status(500).json({ error: "Réponse vide de l'IA" });
    }

    const duration = Date.now() - startTime;
    console.log("[CHAT] Success", {
      duration: `${duration}ms`,
      replyLength: reply.length,
    });

    return res.json({ reply });
    
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error("[CHAT] Error", {
      duration: `${duration}ms`,
      error: error?.message,
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    });

    if (String(error?.message || "").includes("timeout")) {
      return res.status(504).json({ error: "L'IA met trop de temps à répondre. Réessayez." });
    }

    if (String(error?.message || "").includes("API")) {
      return res.status(502).json({ error: "Problème de communication avec l'IA. Réessayez." });
    }

    return res.status(500).json({ error: "Une erreur est survenue. Réessayez." });
  }
});

module.exports = router;