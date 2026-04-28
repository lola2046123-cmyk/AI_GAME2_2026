const SESSION_KEY = "ai_game_2026_admin_session";

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function setAdminAuthenticated(ok: boolean) {
  if (ok) sessionStorage.setItem(SESSION_KEY, "1");
  else sessionStorage.removeItem(SESSION_KEY);
}

export function getAdminPin(): string {
  return import.meta.env.VITE_ADMIN_PIN ?? "2026";
}
