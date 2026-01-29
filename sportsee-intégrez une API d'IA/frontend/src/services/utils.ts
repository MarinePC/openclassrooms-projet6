// src/services/utils.ts

/**
 * Additionne un tableau de nombres
 */
export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

/**
 * Arrondit à 1 décimale
 * Exemple: round1(12.456) => 12.5
 */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Retourne une date à minuit (début de journée)
 */
export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Retourne une date à 23:59:59 (fin de journée)
 */
export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Formate une date en DD.MM
 * Exemple: formatDDMM(new Date('2024-03-15')) => "15.03"
 */
export function formatDDMM(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

/**
 * Formate une date courte localisée
 * Exemple: "15 mars"
 */
export function formatDayMonthShort(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/**
 * Formate une plage de dates
 * Exemple: "15 mars - 21 mars"
 */
export function formatTopRange(start: Date, end: Date): string {
  return `${formatDayMonthShort(start)} - ${formatDayMonthShort(end)}`;
}

/**
 * Trouve la date ISO maximale dans un tableau
 */
export function maxISO(dates: (string | null | undefined)[]): string | null {
  const clean = dates
    .map((d) => (d ?? "").trim())
    .filter((x) => x.length >= 10);
  
  if (!clean.length) return null;
  return clean.reduce((m, x) => (x > m ? x : m), clean[0]);
}

/**
 * Trouve la date ISO minimale dans un tableau
 */
export function minISO(dates: (string | null | undefined)[]): string | null {
  const clean = dates
    .map((d) => (d ?? "").trim())
    .filter((x) => x.length >= 10);
  
  if (!clean.length) return null;
  return clean.reduce((m, x) => (x < m ? x : m), clean[0]);
}