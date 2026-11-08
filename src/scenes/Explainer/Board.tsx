import { Easing, interpolate } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { clamp } from "./anim";
import type { Ladder, Scene } from "./types";

// Board mode (long explainer videos, 2026-10-25): a section title pinned at the top that stays while
// consecutive scenes with the same `header.title` change underneath, a subtitle per point, and a small
// level ladder in the corner that stays for the whole video. Style: الأسلوب/أسلوب-المونتاج.md §15.

type TimedHeaderScene = Scene & { start: number; end: number };

export type HeaderBlock = { title: string; start: number; end: number; scenes: TimedHeaderScene[] };

export const headerBlocks = (scenes: TimedHeaderScene[]): HeaderBlock[] => {
  const blocks: HeaderBlock[] = [];
  for (const s of scenes) {
    const last = blocks[blocks.length - 1];
    if (s.header && last && last.title === s.header.title && last.end === s.start) {
      last.end = s.end;
      last.scenes.push(s);
    } else if (s.header) {
      blocks.push({ title: s.header.title, start: s.start, end: s.end, scenes: [s] });
    }
  }
  return blocks;
};

const IN = 12;
const OUT = 8;

const glow = (c: string) => `0 6px 14px rgba(0,0,0,0.85), 0 0 18px ${c}, 0 0 40px ${c}66`;

const Header: React.FC<{ block: HeaderBlock; frame: number; wordAt: (i: number) => number; last: boolean }> = ({ block, frame, wordAt, last }) => {
  const pin = interpolate(frame, [block.start, block.start + IN], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pout = last ? 0 : interpolate(frame, [block.end - 2, block.end + OUT - 2], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const opacity = pin * (1 - pout);
  if (opacity <= 0) return null;
  const bar = interpolate(frame, [block.start + 6, block.start + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 46, display: "flex", flexDirection: "column", alignItems: "center", opacity, direction: "rtl" }}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 900,
          fontSize: 74,
          lineHeight: 1.15,
          color: colors.text,
          textShadow: `0 6px 14px ${colors.textShadow}, 0 0 22px ${colors.textGlow}`,
          transform: `translateY(${(1 - pin) * -40}px)`,
          filter: pin < 1 ? `blur(${(1 - pin) * 12}px)` : undefined,
        }}
      >
        {block.title}
      </div>
      <div style={{ marginTop: 14, height: 7, width: 420 * bar, borderRadius: 4, background: colors.brandGradient, boxShadow: `0 0 18px ${colors.brandMagenta}` }} />
      {block.scenes.map((s, i) => {
        const sub = s.header?.sub;
        if (!sub) return null;
        const prevSame = i > 0 && block.scenes[i - 1].header?.sub === sub;
        const nextSame = block.scenes[i + 1]?.header?.sub === sub;
        const at = prevSame ? s.start : Math.max(s.start, wordAt(s.header?.subAt ?? s.from) - 2);
        const a = prevSame ? 1 : interpolate(frame, [at, at + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const b = nextSame || i === block.scenes.length - 1 ? 0 : interpolate(frame, [s.end - 1, s.end + 5], [0, 1], clamp);
        if (frame < at || frame >= s.end + 6 || a * (1 - b) <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 112,
              fontFamily: FONT_FAMILY,
              fontWeight: 800,
              fontSize: 46,
              color: colors.green,
              textShadow: glow(colors.green),
              opacity: a * (1 - b),
              transform: `translateX(${(1 - a) * -60}px)`,
              filter: a < 1 ? `blur(${(1 - a) * 10}px)` : undefined,
              whiteSpace: "nowrap",
            }}
          >
            {sub}
          </div>
        );
      })}
    </div>
  );
};

// Corner staircase: one step per level, the active one lit in brand orange with its label under it.
const LadderView: React.FC<{ ladder: Ladder; frame: number; wordAt: (i: number) => number }> = ({ ladder, frame, wordAt }) => {
  const start = wordAt(ladder.word) - 2;
  const pin = interpolate(frame, [start, start + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  if (pin <= 0) return null;
  const active = [...(ladder.active ?? [])].filter((a) => frame >= wordAt(a.word) - 2).pop();
  const lvl = active?.level ?? 0;
  const lit = active ? interpolate(frame, [wordAt(active.word) - 2, wordAt(active.word) + 6], [0, 1], clamp) : 0;
  const n = ladder.labels.length;
  const W = 72;
  return (
    <div style={{ position: "absolute", left: 56, top: 52, transform: `scale(${pin})`, transformOrigin: "left top", opacity: pin }}>
      <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "flex-end", gap: 8 }}>
        {ladder.labels.map((_, i) => {
          const on = i + 1 === lvl;
          const done = i + 1 < lvl;
          const h = 44 + i * 26;
          return (
            <div
              key={i}
              style={{
                width: W,
                height: h,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: on ? colors.brandGradient : done ? "rgba(251,159,42,0.28)" : "rgba(160,78,215,0.22)",
                border: `2px solid ${on ? colors.brandOrange : "rgba(255,255,255,0.14)"}`,
                boxShadow: on ? `0 0 ${18 + 14 * lit}px ${colors.brandOrange}aa` : "none",
                transform: on ? `translateY(${-6 * lit}px)` : undefined,
                fontFamily: NUMBER_FONT_FAMILY,
                fontWeight: 800,
                fontSize: 34,
                color: on || done ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
      {lvl > 0 ? (
        <div
          style={{
            marginTop: 10,
            width: n * W + (n - 1) * 8,
            textAlign: "center",
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 32,
            color: colors.green,
            textShadow: glow(colors.green),
            opacity: lit,
            direction: "rtl",
          }}
        >
          {ladder.labels[lvl - 1]}
        </div>
      ) : null}
    </div>
  );
};

export const BoardOverlay: React.FC<{ blocks: HeaderBlock[]; ladder?: Ladder; frame: number; wordAt: (i: number) => number; total: number }> = ({ blocks, ladder, frame, wordAt, total }) => (
  <>
    {blocks.map((b, i) => (frame >= b.start - 1 && frame < b.end + OUT ? <Header key={i} block={b} frame={frame} wordAt={wordAt} last={b.end >= total} /> : null))}
    {ladder ? <LadderView ladder={ladder} frame={frame} wordAt={wordAt} /> : null}
  </>
);
