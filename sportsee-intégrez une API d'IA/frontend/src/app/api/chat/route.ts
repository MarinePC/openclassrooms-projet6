// frontend/src/app/api/chat/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatBody = {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

function sanitizeUserText(input: string) {
  return String(input ?? "").replace(/\s+/g, " ").trim();
}

function safePreviewForLogs(s: string, max = 120) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

async function fetchSystemPrompt() {
  const backendUrl = process.env.BACKEND_URL; // ex: http://localhost:3001
  if (!backendUrl) throw new Error("BACKEND_URL manquante côté Next");

  const res = await fetch(`${backendUrl}/api/prompt/system`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Prompt backend error: ${res.status}`);

  const data = await res.json().catch(() => ({}));
  const prompt = String(data?.systemPrompt ?? "").trim();

  if (!prompt) throw new Error("Prompt vide reçu depuis le backend");
  return prompt;
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body = (await req.json()) as Partial<ChatBody>;
    const message = sanitizeUserText(body?.message ?? "");

    if (!message) {
      return NextResponse.json({ error: "Message vide." }, { status: 400 });
    }

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

    /* recup prompt */
    const SYSTEM_PROMPT = await fetchSystemPrompt();

   
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    console.info(
      `[api/chat] start id=${requestId} msg="${safePreviewForLogs(message)}"`
    );

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
          { role: "user", content: message },
        ],
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 300,
      }),
    });

    clearTimeout(timeout);

    if (!mistralRes.ok) {
      console.warn(
        `[api/chat] mistral error id=${requestId} status=${mistralRes.status}`
      );
      return NextResponse.json(
        { error: "Erreur du service IA.", status: mistralRes.status },
        { status: 502 }
      );
    }

    const data = await mistralRes.json().catch(() => ({}));

    const reply: string =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.message?.content?.[0]?.text ??
      "";

    if (!reply) {
      console.warn(`[api/chat] empty reply id=${requestId}`);
      return NextResponse.json({ error: "Réponse IA vide." }, { status: 502 });
    }

    console.info(`[api/chat] success id=${requestId}`);


    return NextResponse.json({ reply }, { status: 200 });
  } catch (e: any) {
    const isAbort = e?.name === "AbortError";
    console.warn(`[api/chat] fail id=${requestId} abort=${isAbort}`);

    return NextResponse.json(
      { error: isAbort ? "Timeout IA." : "Erreur serveur." },
      { status: isAbort ? 504 : 500 }
    );
  }
}
