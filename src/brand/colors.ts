// Explainer palette: layout/motion colours from the references (المراجع/), accents from the student's brand
// (orange → magenta → purple, deep purple #412562 — الأسلوب/أسلوب-المونتاج.md §7).
// Keep the keys — the scene and items use them.
export const colors = {
  // Background: near-black top fading to graphite at the bottom.
  bgTop: "#030205",
  bgMid: "#0B0910",
  bgBottom: "#1F1A28",
  // Brand: a faint purple aura in the dark background (never a purple background).
  brandDeep: "#412562",
  brandPurple: "#A04ED7",
  brandMagenta: "#B2378A",
  brandOrange: "#FB9F2A",
  brandGradient: "linear-gradient(100deg, #F7953F 0%, #CD5968 35%, #B23788 62%, #A04ED7 100%)",
  // Text: white with a dark drop shadow and a faint white bloom.
  text: "#FFFFFF",
  textShadow: "rgba(0,0,0,0.85)",
  textGlow: "rgba(255,255,255,0.35)",
  // Accents — brand only (2026-10-09: no red, no green). The keys keep their old role names so plans don't break:
  //   "green" = highlight / done / correct  → brand orange
  //   "red"   = wrong / warning / problem    → brand magenta
  green: "#FFA733", // brand orange, a touch brighter for glow on dark
  greenDeep: "#C9701A",
  red: "#E04BA8", // brand magenta, brightened for legibility on dark
  redDeep: "#8A2468",
  redGlow: "224,75,168",
  brandGlow: "178,55,138", // magenta glow around badges / ribbon
  yellow: "#FB9F2A", // badges (pentagon / octagon / diamond) — brand orange
  lime: "#FB9F2A", // ribbon caps — brand orange
  blueFrom: "#6A2FA8", // info (tone "blue") → brand purple
  blueTo: "#A04ED7",
  ribbon: "#412562", // ribbon bar — brand deep purple
  // Lines: light trail, dotted tree branches, ring outline.
  line: "#FFFFFF",
  // Host spectrum bars around the logo.
  spectrum: "#A04ED7",
  // Search bar.
  searchBg: "#FFFFFF",
  searchInk: "#111111",
  searchGlow: "#A04ED7",
} as const;

export type ToneName = "white" | "green" | "red" | "yellow" | "blue" | "orange" | "magenta" | "purple";

export const toneColor: Record<ToneName, string> = {
  white: colors.text,
  green: colors.green,
  red: colors.red,
  yellow: colors.yellow,
  blue: colors.blueTo,
  orange: colors.green,
  magenta: colors.red,
  purple: colors.brandPurple,
};
