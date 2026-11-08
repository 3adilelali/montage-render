import { Pointer, Search, Mic } from "lucide-react";
import { Easing, interpolate, spring } from "remotion";
import { colors, toneColor } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { COUNTER_FRAMES, SPRINGS, TYPE_PER_CHAR } from "../../brand/motion";
import { clamp } from "./anim";
import { BADGE_SIZE, CARD_FONT, COUNTER_SIZE, type Ctx, NUMBER_SIZE, startOf } from "./layout";
import { textShadow } from "./TextLeaf";
import type { BadgeItem, CardItem, CounterItem, NumberItem, RibbonItem, RingItem, ScribbleItem, SearchItem, StepsItem, SubscribeItem } from "./types";
import { iconSrc } from "./VisualLeaf";
import { Img } from "remotion";

const center = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } as const;

// ---------- List number: white digits, coloured outline + glow (refs: red «1», green «2», neon «4»).
export const NumberLeaf: React.FC<{ item: NumberItem }> = ({ item }) => {
  const fs = NUMBER_SIZE[item.size ?? "m"];
  const c = item.tone === "green" ? colors.green : item.tone === "white" ? "#d9d9d9" : colors.red;
  return (
    <div
      style={{
        ...center,
        fontFamily: NUMBER_FONT_FAMILY,
        fontWeight: 800,
        fontSize: fs,
        lineHeight: 1,
        color: "#fff",
        WebkitTextStroke: `${Math.round(fs / 28)}px ${c}`,
        paintOrder: "stroke fill",
        textShadow: `0 0 ${fs / 10}px ${c}, 0 ${fs / 30}px ${fs / 18}px rgba(0,0,0,0.9)`,
      }}
    >
      {item.text}
    </div>
  );
};

// ---------- Counter: counts up with an ease-out; optional light rays behind (refs: 0 → 6,000,000).
export const CounterLeaf: React.FC<{ item: CounterItem; local: number }> = ({ item, local }) => {
  const fs = COUNTER_SIZE[item.size ?? "m"];
  const frames = item.frames ?? COUNTER_FRAMES;
  const t = interpolate(local, [0, frames], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const from = item.from ?? 0;
  const value = Math.round(from + (item.to - from) * t);
  const tone = item.tone ?? "white";
  return (
    <div style={{ ...center, position: "relative" }}>
      {item.rays ? <Rays size={fs * 6} /> : null}
      {/* Light streaks under the digits, like the refs' glowing counters. */}
      <div style={{ position: "absolute", width: "110%", height: fs * 0.28, bottom: "8%", background: "radial-gradient(ellipse at center, rgba(255,255,255,0.35), transparent 70%)", filter: "blur(6px)" }} />
      <span
        style={{
          position: "relative",
          fontFamily: NUMBER_FONT_FAMILY,
          fontWeight: 800,
          fontSize: fs,
          lineHeight: 1,
          color: toneColor[tone],
          textShadow: textShadow(tone),
          direction: "ltr",
        }}
      >
        {item.prefix ?? ""}
        {value.toLocaleString("en-US")}
        {item.suffix ?? ""}
      </span>
    </div>
  );
};

// Soft rotating light rays (refs: behind big numbers and reveals).
export const Rays: React.FC<{ size: number; spin?: number }> = ({ size, spin = 0 }) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: `repeating-conic-gradient(from ${spin}deg, rgba(255,255,255,0.13) 0deg 6deg, transparent 6deg 22deg)`,
      maskImage: "radial-gradient(circle, black 0%, transparent 65%)",
      WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 65%)",
      filter: "blur(5px)",
    }}
  />
);

