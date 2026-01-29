"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";
type ChatMsg = { id: string; role: Role; content: string };

const MAX_CHARS = 300;
const MAX_HISTORY = 10;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3001";

function uid() {
  return crypto.randomUUID();
}

function getToken() {
  return localStorage.getItem("token");
}

type Props = {
  profilePicture?: string | null;
  fullName?: string | null;
};

export default function ChatbotPanel({ profilePicture = null, fullName = null }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si l'image ne charge pas, on force fallback
  const [avatarOk, setAvatarOk] = useState(true);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const trimmed = input.trim();
  const canSend = !isLoading && trimmed.length > 0 && trimmed.length <= MAX_CHARS;

  const historyForApi = useMemo(() => {
    return messages.slice(-MAX_HISTORY).map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  // Debug: tu sauras si la prop arrive vraiment
  useEffect(() => {
    console.log("[ChatbotPanel] profilePicture =", profilePicture);
  }, [profilePicture]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "24px";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  }, [input]);

  // Si l'URL change, on retente le chargement
  useEffect(() => {
    setAvatarOk(true);
  }, [profilePicture]);

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
        const token = getToken();
        if (!token) throw new Error("Vous n'êtes pas connecté. Veuillez vous reconnecter.");

        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: text, history: historyForApi }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg =
            data?.error ||
            data?.message ||
            (res.status === 401
              ? "Session expirée. Veuillez vous reconnecter."
              : `Erreur serveur (${res.status}).`);
          throw new Error(msg);
        }

        const data = (await res.json()) as { reply?: string };
        const reply = (data.reply ?? "").trim();

        const botMsg: ChatMsg = {
          id: uid(),
          role: "assistant",
          content: reply || "Je n'ai pas réussi à générer une réponse. Réessaie.",
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
    "Peux-tu m'expliquer mon dernier graphique ?",
  ];

  const fallbackLetter = (fullName?.trim()?.[0] ?? "S").toUpperCase();

  return (
    <section className="chatPanel">
      <div className="chatMessages">
        {messages.length === 0 ? (
          <div className="chatEmpty">
            Posez vos questions sur votre programme,
            <br />
            vos performances ou vos objectifs
          </div>
        ) : (
          <div className="chatThread">
            {messages.map((m) => {
              const isUser = m.role === "user";

              if (isUser) {
                return (
                  <div key={m.id} className="chatRow chatRowUser">
                    <div className="chatBubble chatBubbleUser">
                      <div className="chatBubbleContent">{m.content}</div>
                    </div>

                    {/* Avatar user */}
                    {profilePicture && avatarOk ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="chatUserAvatar"
                        src={profilePicture}
                        alt={fullName ?? "Utilisateur"}
                        onError={() => {
                          console.error("[ChatbotPanel] Avatar failed:", profilePicture);
                          setAvatarOk(false);
                        }}
                      />
                    ) : (
                      <div className="chatUserAvatarFallback" aria-hidden="true">
                        {fallbackLetter}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={m.id} className="chatRow chatRowBot">
                  <img className="chatbotIcon" src="/chatbot-answer.svg" alt="chatbot-answer" />

                  <div className="chatBotCol">
                    <div className="chatBotLabel">Coach AI</div>

                    <div className="chatBubble chatBubbleBot">
                      <div className="chatBubbleContent">{m.content}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="chatRow chatRowBot">
                <img className="chatbotIcon" src="/chatbot-answer.svg" alt="chatbot-answer" />

                {/* ✅ MODIFICATION : Supprimer la colonne et le label, garder juste les dots */}
                <div className="chatBubbleTyping">
                  <span className="typingDots" aria-label="Chargement">
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

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

      <div className="chatComposer">
        <div className="chatInputWrap">
          <div className="chatInputLine">
            {/* NOTE: si la maquette veut l'icône dans la bulle bot, on la déplacera ensuite */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="dashAskIcon" src="/stars-chatbot.svg" alt="stars-chatbot" />

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="chatInputArea"
              disabled={isLoading}
              maxLength={MAX_CHARS + 50}
              aria-label="Votre message"
              placeholder="Comment puis-je vous aider ?"
              rows={1}
            />
          </div>

          <button
            onClick={() => void sendMessage()}
            disabled={!canSend}
            className="chatSend"
            aria-label="Envoyer"
            type="button"
          >
            →
          </button>
        </div>

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