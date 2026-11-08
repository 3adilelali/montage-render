import type { CSSProperties } from "react";
import { Easing, interpolate, spring } from "remotion";
import { IDLE_GROW, IDLE_GROW_MAX, POP_BLUR, SPRINGS } from "../../brand/motion";
import { type Ctx, outOf, startOf, type Placed } from "./layout";
import type { Enter, Leaf } from "./types";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Default entrance per element type (refs: icons pop, text letters light up, cards flip, badges spin).
export const defaultEnter = (item: Leaf): Enter => {
  switch (item.type) {
    case "text":
      return "chars";
    case "card":
      return "flip";
    case "badge":
      return "spin";
    case "ring":
    case "scribble":
    case "steps":
    case "bar3d":
    case "banner":
    case "xstamp":
    case "arrow":
    case "multiply":
    case "checklist":
    case "fly3d":
      return "none";
    case "disc":
      return "slam";
    default:
      return "pop";
  }
};

export type LeafAnim = { local: number; style: CSSProperties; visible: boolean };

// Absolute box + entrance + idle growth + optional exit at `out`.
export const leafAnim = (p: Placed, ctx: Ctx): LeafAnim => {
  const { item } = p;
  const s = startOf(ctx, item.word);
  const local = ctx.frame - s;
  if (local < 0) return { local, style: {}, visible: false };
  const o = outOf(ctx, item.out);
  const outP = ctx.frame < o ? 0 : spring({ frame: ctx.frame - o, fps: ctx.fps, config: SPRINGS.out });
  if (outP > 0.995) return { local, style: {}, visible: false };

  const enter0 = item.enter ?? defaultEnter(item);
  // Teaching mode: every moving entrance becomes a soft fade-up (no overshoot, no blur).
  const enter = ctx.calm && enter0 !== "none" && enter0 !== "words" ? "soft" : enter0;
  const cfg = item.type === "number" || item.type === "badge" || enter === "slam" ? SPRINGS.slam : item.type === "card" ? SPRINGS.card : SPRINGS.pop;
  const k = spring({ frame: local, fps: ctx.fps, config: cfg });
  const fade = interpolate(local, [0, 3], [0, 1], clamp);

  let scale = 1;
  let x = 0;
  let y = 0;
  let rot = 0;
  let rotY = 0;
  let blur = 0;
  let opacity = 1;
  switch (enter) {
    case "pop":
      scale = interpolate(k, [0, 1], [0.35, 1]);
      blur = (1 - Math.min(1, k)) * POP_BLUR;
      opacity = fade;
      break;
    case "drop":
      y = interpolate(k, [0, 1], [-320, 0]);
      blur = (1 - Math.min(1, k)) * 20;
      opacity = fade;
      break;
    case "rise":
      y = interpolate(k, [0, 1], [320, 0]);
      blur = (1 - Math.min(1, k)) * 20;
      opacity = fade;
      break;
    case "slide":
      // Out of the right side (RTL reading start), motion-blurred.
      x = interpolate(k, [0, 1], [260, 0]);
      blur = (1 - Math.min(1, k)) * 18;
      opacity = fade;
      break;
    case "spin":
      rot = interpolate(k, [0, 1], [-160, 0]);
      scale = interpolate(k, [0, 1], [0.2, 1]);
      opacity = fade;
      break;
    case "flip":
      rotY = interpolate(k, [0, 1], [75, 0]);
      rot = interpolate(k, [0, 1], [-12, 0]);
      scale = interpolate(k, [0, 1], [0.4, 1]);
      opacity = fade;
      break;
    case "slam":
      // YouTubeSkool step number: lands filling the screen, blurred, and shrinks to size in ~0.5s.
      // Past k=1 the spring overshoots; shrink only a little so the disc never collapses.
      scale = k <= 1 ? 5.5 - 4.5 * k : 1 - (k - 1) * 0.5;
      blur = (1 - Math.min(1, k)) * 34;
      opacity = interpolate(local, [0, 2], [0.4, 1], clamp);
      break;
    case "soft": {
      const e = interpolate(local, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      y = (1 - e) * 26;
      scale = 0.97 + 0.03 * e;
      opacity = e;
      break;
    }
    case "chars":
    case "words":
    case "none":
      break;
  }
  // Inner life by meaning (YouTubeSkool #24/#38): warning sways, heart pulses, things float.
  const t = local / ctx.fps;
  if (item.idle === "sway") rot += Math.sin(t * 3.2) * 7;
  else if (item.idle === "pulse") scale *= 1 + Math.max(0, Math.sin(t * 5)) * 0.07;
  else if (item.idle === "bob") y += Math.sin(t * 2.6) * 14;
  else if (item.idle === "spin") rot += t * 40;

  // Idle life: keep growing slowly.
  scale *= ctx.calm ? 1 + Math.min(0.04, (0.012 * local) / ctx.fps) : 1 + Math.min(IDLE_GROW_MAX, (IDLE_GROW * local) / ctx.fps);
  // Exit: blur up and away.
  if (outP > 0) {
    opacity *= 1 - outP;
    blur += outP * 18;
    y -= outP * 70;
  }

  const style: CSSProperties = {
    position: "absolute",
    left: p.cx - p.w / 2,
    top: p.cy - p.h / 2,
    width: p.w,
    height: p.h,
    opacity,
    transform: `translate(${x}px, ${y}px) perspective(1400px) rotateY(${rotY}deg) rotate(${rot + (item.tilt ?? 0)}deg) scale(${scale})`,
    filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
  };
  return { local, style, visible: true };
};
