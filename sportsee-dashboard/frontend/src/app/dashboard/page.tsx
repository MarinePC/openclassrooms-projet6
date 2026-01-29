// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChatbotModal from "@/components/chatbot/chatbotModal";

import MonthlyKmBarChart from "@/components/dashboard/MonthlyKmBarChart";
import HeartRateComposedChart from "@/components/dashboard/HeartRateComposedChart";
import GoalDonutChart from "@/components/dashboard/GoalDonutChart";

import { useAppContext } from "@/context/AppContext";
import { ROUTES } from "@/config/routes";
import "@/styles/chatbot.css";

import { useDashboardData } from "@/services/useDashboardData";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, dataSource } = useAppContext();

  const [chatOpen, setChatOpen] = useState(false);

  /* =====================
     Auth guard
  ===================== */
  useEffect(() => {
    if (!isAuthenticated) router.replace(ROUTES.login);
  }, [isAuthenticated, router]);

  /* =====================
     DATA (single source of truth)
  ===================== */
  const {
    // base loading/errors
    loadingBase,
    errorBase,

    // header
    fullName,
    memberSince,
    totalDistanceKm,
    profilePicture,

    // bloc 1 (km)
    monthlyKm,
    monthlyKpiLabel,
    monthlyRangeLabel,
    hasPrevMonthData,
    hasNextMonthData,
    goPrevMonth,
    goNextMonth,

    // bloc 2 (bpm)
    weeklyBpmRangeLabel,
    bpmKpiLabel,
    hasPrevWeekData,
    hasNextWeekData,
    goPrevWeek,
    goNextWeek,
    heartComposedData,

    // bloc 3 (goal donut + stats)
    weeklyGoal,
    weekSubtitle,
    weekDuration,
    weekDistance,
  } = useDashboardData({ isAuthenticated, dataSource });

  // Fallbacks sûrs (au cas où)
  const safeHeartData = heartComposedData ?? [];
  const safeWeeklyGoal = weeklyGoal ?? { goal: 0, done: 0 };

  return (
    <div>
      <div className="dashContainer">
        <Header />

        <main className="dashMain">
          <div className="dashContent">
            <DashboardHeader
              fullName={fullName}
              memberSince={memberSince}
              totalDistanceKm={totalDistanceKm}
              profilePicture={profilePicture}
              onOpenChat={() => setChatOpen(true)}
            />

            <ChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />

            <section className="dashPerfBlock">
              {/* =====================
                  Bloc 1 + Bloc 2
              ===================== */}
              <div className="dashPerfLast">
                <h2 className="dashPerfTitle">Vos dernières performances</h2>

                <div className="dashPerfCharts">
                  {/* Bloc 1 - Mensuel Km */}
                  <div className="dashCard dashPerfChart dashPerfChartKm">
                    <div className="dashMonthlyHeader">
                      <div className="dashMonthlyTitleWrap">
                        <div className="dashMonthlyKpi">{monthlyKpiLabel}</div>
                        <div className="dashMonthlySub">
                          Total des kilomètres 4 dernières semaines
                        </div>
                      </div>

                      <div className="dashMonthlyNav">
                        <button
                          type="button"
                          className="dashNavBtn"
                          disabled={!hasPrevMonthData}
                          aria-label="Mois précédent"
                          onClick={goPrevMonth}
                        >
                          <span className="dashNavIconWrap">
                            <img
                              src="/left.svg"
                              alt=""
                              className="dashNavIcon dashNavIconDefault"
                            />
                            <img
                              src="/hover-arrow.svg"
                              alt=""
                              className="dashNavIcon dashNavIconHover dashNavIconHoverLeft"
                            />
                          </span>
                        </button>

                        <div className="dashMonthlyRange">{monthlyRangeLabel}</div>

                        <button
                          type="button"
                          className="dashNavBtn"
                          disabled={!hasNextMonthData}
                          aria-label="Mois suivant"
                          onClick={goNextMonth}
                        >
                          <span className="dashNavIconWrap">
                            <img
                              src="/right.svg"
                              alt=""
                              className="dashNavIcon dashNavIconDefault"
                            />
                            <img
                              src="/hover-arrow.svg"
                              alt=""
                              className="dashNavIcon dashNavIconHover"
                            />
                          </span>
                        </button>
                      </div>
                    </div>

                    {loadingBase && <p className="dashLoading">Chargement…</p>}
                    {!loadingBase && errorBase && (
                      <p className="dashError">Erreur : {errorBase}</p>
                    )}

                    {!loadingBase && !errorBase && (
                      <div className="dashMonthlyChartPad">
                        <MonthlyKmBarChart data={monthlyKm?.weeks ?? []} />
                      </div>
                    )}
                  </div>

                  {/* Bloc 2 - BPM */}
                  <div className="dashCard dashPerfChart dashPerfChartBpm">
                    <div className="dashMonthlyHeader">
                      <div className="dashMonthlyTitleWrap">
                        <div className="dashBpmKpi">{bpmKpiLabel}</div>
                        <div className="dashMonthlySub">
                          Fréquence cardiaque moyenne
                        </div>
                      </div>

                      <div className="dashMonthlyNav">
                        <button
                          type="button"
                          className="dashNavBtn"
                          disabled={!hasPrevWeekData}
                          aria-label="Semaine précédente"
                          onClick={goPrevWeek}
                        >
                          <span className="dashNavIconWrap">
                            <img
                              src="/left.svg"
                              alt=""
                              className="dashNavIcon dashNavIconDefault"
                            />
                            <img
                              src="/hover-arrow.svg"
                              alt=""
                              className="dashNavIcon dashNavIconHover dashNavIconHoverLeft"
                            />
                          </span>
                        </button>

                        <div className="dashMonthlyRange">{weeklyBpmRangeLabel}</div>

                        <button
                          type="button"
                          className="dashNavBtn"
                          disabled={!hasNextWeekData}
                          aria-label="Semaine suivante"
                          onClick={goNextWeek}
                        >
                          <span className="dashNavIconWrap">
                            <img
                              src="/right.svg"
                              alt=""
                              className="dashNavIcon dashNavIconDefault"
                            />
                            <img
                              src="/hover-arrow.svg"
                              alt=""
                              className="dashNavIcon dashNavIconHover"
                            />
                          </span>
                        </button>
                      </div>
                    </div>

                    {loadingBase && <p className="dashLoading">Chargement…</p>}
                    {!loadingBase && errorBase && (
                      <p className="dashError">Erreur : {errorBase}</p>
                    )}

                    {!loadingBase && !errorBase && (
                      <div className="dashChart bpmChart">
                        <HeartRateComposedChart data={safeHeartData} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* =====================
                  Bloc 3 - Cette semaine
              ===================== */}
              <div className="dashWeekBlock">
                <h3 className="dashPerfTitle">Cette semaine</h3>
                <div className="dashWeekSubtitle">{weekSubtitle}</div>

                <div className="dashWeekGrid">
                  {/* Donut */}
                  <div className="dashCard dashWeekGoalCard">
                    {loadingBase && <p className="dashLoading">Chargement…</p>}
                    {!loadingBase && errorBase && (
                      <p className="dashError">Erreur : {errorBase}</p>
                    )}
                    {!loadingBase && !errorBase && (
                      <GoalDonutChart done={safeWeeklyGoal.done} goal={safeWeeklyGoal.goal} />
                    )}
                  </div>

                  {/* Stats (2 cards distinctes) */}
                  <div className="dashWeekSideCards">
                    {/* Card 1 - Durée */}
                    <div className="dashCard dashWeekStatCard">
                      <div className="dashSmallLabel">Durée d&apos;activité</div>
                      <div className="dashWeekStatLine">
                        <span className="dashWeekStatValue dashWeekStatValueBlue">
                          {weekDuration?.value ?? 0}
                        </span>
                        <span className="dashWeekStatUnit dashWeekStatUnitDuration">
                          {weekDuration?.unit ?? "minutes"}
                        </span>
                      </div>
                    </div>

                    {/* Card 2 - Distance */}
                    <div className="dashCard dashWeekStatCard">
                      <div className="dashSmallLabel">Distance</div>
                      <div className="dashWeekStatLine">
                        <span className="dashWeekStatValue dashWeekStatValueRed">
                          {weekDistance?.value ?? 0}
                        </span>
                        <span className="dashWeekStatUnit dashWeekStatUnitDistance">
                          {weekDistance?.unit ?? "kilomètres"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
