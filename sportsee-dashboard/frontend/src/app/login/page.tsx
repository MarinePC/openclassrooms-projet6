// src/app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useAppContext } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error(`Login failed (${res.status})`);

      const data: { token: string; userId: string } = await res.json();

      login(data.token);              // ✅ cookie + UI sync
      router.push(ROUTES.dashboard);  // ✅ page protégée
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 360 }}
      >
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </main>
  );
}

