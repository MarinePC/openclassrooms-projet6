// src/services/authToken.ts
const TOKEN_COOKIE = "sportsee_token";

type CookieOptions = {
  maxAgeDays?: number;
};

/* token dans le cookie */
export function setAuthToken(token: string, options: CookieOptions = {}) {
  const maxAgeDays = options.maxAgeDays ?? 1;
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;

  document.cookie = [
    `${TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    `Path=/`,
    `Max-Age=${maxAgeSeconds}`,
    `SameSite=Lax`,
  ].join("; ");
}

const COOKIE_NAME = "sportsee_token";

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] ?? "");
}


/* logout */
export function clearAuthToken() {
  document.cookie = [
    `${TOKEN_COOKIE}=`,
    `Path=/`,
    `Max-Age=0`,
    `SameSite=Lax`,
  ].join("; ");
}
