// src/mocks/apiMock.ts

export type UserProfile = {
  firstName: string;
  lastName: string;
  createdAt: string; // "YYYY-MM-DD"
  age: number;
  weight: number;
  height: number;
  gender?: string; // ✅ Ajout du genre
  profilePicture: string;
};

export type UserStatistics = {
  totalDistance: number | string; // ✅ Accepte les deux types
  totalSessions: number;
  totalDuration: number; // minutes
  weeklyGoal: number; // ✅ Toujours un number
};

export type UserInfo = {
  profile: UserProfile;
  statistics: UserStatistics;
};

export type HeartRate = {
  min: number;
  max: number;
  average: number;
};

export type UserActivity = {
  date: string; // "YYYY-MM-DD"
  distance: number; // km
  duration: number; // minutes
  heartRate: HeartRate;
  caloriesBurned: number;
};

/* =====================
   RAW DATA (structure "data.json like")
===================== */

type RawUserInfos = {
  firstName: string;
  lastName: string;
  createdAt: string;
  age: number;
  weight: number;
  height: number;
  gender?: string; // ✅ Ajout du champ gender
  profilePicture: string;
  goal?: number;
  weeklyGoal?: number;
};

type RawUser = {
  id: string;
  goal?: number;
  weeklyGoal?: number;
  userInfos: RawUserInfos;
  runningData: UserActivity[];
  username?: string;
  password?: string;
};

/* =====================
   Mock dataset (EXEMPLES)
===================== */

const USERS: RawUser[] = [
  {
    id: "user123",
    weeklyGoal: 15, // ✅ Goal au niveau racine
    userInfos: {
      firstName: "Sophie",
      lastName: "Martin",
      createdAt: "2024-09-01",
      age: 28,
      weight: 62,
      height: 165,
      gender: "Femme", // ✅ Ajout du genre
      profilePicture: "/images/sophie.jpg",
      weeklyGoal: 2, // ✅ Goal aussi dans userInfos
    },
    runningData: [
      { date: "2025-02-10", distance: 3.5, duration: 22, heartRate: { min: 105, max: 155, average: 130 }, caloriesBurned: 220 },
      { date: "2026-01-20", distance: 5.2, duration: 32, heartRate: { min: 110, max: 165, average: 140 }, caloriesBurned: 320 },
      { date: "2026-01-21", distance: 4.8, duration: 28, heartRate: { min: 108, max: 160, average: 135 }, caloriesBurned: 290 },
      { date: "2026-01-22", distance: 6.3, duration: 38, heartRate: { min: 112, max: 168, average: 142 }, caloriesBurned: 380 },
      { date: "2026-01-23", distance: 5.5, duration: 33, heartRate: { min: 110, max: 165, average: 138 }, caloriesBurned: 330 },
      { date: "2029-12-15", distance: 8.1, duration: 48, heartRate: { min: 115, max: 175, average: 145 }, caloriesBurned: 520 },
    ],
  },
];

// 👉 Utilisateur par défaut
export const DEFAULT_USER_ID = "user123";

/* =====================
   Helpers
===================== */

function pickUser(userId = DEFAULT_USER_ID): RawUser {
  const u = USERS.find((x) => x.id === userId);
  if (!u) {
    console.error(`❌ apiMock: user "${userId}" introuvable`);
    throw new Error(`apiMock: user "${userId}" introuvable`);
  }
  return u;
}

function extractWeeklyGoal(raw: RawUser): number {
  const candidates = [
  raw.userInfos?.weeklyGoal,
  raw.userInfos?.goal,
  raw.weeklyGoal,
  raw.goal,
];
  
  console.log('🔍 extractWeeklyGoal candidates:', candidates);
  
  const found = candidates.find((v) => typeof v === "number" && v > 0);
  const result = typeof found === "number" ? found : 0;
  
  console.log('✅ extractWeeklyGoal result:', result);
  return result;
}

function sum(numbers: number[]) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function buildUserInfo(raw: RawUser): UserInfo {
  const totalDistance = round1(sum(raw.runningData.map((a) => a.distance)));
  const totalSessions = raw.runningData.length;
  const totalDuration = sum(raw.runningData.map((a) => a.duration));
  const weeklyGoal = extractWeeklyGoal(raw);

  const userInfo: UserInfo = {
    profile: {
      firstName: raw.userInfos.firstName,
      lastName: raw.userInfos.lastName,
      createdAt: raw.userInfos.createdAt,
      age: raw.userInfos.age,
      weight: raw.userInfos.weight,
      height: raw.userInfos.height,
      gender: raw.userInfos.gender, // ✅ Ajout du genre
      profilePicture: raw.userInfos.profilePicture,
    },
    statistics: {
      totalDistance: totalDistance, // ✅ Retourner comme number
      totalSessions,
      totalDuration,
      weeklyGoal, // ✅ Maintenant correctement typé comme number
    },
  };

  console.log('🏗️ Built UserInfo:', userInfo);
  console.log('🎯 weeklyGoal in statistics:', userInfo.statistics.weeklyGoal);
  console.log('👤 gender in profile:', userInfo.profile.gender); // ✅ Debug du genre
  
  return userInfo;
}

/* =====================
   MOCK API (functions)
===================== */

export function mockGetUserInfo(userId = DEFAULT_USER_ID): UserInfo {
  console.log('📞 mockGetUserInfo called for userId:', userId);
  const result = buildUserInfo(pickUser(userId));
  console.log('📦 mockGetUserInfo returning:', result);
  return result;
}

export function mockGetUserActivity(userId = DEFAULT_USER_ID): UserActivity[] {
  const activities = pickUser(userId).runningData;
  console.log('📞 mockGetUserActivity called, returning:', activities.length, 'activities');
  return activities;
}