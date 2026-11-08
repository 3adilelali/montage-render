// Video-specific motion cards (2026-10-12, «4 مستويات من البرومبت»), same light-card system as MotionCards.tsx.
//   mc-code    — a code editor that types real-looking lines with syntax colours ("Claude wrote it as code")
//   mc-post    — a social post claiming "one prompt" with likes ticking up
//   mc-levels  — a 4-step staircase; steps light up to `active`, each with a label and an optional result tag
//   mc-doc     — a brief document that builds section by section on cue words (role / banned list / swatches / storyboard)
//   mc-rhythm  — a trailer timeline: cut blocks, title slams, a playhead sweeping across on the beat
//   mc-frames  — a film strip: frames pop in one by one (video cut into stills)
import { Easing, Img, interpolate, spring, staticFile } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { clamp } from "./anim";
import { assetFor, type Ctx, startOf } from "./layout";
import type { McCode, McDoc, McFrames, McLevels, McPost, McRhythm } from "./types";
import { iconSrc } from "./VisualLeaf";

const fill = { position: "absolute", inset: 0 } as const;
const C = { card: "#FBF7FF", ink: "#1d0b33", soft: "#8a7aa6", line: "#e9def6", purple: colors.brandPurple, orange: colors.brandOrange, bad: colors.red, deep: colors.brandDeep };
const cardStyle: React.CSSProperties = { ...fill, background: C.card, borderRadius: 34, boxShadow: `0 30px 70px rgba(10,0,25,0.7), 0 0 46px rgba(${colors.brandGlow},0.35)`, overflow: "hidden" };
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const mono = "Consolas, 'Courier New', monospace";
const rel = (ctx: Ctx, base: number, w: number | null | undefined, fb: number) => (w == null ? fb : startOf(ctx, w) - base);

