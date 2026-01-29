// src/app/api/chat/route.ts


import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/ai/systemPrompt";


export const runtime = "nodejs"; // simple & compatible
export const dynamic = "force-dynamic"; // évite cache

type ChatBody = {
  message: string;
  // optionnel: history si tu veux plus tard
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

function sanitizeUserText(input: string) {
  // MVP: trim + limite taille + normalise espaces
  const s = String(input ?? "").replace(/\s+/g, " ").trim();
  return s;
}

function safePreviewForLogs(s: string, max = 120) {
  // Ne jamais logger la question entière si elle peut contenir du perso
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body = (await req.json()) as Partial<ChatBody>;
    const message = sanitizeUserText(body?.message ?? "");

    // Validation stricte
    if (!message) {
      return NextResponse.json(
        { error: "Message vide." },
        { status: 400 }
      );
    }

    // Anti-abus + contrôle coûts (limite simple)
    if (message.length > 600) {
      return NextResponse.json(
        { error: "Message trop long (max 600 caractères)." },
        { status: 413 }
      );
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "MISTRAL_API_KEY manquante côté serveur." },
        { status: 500 }
      );
    }

    // Timeout propre
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    // Logs “safe”
    console.info(`[api/chat] start id=${requestId} msg="${safePreviewForLogs(message)}"`);

    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.MISTRAL_MODEL ?? "mistral-small-latest",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          // plus tard: injecter data user + history
          { role: "user", content: message },
        ],
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 300, // doc: prompt + max_tokens <= contexte modèle :contentReference[oaicite:3]{index=3}
      }),
    });

    clearTimeout(timeout);

    if (!mistralRes.ok) {
      const errText = await mistralRes.text().catch(() => "");
      // ne log pas le prompt complet ni la clé; OK de logger status
      console.warn(`[api/chat] mistral error id=${requestId} status=${mistralRes.status}`);
      return NextResponse.json(
        { error: "Erreur du service IA.", status: mistralRes.status },
        { status: 502 }
      );
    }

    const data = await mistralRes.json();

    const answer: string =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.message?.content?.[0]?.text ?? // selon formats
      "";

    if (!answer) {
      console.warn(`[api/chat] empty answer id=${requestId}`);
      return NextResponse.json(
        { error: "Réponse IA vide." },
        { status: 502 }
      );
    }

    console.info(`[api/chat] success id=${requestId}`);
    return NextResponse.json({ answer }, { status: 200 });
  } catch (e: any) {
    const isAbort = e?.name === "AbortError";
    console.warn(`[api/chat] fail id=${requestId} abort=${isAbort}`);

    return NextResponse.json(
      { error: isAbort ? "Timeout IA." : "Erreur serveur." },
      { status: isAbort ? 504 : 500 }
    );
  }
}
