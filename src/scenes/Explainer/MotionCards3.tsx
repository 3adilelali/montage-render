// Course promo cards (2026-10-17, «كلود يعمل عنك»), same light-card system as MotionCards.tsx.
//   mc-chat   — a plain Claude chat (question → answer); on `zoomAt` it shrinks and the unused tools light up around it
//   title-3d  — an extruded brand-gradient title swinging in 3D, a sheen sweeps across, a subline types in under it
//   mc-price  — old price gets struck, the new price slams in with a burst, a tag drops, a guarantee seal spins in
import { Easing, Img, interpolate, spring } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { clamp } from "./anim";
import { type Ctx, startOf } from "./layout";
import type { McChat, McPrice, Title3D } from "./types";
import { iconSrc } from "./VisualLeaf";

const fill = { position: "absolute", inset: 0 } as const;
const C = { card: "#FBF7FF", ink: "#1d0b33", soft: "#8a7aa6", line: "#e9def6", purple: colors.brandPurple, orange: colors.brandOrange, deep: colors.brandDeep, magenta: colors.brandMagenta };
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const rel = (ctx: Ctx, base: number, w: number | null | undefined, fb: number) => (w == null ? fb : startOf(ctx, w) - base);
const CLAUDE = "#D97757";

// ---------- Chat → tools. The chat sits in the middle; the tools orbit on an ellipse once it shrinks.
export const ChatMC: React.FC<{ item: McChat; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const qAt = rel(ctx, base, item.qAt, 4);
  const aAt = rel(ctx, base, item.aAt, qAt + 14);
  const zAt = rel(ctx, base, item.zoomAt, aAt + 30);
  const z = spring({ frame: local - zAt, fps: ctx.fps, config: SPRINGS.layout });
  const scale = interpolate(z, [0, 1], [1, 0.68]);
  const qk = spring({ frame: local - qAt, fps: ctx.fps, config: SPRINGS.pop });
  const ak = spring({ frame: local - aAt, fps: ctx.fps, config: SPRINGS.pop });
  const typed = Math.floor(interpolate(local, [aAt, aAt + 18], [0, item.answer.length], clamp));
  const N = item.nodes.length;
  return (
    <div style={{ ...fill }}>
      {/* Orbit ring */}
      <svg width={1600} height={820} style={{ position: "absolute", left: 0, top: 0, opacity: z * 0.5 }}>
        <ellipse cx={800} cy={410} rx={640} ry={330} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" />
      </svg>
      {item.nodes.map((n, i) => {
        const ang = -Math.PI / 2 + (i / N) * Math.PI * 2 + local * 0.0035;
        const k = spring({ frame: local - zAt - 6 - i * 3, fps: ctx.fps, config: SPRINGS.pop });
        if (local < zAt + 6 + i * 3) return null;
        const x = 800 + Math.cos(ang) * 640;
        const y = 410 + Math.sin(ang) * 330;
        const glow = 0.5 + 0.5 * Math.sin(local / 9 + i);
        return (
          <div key={i} style={{ position: "absolute", left: x - 90, top: y - 80, width: 180, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${Math.max(0, k)})` }}>
            <div style={{ width: 112, height: 112, borderRadius: 30, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.22)", boxShadow: `0 0 ${24 + glow * 22}px rgba(${colors.brandGlow},${0.35 + glow * 0.35})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {n.icon && ctx.assets.icons.includes(n.icon) ? <Img src={iconSrc(n.icon)} style={{ width: 74, height: 74, objectFit: "contain" }} /> : null}
            </div>
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, color: "#fff", textShadow: "0 4px 10px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>{n.label}</div>
          </div>
        );
      })}
      {/* The chat window */}
      <div style={{ position: "absolute", left: 800 - 420, top: 410 - 200, width: 840, height: 400, transform: `scale(${scale})` }}>
        <div style={{ ...fill, background: C.card, borderRadius: 34, boxShadow: `0 30px 70px rgba(10,0,25,0.7), 0 0 46px rgba(${colors.brandGlow},0.35)`, overflow: "hidden", direction: "rtl" }}>
          <div style={{ height: 70, display: "flex", alignItems: "center", gap: 14, padding: "0 30px", borderBottom: `2px solid ${C.line}` }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: CLAUDE }} />
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 32, color: C.ink }}>Claude</div>
          </div>
          <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ alignSelf: "flex-start", maxWidth: 620, padding: "16px 26px", borderRadius: "26px 26px 8px 26px", background: "#efe6fb", fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 34, color: C.ink, opacity: Math.min(1, Math.max(0, qk)), transform: `translateY(${(1 - Math.min(1, qk)) * 20}px)` }}>{item.question}</div>
            {local >= aAt ? (
              <div style={{ alignSelf: "flex-end", display: "flex", gap: 14, alignItems: "flex-start", opacity: Math.min(1, Math.max(0, ak)) }}>
                <div style={{ maxWidth: 620, fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 32, color: C.ink, lineHeight: 1.45 }}>{item.answer.slice(0, typed)}</div>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: CLAUDE, flexShrink: 0 }} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- 3D title. Extrusion = stacked offset copies (deep purple → magenta), the face carries the brand gradient.
