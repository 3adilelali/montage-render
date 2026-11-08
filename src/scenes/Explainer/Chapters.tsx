import { Easing, interpolate } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY, NUMBER_FONT_FAMILY } from "../../brand/fonts";
import { clamp } from "./anim";
import type { Chapters } from "./types";

// Chapter tracker (Adil 2026-11-03): when a step starts, the talking pauses ~2s and its title fills the screen
// («الخطوة 1» + the title, big), then it flies up into a pinned row of chips at the top. The current step is
// lit in brand orange, the finished ones turn gray, so the viewer always knows which step we're on.
// The ~2s of silence before each chapter word comes from insert-pauses.mjs. Style: الأسلوب/أسلوب-المونتاج.md §17.

export const INTRO = 66; // frames of the full-screen title before the chapter word
const FLY = 16; // last frames of the intro: the title shrinks up into its chip
const BAR_FADE = 8;

type WordAt = (i: number) => number;

const glow = (c: string) => `0 6px 14px rgba(0,0,0,0.85), 0 0 22px ${c}, 0 0 48px ${c}66`;

// 0..1: how much the pinned row is showing at this frame (scenes under it sit lower and smaller).
export const barShown = (ch: Chapters | undefined, wordAt: WordAt, frame: number) => {
  if (!ch) return 0;
  if (ch.corner) return 0; // the corner title takes no room from the scenes
  const first = ch.items.find((c) => c.bar !== false);
  if (!first) return 0;
  const start = wordAt(first.word) - 6;
  let v = interpolate(frame, [start, start + BAR_FADE], [0, 1], clamp);
  if (ch.endWord !== undefined) {
    // Leaves with the next full-screen title (or at endWord when nothing introduces it).
    const end = wordAt(ch.endWord) - (!ch.top && ch.items.some((c) => c.word === ch.endWord && c.intro !== false) ? INTRO : 3);
    v *= interpolate(frame, [end, end + BAR_FADE], [1, 0], clamp);
  }
  for (const h of ch.hide ?? []) {
    const a = wordAt(h.from) - 3;
    const b = wordAt(h.to) - 3;
    if (frame >= a && frame < b + BAR_FADE) v *= Math.min(interpolate(frame, [a, a + BAR_FADE], [1, 0], clamp), interpolate(frame, [b, b + BAR_FADE], [0, 1], clamp));
  }
  return v;
};

// Side column geometry (ch.side): chip k sits at the right edge, SIDE_TOP + k * SIDE_STEP.
export const SIDE_W = 400;
const SIDE_TOP = 150;
const SIDE_STEP = 112;

