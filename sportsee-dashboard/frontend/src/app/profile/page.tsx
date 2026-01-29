// src/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeartRateComposedChart from "@/components/dashboard/HeartRateComposedChart";
import BarChartBase from "@/components/dashboard/BarChartBase";
import GoalDonutChart from "@/components/dashboard/GoalDonutChart";

import { useAppContext } from "@/context/AppContext";
import { ROUTES } from "@/config/routes";

import { useDashboardData } from "@/services/useDashboardData";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, dataSource } = useAppContext();

  // Auth guard (évite le "flash" du dashboard)
  useEffect(() => {
    if (!isAuthenticated) router.replace(ROUTES.login);
  }, [isAuthenticated, router]);

  const {
    monthlyKm,
    weeklyGoal,

    loadingBase,
    errorBase,

    loadingMonthly,
    errorMonthly,

    fullName,
    memberSince,
    totalDistanceKm,
    profilePicture,

    weekDuration,
    weekDistance,
    weekSubtitle,

    monthlyRangeLabel,
    monthlyKpiLabel,
    hasPrevMonthData,
    hasNextMonthData,
    goPrevMonth,
    goNextMonth,

    weeklyBpmRangeLabel,
    bpmKpiLabel,
    hasPrevWeekData,
    hasNextWeekData,
    goPrevWeek,
    goNextWeek,
    heartComposedData,
  } = useDashboardData({ isAuthenticated, dataSource });

  if (!isAuthenticated) return null;

  return (
    <div className="dashPage">
      <div className="dashContainer">
        <Header />

        <main className="dashMain">
          <div className="dashContent">
            <DashboardHeader
              fullName={fullName}
              memberSince={memberSince}
              totalDistanceKm={totalDistanceKm}
              profilePicture={profilePicture}
            />

            <section className="dashPerfBlock">
              {/* Sous bloc 1 : dernières performances */}
              <div className="dashPerfLast">
                <h2 className="dashPerfTitle">Vos dernières performances</h2>

                <div className="dashPerfCharts">
                  {/* Bloc 1 (Mensuel Km) */}
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
                          onClick={goPrevMonth}
                          disabled={!hasPrevMonthData}
                          aria-label="Mois précédent"
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
                          onClick={goNextMonth}
                          disabled={!hasNextMonthData}
                          aria-label="Mois suivant"
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

                    {loadingMonthly && <p className="dashLoading">Chargement…</p>}
                    {!loadingMonthly && errorMonthly && (
                      <p className="dashError">Erreur : {errorMonthly}</p>
                    )}

                    {!loadingMonthly && !errorMonthly && monthlyKm && (
                      <div className="dashChart dashMonthlyChartPad kmChart">
                        <BarChartBase
                          data={monthlyKm.weeks.map((w) => ({
                            label: w.label,
                            km: w.km,
                            dateRange: w.dateRange,
                            weekKey: w.weekKey,
                          }))}
                          xKey="label"
                          bars={[
                            {
                              dataKey: "km",
                              name: "Km",
                              fill: "#B6BDFC",
                              activeFill: "#0B23F4",
                              barSize: 14,
                              radius: [30, 30, 0, 0],
                            },
                          ]}
                          barCategoryGap={61}
                          grid={false}
                          verticalGrid={false}
                          tooltip
                          customTooltip
                        />
                      </div>
                    )}
                  </div>

                  {/* Bloc 2 (BPM) – semaine ISO */}
                  <div className="dashCard dashPerfChart dashPerfChartBpm">
                    <div className="dashMonthlyHeader">
                      <div className="dashMonthlyTitleWrap">
                        <div className="dashBpmKpi">{bpmKpiLabel}</div>
                        <div className="dashMonthlySub">Fréquence cardiaque moyenne</div>
                      </div>

                      <div className="dashMonthlyNav">
                        <button
                          type="button"
                          className="dashNavBtn"
                          onClick={goPrevWeek}
                          disabled={!hasPrevWeekData}
                          aria-label="Semaine précédente"
                        >
                          <img src="/left.svg" alt="" className="dashNavIcon" />
                        </button>

                        <div className="dashMonthlyRange">{weeklyBpmRangeLabel}</div>

                        <button
                          type="button"
                          className="dashNavBtn"
                          onClick={goNextWeek}
                          disabled={!hasNextWeekData}
                          aria-label="Semaine suivante"
                        >
                          <img src="/right.svg" alt="" className="dashNavIcon" />
                        </button>
                      </div>
                    </div>

                    {loadingBase && <p className="dashLoading">Chargement…</p>}
                    {!loadingBase && errorBase && <p className="dashError">Erreur : {errorBase}</p>}

                    {!loadingBase && !errorBase && (
                      <div className="dashChart bpmChart">
                        <HeartRateComposedChart data={heartComposedData} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sous bloc 2 : cette semaine */}
              <div className="dashWeekBlock">
                <h3 className="dashPerfTitle">Cette semaine</h3>
                <div className="dashWeekSubtitle">{weekSubtitle}</div>

                <div className="dashWeekGrid">
                  {/* Bloc 3 (Goal donut) */}
                  <div className="dashCard dashWeekGoalCard">
                    {loadingBase && <p className="dashLoading">Chargement…</p>}
                    {!loadingBase && errorBase && <p className="dashError">Erreur : {errorBase}</p>}

                    {!loadingBase && !errorBase && weeklyGoal && (
                      <GoalDonutChart done={weeklyGoal.done} goal={weeklyGoal.goal} />
                    )}

                    {!loadingBase && !errorBase && !weeklyGoal && (
                      <p className="dashLoading">Aucune donnée objectif.</p>
                    )}
                  </div>

                  <div className="dashWeekSideCards">
                    <div className="dashCard dashWeekStatCard">
                      <div className="dashSmallLabel">Durée d'activité</div>
                      <div className="dashStatBlue">{weekDuration}</div>
                    </div>

                    <div className="dashCard dashWeekStatCard">
                      <div className="dashSmallLabel">Distance</div>
                      <div className="dashStatRed">{weekDistance}</div>
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
