// src/services/userData.ts

import { apiClient } from "@/services/apiClient";
import type { UserInfo, UserActivity } from "@/mocks/apiMock";
import { mockGetUserInfo, mockGetUserActivity, DEFAULT_USER_ID } from "@/mocks/apiMock";

import { toISODate, normalizeISODateKey } from "@/services/date";

/* Source de données */

export type DataSource = "mock" | "api";

export type ActivityDatum = {
  date: string; 
  distance: number; 
  duration: number; 
  caloriesBurned: number;
};

export type HeartRateDatum = {
  date: string; 
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

/* helpers */

function safeISODate(date: string): string {
  return normalizeISODateKey(date) ?? date;
}

function toNumberOrNaN(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return NaN;
}

/* goal */
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


function computeStatsFromRunningData(candidate: any) {
  const runningData: any[] = Array.isArray(candidate?.runningData) ? candidate.runningData : [];
  if (!runningData.length) return null;

  const totalDistance = round1(sum(runningData.map((a) => Number(a?.distance) || 0)));
  const totalSessions = runningData.length;
  const totalDuration = sum(runningData.map((a) => Number(a?.duration) || 0));

  return { totalDistance, totalSessions, totalDuration };
}

/* normalisation listes */

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

/* Fetch activities */

async function fetchUserActivityRaw(source: DataSource, userId: string): Promise<UserActivity[]> {
  if (source === "mock") return mockGetUserActivity(userId);

  
  const url = `/api/user-activity?startWeek=2000-01-01&endWeek=2100-01-01&userId=${encodeURIComponent(
    userId
  )}`;

  const list = await apiClient.get<UserActivity[]>(url);

  return list.map((a) => ({ ...a, date: safeISODate((a as any).date) }));
}

/* Exports consommés par l'UI */

/* Récupère les info user */
export async function getUserInfo(
  source: DataSource,
  userId: string = DEFAULT_USER_ID
): Promise<UserInfo> {
  if (source === "mock") {
    return mockGetUserInfo(userId);
  }

  
  const url = `/api/user-info?userId=${encodeURIComponent(userId)}`;
  const rawResponse = await apiClient.get<any>(url);

  const candidate = unwrapApiUser(rawResponse, userId);
  if (!candidate) {
    throw new Error("API: user-info vide ou utilisateur introuvable");
  }


  const weeklyGoal = resolveWeeklyGoal(candidate);
  const profile = candidate?.profile ?? candidate?.userInfos;
  if (!profile) {
    throw new Error("API: profil introuvable (profile/userInfos manquant)");
  }
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

/* recup activité */
export async function getAllUserActivityRaw(
  source: DataSource,
  userId: string = DEFAULT_USER_ID
): Promise<UserActivity[]> {
  return fetchUserActivityRaw(source, userId);
}

export async function getUserActivity(
  source: DataSource,
  userId: string = DEFAULT_USER_ID
): Promise<ActivityDatum[]> {
  const list = await fetchUserActivityRaw(source, userId);
  return normalizeActivity(list);
}

/* recup bpm */
export async function getUserHeartRate(
  source: DataSource,
  userId: string = DEFAULT_USER_ID
): Promise<HeartRateDatum[]> {
  const list = await fetchUserActivityRaw(source, userId);
  return normalizeHeartRate(list);
}


/* profil user */ 

export type ProfileUserUI = {
  fullName: string;
  firstName: string;
  lastName: string;
  memberSinceISO: string;
  memberSinceFormatted: string; 
  age: number;
  gender: string;
  height: number;
  weight: number; 
  avatarUrl: string | null;
};

function resolveMemberSinceISO(user: any, activity?: ActivityDatum[]): string {
  const candidates = [
    user?.memberSince,
    user?.createdAt,
    user?.profile?.memberSince,
    user?.profile?.createdAt,
    user?.userInfos?.createdAt,
    user?.profile?.joinedAt,
  ].filter(Boolean);

  const first = candidates[0];
  if (typeof first === "string" && first.length >= 10) return safeISODate(first);

  if (activity?.length) {
    const dates = activity
      .map((a) => a.date)
      .filter(Boolean)
      .sort(); 
    if (dates[0]) return safeISODate(dates[0]);
  }


  return new Date().toISOString().slice(0, 10);
}

function resolveAvatarUrl(user: any): string | null {
  const candidates = [
    user?.avatarUrl,
    user?.avatar,
    user?.profile?.avatarUrl,
    user?.profile?.picture,
    user?.profile?.image,
    user?.profile?.profilePicture,
    user?.userInfos?.avatarUrl,
    user?.userInfos?.profilePicture,
  ].filter((v: any) => typeof v === "string" && v.trim() !== "");

  return (candidates[0] as string | undefined) ?? null;
}

/* format des dates */
function formatFrenchDate(isoDate: string): string {
  try {
    const date = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return isoDate;
    
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export function toProfileUserUI(userInfo: UserInfo, activity?: ActivityDatum[]): ProfileUserUI {
  const profile: any = (userInfo as any).profile ?? (userInfo as any).userInfos ?? {};
  const firstName = profile?.firstName ?? (userInfo as any)?.firstName ?? "";
  const lastName = profile?.lastName ?? (userInfo as any)?.lastName ?? "";

  const fullName = `${firstName} ${lastName}`.trim() || "Utilisateur";
  
  const memberSinceISO = resolveMemberSinceISO(userInfo as any, activity);
  const memberSinceFormatted = formatFrenchDate(memberSinceISO);

  return {
    fullName,
    firstName,
    lastName,
    memberSinceISO,
    memberSinceFormatted,
    age: Number(profile?.age) || 0,
    gender: String(profile?.gender ?? profile?.sex ?? "").trim() || "—",
    height: Number(profile?.height) || 0,
    weight: Number(profile?.weight) || 0,
    avatarUrl: resolveAvatarUrl(userInfo as any),
  };
}

export type ProfileStats = {
  totalDurationMin: number;
  totalDistanceKm: number;
  totalCalories: number;
  totalSessions: number;
  restDays: number;
};

/* date inscription */
function diffDaysFromToday(startISO: string): number {
  const start = new Date(startISO);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const ms = today.getTime() - start.getTime();
  return Math.max(Math.floor(ms / (1000 * 60 * 60 * 24)), 0);
}

/* jours repos */
export function computeProfileStats(
  activity: ActivityDatum[],
  memberSinceISO: string
): ProfileStats {
  const totalSessions = activity.length;

  const totalDurationMin = activity.reduce((sum, a) => sum + (a.duration || 0), 0);
  const totalDistanceKm = activity.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalCalories = activity.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);

  const daysSince = diffDaysFromToday(memberSinceISO);
  const restDays = Math.max(daysSince - totalSessions, 0);

  return {
    totalDurationMin,
    totalDistanceKm,
    totalCalories,
    totalSessions,
    restDays,
  };
}
