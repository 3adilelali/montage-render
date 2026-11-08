import { spring } from "remotion";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { LEAD, SPRINGS } from "../../brand/motion";
import { measureText } from "./measure";
import type { Assets, Item, Leaf, ShotItem, Size } from "./types";
import { bannerSize, bar3dSize, checklistSize, DISC_SIZE, multiplySize } from "./skoolSize";

// Auto layout: a scene is a tree of rows/stacks. Every element's share of the layout grows with a smooth
// spring when it appears (and shrinks when it leaves), so earlier elements glide aside — like the references,
// where an icon rises to make room for its caption and a list number slides right when its title arrives.

export const TEXT_SIZE: Record<Size, number> = { s: 54, m: 80, l: 112, xl: 150 };
export const VISUAL_SIZE: Record<Size, number> = { s: 170, m: 270, l: 420, xl: 620 };
export const NUMBER_SIZE: Record<Size, number> = { s: 150, m: 220, l: 300, xl: 400 };
export const COUNTER_SIZE: Record<Size, number> = { s: 90, m: 130, l: 190, xl: 260 };
export const CARD_FONT: Record<Size, number> = { s: 44, m: 58, l: 74, xl: 92 };
export const BADGE_SIZE: Record<Size, number> = { s: 200, m: 290, l: 400, xl: 560 };
export const HOST_SIZE: Record<Size, number> = { s: 240, m: 360, l: 500, xl: 640 };
export const LINE_HEIGHT = 1.4;

export type Ctx = {
  frame: number;
  fps: number;
  wordAt: (i: number) => number;
  sceneStart: number;
  sceneEnd: number;
  assets: Assets;
  calmFrom?: number; // frame where teaching mode starts (plan.calm)
  calmTo?: number; // frame where it ends (plan.calm.to: energetic CTA again, Adil 2026-11-08)
  calm?: boolean; // this scene is in teaching mode
};

// First frame of an element: LEAD before its word, never before the scene starts.
export const startOf = (ctx: Ctx, word: number) => Math.max(ctx.sceneStart, ctx.wordAt(word) - LEAD);
export const outOf = (ctx: Ctx, out: number | undefined) => (out === undefined ? Infinity : ctx.wordAt(out) - LEAD);

const layoutWeight = (ctx: Ctx, word: number, out?: number) => {
  const s = startOf(ctx, word);
  const inP = spring({ frame: ctx.frame - s, fps: ctx.fps, config: SPRINGS.layout });
  const o = outOf(ctx, out);
  const outP = o === Infinity ? 0 : spring({ frame: ctx.frame - o, fps: ctx.fps, config: SPRINGS.layout });
  return Math.max(0, Math.min(1, inP - outP));
};

const firstWord = (item: Item): number => {
  if (item.type === "group") return Math.min(...item.items.map(firstWord));
  return item.word;
};

// Frame size: keep the media's own aspect so % coordinates match the picture exactly.
export const shotSize = (item: ShotItem, aspect: number) => {
  const maxW = item.w ?? 1560;
  const maxH = item.h ?? 820;
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return { w: Math.round(w), h: Math.round(h) };
};

export const assetFor = (assets: Assets, file?: string) => {
  if (!file) return null;
  return assets.files[file] ?? assets.files[file.replace(/\.[^.]+$/, "")] ?? null;
};