// ---------- Steps: 1 2 3 that turn green as each point is done (refs), or red chips (1 2 3 4 5).
export const StepsLeaf: React.FC<{ item: StepsItem; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const chips = item.style === "chips";
  let doneUpto = 0;
  let doneAt = 0;
  for (const d of item.done ?? []) {
    const at = startOf(ctx, d.word);
    if (ctx.frame >= at) {
      doneUpto = d.upto;
      doneAt = at;
    }
  }
  return (
    <div style={{ ...center, flexDirection: "row", direction: "ltr", gap: 0 }}>
      {item.labels.map((label, i) => {
        const k = spring({ frame: local - i * 3, fps: ctx.fps, config: SPRINGS.pop });
        const green = i < doneUpto;
        const flash = green ? interpolate(ctx.frame - doneAt, [0, 6], [1.25, 1], clamp) : 1;
        if (chips) {
          return (
            <div key={i} style={{ width: 190, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 2), transform: `translateX(${(1 - k) * -120}px) scale(${Math.min(1.05, k)})` }}>
              <div style={{ ...center, width: 150, height: 96, borderRadius: 20, background: `linear-gradient(${colors.red}, ${colors.redDeep})`, boxShadow: `0 8px 0 ${colors.brandDeep}, 0 14px 22px rgba(0,0,0,0.7)`, fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 70, color: "#fff", textShadow: "0 3px 4px rgba(0,0,0,0.6)" }}>
                {label}
              </div>
            </div>
          );
        }
        const c = green ? colors.green : "#fff";
        return (
          <div
            key={i}
            style={{
              width: 300,
              textAlign: "center",
              fontFamily: NUMBER_FONT_FAMILY,
              fontWeight: 800,
              fontSize: 140,
              lineHeight: 1,
              color: c,
              textShadow: green ? `0 0 16px ${colors.green}, 0 0 40px ${colors.green}88, 0 6px 10px #000` : `0 0 18px rgba(255,255,255,0.6), 0 6px 10px #000`,
              opacity: Math.min(1, k * 2),
              transform: `scale(${Math.min(1.05, k) * flash})`,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Glossy card in the brand gradient with white text (refs: blue card «المشاهدة في أول 20 ثانية»).
export const CardLeaf: React.FC<{ item: CardItem; local: number; fps: number }> = ({ item, local, fps }) => {
  const fs = CARD_FONT[item.size ?? "m"];
  const sway = Math.sin((local / fps) * 1.3) * 1.5;
  return (
    <div
      style={{
        ...center,
        flexDirection: "column",
        borderRadius: fs * 0.7,
        background: colors.brandGradient,
        boxShadow: "0 22px 40px rgba(0,0,0,0.75), inset 0 2px 0 rgba(255,255,255,0.35)",
        direction: "rtl",
        fontFamily: FONT_FAMILY,
        fontWeight: 800,
        fontSize: fs,
        lineHeight: 1.6,
        color: "#fff",
        textShadow: "0 4px 8px rgba(0,0,0,0.6)",
        transform: `rotate(${sway}deg)`,
        whiteSpace: "nowrap",
      }}
    >
      {item.text.split("\n").map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
};

const POLY = {
  octagon: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
  pentagon: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
};

// ---------- Yellow badge with red glow (refs: «دورة كاملة مجانية», «التفاعل», «استمر»).
export const BadgeLeaf: React.FC<{ item: BadgeItem }> = ({ item }) => {
  const d = BADGE_SIZE[item.size ?? "m"];
  const shape = item.shape ?? "octagon";
  const lines = (item.text ?? "").split("\n");
  const fs = Math.min(d * 0.2, (d * 0.95) / Math.max(1, Math.max(...lines.map((l) => l.length)) * 0.55));
  return (
    <div style={{ ...center, filter: `drop-shadow(0 0 16px rgba(${colors.brandGlow},0.95)) drop-shadow(0 0 40px rgba(${colors.brandGlow},0.6))` }}>
      <div style={{ ...center, flexDirection: "column", clipPath: POLY[shape], background: `radial-gradient(circle at 40% 35%, #ffd08a, ${colors.yellow} 60%)` }}>
        {item.icon ? <Img src={iconSrc(item.icon)} style={{ width: "45%", height: "45%", objectFit: "contain" }} /> : null}
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: fs, lineHeight: 1.25, color: "#fff", direction: "rtl", textShadow: `0 0 3px ${colors.brandDeep}, 0 0 3px ${colors.brandDeep}, 0 4px 6px rgba(0,0,0,0.6)` }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Ribbon: deep-purple bar between two orange octagons with magenta glow (refs: numbered sections).
export const RibbonLeaf: React.FC<{ item: RibbonItem }> = ({ item }) => {
  const cap = (
    <div style={{ width: 96, height: 96, clipPath: POLY.octagon, background: `radial-gradient(circle at 40% 35%, #ffd08a, ${colors.lime} 65%)` }} />
  );
  return (
    <div style={{ ...center, filter: `drop-shadow(0 0 18px rgba(${colors.brandGlow},0.85))` }}>
      <div style={{ ...center, width: "auto", position: "absolute", left: 60, right: 60, height: 70, background: `linear-gradient(90deg, transparent, ${colors.ribbon} 15%, ${colors.ribbon} 85%, transparent)`, fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 60, color: "#fff", textShadow: "0 3px 6px #000", direction: "rtl" }}>
        <span style={{ fontFamily: /\d/.test(item.text) ? NUMBER_FONT_FAMILY : FONT_FAMILY }}>{item.text}</span>
      </div>
      <div style={{ position: "absolute", right: 0 }}>{cap}</div>
      <div style={{ position: "absolute", left: 0 }}>{cap}</div>
    </div>
  );
};

// ---------- Ring: thin white circle drawn around a short label (refs: «CTR»).
export const RingLeaf: React.FC<{ item: RingItem; local: number; fps: number }> = ({ item, local, fps }) => {
  const draw = interpolate(local, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const k = spring({ frame: local - 4, fps, config: SPRINGS.pop });
  const r = 140;
  const C = 2 * Math.PI * r;
  const isLatin = /^[\x20-\x7E]+$/.test(item.text);
  return (
    <div style={{ ...center, position: "relative" }}>
      <svg width={300} height={300} style={{ position: "absolute" }}>
        <circle cx={150} cy={150} r={r} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray={C} strokeDashoffset={C * (1 - draw)} transform="rotate(-90 150 150)" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }} />
      </svg>
      <div style={{ fontFamily: isLatin ? NUMBER_FONT_FAMILY : FONT_FAMILY, fontWeight: 900, fontSize: isLatin ? 110 : 54, lineHeight: 1.2, color: "#fff", textAlign: "center", direction: "rtl", textShadow: textShadow("white"), opacity: Math.min(1, k), transform: `scale(${Math.min(1.05, k)})` }}>
        {item.text.split("\n").map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
};

// ---------- Search bar typing a query (refs: «كريستيانو رونالدو»).
export const SearchLeaf: React.FC<{ item: SearchItem; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const chars = Array.from(item.text);
  const span = item.end !== undefined ? Math.max(8, startOf(ctx, item.end) - startOf(ctx, item.word)) : chars.length * TYPE_PER_CHAR;
  const n = Math.round(interpolate(local - 6, [0, span], [0, chars.length], clamp));
  const caret = Math.floor(local / 8) % 2 === 0;
  return (
    <div style={{ ...center }}>
      <div style={{ width: "100%", height: 104, borderRadius: 18, background: colors.searchBg, boxShadow: `0 0 0 4px ${colors.searchGlow}, 0 0 30px ${colors.searchGlow}, 18px 22px 0 rgba(56,214,255,0.25)`, display: "flex", alignItems: "center", padding: "0 34px", gap: 22, direction: "rtl" }}>
        <div style={{ flex: 1, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 52, color: colors.searchInk, whiteSpace: "nowrap", overflow: "hidden" }}>
          {chars.slice(0, n).join("")}
          <span style={{ opacity: caret ? 1 : 0, fontWeight: 300 }}>|</span>
        </div>
        <Mic size={44} color="#1e88e5" />
        <Search size={48} color="#1e88e5" strokeWidth={3} />
      </div>
    </div>
  );
};

// ---------- Red neon scribble underline (refs: under «اختيارنا الخاطئ لمجال القناة»).
export const ScribbleLeaf: React.FC<{ item: ScribbleItem; local: number }> = ({ item, local }) => {
  const draw = interpolate(local, [0, 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const c = item.tone === "white" ? "#ffffff" : colors.red;
  const d = "M 660 30 C 420 10, 120 14, 30 34 C 10 44, 60 56, 330 50 C 560 44, 690 52, 640 70 C 560 92, 240 84, 130 92";
  const L = 2200;
  return (
    <svg viewBox="0 0 680 110" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <path d={d} fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} style={{ filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 14px ${c})` }} />
    </svg>
  );
};

// ---------- Subscribe button + hand cursor click (refs: CTA).
export const SubscribeLeaf: React.FC<{ item: SubscribeItem; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const clickAt = item.clickAt !== undefined ? startOf(ctx, item.clickAt) - startOf(ctx, item.word) : 24;
  const hand = interpolate(local, [4, clickAt], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pressed = local >= clickAt;
  const press = interpolate(local - clickAt, [0, 3, 7], [1, 0.9, 1], clamp);
  return (
    <div style={{ ...center, position: "relative" }}>
      <div style={{ ...center, width: 470, height: 110, flexDirection: "row", gap: 18, borderRadius: 6, background: pressed ? "#d4d4d4" : colors.brandGradient, transform: `scale(${press})`, boxShadow: "0 12px 24px rgba(0,0,0,0.7)", fontFamily: "Roboto, Arial, sans-serif", fontSize: 50, fontWeight: 500, color: pressed ? "#555" : "#fff" }}>
        {pressed ? null : <div style={{ ...center, width: 64, height: 44, borderRadius: 10, background: "#fff" }}><div style={{ width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: `20px solid ${colors.brandMagenta}`, marginLeft: 4 }} /></div>}
        {pressed ? "Subscribed" : "Subscribe"}
      </div>
      <div style={{ position: "absolute", left: 300 + hand * 240, top: 60 + hand * 160, transform: `scale(${pressed ? press : 1})` }}>
        <Pointer size={92} color="#111" fill="#fff" strokeWidth={1.6} />
      </div>
    </div>
  );
};
