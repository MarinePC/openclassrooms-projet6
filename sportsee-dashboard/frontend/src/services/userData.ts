// src/services/userData.ts

import { apiClient } from "@/services/apiClient";
import type { UserInfo, UserActivity } from "@/mocks/apiMock";
import { mockGetUserInfo, mockGetUserActivity, DEFAULT_USER_ID } from "@/mocks/apiMock";

import { toISODate, normalizeISODateKey } from "@/services/date";

/* =====================
   Source des données
===================== */

export type DataSource = "mock" | "api";

/* =====================
   Types exposés à l'UI
===================== */

export type ActivityDatum = {
  date: string; // "YYYY-MM-DD"
  distance: number; // km
  duration: number; // minutes
  caloriesBurned: number;
};

export type HeartRateDatum = {
  date: string; // "YYYY-MM-DD"
  min: number;
  max: number;
  average: number;
};

export type WeeklyGoalData = {
  goal: number;
  done: number;
};

export type MonthlyKmWeekBar = {
  weekKey: string;
  label: string;
  km: number;
  dateRange: string;
};

export type MonthlyKmBlock = {
  monthStart: string;
  monthEnd: string;
  avgKmPerWeek: number;
  weeks: MonthlyKmWeekBar[];
};

/* =====================
   Helpers
===================== */

function safeISODate(date: string): string {
  return normalizeISODateKey(date) ?? date;
}

function toNumberOrNaN(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return NaN;
}

/**
 * 🎯 Résout le weeklyGoal depuis plusieurs sources possibles
 * 
 * L'API peut renvoyer le goal sous différents formats:
 * - { weeklyGoal: 5 }
 * - { goal: 5 }
 * - { statistics: { weeklyGoal: 5 } }
 * - { userInfos: { goal: 5 } }
 * 
 * Cette fonction gère tous les cas pour éviter les bugs.
 * Si absent/invalide => retourne 0
 */