const Intro: React.FC<{ kicker?: string; num?: number; label: string; at: number; frame: number; bar: boolean; side?: number }> = ({ kicker, num, label, at, frame, bar, side }) => {
  const t0 = at - INTRO;
  const local = frame - t0;
  if (local < 0 || local > INTRO + 4) return null;
  const cover = interpolate(local, [0, 8], [0, 1], clamp) * interpolate(local, [INTRO - 3, INTRO + 4], [1, 0], clamp);
  const fly = interpolate(local, [INTRO - FLY, INTRO - 2], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const kin = interpolate(local, [2, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const tin = interpolate(local, [9, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const line = interpolate(local, [14, 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const grow = 1 + 0.05 * interpolate(local, [12, INTRO - FLY], [0, 1], clamp);
  // Without a pinned row the title just fades up and away.
  // Side mode: the title flies into its chip in the right column.
  const sx = side !== undefined && bar ? interpolate(fly, [0, 1], [0, 960 - 40 - SIDE_W / 2]) : 0;
  const y = bar ? interpolate(fly, [0, 1], [0, side !== undefined ? SIDE_TOP + side * SIDE_STEP + 40 - 540 : -470]) : -60 * fly;
  const scale = grow * (bar ? interpolate(fly, [0, 1], [1, side !== undefined ? 0.26 : 0.32]) : 1 - 0.1 * fly);
  const op = bar ? 1 - interpolate(fly, [0.75, 1], [0, 1], clamp) : 1 - fly;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: cover,
          // Opaque: the scene behind must not show through while the title holds.
          background: `radial-gradient(ellipse at 50% 45%, #2a1842 0%, ${colors.bgMid} 55%, ${colors.bgTop} 100%), ${colors.bgTop}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          opacity: op,
          transform: `translate(${sx}px, ${y}px) scale(${scale})`,
        }}
      >
        {kicker ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              transform: `scale(${kin})`,
              opacity: Math.min(1, kin * 1.5),
              marginBottom: 26,
            }}
          >
            {num !== undefined ? (
              <div
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 999,
                  background: colors.brandGradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: NUMBER_FONT_FAMILY,
                  fontWeight: 800,
                  fontSize: 76,
                  color: "#fff",
                  boxShadow: `0 0 40px ${colors.brandOrange}aa, 0 10px 24px rgba(0,0,0,0.6)`,
                }}
              >
                {num}
              </div>
            ) : null}
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 64, color: colors.green, textShadow: glow(colors.green) }}>{kicker}</div>
          </div>
        ) : null}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 900,
            fontSize: label.length > 22 ? 104 : 136,
            lineHeight: 1.12,
            textAlign: "center",
            maxWidth: 1700,
            color: colors.text,
            textShadow: `0 8px 18px ${colors.textShadow}, 0 0 30px ${colors.textGlow}`,
            opacity: tin,
            transform: `translateY(${(1 - tin) * 50}px)`,
            filter: tin < 1 ? `blur(${(1 - tin) * 14}px)` : undefined,
          }}
        >
          {label}
        </div>
        <div style={{ marginTop: 26, height: 9, width: 620 * line, borderRadius: 5, background: colors.brandGradient, boxShadow: `0 0 22px ${colors.brandMagenta}` }} />
      </div>
    </>
  );
};

const Bar: React.FC<{ ch: Chapters; frame: number; wordAt: WordAt; shown: number }> = ({ ch, frame, wordAt, shown }) => {
  const items = ch.items.map((c, i) => ({ ...c, i })).filter((c) => c.bar !== false);
  const reached = items.filter((c) => frame >= wordAt(c.word) - 6);
  if (!reached.length) return null;
  const cur = reached[reached.length - 1];
  const side = !!ch.side;
  return (
    <div
      style={
        side
          ? {
              position: "absolute",
              top: SIDE_TOP,
              right: 40,
              width: SIDE_W,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: SIDE_STEP - 84,
              direction: "rtl",
              opacity: shown,
              transform: `translateX(${(1 - shown) * 60}px)`,
            }
          : {
              position: "absolute",
              top: 30,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 14,
              direction: "rtl",
              opacity: shown,
              transform: `translateY(${(1 - shown) * -30}px)`,
            }
      }
    >
      {reached.map((c, k) => {
        const on = c === cur;
        const at = wordAt(c.word) - 6;
        const pop = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
        // The previous chip greys out as the new one lands.
        const nextAt = reached[k + 1] ? wordAt(reached[k + 1].word) - 6 : null;
        const dim = nextAt === null ? 0 : interpolate(frame, [nextAt, nextAt + 10], [0, 1], clamp);
        const lit = on ? 1 : 1 - dim;
        const n = items.indexOf(c) + 1;
        return (
          <div
            key={c.i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: side ? "0 14px" : lit > 0.5 ? "10px 26px 10px 12px" : "8px 18px 8px 10px",
              height: side ? 84 : undefined,
              boxSizing: "border-box",
              borderRadius: side ? 26 : 999,
              background: lit > 0.5 ? colors.brandGradient : side ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.07)",
              border: `2px solid ${lit > 0.5 ? colors.brandOrange : "rgba(255,255,255,0.14)"}`,
              boxShadow: lit > 0.5 ? `0 0 ${16 + 10 * lit}px ${colors.brandOrange}99` : "none",
              transform: side ? `translateX(${(1 - pop) * 80}px) scale(${0.94 + 0.06 * lit})` : `scale(${pop * (0.86 + 0.14 * lit)})`,
              transformOrigin: "right center",
              opacity: pop,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: lit > 0.5 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.12)",
                color: lit > 0.5 ? colors.brandDeep : "rgba(255,255,255,0.5)",
                fontFamily: NUMBER_FONT_FAMILY,
                fontWeight: 800,
                fontSize: 32,
              }}
            >
              {n}
            </div>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontWeight: 800,
                fontSize: side ? 34 : lit > 0.5 ? 38 : 31,
                color: lit > 0.5 ? "#fff" : side ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.45)",
                textShadow: lit > 0.5 ? "0 2px 8px rgba(0,0,0,0.45)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {c.short ?? c.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Corner mode (Adil 2026-11-04, sales video): no pauses, no full-screen cards. The current topic sits top-left
// (small orange kicker + white title + brand underline) from its word; the next topic slides in and replaces it.
const CORNER_IN = 14;
const Corner: React.FC<{ ch: Chapters; frame: number; wordAt: WordAt }> = ({ ch, frame, wordAt }) => {
  const items = ch.items.map((c) => ({ ...c, at: wordAt(c.word) - 4 }));
  const end = ch.endWord !== undefined ? wordAt(ch.endWord) - 4 : Infinity;
  return (
    <>
      {items.map((c, i) => {
        const next = items[i + 1]?.at ?? end;
        const inK = interpolate(frame, [c.at, c.at + CORNER_IN], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const outK = interpolate(frame, [next - 2, next + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
        if (inK <= 0 || outK >= 1) return null;
        const line = interpolate(frame, [c.at + 6, c.at + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 56,
              top: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
              direction: "rtl",
              opacity: inK * (1 - outK),
              transform: `translateX(${(1 - inK) * -50 + outK * -30}px)`,
              filter: inK < 1 ? `blur(${(1 - inK) * 8}px)` : undefined,
            }}
          >
            {c.kicker ? <div style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, color: colors.green, textShadow: glow(colors.green) }}>{c.kicker}</div> : null}
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 50, color: colors.text, textShadow: `0 6px 14px ${colors.textShadow}`, whiteSpace: "nowrap" }}>{c.label}</div>
            <div style={{ alignSelf: "stretch", height: 6, borderRadius: 3, background: colors.brandGradient, transform: `scaleX(${line})`, transformOrigin: "right center", boxShadow: `0 0 14px ${colors.brandMagenta}` }} />
          </div>
        );
      })}
    </>
  );
};

// Top mode (Adil 2026-11-07, default from now): no full-screen title and no pause. The whole road sits in a row
// at the top from the first step. The step we're on is lit and grows a little as Adil announces it by voice,
// then settles; when its step is over it shrinks, greys out and a line is drawn through it (done). Steps still
// to come wait small and dim, so the viewer sees where we are and what's left.
const TopRow: React.FC<{ ch: Chapters; frame: number; wordAt: WordAt; shown: number }> = ({ ch, frame, wordAt, shown }) => {
  const items = ch.items.filter((c) => c.bar !== false).map((c) => ({ ...c, at: wordAt(c.word) - 4 }));
  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        direction: "rtl",
        opacity: shown,
        transform: `translateY(${(1 - shown) * -30}px)`,
      }}
    >
      {items.map((c, k) => {
        const nextAt = items[k + 1]?.at ?? (ch.endWord !== undefined ? wordAt(ch.endWord) - 4 : Infinity);
        const on = interpolate(frame, [c.at, c.at + 10], [0, 1], clamp) * interpolate(frame, [nextAt, nextAt + 12], [1, 0], clamp);
        const done = interpolate(frame, [nextAt, nextAt + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        // Arrival: the chip swells (~1.3×) as its step is announced, then settles over ~1s.
        const swell = interpolate(frame, [c.at, c.at + 8, c.at + 34], [1, 1.3, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const scale = (0.8 + 0.2 * on) * (frame >= c.at && frame < nextAt ? swell : 1);
        const strike = done;
        const fg = on > 0.5 ? "#fff" : done > 0.5 ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.3)";
        return (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: on > 0.5 ? "10px 24px 10px 10px" : "7px 16px 7px 8px",
              borderRadius: 999,
              background: on > 0.5 ? colors.brandGradient : "rgba(255,255,255,0.06)",
              border: `2px solid ${on > 0.5 ? colors.brandOrange : "rgba(255,255,255,0.1)"}`,
              boxShadow: on > 0.5 ? `0 0 ${18 * on}px ${colors.brandOrange}99, 0 8px 18px rgba(0,0,0,0.5)` : "none",
              transform: `scale(${scale})`,
              transformOrigin: "center top",
              zIndex: on > 0.5 ? 2 : 1,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: on > 0.5 ? "rgba(255,255,255,0.95)" : done > 0.5 ? `${colors.brandOrange}55` : "rgba(255,255,255,0.1)",
                color: on > 0.5 ? colors.brandDeep : "rgba(255,255,255,0.7)",
                fontFamily: NUMBER_FONT_FAMILY,
                fontWeight: 800,
                fontSize: done > 0.5 && on < 0.5 ? 26 : 28,
              }}
            >
              {done > 0.5 && on < 0.5 ? "✓" : k + 1}
            </div>
            <div style={{ position: "relative", fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 34, color: fg, whiteSpace: "nowrap", textShadow: on > 0.5 ? "0 2px 8px rgba(0,0,0,0.45)" : "none" }}>
              {c.short ?? c.label}
              {strike > 0 ? (
                <div style={{ position: "absolute", right: -4, left: -4, top: "54%", height: 4, borderRadius: 2, background: colors.brandOrange, opacity: 0.85, transform: `scaleX(${strike})`, transformOrigin: "right center" }} />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ChaptersOverlay: React.FC<{ ch: Chapters; frame: number; wordAt: WordAt }> = ({ ch, frame, wordAt }) => {
  if (ch.corner) return <Corner ch={ch} frame={frame} wordAt={wordAt} />;
  if (ch.top) {
    const shown = barShown(ch, wordAt, frame);
    return shown > 0 ? <TopRow ch={ch} frame={frame} wordAt={wordAt} shown={shown} /> : null;
  }
  const shown = barShown(ch, wordAt, frame);
  let n = 0;
  return (
    <>
      {shown > 0 ? <Bar ch={ch} frame={frame} wordAt={wordAt} shown={shown} /> : null}
      {ch.items.map((c, i) => {
        const num = c.bar !== false ? ++n : undefined;
        if (c.intro === false) return null;
        return (
          <Intro
            key={i}
            kicker={c.kicker ?? (num ? "الخطوة" : undefined)}
            num={c.kicker === undefined ? num : undefined}
            label={c.label}
            at={wordAt(c.word)}
            frame={frame}
            bar={c.bar !== false}
            side={ch.side && num !== undefined ? num - 1 : undefined}
          />
        );
      })}
    </>
  );
};

// Sound: a deep whoosh as the title card lands, an impact on the title, a whoosh as it flies up.
export const chapterCues = (ch: Chapters | undefined, wordAt: WordAt) =>
  ch?.corner || ch?.top
    ? ch.items.map((c) => ({ name: "swish" as const, at: wordAt(c.word) - 4, prio: 4 }))
    : (ch?.items ?? []).filter((c) => c.intro !== false).flatMap((c) => {
    const t0 = wordAt(c.word) - INTRO;
    return [
      { name: "whooshBig" as const, at: t0 + 2, prio: 5 },
      { name: "impact" as const, at: t0 + 10, prio: 5 },
      { name: "whoosh" as const, at: t0 + INTRO - FLY, prio: 5 },
    ];
  });
