// Long explanatory diagrams (2026-11-04, video «80% من كلود»). Adil: drawings that stay on screen and explain, not 2-second flashes.
//   mc-hub      — Claude in the centre, app logos pop around it, links draw and data pulses travel; `manyAt` floods the
//                 background with hundreds of faint app tiles («آلاف التطبيقات»); `task` types a request in the centre.
//   mc-devices  — browser / phone / desktop appear one by one; `pickAt` lifts the desktop, file chips fly out of it, `badge` crowns it.
//   mc-project  — a project window: instructions type in, files drop in, chats below light up «بيعرفك»; `projects` adds sibling tiles.
//   mc-prompt   — the weak one-line request gets struck, then the strong prompt builds part by part, each with a coloured tag.
//   mc-skill    — a chat line turns into a SKILL file whose steps tick in, then day after day runs stamp out of the same file.
//   mc-models   — Opus / Sonnet / Haiku cards with power + speed bars; `autoAt` drops an «تلقائي» switch that picks for you.
import { Easing, Img, interpolate, spring } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { clamp } from "./anim";
import { type Ctx, startOf } from "./layout";
import type { McDevices, McHub, McModels, McProject, McPrompt, McSkill } from "./types";
import { iconSrc, resolveVisual } from "./VisualLeaf";

const fill = { position: "absolute", inset: 0 } as const;
const C = { card: "#FBF7FF", ink: "#1d0b33", soft: "#8a7aa6", line: "#e9def6", purple: colors.brandPurple, orange: colors.brandOrange, deep: colors.brandDeep, magenta: colors.brandMagenta };
const CLAUDE = "#D97757";
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const TONE: Record<string, string> = { orange: C.orange, purple: C.purple, magenta: C.magenta, claude: CLAUDE, green: C.orange, red: C.magenta };
const tone = (t?: string) => TONE[t ?? "orange"] ?? C.orange;
const at = (ctx: Ctx, base: number, w: number | null | undefined, fb: number) => (w == null ? fb : startOf(ctx, w) - base);
const pop = (ctx: Ctx, local: number, from: number) => spring({ frame: local - from, fps: ctx.fps, config: SPRINGS.pop });
const k01 = (v: number) => Math.min(1, Math.max(0, v));
const Icon: React.FC<{ ctx: Ctx; icon?: string; file?: string; size: number }> = ({ ctx, icon, file, size }) => {
  if (file) {
    const v = resolveVisual({ file, icon }, ctx.assets);
    if (v && v.kind === "image") return <Img src={v.src} style={{ width: size, height: size, objectFit: "contain", borderRadius: size * 0.2 }} />;
  }
  return icon && ctx.assets.icons.includes(icon) ? <Img src={iconSrc(icon)} style={{ width: size, height: size, objectFit: "contain" }} /> : null;
};
const txt = (size: number, color = "#fff", weight = 900): React.CSSProperties => ({ fontFamily: FONT_FAMILY, fontWeight: weight, fontSize: size, color, direction: "rtl" });
const shadowTxt = "0 4px 12px rgba(0,0,0,0.85)";
const typed = (s: string, local: number, from: number, frames = 16) => s.slice(0, Math.floor(interpolate(local, [from, from + frames], [0, s.length], clamp)));

// Claude core: the orange tile with the logo, breathing glow.
const Core: React.FC<{ ctx: Ctx; local: number; size: number; k: number }> = ({ ctx, local, size, k }) => {
  const glow = 0.5 + 0.5 * Math.sin(local / 10);
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "#FFF6EF", border: `4px solid ${CLAUDE}`, boxShadow: `0 0 ${40 + glow * 40}px rgba(217,119,87,${0.55 + glow * 0.3}), 0 20px 50px rgba(0,0,0,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.max(0, k)})` }}>
      <Icon ctx={ctx} icon="logos:claude-icon" size={size * 0.62} />
    </div>
  );
};

