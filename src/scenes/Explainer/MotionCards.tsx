// Explainer motion-graphics cards (2026-10-12, «طبقة الاحتراف»): light UI cards that animate the idea itself on our dark
// background, timed to spoken words. Ported from the reels system's Motion.tsx and re-laid for 16:9 (wider cards, card beside text).
//   mc-search  — a query types in, then a result (or a magenta "No results" that shakes)
//   mc-flow    — app → app → app joined by a dashed line with an orange pulse travelling along it
//   mc-chart   — bars grow one by one; the best turns orange and gets a star
//   mc-week    — seven day columns fill with a content-type tag
//   mc-form    — settings fields fill one by one, each value types in and gets a ✓
//   mc-typing  — a prompt types letter by letter; optional red-magenta X strikes it out
//   mc-grid    — a counter ticks up while a grid of app logos pops in one after another
// Brand-only colours: "red" = magenta, "green"/success = orange (no real red or green). Sizes live in layout.ts (leafSize).
import { Easing, Img, interpolate, spring, staticFile } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { clamp } from "./anim";
import { assetFor, type Ctx, startOf } from "./layout";
import type { McChart, McFlow, McForm, McGrid, McSearch, McTyping, McWeek } from "./types";
import { iconSrc, is3d } from "./VisualLeaf";

const fill = { position: "absolute", inset: 0 } as const;
const C = {
  card: "#FBF7FF",
  ink: "#1d0b33",
  soft: "#8a7aa6",
  line: "#e9def6",
  purple: colors.brandPurple,
  orange: colors.brandOrange,
  bad: colors.red, // brand magenta
};
const cardStyle: React.CSSProperties = {
  ...fill,
  background: C.card,
  borderRadius: 34,
  boxShadow: `0 30px 70px rgba(10,0,25,0.7), 0 0 46px rgba(${colors.brandGlow},0.35)`,
  overflow: "hidden",
};
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const latin = "Inter, Arial, sans-serif";
const isLatin = (s: string) => !/[؀-ۿ]/.test(s);
const fontFor = (s: string) => (isLatin(s) ? latin : FONT_FAMILY);
const rel = (ctx: Ctx, base: number, w: number | undefined, fallback: number) => (w === undefined ? fallback : startOf(ctx, w) - base);
const srcOf = (ctx: Ctx, file?: string, icon?: string) => {
  const a = assetFor(ctx.assets, file);
  if (a) return staticFile(a.src);
  return icon && ctx.assets.icons.includes(icon) ? iconSrc(icon) : null;
};

// ---------- Search: types the query, then the result. No result → magenta "No results" + shake.
export const SearchMC: React.FC<{ item: McSearch; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const len = item.query.length;
  const typeStart = 8;
  const typeEnd = item.end !== undefined ? Math.max(typeStart + 6, startOf(ctx, item.end) - base) : typeStart + len * 2;
  const n = Math.floor(interpolate(local, [typeStart, typeEnd], [0, len], clamp));
  const done = rel(ctx, base, item.resultAt, typeEnd + 6);
  const res = interpolate(local, [done, done + 8], [0, 1], ease);
  const none = !item.result;
  const shake = none ? Math.sin((local - done) * 1.6) * 12 * interpolate(local, [done, done + 16], [1, 0], clamp) : 0;
  const caret = local < done && Math.floor(local / 8) % 2 === 0;
  const label = item.label ?? "Search";
  return (
    <div style={cardStyle}>
      <div style={{ position: "absolute", left: 46, right: 46, top: 26, fontFamily: fontFor(label), fontSize: 38, fontWeight: 800, color: C.ink, direction: isLatin(label) ? "ltr" : "rtl" }}>{label}</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 92, height: 92, borderRadius: 46, background: "#fff", border: `3px solid ${C.purple}`, display: "flex", alignItems: "center", gap: 18, padding: "0 30px", boxShadow: "0 8px 22px rgba(160,78,215,0.22)", direction: isLatin(item.query) ? "ltr" : "rtl" }}>
        <svg width="44" height="44" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" stroke={C.soft} strokeWidth="2.4" fill="none" />
          <path d="M16.5 16.5 L21 21" stroke={C.soft} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: fontFor(item.query), fontSize: 48, color: C.ink, whiteSpace: "nowrap" }}>
          {item.query.slice(0, n)}
          {caret ? <span style={{ color: C.purple }}>|</span> : null}
        </span>
      </div>
      <div style={{ position: "absolute", left: 46, right: 46, top: 210, height: 76, display: "flex", alignItems: "center", gap: 18, opacity: res, transform: `translate(${shake}px, ${(1 - res) * 16}px)`, fontFamily: fontFor(item.result ?? "No results"), fontSize: 42, fontWeight: 800, color: none ? C.bad : C.ink, direction: isLatin(item.result ?? "No") ? "ltr" : "rtl" }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: none ? C.bad : C.orange, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontFamily: latin }}>{none ? "✕" : "✓"}</div>
        <span>{none ? "No results" : item.result}</span>
      </div>
    </div>
  );
};

