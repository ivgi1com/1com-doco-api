/**
 * Syntax colours for the dark code surface (used in both themes).
 * Contrast on code-bg (light theme #14151e / dark theme #06070c):
 * all tokens >= 6.8:1 (computed in Phase 2). Hues avoid the reserved
 * Live (40-55) and Demo (195) mode hues.
 *
 * Shared between `highlight.ts` (server-only, shiki theme) and any
 * client-side renderer that needs the same palette (e.g. the JSON
 * tree viewer), which cannot import `highlight.ts` directly.
 */
export const syntax = {
  ink: "#e6e7ed",
  muted: "#a1a4b2",
  punct: "#9b9ea8",
  key: "#a1bdf9",
  string: "#a8dc8c",
  number: "#eea2d4",
  constant: "#c7aff5",
  keyword: "#bda8fc",
  func: "#8fc8f7",
};
