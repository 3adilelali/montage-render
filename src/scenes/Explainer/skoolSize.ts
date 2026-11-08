// Layout sizes of the Skool.tsx elements (kept apart so layout.ts doesn't import the components — no import cycle).
import { FONT_FAMILY } from "../../brand/fonts";
import { measureText } from "./measure";
import type { Banner, Bar3D, Checklist, Multiply } from "./types";

export const BAR_FS = 96;
export const BANNER_FS = 62;
export const DISC_SIZE = { s: 150, m: 230, l: 330, xl: 460 } as const;

export const bar3dSize = (it: Bar3D) => ({ w: Math.max(620, measureText(it.text, it.fs ?? BAR_FS, FONT_FAMILY, 900) + 220), h: (it.fs ?? BAR_FS) * 1.9 });
export const bannerSize = (it: Banner) => {
  const fs = it.fs ?? BANNER_FS;
  const lines = it.text.split("\n");
  return { w: Math.max(...lines.map((l) => measureText(l, fs, FONT_FAMILY, 900))) + fs * 1.3, h: lines.length * fs * 1.32 + fs * 0.7 };
};
export const multiplySize = (it: Multiply) => {
  const cols = it.cols ?? 6;
  const cell = it.cell ?? 150;
  return { w: cols * cell, h: Math.ceil(it.count / cols) * cell };
};
export const checklistSize = (it: Checklist) => ({ w: it.w ?? 1300, h: it.items.length * ((it.row ?? 130) + 20) });