// ---------- mc-hub
export const HubMC: React.FC<{ item: McHub; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const W = 1600, H = 860, cx = W / 2, cy = H / 2 + 10;
  const N = item.nodes.length;
  const inner = Math.min(N, 8);
  const coreK = pop(ctx, local, 0);
  const manyAt = item.manyAt == null ? Infinity : at(ctx, base, item.manyAt, 0);
  const many = Number.isFinite(manyAt) ? interpolate(local, [manyAt, manyAt + 40], [0, 1], ease) : 0;
  const taskAt = item.task ? at(ctx, base, item.task.word, 10) : Infinity;
  const pos = (i: number) => {
    const ring = i < inner ? 0 : 1;
    const n = ring === 0 ? inner : N - inner;
    const j = ring === 0 ? i : i - inner;
    // The outer ring leaves a gap at the bottom for the «thousands» pill / the task bubble.
    const ang = ring ? Math.PI / 2 + 0.75 + (j / Math.max(1, n - 1)) * (Math.PI * 2 - 1.5) + local * 0.0006 : -Math.PI / 2 + (j / n) * Math.PI * 2 + local * 0.0008;
    const rx = ring ? 720 : 470, ry = ring ? 340 : 245;
    return { x: cx + Math.cos(ang) * rx, y: cy + Math.sin(ang) * ry };
  };
  // Faint background tiles for «thousands».
  const dots = Array.from({ length: 220 }, (_, i) => {
    const a = i * 2.39996;
    const r = 0.35 + 0.65 * Math.sqrt((i + 1) / 220);
    return { x: cx + Math.cos(a) * r * 900, y: cy + Math.sin(a) * r * 520, d: (i / 220) * 34, hue: i % 3 };
  });
  return (
    <div style={{ ...fill }}>
      {Number.isFinite(manyAt)
        ? dots.map((d, i) => {
            const k = interpolate(local, [manyAt + d.d, manyAt + d.d + 8], [0, 1], clamp);
            if (k <= 0) return null;
            const tw = 0.25 + 0.2 * Math.sin(local / 7 + i);
            return <div key={`d${i}`} style={{ position: "absolute", left: d.x - 13, top: d.y - 13, width: 26, height: 26, borderRadius: 8, opacity: k * tw, transform: `scale(${k})`, background: [C.orange, C.purple, C.magenta][d.hue], boxShadow: "0 0 10px rgba(255,255,255,0.15)" }} />;
          })
        : null}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {item.nodes.map((n, i) => {
          const s = at(ctx, base, n.word, 6 + i * 4);
          const p = pos(i);
          const draw = interpolate(local, [s, s + 12], [0, 1], ease);
          if (draw <= 0) return null;
          const len = Math.hypot(p.x - cx, p.y - cy);
          const hot = item.focus != null && item.focus.includes(i) && local >= taskAt + 20;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={hot ? CLAUDE : "rgba(255,255,255,0.35)"} strokeWidth={hot ? 5 : 3} strokeDasharray={`${len}`} strokeDashoffset={len * (1 - draw)} strokeLinecap="round" />
              {[0, 0.5].map((o) => {
                const t = ((local - s) / 34 + o + i * 0.13) % 1;
                const dir = hot ? 1 - t : t;
                return draw >= 1 ? <circle key={o} cx={cx + (p.x - cx) * dir} cy={cy + (p.y - cy) * dir} r={hot ? 9 : 6} fill={hot ? CLAUDE : C.orange} opacity={0.9} /> : null;
              })}
            </g>
          );
        })}
      </svg>
      {item.nodes.map((n, i) => {
        const s = at(ctx, base, n.word, 6 + i * 4);
        if (local < s + 6) return null;
        const k = pop(ctx, local, s + 6);
        const p = pos(i);
        const hot = item.focus != null && item.focus.includes(i) && local >= taskAt + 20;
        const sz = i < inner ? 118 : 96;
        return (
          <div key={i} style={{ position: "absolute", left: p.x - 100, top: p.y - sz / 2, width: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: `scale(${Math.max(0, k) * (hot ? 1.12 : 1)})` }}>
            <div style={{ width: sz, height: sz, borderRadius: 30, background: "#FBF7FF", border: hot ? `4px solid ${CLAUDE}` : "3px solid rgba(255,255,255,0.6)", boxShadow: hot ? "0 0 40px rgba(217,119,87,0.9)" : "0 14px 30px rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon ctx={ctx} icon={n.icon} file={n.file} size={sz * 0.62} />
            </div>
            {n.label ? <div style={{ ...txt(30), textShadow: shadowTxt, whiteSpace: "nowrap" }}>{n.label}</div> : null}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: cx - 90, top: cy - 90 }}>
        <Core ctx={ctx} local={local} size={180} k={coreK} />
      </div>
      {item.manyLabel && Number.isFinite(manyAt) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: H - 96, display: "flex", justifyContent: "center", opacity: many, transform: `translateY(${(1 - many) * 20}px)` }}>
          <div style={{ ...txt(54), padding: "10px 34px 16px", borderRadius: 999, background: colors.brandGradient, boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>{item.manyLabel}</div>
        </div>
      ) : null}
      {item.task && local >= taskAt ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: H - 96, display: "flex", justifyContent: "center", transform: `scale(${k01(pop(ctx, local, taskAt))})` }}>
          <div style={{ ...txt(38, C.ink, 800), background: C.card, padding: "14px 30px 20px", borderRadius: "28px 28px 28px 8px", border: `4px solid ${CLAUDE}`, boxShadow: "0 18px 40px rgba(0,0,0,0.6)", maxWidth: 1100, whiteSpace: "nowrap" }}>{typed(item.task.text, local, taskAt, 20)}</div>
        </div>
      ) : null}
    </div>
  );
};

