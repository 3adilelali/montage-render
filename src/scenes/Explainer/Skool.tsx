// YouTubeSkool layer (2026-11-02, video «كلود-المونتير»), studied in المراجع/دراسة-يوتيوب-سكول/ and re-drawn in the brand.
//   bar3d    — bevelled deep-purple title bar: lands empty with a stretch, then its words drop in one by one on their words
//   banner   — flat magenta/orange banner that types word by word, the box growing leftwards (RTL) as it writes
//   disc     — step number in a glossy brand disc (use enter "slam": it fills the screen and shrinks in ~0.5s)
//   xstamp   — brush-stroke X stamped over the item under it (float it over a visual or banner)
//   arrow    — hand-drawn curved arrow that draws on, wiggles, and redraws
//   multiply — one icon multiplies into a grid from dots; the grid can grey out and one tile can be picked
//   checklist— numbered rows, the one being said is sharp and the rest out of focus; all light up on `doneAt`
//   fly3d    — opener: words float in 3D space while the camera flies through them, the last one settles
//   mc-claude— the Claude Code app: a prompt is typed and sent, then the work log ticks line by line
//   mc-folder— a folder window («المخرجات») where the finished video file lands and gets selected
//   mc-player— a video player frame playing a clip of this very video, with a running progress bar
import { Easing, Img, interpolate, OffthreadVideo, random, spring, staticFile } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { assetFor, type Ctx, startOf } from "./layout";
import { measureText } from "./measure";
import { BANNER_FS, BAR_FS, bannerSize, DISC_SIZE } from "./skoolSize";
import type { Arrow, Bar3D, Banner, Checklist, Disc, Fly3D, McClaude, McFolder, McPlayer, Multiply, XStamp } from "./types";
import { iconSrc, is3d } from "./VisualLeaf";

const fill = { position: "absolute", inset: 0 } as const;
const NEVER = 1e7; // "no cue" frame (Infinity breaks interpolate)
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const CLAUDE = "#D97757";
const at = (ctx: Ctx, w: number | undefined, fb: number) => (w === undefined ? fb : startOf(ctx, w));
const SOFT3D = "drop-shadow(0 0 24px rgba(160,78,215,0.32)) drop-shadow(0 18px 22px rgba(0,0,0,0.7))";
const STICKER = "drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 12px 16px rgba(0,0,0,0.75))";

// Word timings for a multi-word item: explicit `at` words, else one word every `step` frames from the start.
const wordFrames = (ctx: Ctx, base: number, n: number, ats?: number[], step = 4) =>
  Array.from({ length: n }, (_, i) => (ats && ats[Math.min(i, ats.length - 1)] !== undefined ? Math.max(base, startOf(ctx, ats[Math.min(i, ats.length - 1)])) : base + 6 + i * step));

const words = (t: string) => t.split(" ").filter(Boolean);

