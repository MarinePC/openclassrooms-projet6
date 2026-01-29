"use client";

import { useEffect } from "react";
import ChatbotPanel from "./chatbot";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChatbotModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

    return (
        <div
        className="chatOverlay"
        role="dialog"
        aria-modal="true"
        aria-label="Coach AI"
        onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}
        >
        <div className="chatModal">
            <button className="chatClose" onClick={onClose} aria-label="Fermer">
            Fermer ✕
            </button>

            <div className="chatShell">
            <ChatbotPanel />
            </div>
        </div>
        </div>
    );

}
