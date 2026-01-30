// frontend/src/components/chatbot/chatbotModal.tsx
"use client";

import { useEffect } from "react";
import ChatbotPanel from "./chatbot";

type Props = {
  open: boolean;
  onClose: () => void;
  profilePicture?: string | null;
  fullName?: string | null;
  userInfo?: any;
  recentActivities?: any[];
};

export default function ChatbotModal({ 
  open, 
  onClose, 
  profilePicture, 
  fullName,
  userInfo,
  recentActivities 
}: Props) {
  
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="chatModal">
        <button className="chatClose" type="button" onClick={onClose} aria-label="Fermer">
          Fermer ✕
        </button>

        <div className="chatShell">
          <ChatbotPanel 
            profilePicture={profilePicture ?? null}
            fullName={fullName ?? null}
            userInfo={userInfo}
            recentActivities={recentActivities}
          />
        </div>
      </div>
    </div>
  );
}