// ---------- mc-devices
const DeviceShape: React.FC<{ kind: "browser" | "phone" | "desktop"; children?: React.ReactNode; hot: boolean }> = ({ kind, children, hot }) => {
  const border = hot ? `5px solid ${CLAUDE}` : "4px solid rgba(255,255,255,0.75)";
  const glow = hot ? "0 0 60px rgba(217,119,87,0.85)" : "0 20px 40px rgba(0,0,0,0.55)";
  if (kind === "phone")
    return (
      <div style={{ width: 190, height: 360, borderRadius: 36, border, boxShadow: glow, background: "#1a0d2b", padding: 14, display: "flex", flexDirection: "column" }}>
        <div style={{ width: 60, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.4)", alignSelf: "center", marginBottom: 12 }} />
        <div style={{ flex: 1, borderRadius: 20, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      </div>
    );
  if (kind === "browser")
    return (
      <div style={{ width: 380, height: 280, borderRadius: 22, border, boxShadow: glow, background: C.card, overflow: "hidden" }}>
        <div style={{ height: 44, background: "#e9def6", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
          {[C.magenta, C.orange, C.purple].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          <div style={{ flex: 1, height: 22, borderRadius: 11, background: "#fff", marginLeft: 10 }} />
        </div>
        <div style={{ height: 236, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 460, height: 300, borderRadius: 22, border, boxShadow: glow, background: "#1a0d2b", padding: 14 }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 12, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      </div>
      <div style={{ width: 70, height: 46, background: "rgba(255,255,255,0.5)" }} />
      <div style={{ width: 220, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.6)" }} />
    </div>
  );
};

export const DevicesMC: React.FC<{ item: McDevices; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const kinds = ["browser", "phone", "desktop"] as const;
  const pickAt = item.pickAt == null ? Infinity : at(ctx, base, item.pickAt, 0);
  const pk = Number.isFinite(pickAt) ? spring({ frame: local - pickAt, fps: ctx.fps, config: SPRINGS.layout }) : 0;
  const slots = [{ x: 1250, y: 300 }, { x: 800, y: 260 }, { x: 330, y: 280 }];
  return (
    <div style={{ ...fill }}>
      {kinds.map((kind, i) => {
        const s = at(ctx, base, item.at?.[i], i * 8);
        if (local < s) return null;
        const k = pop(ctx, local, s);
        const isDesk = kind === "desktop";
        const sl = slots[i];
        // After pick: the desktop moves to centre and grows, the others shrink to the bottom corners.
        const x = isDesk ? interpolate(pk, [0, 1], [sl.x, 800]) : interpolate(pk, [0, 1], [sl.x, i === 0 ? 1430 : 1210]);
        const y = isDesk ? interpolate(pk, [0, 1], [sl.y, 330]) : interpolate(pk, [0, 1], [sl.y, 640]);
        const sc = isDesk ? interpolate(pk, [0, 1], [1, 1.25]) : interpolate(pk, [0, 1], [1, 0.42]);
        const dim = isDesk ? 1 : interpolate(pk, [0, 1], [1, 0.45]);
        return (
          <div key={kind} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${Math.max(0, k) * sc})`, opacity: dim, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <DeviceShape kind={kind} hot={isDesk && pk > 0.5}>
              <Icon ctx={ctx} icon="logos:claude-icon" size={kind === "phone" ? 70 : 96} />
            </DeviceShape>
            <div style={{ ...txt(44), textShadow: shadowTxt }}>{item.labels[i]}</div>
          </div>
        );
      })}
      {(item.chips ?? []).map((c, i) => {
        const s = at(ctx, base, c.word, 0);
        if (local < s) return null;
        const t = interpolate(local, [s, s + 16], [0, 1], ease);
        const n = (item.chips ?? []).length;
        const ang = Math.PI * (0.15 + (0.7 * i) / Math.max(1, n - 1));
        const tx = 800 - Math.cos(ang) * 620 * t;
        const ty = 300 - Math.sin(ang) * 30 * t + (i % 2 ? 140 : -120) * t;
        return (
          <div key={i} style={{ position: "absolute", left: tx, top: ty, transform: `translate(-50%,-50%) scale(${0.4 + 0.6 * t})`, opacity: t, display: "flex", alignItems: "center", gap: 14, padding: "12px 26px 16px", borderRadius: 22, background: C.card, boxShadow: "0 16px 34px rgba(0,0,0,0.6)" }}>
            <Icon ctx={ctx} icon={c.icon} size={50} />
            <div style={{ ...txt(36, C.ink) }}>{c.text}</div>
          </div>
        );
      })}
      {item.badge && local >= at(ctx, base, item.badge.word, 0) ? (
        <div style={{ position: "absolute", left: 800, top: 70, transform: `translate(-50%,0) scale(${k01(pop(ctx, local, at(ctx, base, item.badge.word, 0)))})`, display: "flex", alignItems: "center", gap: 16, padding: "14px 34px 20px", borderRadius: 999, background: "#1d0b33", border: `4px solid ${CLAUDE}`, boxShadow: "0 0 50px rgba(217,119,87,0.7)" }}>
          <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 40, color: CLAUDE }}>{">_"}</div>
          <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 50, color: "#fff" }}>{item.badge.text}</div>
        </div>
      ) : null}
    </div>
  );
};

// ---------- mc-project
export const ProjectMC: React.FC<{ item: McProject; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const k = spring({ frame: local, fps: ctx.fps, config: SPRINGS.card });
  const multiAt = item.multiAt == null ? Infinity : at(ctx, base, item.multiAt, 0);
  const mk = Number.isFinite(multiAt) ? spring({ frame: local - multiAt, fps: ctx.fps, config: SPRINGS.layout }) : 0;
  const scale = interpolate(mk, [0, 1], [1, 0.62]);
  const shiftY = interpolate(mk, [0, 1], [0, -170]);
  return (
    <div style={{ ...fill }}>
      <div style={{ position: "absolute", left: 800 - 720, top: 30, width: 1440, height: 780, transform: `translateY(${shiftY}px) scale(${Math.max(0, k) * scale})`, transformOrigin: "50% 50%" }}>
        <div style={{ ...fill, background: C.card, borderRadius: 40, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 50px rgba(${colors.brandGlow},0.35)`, overflow: "hidden", direction: "rtl" }}>
          <div style={{ height: 96, display: "flex", alignItems: "center", gap: 20, padding: "0 40px", background: "linear-gradient(100deg, #412562, #6A2FA8)" }}>
            <div style={{ fontSize: 50 }}>📁</div>
            <div style={{ ...txt(50) }}>{item.title}</div>
          </div>
          <div style={{ display: "flex", gap: 30, padding: "30px 40px", height: 420 }}>
            <div style={{ flex: 1.25, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ ...txt(34, C.purple) }}>{item.instructionsLabel ?? "التعليمات"}</div>
              {item.instructions.map((l, i) => {
                const s = at(ctx, base, l.word, 8 + i * 10);
                if (local < s) return null;
                return (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 20px 16px", borderRadius: 18, background: "#f1e8fb" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 7, background: C.orange, flexShrink: 0 }} />
                    <div style={{ ...txt(36, C.ink, 800) }}>{typed(l.text, local, s, 14)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ width: 3, background: C.line }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ ...txt(34, C.purple) }}>{item.filesLabel ?? "الملفات"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                {item.files.map((f, i) => {
                  const s = at(ctx, base, f.word, 20 + i * 8);
                  if (local < s) return null;
                  const fk = pop(ctx, local, s);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 16px", borderRadius: 18, border: `3px solid ${C.line}`, background: "#fff", transform: `translateY(${(1 - k01(fk)) * -60}px) scale(${Math.max(0, fk)})` }}>
                      {f.icon ? <Icon ctx={ctx} icon={f.icon} size={44} /> : <div style={{ fontSize: 36 }}>📄</div>}
                      <div style={{ ...txt(34, C.ink, 800) }}>{f.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, padding: "0 40px", borderTop: `3px solid ${C.line}`, paddingTop: 24 }}>
            {(item.chats ?? []).map((c, i) => {
              const s = at(ctx, base, c.word, 40 + i * 6);
              if (local < s) return null;
              const ck = pop(ctx, local, s);
              const lit = interpolate(local, [s + 10, s + 22], [0, 1], clamp);
              return (
                <div key={i} style={{ flex: 1, padding: "16px 22px 20px", borderRadius: 20, background: "#fff", border: `3px solid ${lit > 0.5 ? CLAUDE : C.line}`, boxShadow: lit > 0.5 ? "0 0 26px rgba(217,119,87,0.5)" : "none", transform: `scale(${Math.max(0, ck)})`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 34 }}>💬</div>
                  <div style={{ ...txt(32, C.ink, 800), flex: 1 }}>{c.text}</div>
                  <div style={{ ...txt(28, CLAUDE), opacity: lit }}>{item.chatTag ?? "بيعرفك ✓"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {(item.projects ?? []).map((p, i) => {
        const s = at(ctx, base, p.word, 0);
        if (local < s) return null;
        const pk = pop(ctx, local, s);
        const n = (item.projects ?? []).length;
        const x = 800 + (i - (n - 1) / 2) * 470;
        return (
          <div key={i} style={{ position: "absolute", left: x - 210, top: 560, width: 420, height: 190, borderRadius: 30, background: C.card, border: `4px solid ${tone(p.tone)}`, boxShadow: `0 0 36px ${tone(p.tone)}88, 0 20px 40px rgba(0,0,0,0.6)`, transform: `scale(${Math.max(0, pk)})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ fontSize: 60 }}>📁</div>
            <div style={{ ...txt(40, C.ink) }}>{p.text}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- mc-prompt
export const PromptMC: React.FC<{ item: McPrompt; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const crossAt = item.crossAt == null ? Infinity : at(ctx, base, item.crossAt, 0);
  const cross = Number.isFinite(crossAt) ? interpolate(local, [crossAt, crossAt + 10], [0, 1], ease) : 0;
  const firstPart = item.parts.length ? at(ctx, base, item.parts[0].word, 30) : Infinity;
  const shrink = Number.isFinite(firstPart) ? interpolate(local, [firstPart - 4, firstPart + 10], [0, 1], ease) : 0;
  const k = spring({ frame: local, fps: ctx.fps, config: SPRINGS.card });
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: interpolate(shrink, [0, 1], [260, 10]) }}>
      {item.weak ? (
        <div style={{ position: "relative", transform: `scale(${Math.max(0, k) * interpolate(shrink, [0, 1], [1.2, 0.8])})`, opacity: interpolate(shrink, [0, 1], [1, 0.75]) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 34px 24px", borderRadius: 26, background: C.card, boxShadow: "0 18px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ ...txt(30, C.soft) }}>{item.weakLabel ?? "طلب ضعيف"}</div>
            <div style={{ ...txt(46, C.ink) }}>{item.weak}</div>
          </div>
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 10, borderRadius: 5, background: C.magenta, transformOrigin: "right", transform: `scaleX(${cross}) rotate(-2deg)` }} />
        </div>
      ) : null}
      {local >= firstPart - 4 ? (
        <div style={{ width: 1460, borderRadius: 34, background: C.card, boxShadow: `0 30px 70px rgba(0,0,0,0.7), 0 0 50px rgba(217,119,87,0.35)`, overflow: "hidden", opacity: shrink, transform: `translateY(${(1 - shrink) * 40}px)` }}>
          <div style={{ height: 66, display: "flex", alignItems: "center", gap: 14, padding: "0 30px", borderBottom: `2px solid ${C.line}`, direction: "rtl" }}>
            <Icon ctx={ctx} icon="logos:claude-icon" size={34} />
            <div style={{ ...txt(30, C.ink) }}>{item.title ?? "طلب قوي"}</div>
          </div>
          <div style={{ padding: "18px 30px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {item.parts.map((p, i) => {
              const s = at(ctx, base, p.word, firstPart + i * 20);
              if (local < s) return null;
              const pk = pop(ctx, local, s);
              const c = tone(p.tone);
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 18, direction: "rtl", opacity: k01(pk) }}>
                  <div style={{ ...txt(30), minWidth: 170, textAlign: "center", padding: "6px 16px 10px", borderRadius: 14, background: c, flexShrink: 0, transform: `scale(${Math.max(0, pk)})` }}>{p.tag}</div>
                  <div style={{ ...txt(item.fontSize ?? 34, C.ink, 700), lineHeight: 1.45, borderRight: `5px solid ${c}`, paddingRight: 16 }}>{typed(p.text, local, s, Math.min(40, 10 + p.text.length / 3))}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ---------- mc-skill
export const SkillMC: React.FC<{ item: McSkill; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const fileAt = at(ctx, base, item.fileAt, 0);
  const fk = spring({ frame: local - fileAt, fps: ctx.fps, config: SPRINGS.card });
  const runs = item.runs ?? [];
  const runsStart = runs.length ? at(ctx, base, runs[0].word, Infinity) : Infinity;
  const slide = Number.isFinite(runsStart) ? spring({ frame: local - runsStart, fps: ctx.fps, config: SPRINGS.layout }) : 0;
  const fileX = interpolate(slide, [0, 1], [800, 1130]);
  return (
    <div style={{ ...fill }}>
      {item.chat && local < fileAt + 12 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 320, display: "flex", justifyContent: "center", transform: `scale(${k01(pop(ctx, local, at(ctx, base, item.chat.word, 0))) * interpolate(local, [fileAt, fileAt + 12], [1, 0.2], clamp)})`, opacity: interpolate(local, [fileAt, fileAt + 12], [1, 0], clamp) }}>
          <div style={{ ...txt(50, C.ink), background: C.card, padding: "20px 40px 28px", borderRadius: "32px 32px 32px 8px", boxShadow: "0 18px 40px rgba(0,0,0,0.6)" }}>{item.chat.text}</div>
        </div>
      ) : null}
      {local >= fileAt ? (
        <div style={{ position: "absolute", left: fileX - 330, top: 40, width: 660, transform: `rotateY(${(1 - k01(fk)) * 70}deg) scale(${Math.max(0, fk)})` }}>
          <div style={{ background: C.card, borderRadius: 34, overflow: "hidden", boxShadow: `0 30px 70px rgba(0,0,0,0.7), 0 0 50px rgba(217,119,87,0.45)`, direction: "rtl" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 30px", background: CLAUDE }}>
              <div style={{ fontSize: 44 }}>⚡</div>
              <div style={{ ...txt(42) }}>{item.title}</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 28, color: "#fff", direction: "ltr" }}>SKILL.md</div>
            </div>
            <div style={{ padding: "22px 30px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
              {item.steps.map((s, i) => {
                const t = at(ctx, base, s.word, fileAt + 10 + i * 8);
                if (local < t) return null;
                const ok = interpolate(local, [t + 8, t + 14], [0, 1], clamp);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, border: `3px solid ${CLAUDE}`, background: ok > 0.5 ? CLAUDE : "transparent", display: "flex", alignItems: "center", justifyContent: "center", ...txt(30), flexShrink: 0 }}>{ok > 0.5 ? "✓" : ""}</div>
                    <div style={{ ...txt(36, C.ink, 800) }}>{typed(s.text, local, t, 12)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
      {runs.map((r, i) => {
        const s = at(ctx, base, r.word, runsStart + i * 10);
        if (local < s) return null;
        const t = interpolate(local, [s, s + 14], [0, 1], ease);
        const y = 120 + i * 160;
        const x = interpolate(t, [0, 1], [fileX - 300, 380]);
        const stamp = interpolate(local, [s + 12, s + 18], [1.6, 1], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: x - 300, top: y, width: 600, opacity: t, display: "flex", alignItems: "center", gap: 18, padding: "18px 26px 24px", borderRadius: 24, background: C.card, boxShadow: "0 16px 36px rgba(0,0,0,0.6)", direction: "rtl" }}>
            <div style={{ ...txt(34, C.purple), minWidth: 130 }}>{r.day}</div>
            <div style={{ ...txt(34, C.ink, 800), flex: 1 }}>{r.text}</div>
            <div style={{ ...txt(28), padding: "6px 14px 10px", borderRadius: 12, background: CLAUDE, transform: `scale(${local >= s + 12 ? stamp : 0}) rotate(-6deg)` }}>{item.stamp ?? "نفس الطريقة"}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- mc-models
export const ModelsMC: React.FC<{ item: McModels; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const autoAt = item.autoAt == null ? Infinity : at(ctx, base, item.autoAt, 0);
  const ak = Number.isFinite(autoAt) ? spring({ frame: local - autoAt, fps: ctx.fps, config: SPRINGS.layout }) : 0;
  const n = item.models.length;
  // The auto switch walks a highlight across the cards.
  const autoPick = Number.isFinite(autoAt) && local > autoAt + 14 ? Math.floor((local - autoAt - 14) / 22) % n : -1;
  return (
    <div style={{ ...fill }}>
      {item.models.map((m, i) => {
        const s = at(ctx, base, m.word, i * 10);
        if (local < s) return null;
        const k = spring({ frame: local - s, fps: ctx.fps, config: SPRINGS.card });
        const c = tone(m.tone);
        const x = 800 + ((n - 1) / 2 - i) * 500;
        const lit = autoPick === i;
        const bar = (label: string, v: number, d: number) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ ...txt(26, C.soft, 800) }}>{label}</div>
            <div style={{ height: 18, borderRadius: 9, background: "#ece3f7", overflow: "hidden", direction: "rtl" }}>
              <div style={{ height: "100%", width: `${interpolate(local, [s + d, s + d + 20], [0, v * 100], ease)}%`, background: c, borderRadius: 9 }} />
            </div>
          </div>
        );
        return (
          <div key={i} style={{ position: "absolute", left: x - 225, top: 130 + interpolate(ak, [0, 1], [0, 60]), width: 450, transform: `translateY(${(1 - k01(k)) * 80}px) scale(${Math.max(0, k) * (lit ? 1.06 : 1)})`, opacity: k01(k) }}>
            <div style={{ background: C.card, borderRadius: 34, overflow: "hidden", border: `5px solid ${lit ? CLAUDE : c}`, boxShadow: lit ? "0 0 60px rgba(217,119,87,0.9)" : `0 24px 50px rgba(0,0,0,0.6), 0 0 30px ${c}55`, direction: "rtl" }}>
              <div style={{ padding: "22px 28px", background: c, display: "flex", alignItems: "center", gap: 14 }}>
                <Icon ctx={ctx} icon="logos:claude-icon" size={46} />
                <div style={{ fontFamily: NUMBER_FONT_FAMILY, fontWeight: 900, fontSize: 52, color: "#fff" }}>{m.name}</div>
              </div>
              <div style={{ padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ ...txt(38, C.ink) }}>{m.sub}</div>
                {bar(item.powerLabel ?? "القوة", m.power, 8)}
                {bar(item.speedLabel ?? "السرعة", m.speed, 14)}
                {m.use ? <div style={{ ...txt(32, C.purple, 800), lineHeight: 1.35 }}>{m.use}</div> : null}
              </div>
            </div>
          </div>
        );
      })}
      {Number.isFinite(autoAt) && local >= autoAt ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 20, display: "flex", justifyContent: "center", opacity: ak, transform: `translateY(${(1 - ak) * -30}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 34px 18px", borderRadius: 999, background: C.card, border: `4px solid ${CLAUDE}`, boxShadow: "0 0 40px rgba(217,119,87,0.6)", direction: "rtl" }}>
            <div style={{ width: 90, height: 46, borderRadius: 23, background: CLAUDE, position: "relative" }}>
              <div style={{ position: "absolute", top: 5, left: 6, width: 36, height: 36, borderRadius: 18, background: "#fff" }} />
            </div>
            <div style={{ ...txt(44, C.ink) }}>{item.autoLabel ?? "تلقائي: هو بيختار"}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