function resolveWeeklyGoal(raw: any): number {
  const candidates = [
    raw?.weeklyGoal,
    raw?.goal,
    raw?.statistics?.weeklyGoal,
    raw?.statistics?.goal,
    raw?.userInfos?.weeklyGoal,
    raw?.userInfos?.goal,
    raw?.profile?.weeklyGoal,
  ];

  const n = candidates.find(
    (v) => typeof v === "number" && Number.isFinite(v) && v >= 0
  );
  if (typeof n === "number") return n;

  const s = candidates.find(
    (v) => typeof v === "string" && v.trim() !== ""
  ) as string | undefined;

  if (s) {
    const parsed = Number(s);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  return 0;
}

/**
 * Déballe les réponses API courantes :
 * - { ...user }
 * - { data: { ...user } }
 * - { user: { ...user } }
 * - [ { ...user1 }, { ...user2 } ]
 */
function unwrapApiUser(rawResponse: any, userId: string) {
  if (Array.isArray(rawResponse)) {
    const found =
      rawResponse.find((u) => String(u?.id ?? u?._id ?? u?.userId) === String(userId)) ??
      rawResponse[0];
    return found ?? null;
  }
  return rawResponse?.data ?? rawResponse?.user ?? rawResponse ?? null;
}

function sum(numbers: number[]) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * Si l'API renvoie un RawUser (data.json-like) avec runningData,
 * on reconstruit des statistiques propres (comme le mock).
 */
function computeStatsFromRunningData(candidate: any) {
  const runningData: any[] = Array.isArray(candidate?.runningData) ? candidate.runningData : [];
  if (!runningData.length) return null;

  const totalDistance = round1(sum(runningData.map((a) => Number(a?.distance) || 0)));
  const totalSessions = runningData.length;
  const totalDuration = sum(runningData.map((a) => Number(a?.duration) || 0));

  return { totalDistance, totalSessions, totalDuration };
}

/* =====================
   Normalisation listes
===================== */

function normalizeActivity(list: UserActivity[]): ActivityDatum[] {
  return list.map((a) => ({
    date: safeISODate(a.date),
    distance: Number((a as any).distance) || 0,
    duration: Number((a as any).duration) || 0,
    caloriesBurned: Number((a as any).caloriesBurned) || 0,
  }));
}

function normalizeHeartRate(list: UserActivity[]): HeartRateDatum[] {
  return list.map((a) => ({
    date: safeISODate(a.date),
    min: Number(a.heartRate?.min) || 0,
    max: Number(a.heartRate?.max) || 0,
    average: Number(a.heartRate?.average) || 0,
  }));
}

/* =====================
   Fetch raw activities
===================== */

async function fetchUserActivityRaw(source: DataSource, userId: string): Promise<UserActivity[]> {
  if (source === "mock") return mockGetUserActivity(userId);

  // ⚠️ adapte si ton backend n'accepte pas userId en query
  const url = `/api/user-activity?startWeek=2000-01-01&endWeek=2100-01-01&userId=${encodeURIComponent(
    userId
  )}`;

  const list = await apiClient.get<UserActivity[]>(url);

  // normalise date => YYYY-MM-DD
  return list.map((a) => ({ ...a, date: safeISODate((a as any).date) }));
}

/* =====================
   Exports consommés par l'UI
===================== */

/**
 * Récupère les informations utilisateur (profil + statistiques)
 */
export async function getUserInfo(
  source: DataSource,
  userId: string = DEFAULT_USER_ID
): Promise<UserInfo> {
  if (source === "mock") {
    return mockGetUserInfo(userId);
  }

  // ⚠️ adapte si ton backend n'accepte pas userId en query
  const url = `/api/user-info?userId=${encodeURIComponent(userId)}`;
  const rawResponse = await apiClient.get<any>(url);

  const candidate = unwrapApiUser(rawResponse, userId);
  if (!candidate) {
    throw new Error("API: user-info vide ou utilisateur introuvable");
  }

  // 1) weeklyGoal : weeklyGoal ou goal (racine / userInfos / statistics)
  const weeklyGoal = resolveWeeklyGoal(candidate);

  // 2) Profile : API peut renvoyer "profile" (déjà normalisé) OU "userInfos" (raw)
  const profile = candidate?.profile ?? candidate?.userInfos;
  if (!profile) {
    throw new Error("API: profil introuvable (profile/userInfos manquant)");
  }

  // 3) Stats : soit déjà présentes (UserInfo), soit à reconstruire via runningData (RawUser)
  const computed = computeStatsFromRunningData(candidate);

  const tdRaw = candidate?.statistics?.totalDistance ?? candidate?.totalDistance ?? computed?.totalDistance ?? 0;
  const tdNum = toNumberOrNaN(tdRaw);
  const totalDistance = Number.isFinite(tdNum) ? tdNum : 0;

  const totalSessions =
    candidate?.statistics?.totalSessions ??
    computed?.totalSessions ??
    0;

  const totalDuration =
    candidate?.statistics?.totalDuration ??
    computed?.totalDuration ??
    0;

  const normalized: UserInfo = {
    ...candidate,
    profile,
    statistics: {
      ...(candidate?.statistics ?? {}),
      totalDistance,
      totalSessions,
      totalDuration,
      weeklyGoal,
    },
  };

  return normalized;
}

/**
 * Récupère toutes les activités brutes (avec heartRate)
 */
export async function getAllUserActivityRaw(
  source: DataSource,
  userId: string = DEFAULT_USER_ID
): Promise<UserActivity[]> {
  return fetchUserActivityRaw(source, userId);
}

/**
 * Récupère les activités (distance, durée, calories)
 */
export async function getUserActivity(
  source: DataSource,
  userId: string = DEFAULT_USER_ID
): Promise<ActivityDatum[]> {
  const list = await fetchUserActivityRaw(source, userId);
  return normalizeActivity(list);
}

/**
 * Récupère les données de fréquence cardiaque
 */
export async function getUserHeartRate(
  source: DataSource,
  userId: string = DEFAULT_USER_ID
): Promise<HeartRateDatum[]> {
  const list = await fetchUserActivityRaw(source, userId);
  return normalizeHeartRate(list);
}