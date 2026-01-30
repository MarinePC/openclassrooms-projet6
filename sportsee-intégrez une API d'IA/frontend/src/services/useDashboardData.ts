// src/services/useDashboardData.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserActivity, UserInfo } from "@/mocks/apiMock";

import {
  getUserInfo,
  getAllUserActivityRaw,
  getUserHeartRate,
  type DataSource,
  type MonthlyKmBlock,
  type MonthlyKmWeekBar,
  type WeeklyGoalData,
  type HeartRateDatum,
} from "@/services/userData";

import {
  parseISODate,
  toISODate,
  startOfISOWeekMonday,
  addDays,
  formatDayMonth,
  formatDistanceKm,
  normalizeISODateKey,
} from "@/services/date";

// ✅ Import des utilitaires depuis utils.ts
import {
  sum,
  round1,
  startOfDay,
  endOfDay,
  formatDDMM,
  formatDayMonthShort,
  formatTopRange,
  maxISO,
  minISO,
} from "@/services/utils";

/* KM */

function buildLast4WeeksBlock(
  windowEnd: Date,
  windowActivities: UserActivity[]
): MonthlyKmBlock {
  const end = endOfDay(windowEnd);
  const start = startOfDay(addDays(end, -27)); // 28 jours inclusifs

  const weeks: MonthlyKmWeekBar[] = [];

  for (let i = 0; i < 4; i++) {
    const wStart = startOfDay(addDays(start, i * 7));
    const wEnd = endOfDay(addDays(wStart, 6));

    const km = round1(
      sum(
        windowActivities
          .filter((a) => {
            const t = parseISODate(a.date).getTime();
            return t >= wStart.getTime() && t <= wEnd.getTime();
          })
          .map((a) => Number((a as any).distance) || 0)
      )
    );

    weeks.push({
      weekKey: `${toISODate(wStart)}_S${i + 1}`,
      label: `S${i + 1}`,
      km,
      dateRange: `${formatDDMM(wStart)} - ${formatDDMM(wEnd)}`,
    });
  }

  const avgKmPerWeek = weeks.length
    ? round1(sum(weeks.map((w) => w.km)) / weeks.length)
    : 0;

  return {
    monthStart: toISODate(start),
    monthEnd: toISODate(end),
    avgKmPerWeek,
    weeks,
  };
}

/* BPM */

export type HeartComposedDatum = {
  day: string; // Lun..Dim
  min: number;
  max: number;
  avg: number; // points bleus = AVG
  dateISO: string;
};

export type StatValueUnit = {
  value: number;
  unit: "minutes" | "kilomètres";
};

/* hook */