export const Title3DLeaf: React.FC<{ item: Title3D; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const k = spring({ frame: local, fps: ctx.fps, config: SPRINGS.pop });
  const swing = Math.sin((local / ctx.fps) * 0.9);
  const ry = interpolate(Math.min(1, k), [0, 1], [-55, 0]) + swing * 9;
  const rx = 8 - swing * 3;
  const depth = 16;
  const fs = 168;
  const sheen = interpolate(local, [10, 40], [-30, 130], clamp);
  const subAt = rel(ctx, base, item.subAt, 18);
  const sub = item.sub ?? "";
  const subShown = Math.floor(interpolate(local, [subAt, subAt + 16], [0, sub.length], clamp));
  const face: React.CSSProperties = { fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: fs, lineHeight: 1.15, whiteSpace: "nowrap", direction: "rtl" };
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, perspective: 1400 }}>
      {item.kicker ? <div style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 40, color: "#d8c8f0", letterSpacing: 1, opacity: Math.min(1, Math.max(0, k)) }}>{item.kicker}</div> : null}
      <div style={{ position: "relative", transform: `rotateY(${ry}deg) rotateX(${rx}deg) scale(${0.6 + 0.4 * Math.min(1, Math.max(0, k))})`, transformStyle: "preserve-3d" }}>
        {Array.from({ length: depth }).map((_, i) => (
          <div key={i} style={{ ...face, position: "absolute", left: 0, top: 0, color: i < depth / 2 ? colors.brandDeep : "#5a2a7c", transform: `translateZ(${-(i + 1) * 3}px) translate(${(i + 1) * 0.6}px, ${(i + 1) * 0.9}px)` }}>{item.text}</div>
        ))}
        <div style={{ ...face, position: "relative", background: `linear-gradient(100deg, ${C.orange} 0%, #CD5968 35%, ${C.magenta} 62%, ${C.purple} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 30px rgba(${colors.brandGlow},0.55))` }}>
          {item.text}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sheen - 12}%, rgba(255,255,255,0.85) ${sheen}%, transparent ${sheen + 12}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{item.text}</div>
        </div>
      </div>
      {sub ? (
        <div style={{ marginTop: 10, padding: "14px 36px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.18)", fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 48, color: "#fff", direction: "rtl", opacity: local >= subAt ? 1 : 0, minHeight: 70 }}>
          {sub.slice(0, subShown)}
        </div>
      ) : null}
    </div>
  );
};

