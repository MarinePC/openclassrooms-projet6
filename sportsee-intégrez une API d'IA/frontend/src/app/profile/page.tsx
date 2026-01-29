// src/app/profile/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { useAppContext } from "@/context/AppContext";
import { ROUTES } from "@/config/routes";

import { useProfileData } from "@/services/useProfileData";
import { DEFAULT_USER_ID } from "@/mocks/apiMock";

import "@/styles/profile.css";

function formatDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.floor(totalMinutes || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r}min`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}min`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, dataSource } = useAppContext();

  /* =====================
     Auth guard
  ===================== */
  useEffect(() => {
    if (!isAuthenticated) router.replace(ROUTES.login);
  }, [isAuthenticated, router]);

  /* =====================
     DATA
  ===================== */
  const userId = DEFAULT_USER_ID;

  const { user, stats, loading, error } = useProfileData(dataSource, userId);

  // ✅ Utiliser memberSinceFormatted au lieu de memberSinceISO
  const memberSinceLabel = user?.memberSinceFormatted || "—";

  // ✅ Fallback pour l'avatar
  const avatarSrc = user?.avatarUrl || "/profile.jpg";

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Temps total couru",
        value: formatDuration(stats.totalDurationMin),
        unit: "",
      },
      {
        label: "Calories brûlées",
        value: String(Math.round(stats.totalCalories || 0)),
        unit: "cal",
      },
      {
        label: "Distance totale parcourue",
        value: String(Math.round(stats.totalDistanceKm || 0)),
        unit: "km",
      },
      {
        label: "Nombre de jours de repos",
        value: String(Math.round(stats.restDays || 0)),
        unit: "jours",
      },
      {
        label: "Nombre de sessions",
        value: String(Math.round(stats.totalSessions || 0)),
        unit: "sessions",
      },
    ];
  }, [stats]);

  return (
    <div>
    <div className="container">
      <Header />

      <main className="profileMain">
        <div className="profileWrap">
          {/* Loading / Error */}
          {loading && <p className="profileLoading">Chargement…</p>}
          {!loading && error && <p className="profileError">Erreur : {error}</p>}

          {!loading && !error && user && stats && (
            <div className="profileGrid">
              {/* Colonne gauche */}
              <section className="profileColLeft">
                <div className="profileCard profileIdentityCard">
                  <div className="profileAvatarWrap">
                    <img className="profileAvatar" src={avatarSrc} alt="" />
                  </div>

                  <div className="profileIdentityText">
                    <div className="profileName">{user.fullName}</div>
                    {/* ✅ Afficher "Membre depuis le XX mois XXXX" */}
                    <div className="profileMember">Membre depuis le {memberSinceLabel}</div>
                  </div>
                </div>

                <div className="profileCard profileInfoCard">
                  <div className="profileInfoTitle">Votre profil</div>
                  <div className="profileInfoDivider" />

                  <div className="profileInfoRows">
                    <div className="profileInfoRow">
                      <span className="profileInfoLabel">Âge :</span>
                      <span className="profileInfoValue">{user.age ?? "—"}</span>
                    </div>

                    <div className="profileInfoRow">
                      <span className="profileInfoLabel">Genre :</span>
                      {/* ✅ Le genre vient maintenant de user.gender */}
                      <span className="profileInfoValue">{user.gender ?? "—"}</span>
                    </div>

                    <div className="profileInfoRow">
                      <span className="profileInfoLabel">Taille :</span>
                      <span className="profileInfoValue">
                        {user.height ? `${user.height}cm` : "—"}
                      </span>
                    </div>

                    <div className="profileInfoRow">
                      <span className="profileInfoLabel">Poids :</span>
                      <span className="profileInfoValue">
                        {user.weight ? `${user.weight}kg` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Colonne droite */}
              <section className="profileColRight">
                <div className="profileStatsHeader">
                  <h1 className="profileStatsTitle">Vos statistiques</h1>
                  {/* ✅ Afficher "depuis le XX mois XXXX" */}
                  <div className="profileStatsSubtitle">depuis le {memberSinceLabel}</div>
                </div>

                <div className="profileStatsGrid">
                  {statCards.map((s) => (
                    <div key={s.label} className="profileStatCard">
                      <div className="profileStatLabel">{s.label}</div>
                      <div className="profileStatValue">
                        {s.value}
                        {s.unit ? <span className="profileStatUnit"> {s.unit}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Cas "vide" si le hook ne renvoie rien */}
          {!loading && !error && (!user || !stats) && (
            <p className="profileError">Données indisponibles.</p>
          )}
        </div>
      </main>
</div>
      <Footer />
    </div>
  );
}