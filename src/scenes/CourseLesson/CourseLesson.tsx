// كورس كلود بالعربي: lesson montage (template for every lesson).
// Data: public/course/<lessonId>/{cut.mp4, voice.wav, lesson.json} from scripts/course-cut.mjs.
// Screen mode = the cropped recording inset on brand purple, rounded corners.
// Talk mode = light course board: top title, section header, numbered cards / pills, logo.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../../brand/fonts";

type Seg = { src: number; mode: "talk" | "screen"; from: number; to: number; cropW: number };
type Card = { group: string; n: number; text: string; frame: number; until: number };
type Lesson = {
  title: string;
  lesson: number;
  lessonTitle: string;
  durationInFrames: number;
  width: number;
  height: number;
  segments: Seg[];
  cards: Card[];
  headers: { text: string; frame: number }[];
};
export type CourseLessonProps = { lessonId: string; lesson: Lesson | null };

const PURPLE = "#412161";
const PURPLE2 = "#5A2E85";
const ORANGE = "#D97757";
const CREAM = "#FBFAF8";
const END = 150; // end card after the voice
const FADE = 0; // hard cut between screen and talk (Adil 2026-11-09)

export const calculateCourseMetadata: CalculateMetadataFunction<CourseLessonProps> = async ({ props }) => {
  const lesson: Lesson = await fetch(staticFile(`course/${props.lessonId}/lesson.json`)).then((r) => r.json());
  return { durationInFrames: lesson.durationInFrames + END, props: { ...props, lesson } };
};

const segAt = (segs: Seg[], f: number) => segs.find((s) => f >= s.from && f < s.to) ?? segs[segs.length - 1];