// ---------- Price. RTL: new price on the right (read first after the strike), old one on the left.
export const PriceMC: React.FC<{ item: McPrice; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const strikeAt = rel(ctx, base, item.strikeAt, 10);
  const newAt = rel(ctx, base, item.newAt, strikeAt + 8);
  const tagAt = rel(ctx, base, item.tagAt, newAt + 14);
  const sealAt = rel(ctx, base, item.sealAt, tagAt + 14);
  const strike = interpolate(local, [strikeAt, strikeAt + 7], [0, 1], ease);
  const nk = spring({ frame: local - newAt, fps: ctx.fps, config: SPRINGS.slam });
  const burst = interpolate(local, [newAt, newAt + 16], [0, 1], clamp);
  const tk = spring({ frame: local - tagAt, fps: ctx.fps, config: SPRINGS.pop });
  const sk = spring({ frame: local - sealAt, fps: ctx.fps, config: SPRINGS.pop });
  return (
    <div style={{ ...fill, direction: "rtl", display: "flex", alignItems: "center", justifyContent: "center", gap: 80 }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {local >= newAt ? (
          <>
            <svg width={600} height={600} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -300, marginTop: -330, opacity: 1 - burst }}>
              {Array.from({ length: 14 }).map((_, i) => {
                const a = (i / 14) * Math.PI * 2;
                const r0 = 120 + burst * 90;
                const r1 = r0 + 60 * (1 - burst * 0.5);
                return <line key={i} x1={300 + Math.cos(a) * r0} y1={300 + Math.sin(a) * r0} x2={300 + Math.cos(a) * r1} y2={300 + Math.sin(a) * r1} stroke={C.orange} strokeWidth={10} strokeLinecap="round" />;
              })}
            </svg>
            <div style={{ fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 260, lineHeight: 1, color: C.orange, transform: `scale(${Math.max(0, nk)})`, textShadow: `0 0 40px rgba(251,159,42,0.7), 0 10px 20px rgba(0,0,0,0.8)`, direction: "ltr" }}>{item.now}</div>
          </>
        ) : <div style={{ height: 260 }} />}
        {item.tag ? (
          <div style={{ marginTop: 18, padding: "12px 32px", borderRadius: 18, background: colors.brandGradient, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 44, color: "#fff", opacity: Math.min(1, Math.max(0, tk)), transform: `translateY(${(1 - Math.min(1, tk)) * -30}px) rotate(-2deg)`, boxShadow: `0 12px 30px rgba(0,0,0,0.6)` }}>{item.tag}</div>
        ) : null}
      </div>
      <div style={{ position: "relative", fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 150, color: interpolate(strike, [0, 1], [1, 0.45]) > 0.6 ? "#fff" : "rgba(255,255,255,0.55)", direction: "ltr" }}>
        {item.old}
        <div style={{ position: "absolute", left: -12, right: -12, top: "52%", height: 14, borderRadius: 7, background: colors.red, transformOrigin: "left center", transform: `scaleX(${strike}) rotate(-8deg)`, boxShadow: `0 0 18px ${colors.red}` }} />
      </div>
      {item.seal && local >= sealAt ? (
        <div style={{ position: "absolute", left: 40, bottom: 0, width: 230, height: 230, transform: `scale(${Math.max(0, sk)}) rotate(${interpolate(Math.min(1, sk), [0, 1], [-90, -12]) + Math.sin(local / 20) * 3}deg)` }}>
          <svg width={230} height={230} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2;
              return <circle key={i} cx={115 + Math.cos(a) * 104} cy={115 + Math.sin(a) * 104} r={11} fill={C.purple} />;
            })}
            <circle cx={115} cy={115} r={104} fill={C.purple} />
            <circle cx={115} cy={115} r={86} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="4 6" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT_FAMILY, fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.1 }}>
            {item.seal.split("\n").map((l, i) => <div key={i} style={{ fontSize: i === 1 ? 58 : 32, fontFamily: i === 1 ? NUMBER_FONT_FAMILY : FONT_FAMILY }}>{l}</div>)}
          </div>
        </div>
      ) : null}
    </div>
  );
};
