// Explanatory elements added 2026-10-11 (Adil: "the screen should act out what I say"):
//   meter    — a percentage bar that fills, with labelled zone marks (skip rate 50 / 30 / 20 …)
//   bars     — vertical bars growing side by side for a comparison (reels 1× vs carousels 1.9×)
//   carousel — an Instagram-style carousel that swipes slide by slide on cue words
// Registered in الأسلوب/أسلوب-المونتاج.md §6 and docs/engine-map.md.
import { Easing, Img, interpolate, spring, staticFile } from "remotion";
import { colors, toneColor, type ToneName } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { clamp } from "./anim";
import { type Ctx, startOf } from "./layout";
import type { BarsItem, CarouselItem, MeterItem } from "./types";
import { iconSrc, is3d } from "./VisualLeaf";

const accent = (tone?: ToneName) => toneColor[tone ?? "green"];
const label = (fs: number, color = "#fff") =>
  ({ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: fs, color, direction: "rtl", whiteSpace: "nowrap", textShadow: "0 4px 10px rgba(0,0,0,0.85)" }) as const;

// ---------- Meter: a rounded track, a gradient fill easing to `value`, a big % readout, and zone marks that pop in on their words.
export const MeterLeaf: React.FC<{ item: MeterItem; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const fillTo = (w?: number) => (w === undefined ? 4 : startOf(ctx, w) - startOf(ctx, item.word));
  // The fill can move in steps: [{word, value}] (e.g. 50 → 30 → 20), otherwise it eases to `value` once.
  const stops = item.steps?.length ? item.steps : [{ word: undefined as number | undefined, value: item.value }];
  let v = 0;
  for (const s of stops) {
    const t0 = fillTo(s.word);
    const k = interpolate(local, [t0, t0 + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    v = v + (s.value - v) * k;
  }
  const c = accent(item.tone);
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", direction: "ltr" }}>
      {item.label ? <div style={{ position: "absolute", right: 0, top: 0, ...label(56) }}>{item.label}</div> : null}
      <div style={{ position: "absolute", left: 0, top: 0, fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 84, lineHeight: 1, color: c, textShadow: `0 0 18px ${c}88, 0 6px 12px rgba(0,0,0,0.8)` }}>
        {Math.round(v)}%
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 112, height: 54, borderRadius: 27, background: "rgba(255,255,255,0.09)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${v}%`, height: "100%", borderRadius: 27, background: colors.brandGradient, boxShadow: `0 0 24px rgba(${colors.brandGlow},0.8)` }} />
      </div>
      {(item.marks ?? []).map((m, i) => {
        const at = m.word === undefined ? 10 + i * 6 : startOf(ctx, m.word) - startOf(ctx, item.word);
        const k = spring({ frame: local - at, fps: ctx.fps, config: SPRINGS.pop });
        if (local < at) return null;
        const mc = accent(m.tone ?? "white");
        return (
          <div key={i} style={{ position: "absolute", left: `${m.at}%`, top: 100, transform: `translateX(-50%) scale(${k})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 6, height: 78, borderRadius: 3, background: mc, boxShadow: `0 0 12px ${mc}` }} />
            <div style={{ ...label(40, mc), marginTop: 10 }}>{m.text}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Bars: each bar grows on its own word; the value label rides the top of the bar.
export const BarsLeaf: React.FC<{ item: BarsItem; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const max = Math.max(...item.bars.map((b) => b.value));
  const H = 430;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 90, direction: "rtl" }}>
      {item.bars.map((b, i) => {
        const at = b.word === undefined ? i * 10 : startOf(ctx, b.word) - startOf(ctx, item.word);
        const k = interpolate(local, [at, at + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
        const h = (b.value / max) * H * k;
        const c = accent(b.tone ?? (i === 0 ? "white" : "green"));
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 230, opacity: local < at ? 0 : 1 }}>
            <div style={{ fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 78, color: c, textShadow: `0 0 16px ${c}88, 0 6px 10px rgba(0,0,0,0.8)`, direction: "ltr", marginBottom: 12 }}>{b.text ?? b.value}</div>
            <div style={{ width: 170, height: Math.max(6, h), borderRadius: "22px 22px 6px 6px", background: b.tone === "white" || (!b.tone && i === 0) ? "linear-gradient(#e9e3f5, #8f84a6)" : colors.brandGradient, boxShadow: `0 0 30px ${c}55, 0 18px 30px rgba(0,0,0,0.7)` }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
              {b.icon ? <Img src={iconSrc(b.icon)} style={{ width: 64, height: 64, objectFit: "contain", filter: is3d(b.icon) ? "drop-shadow(0 8px 10px rgba(0,0,0,0.7))" : undefined }} /> : null}
              <div style={label(48)}>{b.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Carousel: a 4:5 Instagram post whose slides swipe in on cue words, with the dots indicator underneath.
export const CarouselLeaf: React.FC<{ item: CarouselItem; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const n = item.slides.length;
  const cue = (i: number) => {
    const w = item.at?.[i - 1];
    return w === undefined ? i * (item.every ?? 24) : startOf(ctx, w) - startOf(ctx, item.word);
  };
  // Continuous position: 0 = first slide, 1 = second… each swipe eases over 12f.
  let pos = 0;
  for (let i = 1; i < n; i++) pos += interpolate(local, [cue(i), cue(i) + 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const W = 520;
  const H = 650;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <div style={{ position: "relative", width: W, height: H, borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.14)", background: "#0f0b16" }}>
        {item.slides.map((s, i) => {
          const x = (i - pos) * W;
          if (Math.abs(x) > W * 1.05) return null;
          const tinted = i % 2 === 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: 0,
                width: W,
                height: H,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 30,
                padding: 40,
                background: tinted ? `linear-gradient(160deg, ${colors.brandDeep}, #160f22 70%)` : "linear-gradient(160deg, #2a1838, #0f0b16 75%)",
                borderRight: "2px solid rgba(255,255,255,0.06)",
              }}
            >
              {s.file && ctx.assets.files[s.file] ? (
                <Img src={staticFile(ctx.assets.files[s.file].src)} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
              ) : null}
              {s.icon ? <Img src={iconSrc(s.icon)} style={{ width: 230, height: 230, objectFit: "contain", filter: "drop-shadow(0 16px 20px rgba(0,0,0,0.7))" }} /> : null}
              {s.text ? <div style={{ ...label(54), whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.3 }}>{s.text}</div> : null}
              <div style={{ position: "absolute", top: 22, left: 26, fontFamily: NUMBER_FONT_FAMILY, fontWeight: 700, fontSize: 28, color: "rgba(255,255,255,0.75)", background: "rgba(0,0,0,0.45)", borderRadius: 18, padding: "4px 14px" }}>
                {i + 1}/{n}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {item.slides.map((_, i) => {
          const on = Math.max(0, 1 - Math.abs(i - pos));
          return <div key={i} style={{ width: 16 + on * 14, height: 16, borderRadius: 8, background: on > 0.5 ? colors.green : "rgba(255,255,255,0.35)", boxShadow: on > 0.5 ? `0 0 10px ${colors.green}` : undefined }} />;
        })}
      </div>
    </div>
  );
};
