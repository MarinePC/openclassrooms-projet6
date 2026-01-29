export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  profile: "/profile",
} as const;

export const PROTECTED_ROUTES = [ROUTES.dashboard, ROUTES.profile] as const;
