// src/services/date.ts

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}


export function normalizeISODateKey(input: string | null | undefined): string | null {
  const s = (input ?? "").trim();
  if (!s) return null;
  const key = s.includes("T") ? s.slice(0, 10) : s;
  return key.length >= 10 ? key.slice(0, 10) : null;
}


export function parseISODate(dateStr: string): Date {
  const key = normalizeISODateKey(dateStr);
  if (!key) return new Date(0);

  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return new Date(0);
  return d;
}

export function isBetweenInclusiveISO(dateStr: string, start: Date, end: Date): boolean {
  const t = parseISODate(dateStr).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function formatMinutesToHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m} min`;
}

export function formatDistanceKm(distanceValue: string | number): string {
  const n = typeof distanceValue === "number" ? distanceValue : Number(distanceValue);
  if (Number.isNaN(n)) return "—";
  return `${Math.round(n)} km`;
}

export function formatDayMonth(dateISO: string): string {
  const d = parseISODate(dateISO);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function isoFromDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ✅ Semaine ISO (lun → dim)
export function startOfISOWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Dim ... 6=Sam
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  x.setHours(0, 0, 0, 0);
  return x;
}