// ---------- Code editor: dark window, lines type one after another with token colours.
const tokenColor = (tok: string) =>
  /^(const|export|return|import|from|function|=>)$/.test(tok) ? "#c792ea" : /^["'`].*["'`]?$/.test(tok) ? "#ffcb6b" : /^\d/.test(tok) ? "#f78c6c" : /^[A-Z]/.test(tok) ? "#82aaff" : /^[<>{}()[\];,.=/]+$/.test(tok) ? "#89ddff" : "#e9e4f2";
export const CodeMC: React.FC<{ item: McCode; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const total = item.lines.join("\n").length;
  const end = item.end !== undefined ? Math.max(20, startOf(ctx, item.end) - base) : 8 + total * 0.55;
  const shown = Math.floor(interpolate(local, [6, end], [0, total], clamp));
  const starts = item.lines.reduce<number[]>((acc, ln, i) => [...acc, i === 0 ? 0 : acc[i - 1] + item.lines[i - 1].length + 1], []);
  const fs = item.fontSize ?? 30;
  return (
    <div style={{ ...fill, borderRadius: 26, background: "#140f1d", boxShadow: `0 30px 70px rgba(0,0,0,0.85), 0 0 46px rgba(${colors.brandGlow},0.35), 0 0 0 2px rgba(255,255,255,0.08)`, overflow: "hidden" }}>
      <div style={{ height: 54, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", background: "#1d1629", direction: "ltr" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, filter: "saturate(0.6)" }} />)}
        <span style={{ marginLeft: 16, fontFamily: mono, fontSize: 24, color: "#9d93b3" }}>{item.filename ?? "Video.tsx"}</span>
      </div>
      <div style={{ padding: "22px 30px", direction: "ltr", fontFamily: mono, fontSize: fs, lineHeight: 1.55, whiteSpace: "pre" }}>
        {item.lines.map((ln, i) => {
          const take = Math.max(0, Math.min(ln.length, shown - starts[i]));
          const active = shown >= starts[i] && shown <= starts[i] + ln.length;
          const caret = active && Math.floor(local / 7) % 2 === 0;
          return (
            <div key={i} style={{ display: "flex", height: fs * 1.55, opacity: shown >= starts[i] ? 1 : 0.25 }}>
              <span style={{ width: 46, color: "#5c536e", textAlign: "right", marginRight: 22 }}>{i + 1}</span>
              <span>
                {ln.slice(0, take).split(/(\s+|[<>{}()[\];,.=/]+)/).map((t, j) => <span key={j} style={{ color: tokenColor(t) }}>{t}</span>)}
                {caret ? <span style={{ color: C.orange }}>▍</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Social post: avatar, handle, a big claim, then a media placeholder and a like counter that climbs.
export const POST_ZOOM = 1.35;
export const PostMC: React.FC<{ item: McPost; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const likes = Math.round(interpolate(local, [10, 50], [0, item.likes ?? 48200], ease));
  const a = assetFor(ctx.assets, item.file);
  return (
    // Drawn at 760px wide and scaled up by POST_ZOOM (layout.ts reserves the scaled size).
    <div style={{ position: "absolute", left: 0, top: 0, width: 760, height: a ? 560 : 330, transform: `scale(${POST_ZOOM})`, transformOrigin: "0 0" }}>
    <div style={{ ...cardStyle, direction: "ltr" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "26px 32px 10px" }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: colors.brandGradient }} />
        <div>
          <div style={{ fontFamily: "Inter, Arial", fontWeight: 800, fontSize: 30, color: C.ink }}>{item.name ?? "AI Creator"} <span style={{ color: C.purple }}>✔</span></div>
          <div style={{ fontFamily: "Inter, Arial", fontSize: 24, color: C.soft }}>{item.handle ?? "@ai.motion"}</div>
        </div>
      </div>
      <div style={{ padding: "6px 32px 16px", fontFamily: "Inter, Arial", fontWeight: 800, fontSize: 40, color: C.ink, lineHeight: 1.25 }}>{item.text}</div>
      {a ? (
        <div style={{ margin: "0 32px", height: 250, borderRadius: 20, overflow: "hidden", background: "#120d1b", position: "relative" }}>
          <Img src={staticFile(a.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 40, padding: "18px 34px", fontFamily: NUMBER_FONT_FAMILY, fontSize: 34, fontWeight: 700, color: C.soft }}>
        <span style={{ color: C.bad }}>♥ {likes.toLocaleString("en-US")}</span>
        <span>↻ {Math.round(likes / 9).toLocaleString("en-US")}</span>
      </div>
    </div>
    </div>
  );
};

// ---------- Levels: a staircase of 4 steps rising right→left (RTL). Steps up to `active` glow; `results` tag under each.
export const LevelsMC: React.FC<{ item: McLevels; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const N = item.labels.length;
  const W = 1500;
  const stepW = W / N - 24;
  return (
    <div style={{ ...fill, direction: "rtl", display: "flex", alignItems: "flex-end", gap: 24 }}>
      {item.labels.map((l, i) => {
        const at = rel(ctx, base, item.at?.[i], i * 6);
        const k = spring({ frame: local - at, fps: ctx.fps, config: SPRINGS.pop });
        const on = i < (item.active ?? N) && local >= at;
        const cur = i === (item.active ?? N) - 1;
        const h = 150 + i * 95;
        const res = item.results?.[i];
        const resAt = rel(ctx, base, item.resultsAt?.[i], at + 10);
        const rk = interpolate(local, [resAt, resAt + 8], [0, 1], ease);
        return (
          <div key={i} style={{ width: stepW, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, transform: `translateY(${(1 - Math.min(1, k)) * 60}px)`, opacity: Math.min(1, Math.max(0, k)) }}>
            {res ? <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 40, color: cur || item.active === undefined ? C.orange : "#fff", opacity: rk, textShadow: "0 4px 10px rgba(0,0,0,0.85)", whiteSpace: "nowrap" }}>{res}</div> : null}
            <div style={{ width: "100%", height: h, borderRadius: "22px 22px 8px 8px", background: on ? (cur ? colors.brandGradient : "linear-gradient(180deg,#4b3466,#2a1d3b)") : "rgba(255,255,255,0.06)", boxShadow: cur ? `0 0 40px rgba(${colors.brandGlow},0.8)` : "0 18px 30px rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 18 }}>
              <div style={{ fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 72, color: "#fff", lineHeight: 1 }}>{i + 1}</div>
              <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 42, color: "#fff", marginTop: 8 }}>{l}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Brief document: sections build on cue words. kinds: text | ban (✕ list) | swatches (colour chips + font sample) | board (storyboard frames + approve ✓)
export const DocMC: React.FC<{ item: McDoc; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  return (
    <div style={{ ...cardStyle, direction: "rtl", padding: "28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: "#D97757" }} />
        <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 40, color: C.ink }}>{item.title ?? "البريف"}</div>
      </div>
      {item.sections.map((s, i) => {
        const at = rel(ctx, base, s.word, 8 + i * 14);
        const k = interpolate(local, [at, at + 8], [0, 1], ease);
        if (local < at) return null;
        return (
          <div key={i} style={{ opacity: k, transform: `translateY(${(1 - k) * 20}px)`, background: "#fff", border: `2px solid ${C.line}`, borderRadius: 20, padding: "14px 22px" }}>
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, color: C.purple, marginBottom: 8 }}>{s.head}</div>
            {s.kind === "text" ? <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 32, color: C.ink, lineHeight: 1.4 }}>{s.items?.[0]}</div> : null}
            {s.kind === "ban" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {(s.items ?? []).map((b, j) => {
                  const bk = interpolate(local, [at + 4 + j * 5, at + 10 + j * 5], [0, 1], ease);
                  return <div key={j} style={{ opacity: bk, display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 14, background: "#fdeef7", fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 28, color: C.bad }}><span style={{ fontFamily: "Arial" }}>✕</span>{b}</div>;
                })}
              </div>
            ) : null}
            {s.kind === "swatches" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {(s.colors ?? [C.orange, colors.brandMagenta, C.purple, C.deep]).map((c, j) => {
                  const ck = spring({ frame: local - at - 4 - j * 3, fps: ctx.fps, config: SPRINGS.pop });
                  return <div key={j} style={{ width: 58, height: 58, borderRadius: 16, background: c, transform: `scale(${Math.max(0, ck)})`, boxShadow: "0 6px 12px rgba(0,0,0,0.2)" }} />;
                })}
                <div style={{ marginRight: 20, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 44, color: C.ink }}>Aa</div>
                <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 28, color: C.soft }}>{s.items?.[0]}</div>
              </div>
            ) : null}
            {s.kind === "board" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {[0, 1, 2, 3].map((j) => {
                  const fk = interpolate(local, [at + 4 + j * 4, at + 10 + j * 4], [0, 1], ease);
                  return (
                    <div key={j} style={{ width: 120, height: 72, borderRadius: 12, background: `linear-gradient(135deg, ${C.deep}, ${C.purple})`, opacity: fk, transform: `scale(${0.7 + 0.3 * fk})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: NUMBER_FONT_FAMILY, fontWeight: 800, fontSize: 30, color: "#fff" }}>{j + 1}</div>
                  );
                })}
                {(() => {
                  const ok = rel(ctx, base, s.approveAt, at + 30);
                  const okk = spring({ frame: local - ok, fps: ctx.fps, config: SPRINGS.slam });
                  return local >= ok ? <div style={{ marginRight: 16, width: 64, height: 64, borderRadius: 32, background: C.orange, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontFamily: "Arial", transform: `scale(${okk})` }}>✓</div> : null;
                })()}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Rhythm: a timeline of cut blocks of varying length; titles slam onto it; the playhead sweeps right→left in time.
export const RhythmMC: React.FC<{ item: McRhythm; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const cuts = item.cuts ?? [3, 2, 1, 1, 4, 1, 1, 2, 5, 1, 1, 1, 3];
  const total = cuts.reduce((a, b) => a + b, 0);
  const W = 1400;
  const play = interpolate(local, [6, item.sweep ?? 90], [0, 1], clamp);
  let x = 0;
  return (
    <div style={{ ...cardStyle, background: "#120d1b", direction: "ltr" }}>
      <div style={{ position: "absolute", left: 50, top: 30, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 38, color: "#fff", direction: "rtl", right: 50, textAlign: "right" }}>{item.title ?? "الإيقاع"}</div>
      <div style={{ position: "absolute", left: 50, top: 120, width: W, height: 120 }}>
        {cuts.map((c, i) => {
          const w = (c / total) * W;
          const left = x;
          x += w;
          const k = interpolate(local, [i * 2, i * 2 + 6], [0, 1], ease);
          const lit = play * W >= left;
          const slam = (item.titles ?? []).find((t) => t.at === i);
          return (
            <div key={i} style={{ position: "absolute", left: left + 3, width: w - 6, top: 0, height: 120, borderRadius: 12, opacity: k, background: lit ? (c === 1 ? C.orange : `linear-gradient(180deg, ${C.purple}, ${C.deep})`) : "rgba(255,255,255,0.08)", boxShadow: lit && c === 1 ? `0 0 20px ${C.orange}` : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {slam && lit ? <span style={{ fontFamily: "Impact, 'Barlow Semi Condensed', sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: 1 }}>{slam.text}</span> : null}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: play * W - 3, top: -20, width: 6, height: 160, borderRadius: 3, background: "#fff", boxShadow: "0 0 16px #fff" }} />
      </div>
      <div style={{ position: "absolute", left: 50, top: 270, width: W, display: "flex", justifyContent: "space-between", direction: "rtl", fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, color: "#b8a9d4" }}>
        {(item.legend ?? ["قطعات سريعة", "عنوان بينزل", "هدوء قبل الذروة"]).map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
};

// ---------- Film strip: sprocket-holed strip; frames (images from العناصر, or icons) pop in one by one.
export const FramesMC: React.FC<{ item: McFrames; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const N = item.frames.length;
  const fw = 250;
  const holes = Array.from({ length: Math.ceil((N * (fw + 20)) / 44) + 1 });
  return (
    <div style={{ ...fill, background: "#0d0a12", borderRadius: 18, boxShadow: `0 30px 60px rgba(0,0,0,0.85), 0 0 40px rgba(${colors.brandGlow},0.3)`, overflow: "hidden", direction: "rtl" }}>
      {[8, 254].map((top) => (
        <div key={top} style={{ position: "absolute", top, left: 0, right: 0, height: 26, display: "flex", gap: 20, padding: "0 12px" }}>
          {holes.map((_, i) => <div key={i} style={{ width: 24, height: 26, borderRadius: 5, background: "#2a2433" }} />)}
        </div>
      ))}
      <div style={{ position: "absolute", top: 44, bottom: 44, left: 20, right: 20, display: "flex", gap: 20, alignItems: "center" }}>
        {item.frames.map((f, i) => {
          const k = spring({ frame: local - 4 - i * 4, fps: ctx.fps, config: SPRINGS.pop });
          const a = assetFor(ctx.assets, f);
          const src = a ? staticFile(a.src) : f.includes(":") && ctx.assets.icons.includes(f) ? iconSrc(f) : null;
          return (
            <div key={i} style={{ width: fw, height: 160, borderRadius: 8, overflow: "hidden", background: "#1b1525", transform: `scale(${Math.max(0, k)})`, flexShrink: 0 }}>
              {src ? <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
