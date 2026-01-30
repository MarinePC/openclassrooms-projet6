// src/services/utils.ts


export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}


export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}


export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}


export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/* format de la date */
export function formatDDMM(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

export function formatDayMonthShort(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/* section de date */
export function formatTopRange(start: Date, end: Date): string {
  return `${formatDayMonthShort(start)} - ${formatDayMonthShort(end)}`;
}

export function maxISO(dates: (string | null | undefined)[]): string | null {
  const clean = dates
    .map((d) => (d ?? "").trim())
    .filter((x) => x.length >= 10);
  
  if (!clean.length) return null;
  return clean.reduce((m, x) => (x > m ? x : m), clean[0]);
}

export function minISO(dates: (string | null | undefined)[]): string | null {
  const clean = dates
    .map((d) => (d ?? "").trim())
    .filter((x) => x.length >= 10);
  
  if (!clean.length) return null;
  return clean.reduce((m, x) => (x < m ? x : m), clean[0]);
}