export function useDashboardData(params: {
  isAuthenticated: boolean;
  dataSource: DataSource;
  userId?: string;
}) {
  const { isAuthenticated, dataSource } = params;
  const userId = params.userId ?? "user123";

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [heartRate, setHeartRate] = useState<HeartRateDatum[]>([]);

  const [loadingBase, setLoadingBase] = useState(true);
  const [errorBase, setErrorBase] = useState<string | null>(null);

  // Bloc 1 (KM) : fin fenêtre 4 semaines
  const [windowEnd, setWindowEnd] = useState<Date>(() => new Date());

  // Blocs 2/3 : semaine navigable
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingBase(true);
        setErrorBase(null);

        const [info, acts, hr] = await Promise.all([
          getUserInfo(dataSource, userId),
          getAllUserActivityRaw(dataSource, userId),
          getUserHeartRate(dataSource, userId),
        ]);

        if (cancelled) return;

        setUserInfo(info);
        setActivities(acts);
        setHeartRate(hr);

        
        const lastActISO = acts.length ? maxISO(acts.map((a) => a.date)) : null;
        if (lastActISO) {
          const last = parseISODate(lastActISO);
          setWindowEnd(last);
          setWeekAnchor(last);
          return;
        }

        const lastHrISO = hr.length ? maxISO(hr.map((x) => x.date)) : null;
        if (lastHrISO) setWeekAnchor(parseISODate(lastHrISO));
      } catch (err: any) {
        if (cancelled) return;
        setErrorBase(err?.message ?? "Erreur lors du chargement des données");
      } finally {
        if (cancelled) return;
        setLoadingBase(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, dataSource, userId]);

  /* Bloc 1 */

  const windowActivities = useMemo(() => {
    if (!activities.length) return [];
    const end = endOfDay(windowEnd);
    const start = startOfDay(addDays(end, -27));

    return activities.filter((a) => {
      const t = parseISODate(a.date).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }, [activities, windowEnd]);

  const monthlyKm: MonthlyKmBlock | null = useMemo(() => {
    if (!windowActivities.length) return null;
    return buildLast4WeeksBlock(windowEnd, windowActivities);
  }, [windowEnd, windowActivities]);

  const monthlyRangeLabel = useMemo(() => {
    if (!monthlyKm) return "—";
    return formatTopRange(
      parseISODate(monthlyKm.monthStart),
      parseISODate(monthlyKm.monthEnd)
    );
  }, [monthlyKm]);

  const monthlyKpiLabel = useMemo(() => {
    if (!monthlyKm) return "—";
    return `${Math.round(monthlyKm.avgKmPerWeek)}km en moyenne`;
  }, [monthlyKm]);

  const minEnd = useMemo(() => {
    if (!activities.length) return null;
    const firstISO = minISO(activities.map((a) => a.date));
    return firstISO ? addDays(parseISODate(firstISO), 27) : null;
  }, [activities]);

  const maxEnd = useMemo(() => {
    if (!activities.length) return null;
    const lastISO = maxISO(activities.map((a) => a.date));
    return lastISO ? parseISODate(lastISO) : null;
  }, [activities]);

  const hasPrevMonthData = !!minEnd && windowEnd.getTime() > minEnd.getTime();
  const hasNextMonthData = !!maxEnd && windowEnd.getTime() < maxEnd.getTime();

  const goPrevMonth = () => {
    if (!hasPrevMonthData) return;
    setWindowEnd((d) => addDays(d, -28));
  };

  const goNextMonth = () => {
    if (!hasNextMonthData) return;
    setWindowEnd((d) => addDays(d, 28));
  };

  /* Semaine */

  const weekStart = useMemo(() => startOfISOWeekMonday(weekAnchor), [weekAnchor]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const weekActivities = useMemo(() => {
    if (!activities.length) return [];
    const startT = weekStart.getTime();
    const endT = endOfDay(weekEnd).getTime();

    return activities.filter((a) => {
      const t = parseISODate(a.date).getTime();
      return t >= startT && t <= endT;
    });
  }, [activities, weekStart, weekEnd]);

  // goal = API 
  const weeklyGoal: WeeklyGoalData | null = useMemo(() => {
    if (!userInfo) return null;

    const raw =
      (userInfo as any)?.statistics?.weeklyGoal ??
      (userInfo as any)?.statistics?.goal;

    const goal =
      typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : 0;

    const safeGoal = Number.isFinite(goal) && goal > 0 ? goal : 0;
    const done = weekActivities.length;

    return { goal: safeGoal, done };
  }, [userInfo, weekActivities]);

  const weekSubtitle = useMemo(() => {
    return `du ${formatDayMonth(toISODate(weekStart))} au ${formatDayMonth(
      toISODate(weekEnd)
    )}`;
  }, [weekStart, weekEnd]);


  const weekDuration: StatValueUnit = useMemo(() => {
    const totalMin = weekActivities.reduce(
      (acc, a) => acc + (Number((a as any).duration) || 0),
      0
    );

    return { value: totalMin, unit: "minutes" };
  }, [weekActivities]);

  const weekDistance: StatValueUnit = useMemo(() => {
    const totalKm = weekActivities.reduce(
      (acc, a) => acc + (Number((a as any).distance) || 0),
      0
    );

    return { value: round1(totalKm), unit: "kilomètres" };
  }, [weekActivities]);

  /* BPM */

  const heartComposedData: HeartComposedDatum[] = useMemo(() => {
    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      const iso = toISODate(d);

      const found = heartRate.find((x) => normalizeISODateKey(x.date) === iso);

      return {
        day: labels[i],
        min: found?.min ?? 0,
        max: found?.max ?? 0,
        avg: found?.average ?? 0,
        dateISO: iso,
      };
    });
  }, [heartRate, weekStart]);

  const bpmKpiLabel = useMemo(() => {
    const vals = heartComposedData.map((x) => x.avg).filter((v) => v > 0);
    if (!vals.length) return "—";
    return `${Math.round(sum(vals) / vals.length)} BPM`;
  }, [heartComposedData]);

  const weeklyBpmRangeLabel = useMemo(() => {
    return `${formatDayMonth(toISODate(weekStart))} - ${formatDayMonth(
      toISODate(weekEnd)
    )}`;
  }, [weekStart, weekEnd]);

  const actMin = useMemo(() => {
    if (!activities.length) return null;
    const iso = minISO(activities.map((a) => a.date));
    return iso ? parseISODate(iso) : null;
  }, [activities]);

  const actMax = useMemo(() => {
    if (!activities.length) return null;
    const iso = maxISO(activities.map((a) => a.date));
    return iso ? parseISODate(iso) : null;
  }, [activities]);

  const hasPrevWeekData =
    !!actMin && weekStart.getTime() > startOfISOWeekMonday(actMin).getTime();

  const hasNextWeekData =
    !!actMax && weekStart.getTime() < startOfISOWeekMonday(actMax).getTime();

  const goPrevWeek = () => {
    if (!hasPrevWeekData) return;
    setWeekAnchor((d) => addDays(d, -7));
  };

  const goNextWeek = () => {
    if (!hasNextWeekData) return;
    setWeekAnchor((d) => addDays(d, 7));
  };

  /* header */

  const fullName = userInfo
    ? `${userInfo.profile.firstName} ${userInfo.profile.lastName}`
    : "—";

  const memberSince =
    userInfo?.profile?.createdAt
      ? `Membre depuis le ${new Date(
          `${normalizeISODateKey(userInfo.profile.createdAt) ?? userInfo.profile.createdAt}T00:00:00`
        ).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`
      : "";

  const totalDistanceKm = userInfo
    ? formatDistanceKm(userInfo.statistics.totalDistance)
    : "—";

  const profilePicture = userInfo?.profile?.profilePicture ?? null;

  return {
    userInfo,
    activities,

    // Bloc 1
    monthlyKm,
    monthlyRangeLabel,
    monthlyKpiLabel,
    hasPrevMonthData,
    hasNextMonthData,
    goPrevMonth,
    goNextMonth,

    // Bloc 2
    weeklyBpmRangeLabel,
    bpmKpiLabel,
    hasPrevWeekData,
    hasNextWeekData,
    goPrevWeek,
    goNextWeek,
    heartComposedData,

    // Bloc 3
    weeklyGoal,
    weekSubtitle,
    weekDuration, 
    weekDistance, 

    // states
    loadingBase,
    errorBase,

    // header
    fullName,
    memberSince,
    totalDistanceKm,
    profilePicture,
  };
}
