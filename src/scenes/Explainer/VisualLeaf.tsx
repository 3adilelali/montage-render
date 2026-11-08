import { Video } from "@remotion/media";
import { Img, interpolate, spring, staticFile } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { clamp } from "./anim";
import { assetFor, type Ctx, startOf } from "./layout";
import type { Assets, Highlight, VisualItem } from "./types";

// Icons with a 3D render (Microsoft Fluent 3D, upscaled) are PNGs; the rest (brand logos…) stay SVG.
// Filled once per render from assets.json by <Explainer>.
const ICONS_3D = new Set<string>();
export const registerIcons3d = (ids: string[] | undefined) => {
  ICONS_3D.clear();
  (ids ?? []).forEach((id) => ICONS_3D.add(id));
};
export const is3d = (id: string) => ICONS_3D.has(id);
export const iconSrc = (id: string) => staticFile(`explainer/icons/${id.replace(":", "--")}.${ICONS_3D.has(id) ? "png" : "svg"}`);

const TINT = {
  // Brand recolours: "red" = magenta (wrong), "green" = orange (done).
  red: "grayscale(1) sepia(1) saturate(6) hue-rotate(-75deg) brightness(1.05)",
  green: "grayscale(1) sepia(1) saturate(7) hue-rotate(-8deg) brightness(1.15)",
  gray: "grayscale(1) brightness(0.65)",
} as const;

// Thin white outline + soft drop shadow, like the flat sticker icons in the refs.
const STICKER = "drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 10px rgba(140,170,255,0.35)) drop-shadow(0 12px 16px rgba(0,0,0,0.75))";
// 3D icons carry their own light and volume: no outline, just a soft brand glow and a grounded shadow.
const SOFT3D = "drop-shadow(0 0 1px rgba(255,255,255,0.3)) drop-shadow(0 0 24px rgba(160,78,215,0.32)) drop-shadow(0 18px 22px rgba(0,0,0,0.7))";

export const resolveVisual = (item: { icon?: string; file?: string; fallback?: string }, assets: Assets) => {
  const a = assetFor(assets, item.file);
  if (a) return { kind: a.kind, src: staticFile(a.src) } as const;
  const icon = item.icon ?? item.fallback;
  if (icon && assets.icons.includes(icon)) return { kind: "image", src: iconSrc(icon), is3d: is3d(icon) } as const;
  return null;
};

const HighlightBox: React.FC<{ h: Highlight; ctx: Ctx; base: number }> = ({ h, ctx, base }) => {
  const at = h.word === undefined ? base + 8 : startOf(ctx, h.word);
  const k = spring({ frame: ctx.frame - at, fps: ctx.fps, config: SPRINGS.pop });
  if (ctx.frame < at) return null;
  const c = h.tone === "green" ? colors.green : colors.red;
  return (
    <div
      style={{
        position: "absolute",
        left: `${h.x}%`,
        top: `${h.y}%`,
        width: `${h.w}%`,
        height: `${h.h}%`,
        border: `5px solid ${c}`,
        borderRadius: 8,
        boxShadow: `0 0 18px ${c}, inset 0 0 12px ${c}66`,
        opacity: Math.min(1, k),
        transform: `scale(${interpolate(k, [0, 1], [1.4, 1])})`,
      }}
    />
  );
};

const Corner: React.FC<{ id: string; ctx: Ctx; at: number; assets: Assets }> = ({ id, ctx, at, assets }) => {
  if (ctx.frame < at) return null;
  const k = spring({ frame: ctx.frame - at, fps: ctx.fps, config: SPRINGS.slam });
  const isIcon = id.includes(":") && assets.icons.includes(id);
  return (
    <div
      style={{
        position: "absolute",
        right: "-14%",
        top: "-22%",
        width: "42%",
        height: "42%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${k}) rotate(${interpolate(k, [0, 1], [-40, 8])}deg)`,
      }}
    >
      {isIcon ? (
        <Img src={iconSrc(id)} style={{ width: "100%", height: "100%", objectFit: "contain", filter: is3d(id) ? SOFT3D : STICKER }} />
      ) : (
        <span style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: "min(160px, 9vw)", color: "#fff", textShadow: `0 6px 12px ${colors.textShadow}` }}>{id}</span>
      )}
    </div>
  );
};

