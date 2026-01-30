// backend/app/chatRoutes.js

const express = require("express");
const { authenticateToken } = require("./middleware");
const { SYSTEM_PROMPT, buildSystemPromptWithContext } = require("./systemPrompt");
const { buildUserContext, sanitizeUserData } = require("./userContextBuilder");
const {
  MISTRAL_API_KEY,
  MISTRAL_API_URL,
  MISTRAL_MODEL,
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_LENGTH,
  MAX_TOKENS,
  REQUEST_TIMEOUT,
} = require("./config");

const router = express.Router();

/* retourne le prompt */
router.get("/api/prompt/system", (req, res) => {
  return res.json({ systemPrompt: SYSTEM_PROMPT });
});

/* nettoie + valide le texte d'entrée */
function sanitizeInput(text) {
  if (typeof text !== "string") return "";
  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, MAX_MESSAGE_LENGTH);
}

/* historique de conversation */
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

/* connexion + condition vers API Mistral AI */
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

/* point d'entrée du chatbot */
router.post("/api/chat", async (req, res) => {
  const startTime = Date.now();
  const isDev = process.env.NODE_ENV === "development";

  try {
    /* verif clé api */
    if (!MISTRAL_API_KEY) {
      console.error("[CHAT] Missing MISTRAL_API_KEY");
      return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    const { message, history, userData } = req.body;

    /* valide message */ 
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

    /* traitement donées user */ 
    const sanitizedUserData = sanitizeUserData(userData);
    const userContext = sanitizedUserData ? buildUserContext(sanitizedUserData) : null;

    /* prompt system + context */ 
    const systemPrompt = buildSystemPromptWithContext(userContext);

     /* log simplifier */
    if (isDev && userContext) {
      console.log("[CHAT] User context included", {
        hasProfile: !!sanitizedUserData?.profile,
        hasStats: !!sanitizedUserData?.statistics,
        activitiesCount: sanitizedUserData?.recentActivities?.length || 0,
      });
    }

    /* messages vers Mistral */
    const messages = [
      { role: "system", content: systemPrompt },
      ...validatedHistory,
      { role: "user", content: sanitizedMessage },
    ];

    console.log("[CHAT] Calling Mistral API...");

    /* Appel à l'API Mistral */ 
    const mistralResponse = await callMistralAPI(messages);

    const reply = mistralResponse?.choices?.[0]?.message?.content || "";

    if (!reply) {
      console.error("[CHAT] Empty response from Mistral API");
      return res.status(500).json({ error: "Réponse vide de l'IA" });
    }

    const duration = Date.now() - startTime;
    console.log(`[CHAT] Success (${duration}ms)`);

    return res.json({ reply });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`[CHAT] Error (${duration}ms):`, error?.message);

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

    return res.status(500).json({ error: "Une erreur est survenue. Réessayez." });
  }
});

module.exports = router;
