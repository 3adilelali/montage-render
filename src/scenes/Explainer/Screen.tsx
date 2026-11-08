import { Video } from "@remotion/media";
import { Easing, interpolate, Sequence, staticFile } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY } from "../../brand/fonts";
import { clamp } from "./anim";
import type { Screens } from "./types";

// Screen-recording parts of the input (laptop screen inside Claude), 2026-10-25.
// The original video plays in sync with the voice inside a rounded brand card, zoomed on the chat column,
// and the camera pans to what moves (keys from scripts/screen-focus.py). الأسلوب §14.4 + §15.

const CARD_W = 1800;
const CARD_H = 1012;
const IN = 12;

const cyAt = (keys: { t: number; cy: number }[], t: number) => {
  if (!keys.length) return 0.5;
  if (t <= keys[0].t) return keys[0].cy;
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i].t) {
      const a = keys[i - 1];
      const b = keys[i];
      return a.cy + (b.cy - a.cy) * Easing.inOut(Easing.cubic)((t - a.t) / (b.t - a.t));
    }
  }
  return keys[keys.length - 1].cy;
};

export const ScreenLayer: React.FC<{ screens: Screens; frame: number; fps: number }> = ({ screens, frame, fps }) => (
  <>
    {screens.parts.map((p, i) => {
      const from = Math.round(p.fromS * fps);
      const to = Math.round(p.toS * fps);
      if (frame < from - 1 || frame > to + IN) return null;
      const pin = interpolate(frame, [from, from + IN], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const pout = interpolate(frame, [to - IN, to], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
      const z = screens.zoom * interpolate(frame, [from, from + 45], [0.62, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      const half = 0.5 / z;
      const cx = Math.min(Math.max(screens.cx, half), 1 - half);
      const cy = Math.min(Math.max(cyAt(p.keys, frame / fps), half), 1 - half);
      const tx = CARD_W / 2 - cx * CARD_W * z;
      const ty = CARD_H / 2 - cy * CARD_H * z;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (1920 - CARD_W) / 2,
            top: (1080 - CARD_H) / 2 + 12,
            width: CARD_W,
            height: CARD_H,
            borderRadius: 28,
            overflow: "hidden",
            background: "#fff",
            opacity: pin * (1 - pout),
            transform: `scale(${0.92 + 0.08 * pin - 0.04 * pout})`,
            boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 0 3px rgba(160,78,215,0.55), 0 0 60px ${colors.brandDeep}`,
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, width: CARD_W, height: CARD_H, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
            <Sequence from={from} durationInFrames={to - from} layout="none">
              <Video src={staticFile("explainer/screen.mp4")} trimBefore={from} muted style={{ width: CARD_W, height: CARD_H, objectFit: "cover" }} />
            </Sequence>
          </div>
          <div
            style={{
              position: "absolute",
              right: 26,
              top: 22,
              padding: "8px 20px",
              borderRadius: 30,
              background: colors.brandGradient,
              fontFamily: FONT_FAMILY,
              fontWeight: 800,
              fontSize: 30,
              color: "#fff",
              direction: "rtl",
              boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
            }}
          >
            تطبيق عملي داخل Claude
          </div>
        </div>
      );
    })}
  </>
);

export const inScreen = (screens: Screens | null, frame: number, fps: number) =>
  !!screens?.parts.some((p) => frame >= p.fromS * fps && frame < p.toS * fps);
