// shot (2026-11-06, «كلود تغيّر بالكامل»): a REAL screen (video clip or screenshot) shown flat and big, like a teacher's
// screen. Adil: "educational, not random" — the camera glides into the exact button/menu on its word (`zoom`), and an
// orange ring/box draws itself around it (`marks`) with an optional label chip. No 3D tilt, no sway: clarity first.
//   file   video/image from العناصر/ (clips cut + face-covered with ffmpeg beforehand)
//   zoom   [{word, x, y, s}] — centre (x,y in % of the media) and scale; starts at the full view
//   marks  [{word, x, y, w, h (% of media), kind: "ring"|"box", label?, out?}]
//   label  small chip above the frame («داخل Claude»…)
import { Easing, interpolate, Sequence, spring } from "remotion";
import { Video } from "@remotion/media";
import { Img } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { clamp } from "./anim";
import { assetFor, type Ctx, shotSize, startOf } from "./layout";
import type { ShotItem } from "./types";
import { resolveVisual } from "./VisualLeaf";

const ORANGE = "#FFA733";
const inOut = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const ZOOM_FRAMES = 22;

type Cam = { x: number; y: number; s: number };

const camAt = (item: ShotItem, ctx: Ctx): Cam => {
  let cam: Cam = { x: 50, y: 50, s: 1 };
  for (const z of item.zoom ?? []) {
    const at = startOf(ctx, z.word);
    const k = interpolate(ctx.frame, [at, at + ZOOM_FRAMES], [0, 1], inOut);
    if (k <= 0) break;
    cam = { x: cam.x + (z.x - cam.x) * k, y: cam.y + (z.y - cam.y) * k, s: cam.s + (z.s - cam.s) * k };
  }
  return cam;
};

