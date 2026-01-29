// frontend/src/components/chatbot/chatbotModal.tsx
"use client";

import { useEffect } from "react";
import ChatbotPanel from "./chatbot";

type Props = {
  open: boolean;
  onClose: () => void;
  profilePicture?: string | null;
  fullName?: string | null;  // ✅ AJOUT
};

export default function ChatbotModal({ open, onClose, profilePicture, fullName }: Props) {
  // Debug: vérifier que la modale reçoit bien la photo et le nom
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line no-console
    console.log("[ChatbotModal] profilePicture =", profilePicture);
    console.log("[ChatbotModal] fullName =", fullName);
  }, [open, profilePicture, fullName]);

  // Escape + lock scroll
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
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
        // Fermer uniquement si clic sur l'overlay
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="chatModal">
        <button className="chatClose" type="button" onClick={onClose} aria-label="Fermer">
          Fermer ✕
        </button>

        <div className="chatShell">
          {/* ✅ CORRECTION : Transmettre profilePicture ET fullName */}
          <ChatbotPanel 
            profilePicture={profilePicture ?? null}
            fullName={fullName ?? null}
          />
        </div>
      </div>
    </div>
  );
}