// 1 = talk board fully on, 0 = screen. Short crossfade around every mode change.
const talkness = (segs: Seg[], f: number, total: number) => {
  if (f >= total) return 1;
  const cur = segAt(segs, f);
  let v = cur.mode === "talk" ? 1 : 0;
  for (let i = 1; i < segs.length; i++) {
    const a = segs[i - 1];
    const b = segs[i];
    if (a.mode === b.mode) continue;
    if (FADE > 0 && Math.abs(f - b.from) < FADE)
      v = interpolate(f, [b.from - FADE, b.from + FADE], [a.mode === "talk" ? 1 : 0, b.mode === "talk" ? 1 : 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  }
  return v;
};

const Spark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    {[0, 45, 90, 135].map((r) => (
      <rect key={r} x="10.8" y="1" width="2.4" height="22" rx="1.2" fill={ORANGE} transform={`rotate(${r} 12 12)`} />
    ))}
  </svg>
);

const ScreenLayer: React.FC<{ lesson: Lesson; lessonId: string }> = ({ lesson, lessonId }) => {
  const f = useCurrentFrame();
  const seg = segAt(lesson.segments, Math.min(f, lesson.durationInFrames - 1));
  const maxW = 1800;
  const maxH = 968;
  const aspect = seg.cropW / lesson.height;
  let h = maxH;
  let w = h * aspect;
  if (w > maxW) {
    w = maxW;
    h = w / aspect;
  }
  const videoW = h * (lesson.width / lesson.height);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${PURPLE2} 0%, ${PURPLE} 55%, #26123b 100%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          borderRadius: 26,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 30px 80px rgba(10,0,25,0.55), 0 0 0 2px rgba(255,255,255,0.10)",
          background: "#fff",
        }}
      >
        <OffthreadVideo
          src={staticFile(`course/${lessonId}/cut.mp4`)}
          muted
          style={{ position: "absolute", top: 0, left: 0, width: videoW, height: h, maxWidth: "none", objectFit: "fill" }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Board: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = lesson.durationInFrames;
  const ending = f >= total;
  const header = [...lesson.headers].reverse().find((h) => h.frame <= f + 2);
  const cards = ending ? [] : lesson.cards.filter((c) => c.frame <= f && f < c.until);
  const pills = cards.filter((c) => c.n === 0);
  const numbered = cards.filter((c) => c.n > 0);
  const hasCards = cards.length > 0;
  const headerIn = header ? spring({ frame: f - header.frame, fps, config: { damping: 20, stiffness: 140 } }) : 0;
  const breathe = 1 + Math.sin(f / 22) * 0.015;
  const endIn = spring({ frame: f - total, fps, config: { damping: 16, stiffness: 120 } });

  return (
    <AbsoluteFill
      style={{
        background: CREAM,
        backgroundImage: `linear-gradient(rgba(65,33,97,0.055) 2px, transparent 2px), linear-gradient(90deg, rgba(65,33,97,0.055) 2px, transparent 2px)`,
        backgroundSize: "64px 64px",
        backgroundPosition: `${(f * 0.25) % 64}px ${(f * 0.25) % 64}px`,
        fontFamily: FONT_FAMILY,
        direction: "rtl",
      }}
    >
      {/* floating purple squares */}
      {[
        [140, 220, 26, 0],
        [1760, 300, 18, 40],
        [260, 880, 20, 80],
        [1680, 860, 30, 120],
        [960, 980, 14, 160],
      ].map(([x, y, s, ph], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y + Math.sin((f + ph) / 40) * 10,
            width: s,
            height: s,
            borderRadius: 6,
            background: i % 2 ? PURPLE2 : ORANGE,
            opacity: 0.22,
            transform: `rotate(${(f + ph) * 0.4}deg)`,
          }}
        />
      ))}
      {/* top title */}
      <div style={{ position: "absolute", top: 50, width: "100%", display: "flex", justifyContent: "center", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: PURPLE,
            color: "#fff",
            padding: "12px 30px",
            borderRadius: 999,
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <Spark size={30} />
          {lesson.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            color: PURPLE,
            border: `3px solid ${PURPLE}`,
            padding: "8px 26px",
            borderRadius: 999,
            fontSize: 32,
            fontWeight: 800,
          }}
        >
          الدرس {lesson.lesson}
        </div>
      </div>

      {ending ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40, opacity: 1 }}>
          <Img src={staticFile("course/logo.jpg")} style={{ width: 230, height: 230, borderRadius: "50%", boxShadow: "0 18px 50px rgba(65,33,97,0.3)" }} />
          <div style={{ fontSize: 84, fontWeight: 900, color: PURPLE }}>نلتقي بالدرس {lesson.lesson + 1}</div>
        </AbsoluteFill>
      ) : hasCards ? (
        <>
          {header && (
            <div style={{ position: "absolute", top: 165, width: "100%", textAlign: "center", fontSize: 70, fontWeight: 900, color: PURPLE, opacity: headerIn }}>
              {header.text}
            </div>
          )}
          <Img
            src={staticFile("course/logo.jpg")}
            style={{
              position: "absolute",
              left: 150,
              top: 400,
              width: 300,
              height: 300,
              borderRadius: "50%",
              transform: `scale(${breathe})`,
              boxShadow: "0 18px 50px rgba(65,33,97,0.3)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 170,
              top: 290,
              width: 1180,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {numbered.map((c) => {
              const s = spring({ frame: f - c.frame, fps, config: { damping: 15, stiffness: 160, mass: 0.7 } });
              return (
                <div
                  key={c.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 26,
                    background: "#fff",
                    borderRadius: 22,
                    padding: "16px 26px",
                    boxShadow: "0 10px 30px rgba(65,33,97,0.12)",
                    border: "2px solid rgba(65,33,97,0.08)",
                    opacity: s,
                    transform: `translateX(${(1 - s) * -60}px) scale(${0.92 + s * 0.08})`,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 18,
                      background: ORANGE,
                      color: "#fff",
                      fontSize: 40,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {c.n}
                  </div>
                  <div style={{ fontSize: numbered.length > 4 ? 44 : 52, fontWeight: 700, color: PURPLE }}>{c.text}</div>
                </div>
              );
            })}
            {pills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 22, marginTop: numbered.length ? 16 : 120, justifyContent: "center" }}>
                {pills.map((c, i) => {
                  const s = spring({ frame: f - c.frame, fps, config: { damping: 11, stiffness: 190, mass: 0.6 } });
                  return (
                    <div
                      key={c.text}
                      style={{
                        fontSize: 54,
                        fontWeight: 800,
                        color: i % 2 ? "#fff" : PURPLE,
                        background: i % 2 ? PURPLE2 : "#fff",
                        border: `3px solid ${PURPLE2}`,
                        padding: "14px 38px",
                        borderRadius: 999,
                        transform: `scale(${s}) rotate(${(i % 2 ? 1 : -1) * 2}deg)`,
                        boxShadow: "0 10px 26px rgba(65,33,97,0.15)",
                      }}
                    >
                      {c.text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46 }}>
          <Img
            src={staticFile("course/logo.jpg")}
            style={{ width: 280, height: 280, borderRadius: "50%", transform: `scale(${breathe})`, boxShadow: "0 18px 50px rgba(65,33,97,0.3)" }}
          />
          {header && (
            <div style={{ fontSize: 96, fontWeight: 900, color: PURPLE, opacity: headerIn, transform: `translateY(${(1 - headerIn) * 30}px)` }}>
              {header.text}
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const CourseLesson: React.FC<CourseLessonProps> = ({ lessonId, lesson }) => {
  const f = useCurrentFrame();
  if (!lesson) return null;
  const t = talkness(lesson.segments, f, lesson.durationInFrames);
  const switches = lesson.segments.filter((s, i) => i > 0 && s.mode !== lesson.segments[i - 1].mode).map((s) => s.from);
  return (
    <AbsoluteFill style={{ background: PURPLE }}>
      {t < 1 && <ScreenLayer lesson={lesson} lessonId={lessonId} />}
      {t > 0 && (
        <AbsoluteFill style={{ opacity: t }}>
          <Board lesson={lesson} />
        </AbsoluteFill>
      )}
      <Audio src={staticFile(`course/${lessonId}/voice.flac`)} />
      {lesson.cards.map((c) => (
        <Sequence key={c.text} from={c.frame} durationInFrames={20}>
          <Audio src={staticFile("assets/sfx/pop.wav")} volume={0.16} />
        </Sequence>
      ))}
      {switches.map((s) => (
        <Sequence key={s} from={Math.max(0, s - 3)} durationInFrames={30}>
          <Audio src={staticFile("assets/sfx/whoosh-simple.wav")} volume={0.12} />
        </Sequence>
      ))}
      <Sequence from={lesson.durationInFrames} durationInFrames={30}>
        <Audio src={staticFile("assets/sfx/whoosh-simple.wav")} volume={0.12} />
      </Sequence>
    </AbsoluteFill>
  );
};
