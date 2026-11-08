// Motion values of the explainer style, measured frame by frame in المراجع/ (الأسلوب/أسلوب-المونتاج.md §4–5).
import type { SpringConfig } from "remotion";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const SPRINGS = {
  // Icons / images: land in ~6f with a small overshoot.
  pop: { damping: 11, stiffness: 190, mass: 0.6 },
  // Layout reflow (an icon sliding up when its caption arrives): smooth, no bounce.
  layout: { damping: 22, stiffness: 140, mass: 0.9 },
  // Numbers, badges: heavier hit.
  slam: { damping: 13, stiffness: 260, mass: 0.7 },
  // Cards flipping/tilting in.
  card: { damping: 15, stiffness: 120, mass: 0.9 },
  // Exits within a scene.
  out: { damping: 26, stiffness: 220, mass: 0.6 },
} satisfies Record<string, Partial<SpringConfig>>;

// Elements appear 2f before their word; scenes start 3f before their first word.
export const LEAD = 2;
export const SCENE_LEAD = 3;

// Idle life: every element keeps growing slowly while on screen (refs: 1 → ~1.08 over 2s).
export const IDLE_GROW = 0.035; // per second
export const IDLE_GROW_MAX = 0.12;
// Camera push per scene.
export const CAMERA_PUSH = 0.04;

// Text reveal: letters light up in a scrambled order over CHARS_FRAMES (refs: 8–10f).
export const CHARS_FRAMES = 9;
export const POP_BLUR = 14;
// Number slides aside when its title arrives; title slides out of the number (refs: 6f, motion-blurred).
export const SLIDE_FRAMES = 6;

// Scene transitions (frames). Whip = horizontal motion-blurred push, the default.
// fade = soft cross-dissolve for board mode (the pinned title stays, only the content changes).
// push = vertical push (YouTubeSkool default, 2026-11-02), through = fly-through zoom, black = rise out of black.
export const TRANSITION = { whip: 7, zoom: 8, glitch: 6, trail: 14, flash: 8, cut: 0, fade: 10, push: 7, through: 9, black: 12 };
export const PUSH_DISTANCE = 760;
export const PUSH_BLUR = 34;
export const WHIP_DISTANCE = 1100;
export const WHIP_BLUR = 38;

// Counters: count up over this many frames unless the item says otherwise.
export const COUNTER_FRAMES = 24;
// Typing speed for the search bar (frames per character).
export const TYPE_PER_CHAR = 2;
// Final fade to black.
export const OUTRO_FADE = 18;
