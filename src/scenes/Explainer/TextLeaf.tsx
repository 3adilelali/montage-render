import { interpolate, random } from "remotion";
import { colors, toneColor, type ToneName } from "../../brand/colors";
import { FONT_FAMILY } from "../../brand/fonts";
import { CHARS_FRAMES } from "../../brand/motion";
import { clamp } from "./anim";
import { type Ctx, LINE_HEIGHT, startOf, TEXT_SIZE } from "./layout";
import type { TextItem } from "./types";

// White heavy text, dark drop shadow + faint bloom (refs). Coloured tones glow in their own colour.
export const textShadow = (tone: ToneName) =>
  tone === "white"
    ? `0 6px 14px ${colors.textShadow}, 0 2px 3px ${colors.textShadow}, 0 0 22px ${colors.textGlow}`
    : `0 6px 14px ${colors.textShadow}, 0 0 18px ${toneColor[tone]}, 0 0 42px ${toneColor[tone]}88`;

const mix = (a: string, b: string, t: number) => {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
};

export const TextLeaf: React.FC<{ item: TextItem; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const fs = TEXT_SIZE[item.size ?? "m"];
  const enter = item.enter ?? (ctx.calm ? "none" : "chars");
  let tone: ToneName = item.tone ?? "white";
  let color = toneColor[tone];
  if (item.toneAt !== undefined && item.toneTo) {
    const t = interpolate(ctx.frame, [startOf(ctx, item.toneAt), startOf(ctx, item.toneAt) + 4], [0, 1], clamp);
    color = mix(toneColor[tone].slice(1), toneColor[item.toneTo].slice(1), t);
    if (t > 0.5) tone = item.toneTo;
  }

  const lines = item.text.split("\n");
  // Word-by-word: each word appears when it is spoken (word indices follow item.word).
  let wordIndex = 0;
  const totalChars = Array.from(item.text.replace(/\n/g, "")).length;
  let charIndex = 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        direction: "rtl",
        fontFamily: FONT_FAMILY,
        fontWeight: ctx.calm && !item.enter ? 700 : 900,
        fontSize: fs,
        lineHeight: LINE_HEIGHT,
        color,
        textShadow: ctx.calm && tone === "white" ? `0 4px 12px ${colors.textShadow}` : textShadow(tone),
        whiteSpace: "nowrap",
      }}
    >
      {lines.map((line, li) => {
        if (enter === "words") {
          return (
            <div key={li}>
              {line.split(" ").map((w, wi) => {
                const at = startOf(ctx, item.word + wordIndex++) - startOf(ctx, item.word);
                const k = interpolate(local - at, [0, 4], [0, 1], clamp);
                return (
                  <span key={wi} style={{ display: "inline-block", opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${0.7 + 0.3 * k})`, filter: k < 1 ? `blur(${(1 - k) * 10}px)` : undefined }}>
                    {w}
                    {wi < line.split(" ").length - 1 ? " " : ""}
                  </span>
                );
              })}
            </div>
          );
        }
        if (enter === "chars") {
          // Letters light up in a scrambled order (refs show half-revealed, disconnected letters).
          const chars = Array.from(line);
          return (
            <div key={li}>
              {chars.map((c, ci) => {
                const order = random(`${item.text}-${charIndex++}`);
                const at = order * CHARS_FRAMES * Math.min(1.6, Math.max(0.8, totalChars / 14));
                const k = interpolate(local - at, [0, 3], [0, 1], clamp);
                return (
                  <span key={ci} style={{ opacity: k }}>
                    {c}
                  </span>
                );
              })}
            </div>
          );
        }
        return <div key={li}>{line}</div>;
      })}
    </div>
  );
};
