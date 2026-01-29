// src/app/not-found.tsx
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import "@/app/globals.css";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Page introuvable</h1>
        <p style={{ marginTop: 12, color: "rgba(17,17,17,0.6)" }}>
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>

        <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link
            href={ROUTES.login}
            style={{
              background: "#0b23f4",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 14,
            }}
          >
            Retour au login
          </Link>

          <Link
            href={ROUTES.dashboard}
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 14,
            }}
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