export const leafSize = (item: Leaf, assets: Assets): { w: number; h: number } => {
  const size = item.size ?? "m";
  switch (item.type) {
    case "text": {
      const fs = TEXT_SIZE[size];
      const lines = item.text.split("\n");
      const w = Math.max(...lines.map((l) => measureText(l, fs, FONT_FAMILY, 900)));
      return { w: w + fs * 0.3, h: lines.length * fs * LINE_HEIGHT };
    }
    case "visual": {
      const a = assetFor(assets, item.file);
      const look = item.look ?? (a ? "card" : "sticker");
      if (look === "full") return { w: 1920, h: 1080 };
      const big = look === "card" || look === "screen" || look === "phone";
      const h = VISUAL_SIZE[item.size ?? (big ? "l" : "m")];
      const aspect = look === "circle" || !a ? 1 : a.w / a.h;
      // Phone: the screenshot sits inside a bezel (≈ 4% each side), at most 9:19.5 tall.
      if (look === "phone") {
        const ph = item.size ? VISUAL_SIZE[item.size] * 1.9 : 860;
        const inner = Math.max(aspect, 9 / 19.5);
        return { w: ph * inner + 36, h: ph };
      }
      // Wide assets (waveforms, banners) are capped to the safe width of the frame.
      const MAX_W = 1640;
      return h * aspect > MAX_W ? { w: MAX_W, h: MAX_W / aspect } : { w: h * aspect, h };
    }
    case "number": {
      const fs = NUMBER_SIZE[size];
      return { w: measureText(item.text, fs, NUMBER_FONT_FAMILY, 800) + fs * 0.25, h: fs * 1.05 };
    }
    case "counter": {
      const fs = COUNTER_SIZE[size];
      const text = `${item.prefix ?? ""}${item.to.toLocaleString("en-US")}${item.suffix ?? ""}`;
      return { w: measureText(text, fs, NUMBER_FONT_FAMILY, 800) + fs * 0.4, h: fs * 1.1 };
    }
    case "steps": {
      const chips = item.style === "chips";
      const slot = chips ? 190 : 300;
      return { w: item.labels.length * slot, h: chips ? 110 : 160 };
    }
    case "card": {
      const fs = CARD_FONT[size];
      const lines = item.text.split("\n");
      const w = Math.max(...lines.map((l) => measureText(l, fs, FONT_FAMILY, 800)));
      return { w: w + fs * 2.4, h: lines.length * fs * 1.6 + fs * 1.4 };
    }
    case "badge": {
      const d = BADGE_SIZE[size];
      return { w: d, h: d };
    }
    case "ribbon":
      return { w: 560, h: 110 };
    case "ring":
      return { w: 300, h: 300 };
    case "search":
      return { w: 900, h: 120 };
    case "scribble":
      return { w: 680, h: 110 };
    case "subscribe":
      return { w: 560, h: 130 };
    case "mc-search":
      return { w: 980, h: 310 };
    case "mc-flow": {
      const n = item.nodes.length;
      return { w: Math.max(200, (n - 1) * 430 + 200), h: 300 };
    }
    case "mc-chart":
      return { w: 980, h: 520 };
    case "mc-week":
      return { w: 1400, h: 500 };
    case "mc-form":
      return { w: 980, h: (item.title ? 100 : 32) + item.fields.length * 112 + 24 };
    case "mc-typing":
      return { w: item.w ?? 1100, h: item.h ?? 330 };
    case "mc-grid": {
      const cols = item.cols ?? 6;
      const rows = Math.ceil(item.logos.length / cols);
      return { w: cols * 142, h: 150 + (item.label ? 70 : 0) + 34 + rows * 142 };
    }
    case "mc-code":
      return { w: 1150, h: 54 + 44 + item.lines.length * (item.fontSize ?? 30) * 1.55 };
    case "mc-post":
      return { w: 760 * 1.35, h: (item.file ? 560 : 330) * 1.35 };
    case "mc-levels":
      return { w: 1500, h: 600 };
    case "mc-doc":
      return { w: item.w ?? 1150, h: item.h ?? 760 };
    case "mc-rhythm":
      return { w: 1500, h: 340 };
    case "mc-frames":
      return { w: Math.min(1700, item.frames.length * 270 + 40), h: 288 };
    case "mc-chat":
      return { w: 1600, h: 820 };
    case "mc-hub":
    case "mc-devices":
    case "mc-project":
    case "mc-prompt":
    case "mc-skill":
    case "mc-models":
      return { w: 1600, h: 860 };
    case "title-3d":
      return { w: 1600, h: item.sub ? 470 : 330 };
    case "mc-price":
      return { w: 1400, h: 560 };
    case "mc-page":
      return { w: item.w ?? 1300, h: item.h ?? 780 };
    case "mc-email":
      return { w: 1200, h: 800 };
    case "mc-member":
      return { w: 1560, h: 860 };
    case "mc-community":
      return { w: 1100, h: 820 };
    case "shot": {
      const a = assetFor(assets, item.file);
      return shotSize(item, a ? a.w / a.h : 16 / 9);
    }
    case "meter":
      return { w: 1300, h: 250 };
    case "bars":
      return { w: item.bars.length * 330, h: 680 };
    case "carousel":
      return { w: 560, h: 720 };
    case "bar3d":
      return bar3dSize(item);
    case "banner":
      return bannerSize(item);
    case "disc": {
      const d = DISC_SIZE[size];
      return { w: d, h: d };
    }
    case "xstamp":
      return { w: item.w ?? 380, h: item.w ?? 380 };
    case "arrow":
      return { w: item.w ?? 300, h: (item.w ?? 300) * 0.66 };
    case "multiply":
      return multiplySize(item);
    case "checklist":
      return checklistSize(item);
    case "fly3d":
      return { w: 1920, h: 1080 };
    case "mc-claude":
      return { w: 1500, h: 860 };
    case "mc-folder":
      return { w: 1300, h: 520 };
    case "mc-player":
      return { w: item.w ?? 1280, h: ((item.w ?? 1280) * 9) / 16 + 64 };
    case "host": {
      const d = HOST_SIZE[size];
      return { w: d * 1.35, h: d * 1.35 };
    }
  }
};

export type Placed = { item: Leaf; cx: number; cy: number; w: number; h: number; weight: number };
export type Branch = { from: { x: number; y: number }; to: { x: number; y: number }; at: number; weight: number };