// ---------- Flow: nodes appear right→left (RTL reading order); a dashed line draws to each, then an orange pulse runs along it.
export const FlowMC: React.FC<{ item: McFlow; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const N = item.nodes.length;
  const box = 200;
  const W = Math.max(box, (N - 1) * 430 + box);
  const y = box / 2;
  const step = N > 1 ? (W - box) / (N - 1) : 0;
  const xs = item.nodes.map((_, i) => W - box / 2 - i * step);
  const at = item.nodes.map((nd, i) => rel(ctx, base, nd.word, i * 10));
  return (
    <div style={{ ...fill }}>
      <svg width={W} height={box + 100} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {xs.slice(0, -1).map((x, i) => {
          const a = at[i + 1];
          const p = interpolate(local, [a, a + 10], [0, 1], ease);
          if (p <= 0) return null;
          const x1 = x - box / 2 - 12;
          const xe = xs[i + 1] + box / 2 + 12;
          const xm = x1 + (xe - x1) * p;
          const t = local - a - 10;
          const dx = x1 + ((xe - x1) * (((t % 24) + 24) % 24)) / 24;
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={xm} y2={y} stroke="#fff" strokeWidth={6} strokeDasharray="16 12" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${C.purple})` }} />
              {t > 0 ? <circle cx={dx} cy={y} r={13} fill={C.orange} style={{ filter: `drop-shadow(0 0 14px ${C.orange})` }} /> : null}
            </g>
          );
        })}
      </svg>
      {item.nodes.map((nd, i) => {
        const k = interpolate(local, [at[i], at[i] + 9], [0, 1], ease);
        const src = srcOf(ctx, nd.file, nd.icon);
        return (
          <div key={i} style={{ position: "absolute", left: xs[i] - box / 2, top: 0, width: box, opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${0.7 + 0.3 * k})` }}>
            <div style={{ width: box, height: box, borderRadius: 48, background: "#fff", boxShadow: `0 18px 40px rgba(10,0,25,0.6), 0 0 34px rgba(${colors.brandGlow},0.45)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {src ? <Img src={src} style={{ width: box * 0.64, height: box * 0.64, objectFit: "contain", borderRadius: 24 }} /> : null}
            </div>
            <div style={{ marginTop: 16, textAlign: "center", fontFamily: fontFor(nd.label), fontWeight: 900, fontSize: 42, color: "#fff", textShadow: "0 4px 10px rgba(0,0,0,0.85)", whiteSpace: "nowrap" }}>{nd.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Chart: bars grow one after another; the best one turns orange with a star.
export const ChartMC: React.FC<{ item: McChart; local: number }> = ({ item, local }) => {
  const max = Math.max(...item.values, 1);
  const N = item.values.length;
  const best = item.best ?? item.values.indexOf(max);
  const chartH = 330;
  const allDone = N * 4 + 16;
  const star = interpolate(local, [allDone, allDone + 8], [0, 1], ease);
  return (
    <div style={cardStyle}>
      {item.title ? <div style={{ position: "absolute", right: 46, left: 46, top: 26, fontFamily: FONT_FAMILY, fontSize: 42, fontWeight: 900, color: C.ink, direction: "rtl" }}>{item.title}</div> : null}
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 76, height: chartH, display: "flex", flexDirection: "row-reverse", alignItems: "flex-end", justifyContent: "space-between", borderBottom: `3px solid ${C.line}` }}>
        {item.values.map((v, i) => {
          const g = interpolate(local, [i * 4 + 4, i * 4 + 16], [0, 1], ease);
          const isBest = i === best;
          const h = (v / max) * (chartH - 50) * g;
          const lit = isBest && star > 0.5;
          return (
            <div key={i} style={{ width: `${70 / N}%`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", position: "relative" }}>
              {isBest ? <div style={{ position: "absolute", bottom: h + 10, fontSize: 50, opacity: star, transform: `scale(${0.5 + 0.5 * star})` }}>⭐</div> : null}
              <div style={{ width: "100%", height: h, borderRadius: "14px 14px 4px 4px", background: lit ? `linear-gradient(180deg, ${C.orange}, #e8742a)` : `linear-gradient(180deg, #c99af0, ${C.purple})`, boxShadow: lit ? `0 0 24px ${C.orange}aa` : "none" }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 20, display: "flex", flexDirection: "row-reverse", justifyContent: "space-between", fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 700, color: C.soft }}>
        {(item.labels ?? item.values.map((_, i) => `${i + 1}`)).map((l, i) => (
          <div key={i} style={{ width: `${70 / N}%`, textAlign: "center", whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>
    </div>
  );
};

// ---------- Week: seven day columns (right→left) fill one by one with a content-type tag and outline lines.
const DAYS = ["اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"];
const TAGS = ["ريل", "كاروسيل", "ستوري", "ريل", "بوست", "ريل", "كاروسيل"];
const TAG_COLORS: Record<string, string> = { ريل: C.purple, كاروسيل: C.orange, ستوري: colors.brandMagenta, بوست: colors.brandDeep, لايف: C.bad, فيديو: C.purple };
export const WeekMC: React.FC<{ item: McWeek; local: number }> = ({ item, local }) => {
  const days = item.days ?? DAYS;
  const tags = item.tags ?? TAGS;
  return (
    <div style={cardStyle}>
      {item.title ? <div style={{ position: "absolute", right: 44, left: 44, top: 22, fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 900, color: C.ink, direction: "rtl" }}>{item.title}</div> : null}
      <div style={{ position: "absolute", left: 26, right: 26, top: item.title ? 92 : 28, bottom: 26, display: "flex", flexDirection: "row-reverse", gap: 14 }}>
        {days.map((d, i) => {
          const k = interpolate(local, [6 + i * 5, 14 + i * 5], [0, 1], ease);
          const tag = tags[i % tags.length];
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ textAlign: "center", fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 800, color: C.soft }}>{d}</div>
              <div style={{ flex: 1, borderRadius: 18, background: "#fff", border: `2px solid ${C.line}`, padding: 12, display: "flex", flexDirection: "column", gap: 12, opacity: 0.35 + 0.65 * k }}>
                <div style={{ alignSelf: "center", padding: "6px 14px", borderRadius: 12, background: TAG_COLORS[tag] ?? C.purple, color: "#fff", fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 900, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>{tag}</div>
                {[0.9, 0.7, 0.8, 0.5].map((w, j) => (
                  <div key={j} style={{ height: 11, borderRadius: 6, background: C.line, width: `${w * 100 * interpolate(local, [10 + i * 5 + j * 2, 18 + i * 5 + j * 2], [0, 1], ease)}%`, alignSelf: "flex-end" }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Form: each field's value types in (at its word, or one after another) and gets a ✓.
export const FormMC: React.FC<{ item: McForm; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const rtlTitle = item.title ? !isLatin(item.title) : false;
  return (
    <div style={cardStyle}>
      {item.title ? <div style={{ position: "absolute", left: 46, right: 46, top: 26, fontFamily: fontFor(item.title), fontSize: 40, fontWeight: 900, color: C.ink, direction: rtlTitle ? "rtl" : "ltr" }}>{item.title}</div> : null}
      <div style={{ position: "absolute", left: 38, right: 38, top: item.title ? 100 : 32, display: "flex", flexDirection: "column", gap: 16 }}>
        {item.fields.map((f, i) => {
          const at = rel(ctx, base, f.word, 6 + i * 12);
          const k = interpolate(local, [at, at + 6], [0, 1], ease);
          const n = Math.floor(interpolate(local, [at + 2, at + 2 + f.value.length * 1.5], [0, f.value.length], clamp));
          const done = interpolate(local, [at + 4 + f.value.length * 1.5, at + 10 + f.value.length * 1.5], [0, 1], ease);
          const rtl = !isLatin(f.label);
          return (
            <div key={i} style={{ height: 96, borderRadius: 22, background: "#fff", border: `3px solid ${k > 0.5 ? C.purple : C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", boxShadow: k > 0.5 ? "0 8px 22px rgba(160,78,215,0.18)" : "none", opacity: 0.4 + 0.6 * k, direction: rtl ? "rtl" : "ltr" }}>
              <span style={{ fontFamily: fontFor(f.label), fontSize: 34, fontWeight: 700, color: C.soft }}>{f.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: fontFor(f.value), fontSize: 40, fontWeight: 800, color: C.ink }}>{f.value.slice(0, n)}</span>
                <span style={{ width: 46, height: 46, borderRadius: 23, background: C.orange, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontFamily: latin, opacity: done, transform: `scale(${0.4 + 0.6 * done})` }}>✓</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Typing: a prompt types letter by letter (Arabic RTL by default); `cross` strikes it with a magenta X.
export const TypingMC: React.FC<{ item: McTyping; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const len = item.text.length;
  const typeEnd = item.end !== undefined ? Math.max(12, startOf(ctx, item.end) - base) : 6 + len * 0.9;
  const n = Math.floor(interpolate(local, [6, typeEnd], [0, len], clamp));
  const typing = n < len;
  const caret = typing || Math.floor(local / 9) % 2 === 0;
  const xAt = item.cross !== undefined ? startOf(ctx, item.cross) - base : null;
  const x = xAt === null ? 0 : interpolate(local, [xAt, xAt + 8], [0, 1], ease);
  const rtl = item.rtl ?? !isLatin(item.text);
  return (
    <div style={cardStyle}>
      {item.title ? (
        <div style={{ position: "absolute", left: 40, right: 40, top: 24, display: "flex", alignItems: "center", gap: 14, direction: "ltr" }}>
          <div style={{ width: 24, height: 24, borderRadius: 12, background: "#D97757" }} />
          <span style={{ fontFamily: fontFor(item.title), fontSize: 34, fontWeight: 800, color: C.ink }}>{item.title}</span>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 40, right: 40, top: item.title ? 92 : 36, bottom: 30, borderRadius: 22, background: "#fff", border: `3px solid ${C.line}`, padding: "18px 28px", fontFamily: rtl ? FONT_FAMILY : latin, fontSize: item.fontSize ?? 40, lineHeight: 1.5, color: C.ink, direction: rtl ? "rtl" : "ltr", textAlign: rtl ? "right" : "left", overflow: "hidden", whiteSpace: "pre-wrap" }}>
        {item.text.slice(0, n)}
        {caret ? <span style={{ color: C.purple, fontWeight: 300 }}>|</span> : null}
      </div>
      {x > 0 ? (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          <line x1="8" y1="15" x2={8 + 84 * x} y2={15 + 70 * x} stroke={C.bad} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="92" y1="15" x2={92 - 84 * x} y2={15 + 70 * x} stroke={C.bad} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ) : null}
    </div>
  );
};

// ---------- Grid: big counter ticks to its value while a grid of app logos pops in one after another.
export const GridMC: React.FC<{ item: McGrid; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const frames = item.frames ?? 24;
  const t = interpolate(local, [0, frames], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const value = Math.round((item.from ?? 0) + (item.to - (item.from ?? 0)) * t);
  const cols = item.cols ?? 6;
  const tile = 120;
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div style={{ fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 150, lineHeight: 1, color: C.orange, textShadow: `0 0 26px ${C.orange}88, 0 8px 14px rgba(0,0,0,0.8)`, direction: "ltr" }}>
        {item.prefix ?? ""}
        {value.toLocaleString("en-US")}
        {item.suffix ?? ""}
      </div>
      {item.label ? <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 48, color: "#fff", textShadow: "0 4px 10px rgba(0,0,0,0.85)", direction: "rtl", marginTop: -14 }}>{item.label}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${tile}px)`, gap: 22, direction: "rtl" }}>
        {item.logos.map((id, i) => {
          const k = spring({ frame: local - 6 - i * 3, fps: ctx.fps, config: SPRINGS.pop });
          const src = srcOf(ctx, undefined, id);
          return (
            <div key={i} style={{ width: tile, height: tile, borderRadius: 30, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.max(0, k)})`, boxShadow: `0 14px 28px rgba(10,0,25,0.6), 0 0 22px rgba(${colors.brandGlow},0.35)` }}>
              {src ? <Img src={src} style={{ width: tile * 0.62, height: tile * 0.62, objectFit: "contain", filter: is3d(id) ? "drop-shadow(0 6px 8px rgba(0,0,0,0.35))" : undefined }} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
