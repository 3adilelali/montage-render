import { staticFile } from "remotion";

// Sound events of the explainer style (الأسلوب/أسلوب-المونتاج.md §8).
// Files: public/assets/sfx/<file>.wav (synthesised by scripts/make-sfx.mjs, plus the Remotion library ones).
// A file with the same name in المؤثرات/ overrides it (copied to public/assets/sfx-user/ by scripts/sync-assets.mjs).

type SfxDef = { file: string; offset: number; volume: number; playbackRate?: number };

export const SFX = {
  // Student's whooshes (المؤثرات/, 2026-10-04): offsets put each peak on the cut.
  whip: { file: "whoosh-simple", offset: -3, volume: 0.55 }, // scene whip (peak 0.1s in)
  whoosh: { file: "whoosh-end", offset: -13, volume: 0.3 }, // trail / big idea change (peak 0.45s in)
  whooshBig: { file: "whoosh-sub", offset: -28, volume: 0.32 }, // zoom / flash reveal (sub drop, peak 0.95s in)
  swish: { file: "swish", offset: -1, volume: 0.22 }, // text reveal
  pop: { file: "pop", offset: 0, volume: 0.45 }, // icon / image lands
  bloop: { file: "bloop", offset: 0, volume: 0.35 }, // card / bubble
  impact: { file: "impact", offset: 0, volume: 0.5 }, // list number / badge
  riser: { file: "riser", offset: -20, volume: 0.3 }, // before a big reveal
  sparkle: { file: "sparkle", offset: 0, volume: 0.35 }, // green / highlight
  glitch: { file: "glitch", offset: 0, volume: 0.4 },
  tick: { file: "tick", offset: 0, volume: 0.3 }, // counter steps, list chips
  click: { file: "click", offset: 0, volume: 0.55 },
  typing: { file: "typing", offset: 0, volume: 0.4 },
  cash: { file: "cash", offset: 0, volume: 0.45 },
  wrong: { file: "wrong", offset: 0, volume: 0.35 },
  ding: { file: "ding", offset: 0, volume: 0.3 },
  boom: { file: "vine-boom", offset: 0, volume: 0.4 },
  shutter: { file: "shutter-modern", offset: 0, volume: 0.4 },
  notify: { file: "snapchat-notification", offset: 0, volume: 0.35 },
  page: { file: "page-turn", offset: 0, volume: 0.4 },
  scratch: { file: "record-scratch", offset: 0, volume: 0.45 },
} satisfies Record<string, SfxDef>;

export type SfxName = keyof typeof SFX;

export const sfxSrc = (name: SfxName, userFiles: string[]) => {
  const file = SFX[name].file;
  const user = userFiles.find((f) => f.replace(/\.[^.]+$/, "") === file);
  return user ? staticFile(`assets/sfx-user/${user}`) : staticFile(`assets/sfx/${file}.wav`);
};