// Groups report sizes that already include their children's weights (`nested`), leaves report full sizes.
type Measured = { w: number; h: number; weight: number; nested?: boolean };
const spanW = (m: Measured) => (m.nested ? m.w : m.w * m.weight);
const spanH = (m: Measured) => (m.nested ? m.h : m.h * m.weight);

const GAP = { row: 110, stack: 46, treeY: 150, treeX: 160 };

const measure = (item: Item, ctx: Ctx): Measured => {
  if (item.type === "group" || item.type === "tree") {
    const kids = item.items.map((k) => measure(k, ctx));
    const weight = Math.max(0, ...kids.map((k) => k.weight));
    if (item.type === "tree") {
      const [root, ...leaves] = kids;
      const lw = leaves.reduce((s, k) => s + spanW(k), 0) + GAP.treeX * Math.max(0, leaves.length - 1);
      const lh = Math.max(0, ...leaves.map((k) => k.h));
      return { w: Math.max(spanW(root), lw), h: spanH(root) + GAP.treeY * root.weight + lh, weight, nested: true };
    }
    const gap = item.gap ?? GAP[item.dir];
    // A gap sits before every element except the first, scaled by that element's weight.
    const gaps = kids.reduce((s, k, i) => s + (i === 0 ? 0 : gap * k.weight), 0);
    if (item.dir === "row") {
      return { w: kids.reduce((s, k) => s + spanW(k), 0) + gaps, h: Math.max(0, ...kids.map((k) => k.h)), weight, nested: true };
    }
    return { w: Math.max(0, ...kids.map((k) => k.w)), h: kids.reduce((s, k) => s + spanH(k), 0) + gaps, weight, nested: true };
  }
  const { w, h } = leafSize(item, ctx.assets);
  // Floating items sit over the group's centre and take no space.
  if (item.float) return { w: 0, h: 0, weight: 0, nested: true };
  return { w, h, weight: layoutWeight(ctx, item.word, item.out) };
};

// Places every leaf; returns absolute centres (px) on the 1920×1080 canvas.
export const place = (item: Item, ctx: Ctx, cx: number, cy: number, out: Placed[] = [], branches: Branch[] = []) => {
  if (item.type !== "group" && item.type !== "tree") {
    if (item.float) {
      const { w, h } = leafSize(item, ctx.assets);
      out.push({ item, cx: cx + (item.dx ?? 0), cy: cy + (item.dy ?? 0), w, h, weight: layoutWeight(ctx, item.word, item.out) });
      return { out, branches };
    }
    const m = measure(item, ctx);
    out.push({ item, cx: cx + (item.dx ?? 0), cy: cy + (item.dy ?? 0), w: m.w, h: m.h, weight: m.weight });
    return { out, branches };
  }
  const kids = item.items.map((k) => measure(k, ctx));
  const total = measure(item, ctx);

  if (item.type === "tree") {
    const [root, ...leaves] = item.items;
    const rootTop = cy - total.h / 2;
    const rootCy = rootTop + spanH(kids[0]) / 2;
    place(root, ctx, cx, rootCy, out, branches);
    const lw = kids.slice(1).reduce((s, k) => s + spanW(k), 0) + GAP.treeX * Math.max(0, leaves.length - 1);
    const leafTop = rootTop + spanH(kids[0]) + GAP.treeY * kids[0].weight;
    const lh = Math.max(0, ...kids.slice(1).map((k) => k.h));
    // RTL: first leaf on the right.
    let x = cx + lw / 2;
    leaves.forEach((leaf, i) => {
      const k = kids[i + 1];
      const lcx = x - spanW(k) / 2;
      place(leaf, ctx, lcx, leafTop + lh / 2, out, branches);
      branches.push({
        from: { x: cx, y: rootTop + spanH(kids[0]) + 8 },
        to: { x: lcx, y: leafTop - 14 },
        at: startOf(ctx, Math.min(item.word, firstWord(leaf))),
        weight: kids[0].weight,
      });
      x -= spanW(k) + GAP.treeX;
    });
    return { out, branches };
  }

  const gap = item.gap ?? GAP[item.dir];
  // Floating children are placed over this group's centre.
  item.items.forEach((k) => {
    if (k.type !== "group" && k.type !== "tree" && k.float) place(k, ctx, cx, cy, out, branches);
  });
  if (item.dir === "row") {
    // RTL: first item on the right.
    let x = cx + total.w / 2;
    item.items.forEach((k, i) => {
      const m = kids[i];
      if (k.type !== "group" && k.type !== "tree" && k.float) return;
      if (i > 0) x -= gap * m.weight;
      const span = spanW(m);
      place(k, ctx, x - span / 2, cy, out, branches);
      x -= span;
    });
  } else {
    let y = cy - total.h / 2;
    item.items.forEach((k, i) => {
      const m = kids[i];
      if (k.type !== "group" && k.type !== "tree" && k.float) return;
      if (i > 0) y += gap * m.weight;
      const span = spanH(m);
      place(k, ctx, cx, y + span / 2, out, branches);
      y += span;
    });
  }
  return { out, branches };
};
