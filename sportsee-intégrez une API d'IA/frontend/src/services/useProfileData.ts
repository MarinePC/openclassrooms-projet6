// src/services/useProfileData.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getUserInfo,
  getUserActivity,
  toProfileUserUI,
  computeProfileStats,
  type DataSource,
  type ProfileUserUI,
  type ProfileStats,
  type ActivityDatum,
} from "@/services/userData";

type UseProfileDataResult = {
  user: ProfileUserUI | null;
  activity: ActivityDatum[];
  stats: ProfileStats | null;
  loading: boolean;
  error: string | null;
};

export function useProfileData(source: DataSource, userId: string): UseProfileDataResult {
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [activity, setActivity] = useState<ActivityDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const [u, a] = await Promise.all([
          getUserInfo(source, userId),
          getUserActivity(source, userId),
        ]);

        if (cancelled) return;
        setUserInfo(u);
        setActivity(a);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erreur lors du chargement du profil.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [source, userId]);

  const user = useMemo(() => {
    if (!userInfo) return null;
    return toProfileUserUI(userInfo, activity);
  }, [userInfo, activity]);

  const stats = useMemo(() => {
    if (!user) return null;
    return computeProfileStats(activity, user.memberSinceISO);
  }, [activity, user]);

  return { user, activity, stats, loading, error };
}