// ---------- bar3d
export const Bar3DLeaf: React.FC<{ item: Bar3D; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const fs = item.fs ?? BAR_FS;
  const base = startOf(ctx, item.word);
  const ws = words(item.text);
  const wf = wordFrames(ctx, base + 3, ws.length, item.at, 5);
  const k = spring({ frame: local, fps: ctx.fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
  const sx = interpolate(k, [0, 1], [1.9, 1]);
  const sy = interpolate(k, [0, 1], [0.25, 1]);
  const blur = (1 - Math.min(1, k)) * 26;
  const sheen = interpolate(local % 90, [0, 40], [-40, 140], clamp);
  const tone = item.tone === "orange" ? ["#C9701A", "#7a3f0c", "#FFB24D"] : ["#5B2C8A", "#2a1244", "#B07DE8"];
  return (
    <div style={{ ...fill, perspective: 1200 }}>
      <div style={{ ...fill, transform: `rotateX(10deg) scale(${sx}, ${sy})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined, opacity: Math.min(1, local / 3) }}>
        {/* Extrusion */}
        <div style={{ ...fill, top: 14, borderRadius: 22, background: tone[1], boxShadow: "0 26px 40px rgba(0,0,0,0.7)" }} />
        {/* Face */}
        <div style={{ ...fill, bottom: 14, borderRadius: 22, background: `linear-gradient(180deg, ${tone[2]} 0%, ${tone[0]} 18%, ${tone[0]} 70%, ${tone[1]} 100%)`, border: "3px solid rgba(255,255,255,0.28)", overflow: "hidden", boxShadow: `inset 0 3px 0 rgba(255,255,255,0.45), 0 0 50px rgba(${colors.brandGlow},0.35)` }}>
          <div style={{ ...fill, background: `linear-gradient(105deg, transparent ${sheen - 10}%, rgba(255,255,255,0.28) ${sheen}%, transparent ${sheen + 10}%)` }} />
          {/* Side caps in brand orange */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 18, background: colors.brandOrange, boxShadow: `0 0 20px ${colors.brandOrange}` }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: colors.brandOrange, boxShadow: `0 0 20px ${colors.brandOrange}` }} />
        </div>
      </div>
      <div style={{ ...fill, bottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: fs * 0.28, direction: "rtl" }}>
        {ws.map((w, i) => {
          const d = spring({ frame: ctx.frame - wf[i], fps: ctx.fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
          if (ctx.frame < wf[i]) return <span key={i} style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: fs, opacity: 0 }}>{w}</span>;
          return (
            <span key={i} style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: fs, lineHeight: 1, color: "#fff", display: "inline-block", transform: `translateY(${interpolate(d, [0, 1], [-170, 0])}px) scale(${interpolate(d, [0, 1], [1.5, 1])})`, opacity: Math.min(1, d * 2), filter: d < 0.8 ? `blur(${(1 - d) * 10}px)` : undefined, textShadow: `0 6px 0 rgba(0,0,0,0.35), 0 10px 18px rgba(0,0,0,0.6)` }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- banner: types word by word; the box is anchored right and grows leftwards with the text.
export const BannerLeaf: React.FC<{ item: Banner; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const fs = item.fs ?? BANNER_FS;
  const base = startOf(ctx, item.word);
  const lines = item.text.split("\n").map(words);
  const all = lines.flat();
  const wf = wordFrames(ctx, base, all.length, item.at, 3);
  const shown = wf.filter((f) => ctx.frame >= f).length;
  const full = bannerSize(item);
  // Width of the text typed so far (widest line).
  let n = shown;
  const partial = lines.map((l) => {
    const take = Math.max(0, Math.min(l.length, n));
    n -= l.length;
    return l.slice(0, take).join(" ");
  });
  const tw = Math.max(fs * 0.6, ...partial.map((p) => (p ? measureText(p, fs, FONT_FAMILY, 900) : 0)));
  const target = Math.min(full.w, tw + fs * 1.3);
  const grow = spring({ frame: local, fps: ctx.fps, config: SPRINGS.pop });
  const w = target * Math.min(1, 0.4 + grow * 0.6);
  const bg = item.tone === "orange" ? `linear-gradient(180deg, #FFB24D, ${colors.brandOrange} 60%, #E07F12)` : item.tone === "purple" ? `linear-gradient(180deg, #8A4FD0, #5B2C8A)` : `linear-gradient(180deg, #F062B6, #D93A99 60%, #B92A82)`;
  // Rough brush edges: a fixed jagged polygon per banner.
  const seed = `${item.text}`;
  const pts: string[] = [];
  for (let i = 0; i <= 12; i++) pts.push(`${(i / 12) * 100}% ${random(`${seed}t${i}`) * 5}%`);
  for (let i = 0; i <= 4; i++) pts.push(`${100 - random(`${seed}r${i}`) * 1.2}% ${(i / 4) * 100}%`);
  for (let i = 12; i >= 0; i--) pts.push(`${(i / 12) * 100}% ${100 - random(`${seed}b${i}`) * 5}%`);
  for (let i = 4; i >= 0; i--) pts.push(`${random(`${seed}l${i}`) * 1.2}% ${(i / 4) * 100}%`);
  return (
    <div style={{ ...fill }}>
      <div style={{ position: "absolute", right: 0, top: 0, height: full.h, width: w, filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.65))", transform: `rotate(${item.tilt ? 0 : -1.2}deg)` }}>
        <div style={{ ...fill, background: bg, clipPath: `polygon(${pts.join(",")})` }} />
      </div>
      <div style={{ position: "absolute", right: fs * 0.65, top: fs * 0.35, direction: "rtl", textAlign: "right", fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: fs, lineHeight: 1.32, color: "#fff", whiteSpace: "nowrap", textShadow: "0 4px 0 rgba(0,0,0,0.28), 0 6px 14px rgba(0,0,0,0.45)" }}>
        {partial.map((p, i) => (
          <div key={i}>{p || " "}</div>
        ))}
      </div>
    </div>
  );
};

// ---------- disc: white number in a glossy brand disc with a white rim.
export const DiscLeaf: React.FC<{ item: Disc; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const doneAt = at(ctx, item.doneAt, NEVER);
  const done = ctx.frame >= doneAt;
  const glow = 0.5 + 0.5 * Math.sin(local / 8);
  const bg = done || item.tone === "orange" ? `radial-gradient(circle at 35% 28%, #FFD08A 0%, ${colors.brandOrange} 38%, #C9581A 100%)` : `radial-gradient(circle at 35% 28%, #F48ACB 0%, #C93795 40%, #5B2C8A 100%)`;
  return (
    <div style={{ ...fill, borderRadius: "50%", background: bg, border: "10px solid #fff", boxShadow: `0 24px 40px rgba(0,0,0,0.7), 0 0 ${40 + glow * 30}px rgba(${done ? "251,159,42" : colors.brandGlow},0.6), inset 0 -14px 26px rgba(0,0,0,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "12%", top: "6%", width: "60%", height: "34%", borderRadius: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))" }} />
      <span style={{ fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: DISC_SIZE[item.size ?? "m"] * 0.6, lineHeight: 1, color: "#fff", textShadow: "0 8px 14px rgba(0,0,0,0.5)", marginTop: DISC_SIZE[item.size ?? "m"] * 0.04 }}>{item.text}</span>
    </div>
  );
};

// ---------- xstamp: two rough brush strokes stamped in (each ~4f).
export const XStampLeaf: React.FC<{ item: XStamp; ctx: Ctx; local: number }> = ({ item, local }) => {
  const c = item.tone === "orange" ? colors.brandOrange : colors.red;
  const s1 = interpolate(local, [0, 4], [0, 1], ease);
  const s2 = interpolate(local, [4, 8], [0, 1], ease);
  const hit = interpolate(local, [0, 3, 8, 12], [1.35, 1, 1.12, 1], clamp);
  const stroke = (d: string, p: number, key: string) => (
    <g key={key}>
      <path d={d} fill="none" stroke={c} strokeWidth={46} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} style={{ filter: `drop-shadow(0 0 16px ${c}) drop-shadow(0 10px 10px rgba(0,0,0,0.6))` }} />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${p * 0.7} 2`} transform="translate(-6,-8)" />
    </g>
  );
  return (
    <svg viewBox="0 0 400 400" style={{ ...fill, width: "100%", height: "100%", overflow: "visible", transform: `scale(${hit})` }}>
      {stroke("M 60 70 C 150 150, 230 230, 340 335", s1, "a")}
      {stroke("M 335 60 C 250 140, 160 240, 70 340", s2, "b")}
    </svg>
  );
};

// ---------- arrow: a hand-drawn curve that draws on, holds, and redraws every ~40f.
export const ArrowLeaf: React.FC<{ item: Arrow; ctx: Ctx; local: number }> = ({ item, local }) => {
  const c = item.tone === "magenta" ? colors.red : colors.brandOrange;
  const cyc = item.loop === false ? local : local % 42;
  const p = interpolate(cyc, [0, 9], [0, 1], ease);
  const fade = item.loop === false ? 1 : interpolate(cyc, [30, 40], [1, 0], clamp);
  const head = interpolate(cyc, [7, 11], [0, 1], ease);
  return (
    <svg viewBox="0 0 300 200" style={{ ...fill, width: "100%", height: "100%", overflow: "visible", transform: `rotate(${item.rotate ?? 0}deg) scaleX(${item.flip ? -1 : 1})`, opacity: fade }}>
      <path d="M 20 170 C 60 40, 170 30, 255 70" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} style={{ filter: `drop-shadow(0 0 10px ${c})` }} />
      <path d="M 210 40 L 262 72 L 222 116" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - head} style={{ filter: `drop-shadow(0 0 10px ${c})` }} />
    </svg>
  );
};

// ---------- multiply: one icon in the middle; copies pop from dots into a grid (centre first, then outwards).
export const MultiplyLeaf: React.FC<{ item: Multiply; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const cols = item.cols ?? 6;
  const rows = Math.ceil(item.count / cols);
  const cell = item.cell ?? 150;
  const base = startOf(ctx, item.word);
  const spreadAt = at(ctx, item.spreadAt, base + 8) - base;
  const grayAt = at(ctx, item.grayAt, NEVER);
  const pickAt = at(ctx, item.pickAt, NEVER);
  const pick = item.pick ?? Math.floor(item.count / 2);
  const gray = interpolate(ctx.frame, [grayAt, grayAt + 8], [0, 1], clamp);
  const pk = spring({ frame: ctx.frame - pickAt, fps: ctx.fps, config: SPRINGS.slam });
  const src = item.icon && ctx.assets.icons.includes(item.icon) ? iconSrc(item.icon) : null;
  const ccx = (cols - 1) / 2;
  const ccy = (rows - 1) / 2;
  const order = Array.from({ length: item.count }, (_, i) => i).sort((a, b) => Math.hypot((a % cols) - ccx, Math.floor(a / cols) - ccy) - Math.hypot((b % cols) - ccx, Math.floor(b / cols) - ccy));
  const centre = order[0];
  return (
    <div style={{ ...fill }}>
      {Array.from({ length: item.count }).map((_, i) => {
        const r = order.indexOf(i);
        const t0 = i === centre ? 0 : spreadAt + r * 1.2;
        if (local < t0) return null;
        const k = spring({ frame: local - t0, fps: ctx.fps, config: SPRINGS.pop });
        const isPick = i === pick && ctx.frame >= pickAt;
        // Before the spread the centre copy sits big in the middle, then shrinks into its cell.
        const sk = spring({ frame: local - spreadAt, fps: ctx.fps, config: SPRINGS.layout });
        const lone = i === centre ? interpolate(sk, [0, 1], [2.6, 1]) : 1;
        const x = (i % cols) * cell + cell / 2;
        const y = Math.floor(i / cols) * cell + cell / 2;
        const cxv = i === centre ? interpolate(sk, [0, 1], [(cols * cell) / 2, x]) : x;
        const cyv = i === centre ? interpolate(sk, [0, 1], [(rows * cell) / 2, y]) : y;
        const dim = isPick ? 0 : gray;
        const sc = Math.min(1.15, k) * lone * (isPick ? 1 + pk * 0.55 : 1) * (ctx.frame >= pickAt && !isPick ? 0.85 : 1);
        return (
          <div key={i} style={{ position: "absolute", left: cxv - cell * 0.42, top: cyv - cell * 0.42, width: cell * 0.84, height: cell * 0.84, transform: `scale(${sc})`, opacity: ctx.frame >= pickAt && !isPick ? 0.35 : 1, zIndex: isPick ? 5 : 1, filter: `grayscale(${dim}) brightness(${1 - dim * 0.4}) ${isPick ? `drop-shadow(0 0 26px ${colors.brandOrange})` : ""}` }}>
            {item.tile ? (
              <div style={{ ...fill, borderRadius: 18, background: isPick ? `linear-gradient(160deg, #FFB24D, ${colors.brandOrange})` : "linear-gradient(160deg, #6a3aa0, #3a1d5e)", border: "3px solid rgba(255,255,255,0.4)", boxShadow: "0 10px 18px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 0, height: 0, borderTop: `${cell * 0.12}px solid transparent`, borderBottom: `${cell * 0.12}px solid transparent`, borderLeft: `${cell * 0.2}px solid #fff`, marginLeft: cell * 0.05 }} />
              </div>
            ) : src ? (
              <Img src={src} style={{ width: "100%", height: "100%", objectFit: "contain", filter: item.icon && is3d(item.icon) ? SOFT3D : STICKER }} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ---------- checklist: rows with a number disc; the row being said is sharp, the rest blurred; all light up on doneAt.
export const ChecklistLeaf: React.FC<{ item: Checklist; ctx: Ctx; local: number }> = ({ item, ctx }) => {
  const doneAt = at(ctx, item.doneAt, NEVER);
  const ats = item.items.map((r) => at(ctx, r.word, startOf(ctx, item.word)));
  const current = ats.reduce((c, f, i) => (ctx.frame >= f ? i : c), -1);
  const allOn = ctx.frame >= doneAt;
  return (
    <div style={{ ...fill, direction: "rtl", display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
      {item.items.map((r, i) => {
        if (ctx.frame < ats[i]) return <div key={i} style={{ height: 130 }} />;
        const k = spring({ frame: ctx.frame - ats[i], fps: ctx.fps, config: SPRINGS.pop });
        const focus = allOn || i === current;
        const lit = spring({ frame: ctx.frame - doneAt, fps: ctx.fps, config: SPRINGS.pop });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 34, height: item.row ?? 130, opacity: Math.min(1, k) * (focus ? 1 : 0.45), filter: focus ? undefined : "blur(5px)", transform: `translateX(${(1 - Math.min(1, k)) * -80}px) scale(${focus ? 1 : 0.92})`, transformOrigin: "right center" }}>
            <div style={{ width: 112, height: 112, flexShrink: 0, borderRadius: "50%", border: "7px solid #fff", background: allOn ? `radial-gradient(circle at 35% 28%, #FFD08A, ${colors.brandOrange} 45%, #C9581A)` : `radial-gradient(circle at 35% 28%, #F48ACB, #C93795 45%, #5B2C8A)`, boxShadow: allOn ? `0 0 ${20 + lit * 20}px ${colors.brandOrange}` : "0 10px 18px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 70, color: "#fff" }}>{i + 1}</div>
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: item.fs ?? 62, color: allOn ? colors.green : "#fff", textShadow: "0 6px 14px rgba(0,0,0,0.8)", whiteSpace: "nowrap" }}>{r.text}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- fly3d: words scattered in depth; the camera flies forward through them and the last one lands centre.
export const Fly3DLeaf: React.FC<{ item: Fly3D; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const ws = item.words;
  const base = startOf(ctx, item.word);
  const wf = wordFrames(ctx, base, ws.length, item.at, 10);
  const last = ws.length - 1;
  // Camera z follows the spoken word: each word sits at z = -i*900, the camera sits 700 in front of the current one.
  const prog = wf.reduce((p, f, i) => (ctx.frame >= f ? i + Math.min(1, (ctx.frame - f) / 8) - 1 : p), -0.6);
  const camZ = interpolate(prog, [-1, last], [-900 - 300, last * 900], clamp);
  const rotY = Math.sin(local / 25) * 10;
  return (
    <div style={{ ...fill, perspective: 900, overflow: "visible" }}>
      <div style={{ ...fill, transformStyle: "preserve-3d", transform: `rotateY(${rotY}deg) translateZ(${camZ}px)` }}>
        {ws.map((w, i) => {
          const angle = i === last ? 0 : (random(`fly${i}`) - 0.5) * 50;
          const x = i === last ? 0 : (random(`flx${i}`) - 0.5) * 900;
          const y = i === last ? 0 : (random(`fly-${i}`) - 0.5) * 380;
          const z = -i * 900;
          const dist = Math.abs(camZ + z);
          const vis = ctx.frame >= wf[i] - 6 ? 1 : 0;
          const blur = Math.min(14, Math.max(0, dist - 500) / 70);
          return (
            <div key={i} style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${angle}deg) rotateZ(${angle * 0.2}deg)`, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: i === last ? 150 : 130, color: i === last && item.tone ? colors.green : "#fff", whiteSpace: "nowrap", direction: "rtl", opacity: vis, filter: blur > 0.5 ? `blur(${blur}px)` : undefined, textShadow: `0 10px 24px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.25)` }}>
              {w}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- mc-claude: the Claude Code app window. Dark UI (like the real app), Claude's spark in its colour.
const Spark: React.FC<{ size: number; spin?: number }> = ({ size, spin = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${spin}deg)` }}>
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r = i % 2 ? 34 : 46;
      return <line key={i} x1={50} y1={50} x2={50 + Math.cos(a) * r} y2={50 + Math.sin(a) * r} stroke={CLAUDE} strokeWidth={11} strokeLinecap="round" />;
    })}
  </svg>
);

export const ClaudeMC: React.FC<{ item: McClaude; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const typeAt = at(ctx, item.typeAt, base + 6);
  const typeEnd = Math.max(typeAt + 1, at(ctx, item.typeEnd, typeAt + item.prompt.length * 2));
  const sendAt = at(ctx, item.sendAt, typeEnd + 6);
  const typed = Math.floor(interpolate(ctx.frame, [typeAt, typeEnd], [0, item.prompt.length], clamp));
  const sent = ctx.frame >= sendAt;
  const lines = item.lines.map((l, i) => ({ ...l, f: at(ctx, l.word, sendAt + 10 + i * 18) }));
  const zoomAt = at(ctx, item.zoomAt, NEVER);
  const zk = spring({ frame: ctx.frame - zoomAt, fps: ctx.fps, config: SPRINGS.layout });
  const caret = Math.floor(local / 8) % 2 === 0;
  const pressK = interpolate(ctx.frame, [sendAt - 2, sendAt, sendAt + 4], [1, 0.82, 1], clamp);
  const W = 1500;
  const H = 860;
  const mono = "Consolas, 'Cascadia Mono', monospace";
  return (
    <div style={{ ...fill, transform: `scale(${1 + zk * (item.zoom ?? 0.25)})`, transformOrigin: item.zoomOrigin ?? "50% 85%" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, borderRadius: 26, background: "#1f1e1d", border: "2px solid rgba(255,255,255,0.12)", boxShadow: `0 40px 90px rgba(0,0,0,0.75), 0 0 70px rgba(${colors.brandGlow},0.28)`, overflow: "hidden" }}>
        {/* Title bar */}
        <div style={{ height: 64, background: "#2a2826", display: "flex", alignItems: "center", padding: "0 26px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c, opacity: 0.9 }} />
          ))}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginRight: 60 }}>
            <Spark size={30} />
            <span style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 26, color: "#d6d1cb", direction: "rtl" }}>Claude Code · {item.folder ?? "نظام المونتاج يوتيوب"}</span>
          </div>
        </div>
        {/* Conversation */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 100, bottom: 190, display: "flex", flexDirection: "column", gap: 22, direction: "rtl" }}>
          {sent ? (
            <div style={{ alignSelf: "flex-start", padding: "16px 30px", borderRadius: 18, background: "#383532", fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 40, color: "#f2eee9", transform: `translateY(${(1 - Math.min(1, spring({ frame: ctx.frame - sendAt, fps: ctx.fps, config: SPRINGS.pop }))) * 120}px)` }}>{item.prompt}</div>
          ) : null}
          {lines.map((l, i) => {
            if (ctx.frame < l.f) return null;
            const k = spring({ frame: ctx.frame - l.f, fps: ctx.fps, config: SPRINGS.pop });
            const next = lines[i + 1]?.f ?? (l.doneAt !== undefined ? at(ctx, l.doneAt, NEVER) : NEVER);
            const done = ctx.frame >= next - 2 || l.done === true;
            const spin = (ctx.frame - l.f) * 14;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, k), transform: `translateX(${(1 - Math.min(1, k)) * -40}px)` }}>
                <div style={{ width: 46, height: 46, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {done ? (
                    <svg width={44} height={44} viewBox="0 0 44 44">
                      <circle cx={22} cy={22} r={20} fill={colors.brandOrange} />
                      <path d="M 12 23 L 19 30 L 32 15" fill="none" stroke="#1f1e1d" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Spark size={42} spin={spin} />
                  )}
                </div>
                <span style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 38, color: done ? "#f2eee9" : "#bdb6ae" }}>{l.text}</span>
                {l.detail ? <span style={{ fontFamily: mono, fontSize: 28, color: "#8f877e", direction: "ltr" }}>{l.detail}</span> : null}
                {l.bar && !done ? (
                  <div style={{ width: 260, height: 14, borderRadius: 7, background: "#383532", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, ((ctx.frame - l.f) / Math.max(1, next - l.f)) * 100)}%`, height: "100%", background: colors.brandGradient }} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {/* Prompt box */}
        <div style={{ position: "absolute", left: 50, right: 50, bottom: 40, height: 120, borderRadius: 22, background: "#2a2826", border: `2px solid ${ctx.frame >= typeAt && !sent ? CLAUDE : "rgba(255,255,255,0.14)"}`, boxShadow: ctx.frame >= typeAt && !sent ? `0 0 30px ${CLAUDE}55` : undefined, display: "flex", alignItems: "center", padding: "0 30px", gap: 20, direction: "rtl" }}>
          <div style={{ flex: 1, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 44, color: sent ? "#7c756e" : "#f2eee9", whiteSpace: "nowrap" }}>
            {sent ? "اكتب رسالة…" : item.prompt.slice(0, typed)}
            {!sent && ctx.frame >= typeAt && caret ? <span style={{ color: CLAUDE }}>|</span> : null}
          </div>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: typed > 0 && !sent ? CLAUDE : "#4a4642", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pressK})` }}>
            <svg width={36} height={36} viewBox="0 0 36 36">
              <path d="M 18 30 L 18 8 M 8 17 L 18 7 L 28 17" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- mc-folder: a file window; the video file drops in on `fileAt` and gets selected.
export const FolderMC: React.FC<{ item: McFolder; ctx: Ctx; local: number }> = ({ item, ctx }) => {
  const fileAt = at(ctx, item.fileAt, startOf(ctx, item.word) + 12);
  const fk = spring({ frame: ctx.frame - fileAt, fps: ctx.fps, config: SPRINGS.pop });
  const sel = ctx.frame >= fileAt + 10;
  const thumb = item.thumb ? assetFor(ctx.assets, item.thumb) : null;
  return (
    <div style={{ ...fill, borderRadius: 26, background: "#FBF7FF", boxShadow: `0 40px 90px rgba(0,0,0,0.75), 0 0 60px rgba(${colors.brandGlow},0.3)`, overflow: "hidden", direction: "rtl" }}>
      <div style={{ height: 76, background: "#efe6fb", display: "flex", alignItems: "center", padding: "0 30px", gap: 18, borderBottom: "2px solid #e1d3f2" }}>
        <svg width={46} height={38} viewBox="0 0 46 38">
          <path d="M 2 6 Q 2 2 6 2 L 17 2 L 21 7 L 40 7 Q 44 7 44 11 L 44 33 Q 44 36 40 36 L 6 36 Q 2 36 2 33 Z" fill={colors.brandOrange} />
        </svg>
        <span style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 38, color: "#1d0b33" }}>{item.title}</span>
      </div>
      <div style={{ padding: 40, display: "flex", gap: 40, flexWrap: "wrap" }}>
        {(item.others ?? []).map((o, i) => (
          <div key={i} style={{ width: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: 0.55 }}>
            <div style={{ width: 210, height: 130, borderRadius: 14, background: "#d9cdea" }} />
            <span style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 24, color: "#5a4a72" }}>{o}</span>
          </div>
        ))}
        {ctx.frame >= fileAt ? (
          <div style={{ width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `scale(${Math.max(0, fk)})`, padding: 12, borderRadius: 18, background: sel ? "rgba(160,78,215,0.16)" : "transparent", border: sel ? `3px solid ${colors.brandPurple}` : "3px solid transparent" }}>
            <div style={{ width: 270, height: 152, borderRadius: 14, overflow: "hidden", background: "#1b1426", position: "relative", boxShadow: "0 10px 20px rgba(0,0,0,0.35)" }}>
              {thumb ? thumb.kind === "video" ? <OffthreadVideo src={staticFile(thumb.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Img src={staticFile(thumb.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              <div style={{ position: "absolute", left: 10, bottom: 8, padding: "2px 10px", borderRadius: 6, background: "rgba(0,0,0,0.7)", fontFamily: NUMBER_FONT_FAMILY, fontSize: 22, color: "#fff" }}>MP4</div>
            </div>
            <span style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 25, color: "#1d0b33", textAlign: "center" }}>{item.filename}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ---------- mc-player: a clip of this video inside a branded player with a running progress bar.
export const PlayerMC: React.FC<{ item: McPlayer; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const a = assetFor(ctx.assets, item.file);
  const dur = (a?.durationS ?? 4) * ctx.fps;
  const prog = Math.min(1, local / dur);
  return (
    <div style={{ ...fill, borderRadius: 26, background: "#0d0a12", border: `4px solid rgba(255,255,255,0.18)`, boxShadow: `0 40px 90px rgba(0,0,0,0.8), 0 0 80px rgba(${colors.brandGlow},0.45)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 64, overflow: "hidden" }}>
        {a ? a.kind === "video" ? <OffthreadVideo src={staticFile(a.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Img src={staticFile(a.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#16121d", display: "flex", alignItems: "center", gap: 22, padding: "0 26px" }}>
        <div style={{ width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: "22px solid #fff" }} />
        <div style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", background: colors.brandGradient }} />
        </div>
        <span style={{ fontFamily: NUMBER_FONT_FAMILY, fontSize: 28, color: "#fff" }}>{item.label ?? ""}</span>
      </div>
    </div>
  );
};

// Shock rings behind an item (YouTubeSkool #25/#48): two glowing rings expand past the frame.
export const Burst: React.FC<{ local: number; size: number; tone?: string }> = ({ local, size, tone }) => {
  const c = tone === "magenta" ? colors.red : colors.brandOrange;
  return (
    <>
      {[0, 9].map((d) => {
        const t = (local - d) / 22;
        if (t < 0 || t > 1) return null;
        const s = interpolate(t, [0, 1], [0.6, 3.4]);
        return <div key={d} style={{ position: "absolute", left: "50%", top: "50%", width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: "50%", border: `${10 * (1 - t) + 2}px solid ${c}`, boxShadow: `0 0 40px ${c}, inset 0 0 30px ${c}`, opacity: 1 - t, transform: `scale(${s})` }} />;
      })}
    </>
  );
};
