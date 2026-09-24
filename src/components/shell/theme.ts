export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "portal-theme";

/**
 * Runs synchronously in <head> before first paint so the page never flashes
 * the wrong theme (MASTER.md "Dark/light strategy").
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;var p=null;try{p=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var m=window.matchMedia("(prefers-color-scheme: dark)").matches;d.dataset.theme=p==="dark"||((p===null||p==="system")&&m)?"dark":"light";})();`;

export function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Storage unavailable (private mode, blocked site data).
  }
  return "system";
}

export function writeThemePreference(pref: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Preference simply won't persist.
  }
  document.documentElement.dataset.theme = resolveTheme(pref);
}