export const VisualLeaf: React.FC<{ item: VisualItem; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const v = resolveVisual(item, ctx.assets);
  const a = assetFor(ctx.assets, item.file);
  const look = item.look ?? (a ? "card" : "sticker");
  const start = startOf(ctx, item.word);

  if (!v) {
    // Missing asset → dashed placeholder so the gap is obvious in check stills.
    return (
      <div style={{ width: "100%", height: "100%", border: "4px dashed #ff4d4d", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#ff4d4d", fontFamily: FONT_FAMILY, fontSize: 34, direction: "rtl", textAlign: "center", padding: 20 }}>
        ناقص: {item.file ?? item.icon}
      </div>
    );
  }

  const tintK = item.tint ? (item.tintAt === undefined ? 1 : interpolate(ctx.frame, [startOf(ctx, item.tintAt), startOf(ctx, item.tintAt) + 5], [0, 1], clamp)) : 0;
  const media = (filter?: string) =>
    v.kind === "video" ? (
      <Video src={v.src} muted loop style={{ width: "100%", height: "100%", objectFit: look === "full" ? "cover" : "contain", filter }} />
    ) : (
      <Img src={v.src} style={{ width: "100%", height: "100%", objectFit: look === "full" ? "cover" : look === "circle" ? "cover" : "contain", filter }} />
    );

  const sticker = "is3d" in v && v.is3d ? SOFT3D : STICKER;
  const layers = (
    <>
      {media(look === "sticker" ? sticker : undefined)}
      {item.tint && tintK > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: tintK }}>{media(`${TINT[item.tint]} ${look === "sticker" ? sticker : ""}`)}</div>
      ) : null}
    </>
  );

  // Phone: a vertical screenshot inside a dark bezel with a dynamic-island pill, floating gently (Instagram screens).
  if (look === "phone") {
    const bob = Math.sin((local / ctx.fps) * 1.3) * 6;
    return (
      <div style={{ width: "100%", height: "100%", transform: `translateY(${bob}px) rotate(${-2 + Math.sin(local / 40) * 0.8}deg)` }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 54, background: "#0c0a10", padding: 18, boxShadow: `0 40px 80px rgba(0,0,0,0.9), 0 0 0 3px #2b2533, 0 0 50px rgba(${colors.brandGlow},0.35)` }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 38, overflow: "hidden", background: "#000", display: "flex", alignItems: "center" }}>
            {layers}
            {(item.highlights ?? []).map((h, i) => (
              <HighlightBox key={i} h={h} ctx={ctx} base={start} />
            ))}
          </div>
          <div style={{ position: "absolute", top: 30, left: "50%", width: 120, height: 34, marginLeft: -60, borderRadius: 17, background: "#000" }} />
        </div>
      </div>
    );
  }

  // Cards: 3D-tilted screenshot that keeps swaying slowly (refs: YouTube stats / thumbnails).
  if (look === "card" || look === "screen") {
    const sway = Math.sin((local / ctx.fps) * 1.1);
    return (
      <div style={{ width: "100%", height: "100%", perspective: 1600 }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transform: `rotateY(${-10 + sway * 6}deg) rotateX(${5 - sway * 2}deg) rotateZ(${-2 + sway * 1.5}deg)`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 30px 60px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.12)",
            background: "#111",
          }}
        >
          {layers}
          {look === "screen" ? (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "9%", background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
              <div style={{ position: "absolute", left: "2%", right: "2%", bottom: "38%", height: 5, background: "rgba(255,255,255,0.35)" }}>
                <div style={{ width: `${Math.min(100, 8 + local / 3)}%`, height: "100%", background: colors.green }} />
              </div>
            </div>
          ) : null}
          {(item.highlights ?? []).map((h, i) => (
            <HighlightBox key={i} h={h} ctx={ctx} base={start} />
          ))}
          {item.credit ? (
            <div style={{ position: "absolute", left: 14, bottom: 12, padding: "4px 12px", borderRadius: 8, background: "rgba(0,0,0,0.6)", fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.85)", direction: "rtl" }}>{item.credit}</div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: look === "circle" ? "50%" : 0,
        overflow: look === "circle" ? "hidden" : "visible",
        border: look === "circle" ? "6px solid #fff" : undefined,
        boxShadow: look === "circle" ? "0 14px 30px rgba(0,0,0,0.8)" : undefined,
      }}
    >
      {layers}
      {(item.highlights ?? []).map((h, i) => (
        <HighlightBox key={i} h={h} ctx={ctx} base={start} />
      ))}
      {item.corner ? <Corner id={item.corner} ctx={ctx} at={item.cornerAt === undefined ? start + 6 : startOf(ctx, item.cornerAt)} assets={ctx.assets} /> : null}
    </div>
  );
};
