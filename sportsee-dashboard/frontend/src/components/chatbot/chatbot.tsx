"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";
type ChatMsg = { id: string; role: Role; content: string };

const MAX_CHARS = 300;
const MAX_HISTORY = 10;

function uid() {
  return crypto.randomUUID();
}

export default function ChatbotPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const trimmed = input.trim();
  const canSend = !isLoading && trimmed.length > 0 && trimmed.length <= MAX_CHARS;

  const historyForApi = useMemo(() => {
    return messages.slice(-MAX_HISTORY).map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  const sendMessage = useCallback(
    async (forcedText?: string) => {
      const text = (forcedText ?? input).trim();

      if (isLoading) return;
      if (!text) return;

      if (text.length > MAX_CHARS) {
        setError(`Message trop long (max ${MAX_CHARS} caractères).`);
        return;
      }

      setError(null);

      const userMsg: ChatMsg = { id: uid(), role: "user", content: text };
      setMessages((prev) => [...prev, userMsg].slice(-MAX_HISTORY * 2));

      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: historyForApi,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg = data?.error ?? `Erreur serveur (${res.status}).`;
          throw new Error(msg);
        }

        const data = (await res.json()) as { reply?: string };
        const reply = (data.reply ?? "").trim();

        const botMsg: ChatMsg = {
          id: uid(),
          role: "assistant",
          content: reply || "Je n’ai pas réussi à générer une réponse. Réessaie.",
        };

        setMessages((prev) => [...prev, botMsg].slice(-MAX_HISTORY * 2));
      } catch (e: any) {
        setError(e?.message ?? "Une erreur est survenue.");
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [historyForApi, input, isLoading]
  );

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) void sendMessage();
    }
  };

  const quickPrompts = [
    "Comment améliorer mon endurance ?",
    "Que signifie mon score de récupération ?",
    "Peux-tu m’expliquer mon dernier graphique ?",
  ];

  return (
    <section className="chatPanel">
      {/* Messages */}
      <div className="chatMessages">
        {messages.length === 0 ? (
          <div className="chatEmpty">
            <span>
              Posez vos questions sur votre programme,
              <br/>
              vos performances ou vos objectifs
            </span>
          </div>
        ) : (
          <div className="chatThread">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chatBubble ${m.role === "user" ? "chatBubbleUser" : "chatBubbleBot"}`}
              >
                {m.content}
              </div>
            ))}

            {isLoading && (
              <div className="chatAssistantBubble chatAssistantTyping">
                <img src="/chatbot-answer.svg" alt="" className="chatAvatar" />
                <span className="typingDots">
                  <i></i><i></i><i></i>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="chatErrorWrap">
          <div className="chatError">
            {error}{" "}
            <button
              className="chatErrorBtn"
              type="button"
              onClick={() => {
                setError(null);
                inputRef.current?.focus();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="chatComposer">
        <div className="chatInputRow">
          <div className="chatInputCol">
            {/* ✅ wrapper RELATIF uniquement pour textarea + bouton */}
            <div className="chatInputWrap">
              {/* Header haut */}
              <div className="chatInputTop">
                <img
                  className="chatInputStar"
                  src="/stars-chatbot.svg"
                  alt=""
                  aria-hidden="true"
                />
                <span className="chatInputHint">Comment puis-je vous aider ?</span>
              </div>

              {/* Zone de saisie */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="chatInputArea"
                disabled={isLoading}
                maxLength={MAX_CHARS + 50}
                aria-label="Votre message"
              />

              {/* Bouton bas droite */}
              <button
                onClick={() => void sendMessage()}
                disabled={!canSend}
                className="chatSend"
                aria-label="Envoyer"
                type="button"
              >
                ↑
              </button>
            </div>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="chatChips">
          {quickPrompts.map((p) => (
            <button
              key={p}
              className="chatChip"
              disabled={isLoading}
              onClick={() => void sendMessage(p)}
              type="button"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
