// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useAppContext } from "@/context/AppContext";

import "@/styles/header.css"; // pour réutiliser les tailles logos si tu veux
import "@/styles/login.css";

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
      if (res.status === 401 || res.status === 403) {
        setError("Adresse email ou mot de passe incorrect");
        return;
      }
      if (!res.ok) throw new Error(`Login failed (${res.status})`);

      const data: { token: string; userId: string } = await res.json();
      login(data.token);
      router.push(ROUTES.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="loginPage">
      <section className="loginLeft">
        {/* Logos (mêmes assets que le header) */}
        <div className="loginTop dashLogoWrapper">
          <img src="/Logo.svg" alt="logo" className="dashLogo" />
          <img src="/SPORTSEE.svg" alt="Sportsee" className="dashLogoText" />
        </div>

        {/* Zone centrée */}
        <div className="loginCardWrap">
          <div className="loginCard">
            {/* Bloc 1 */}
            <div className="loginBlock loginBlock--hero">
              <h1 className="loginTitle">
                Transformez<br />
                vos stats en résultats
              </h1>
            </div>

            {/* Bloc 2 */}
            <div className="loginBlock loginBlock--head">
              <h2 className="loginSubtitle">Se connecter</h2>
            </div>

            {/* Blocs 3 + 4 */}
            <form className="loginForm" onSubmit={handleSubmit}>
              {/* Bloc 3 : inputs (24px entre eux) */}
              <div className="loginFields">
                <label className="loginLabel">
                  Adresse email
                  <input
                    className="loginInput"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </label>

                <label className="loginLabel">
                  Mot de passe
                  <input
                    className="loginInput"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
              </div>

              {/* Bloc 4 : bouton + lien + erreur */}
              <div className="loginActions">
                <button className="loginButton" type="submit" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </button>

                <div className="loginForgot">Mot de passe oublié ?</div>

                {error && <p className="loginError">{error}</p>}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="loginRight" aria-label="Visuel login">
        <div className="loginBubble">
          Analysez vos performances en un clin d’œil, suivez vos progrès et atteignez vos objectifs.
        </div>
      </section>
    </main>

  );
}