export const ShotMC: React.FC<{ item: ShotItem; ctx: Ctx; local: number }> = ({ item, ctx }) => {
  const v = resolveVisual({ file: item.file }, ctx.assets);
  const a = assetFor(ctx.assets, item.file);
  const { w, h } = shotSize(item, a ? a.w / a.h : 16 / 9);
  const start = startOf(ctx, item.word);
  const cam = camAt(item, ctx);
  // translate so the camera point sits in the centre, never showing past the media edges
  const tx = Math.min(0, Math.max(w - w * cam.s, w / 2 - (cam.x / 100) * w * cam.s));
  const ty = Math.min(0, Math.max(h - h * cam.s, h / 2 - (cam.y / 100) * h * cam.s));
  const toScreen = (x: number, y: number) => ({ x: tx + (x / 100) * w * cam.s, y: ty + (y / 100) * h * cam.s });

  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {item.label ? (
        <div style={{ position: "absolute", top: item.labelBelow ? h + 18 : -62, right: 0, padding: "8px 22px", borderRadius: 30, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, color: "#fff", direction: "rtl" }}>
          {item.label}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 22,
          overflow: "hidden",
          background: "#0d0b12",
          boxShadow: `0 30px 70px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.14), 0 0 60px rgba(${colors.brandGlow},0.25)`,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${cam.s})` }}>
          {v ? (
            v.kind === "video" ? (
              <Sequence from={start} layout="none">
                <Video src={v.src} muted loop={item.loop !== false} style={{ width: w, height: h, objectFit: "fill", display: "block" }} />
              </Sequence>
            ) : (
              <Img src={v.src} style={{ width: w, height: h, objectFit: "fill", display: "block" }} />
            )
          ) : (
            <div style={{ width: w, height: h, border: "4px dashed #ff4d4d", color: "#ff4d4d", fontFamily: FONT_FAMILY, fontSize: 40 }}>ناقص: {item.file}</div>
          )}
        </div>
        {/* marks are drawn in screen space so the stroke stays crisp at any zoom */}
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {(item.marks ?? []).map((m, i) => {
            const at = startOf(ctx, m.word);
            if (ctx.frame < at) return null;
            const gone = m.out !== undefined ? interpolate(ctx.frame, [startOf(ctx, m.out), startOf(ctx, m.out) + 8], [1, 0], clamp) : 1;
            const draw = interpolate(ctx.frame, [at, at + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            const a = toScreen(m.x, m.y);
            const b = toScreen(m.x + m.w, m.y + m.h);
            const pad = 10;
            const x = a.x - pad, y = a.y - pad, ww = b.x - a.x + pad * 2, hh = b.y - a.y + pad * 2;
            const ring = (m.kind ?? "box") === "ring";
            const per = ring ? Math.PI * (ww + hh) * 0.75 : 2 * (ww + hh);
            return (
              <g key={i} opacity={gone}>
                {ring ? (
                  <ellipse cx={x + ww / 2} cy={y + hh / 2} rx={ww / 2 + 12} ry={hh / 2 + 10} fill="none" stroke={ORANGE} strokeWidth={6} strokeLinecap="round"
                    strokeDasharray={per} strokeDashoffset={per * (1 - draw)} style={{ filter: `drop-shadow(0 0 10px ${ORANGE})` }} />
                ) : (
                  <rect x={x} y={y} width={ww} height={hh} rx={14} fill={`rgba(255,167,51,${0.08 * draw})`} stroke={ORANGE} strokeWidth={5}
                    strokeDasharray={per} strokeDashoffset={per * (1 - draw)} style={{ filter: `drop-shadow(0 0 10px ${ORANGE})` }} />
                )}
              </g>
            );
          })}
        </svg>
        {/* pointer (Adil 2026-11-08): a bigger arrow that glides to what he's talking about — no boxes, no zoom */}
        {(() => {
          const pts = item.pointer ?? [];
          if (!pts.length) return null;
          const first = startOf(ctx, pts[0].word);
          if (ctx.frame < first) return null;
          let p = { x: pts[0].x, y: pts[0].y };
          for (const q of pts.slice(1)) {
            const at = startOf(ctx, q.word);
            const k = interpolate(ctx.frame, [at, at + 16], [0, 1], inOut);
            if (k <= 0) break;
            p = { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k };
          }
          const s = toScreen(p.x, p.y);
          const show = interpolate(ctx.frame, [first, first + 8], [0, 1], clamp);
          return (
            <svg width={52} height={66} viewBox="0 0 26 33" style={{ position: "absolute", left: s.x - 4, top: s.y - 2, opacity: show, overflow: "visible", filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.55)) drop-shadow(0 0 8px ${ORANGE})` }}>
              <path d="M2 2 L2 26 L8.5 20 L13 30.5 L17.5 28.5 L13 18.5 L22 18.5 Z" fill="#fff" stroke="#1d0b33" strokeWidth={2} strokeLinejoin="round" />
            </svg>
          );
        })()}
        {(item.marks ?? []).map((m, i) => {
          if (!m.label) return null;
          const at = startOf(ctx, m.word) + 8;
          if (ctx.frame < at) return null;
          const k = spring({ frame: ctx.frame - at, fps: ctx.fps, config: SPRINGS.pop });
          const gone = m.out !== undefined ? interpolate(ctx.frame, [startOf(ctx, m.out), startOf(ctx, m.out) + 8], [1, 0], clamp) : 1;
          const a = toScreen(m.x, m.y);
          const b = toScreen(m.x + m.w, m.y + m.h);
          const below = a.y < 110;
          const cx = Math.max(160, Math.min(w - 160, (a.x + b.x) / 2));
          return (
            <div key={`l${i}`} style={{
              position: "absolute", left: cx, top: below ? b.y + 34 : a.y - 34, transform: `translate(-50%, ${below ? 0 : -100}%) scale(${k})`,
              padding: "10px 26px", borderRadius: 16, background: ORANGE, color: "#1d0b33", fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 38,
              direction: "rtl", whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(0,0,0,0.6)", opacity: gone,
            }}>
              {m.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

