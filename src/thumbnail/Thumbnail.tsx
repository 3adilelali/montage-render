// YouTube thumbnail (1280×720), rendered as a Remotion still.
// Layer 1: a 3D hero from Gemini (cut out with rembg into public/thumbnail/).
// Layer 2: everything else is code — background, glow, words, pill, grain.
// Layout follows المراجع/دراسة-الصور-المصغرة/00-الدراسة.md §8: words right, hero left.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT_FAMILY } from "../brand/fonts";

export type ThumbnailProps = {
  hero: string; // file in public/thumbnail/
  brand: string; // English brand line, Claude orange
  word: string; // Arabic line, white
  pill: string; // short promise in the orange pill
  theme?: "dark" | "light"; // light (2026-11-03): cream background, dark-purple words
  wordSize?: number; // Arabic line size (long words need less than 210)
  heroHeight?: number;
};

export const thumbnailDefaults: ThumbnailProps = {
  hero: "hero.png",
  brand: "Claude",
  word: "منتجه",
  pill: "بدون مونتير",
};

const C = {
  deep: "#14091f",
  purple: "#412161",
  violet: "#9224C5",
  orange: "#F79247",
  claude: "#D97757",
  cream: "#FBFAF8",
};

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const Thumbnail: React.FC<ThumbnailProps> = (props) => (props.theme === "light" ? <LightThumbnail {...props} /> : <DarkThumbnail {...props} />);

// Light version: warm cream paper, a soft peach/lavender glow behind the hero, words in deep purple + orange.
const LightThumbnail: React.FC<ThumbnailProps> = ({ hero, brand, word, pill, wordSize = 210, heroHeight = 670 }) => (
  <AbsoluteFill style={{ background: "#FFF7EF", overflow: "hidden", fontFamily: FONT_FAMILY }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 90% at 26% 55%, #FFE0C7 0%, #FCEFE6 45%, #F4ECF8 100%)" }} />
    <AbsoluteFill
      style={{
        background: "repeating-conic-gradient(from 0deg at 26% 52%, rgba(247,146,71,0.07) 0deg 6deg, transparent 6deg 18deg)",
        WebkitMaskImage: "radial-gradient(circle at 26% 52%, black 0%, transparent 62%)",
      }}
    />
    <div style={{ position: "absolute", right: -160, top: -200, width: 720, height: 720, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,78,215,0.18) 0%, transparent 70%)" }} />
    <div style={{ position: "absolute", left: 60, top: 130, width: 560, height: 560, borderRadius: "50%", background: `radial-gradient(circle, ${C.orange}66 0%, ${C.orange}22 45%, transparent 70%)`, filter: "blur(24px)" }} />
    <div style={{ position: "absolute", left: 120, top: 676, width: 420, height: 46, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(65,33,97,0.35) 0%, transparent 70%)" }} />
    <Img src={staticFile(`thumbnail/${hero}`)} style={{ position: "absolute", left: -34, bottom: -6, height: heroHeight, filter: "drop-shadow(0 20px 26px rgba(65,33,97,0.28))" }} />
    <div style={{ position: "absolute", right: 56, top: 70, width: 620, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3, color: C.purple, textShadow: "0 6px 0 rgba(65,33,97,0.15)" }}>{brand}</div>
      <div
        dir="rtl"
        style={{
          fontSize: wordSize,
          fontWeight: 900,
          lineHeight: 1.1,
          backgroundImage: `linear-gradient(180deg, #FFA43A 20%, #EE7A2C 85%)`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 6px 0 #9a4512) drop-shadow(0 12px 18px rgba(154,69,18,0.25))",
          whiteSpace: "nowrap",
        }}
      >
        {word}
      </div>
      <div
        dir="rtl"
        style={{
          marginTop: 22,
          marginRight: 8,
          padding: "10px 38px 18px",
          borderRadius: 999,
          background: "linear-gradient(100deg, #7B2FB8 0%, #412161 100%)",
          color: "#fff",
          fontSize: 68,
          fontWeight: 900,
          transform: "rotate(-3deg)",
          boxShadow: "0 10px 0 #2a1442, 0 18px 26px rgba(65,33,97,0.35)",
        }}
      >
        {pill}
      </div>
    </div>
    <AbsoluteFill style={{ backgroundImage: grain, opacity: 0.05, mixBlendMode: "multiply" }} />
  </AbsoluteFill>
);

const DarkThumbnail: React.FC<ThumbnailProps> = ({ hero, brand, word, pill, wordSize = 210, heroHeight = 670 }) => {
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden", fontFamily: FONT_FAMILY }}>
      {/* Base: warm purple light from the hero side, falling off to near-black */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 95% at 28% 55%, ${C.purple} 0%, #2a1442 45%, ${C.deep} 100%)`,
        }}
      />
      {/* Faint light rays behind the hero */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from 0deg at 26% 52%, rgba(255,255,255,0.045) 0deg 6deg, transparent 6deg 18deg)`,
          WebkitMaskImage: "radial-gradient(circle at 26% 52%, black 0%, transparent 62%)",
        }}
      />
      {/* Orange glow behind the hero */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 90,
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.claude}cc 0%, ${C.orange}55 35%, transparent 70%)`,
          filter: "blur(30px)",
        }}
      />
      {/* Floor shadow */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 672,
          width: 480,
          height: 60,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)",
        }}
      />
      {/* Hero, with a thin warm rim so the black chair and beret separate from the dark */}
      <Img
        src={staticFile(`thumbnail/${hero}`)}
        style={{
          position: "absolute",
          left: -34,
          bottom: -14,
          height: heroHeight,
          filter:
            "drop-shadow(0 0 1.5px rgba(255,214,180,0.9)) drop-shadow(0 0 18px rgba(247,146,71,0.45)) drop-shadow(0 24px 30px rgba(0,0,0,0.55))",
        }}
      />

      {/* Words: right side, read first */}
      <div
        style={{
          position: "absolute",
          right: 56,
          top: 64,
          width: 600,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            fontSize: 172,
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: -3,
            color: C.cream,
            textShadow: "0 6px 0 rgba(0,0,0,0.35), 0 14px 30px rgba(0,0,0,0.6)",
          }}
        >
          {brand}
        </div>
        <div
          dir="rtl"
          style={{
            fontSize: wordSize,
            fontWeight: 900,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            marginTop: 0,
            backgroundImage: `linear-gradient(180deg, #FFAD43 20%, ${C.orange} 80%)`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 6px 0 #8a3f12) drop-shadow(0 14px 24px rgba(0,0,0,0.6))",
          }}
        >
          {word}
        </div>
        <div
          dir="rtl"
          style={{
            marginTop: 26,
            marginRight: 8,
            padding: "10px 34px 18px",
            borderRadius: 999,
            background: C.cream,
            color: C.purple,
            fontSize: 68,
            fontWeight: 900,
            transform: "rotate(-3deg)",
            boxShadow: "0 10px 0 #b9a9c9, 0 18px 30px rgba(0,0,0,0.5)",
          }}
        >
          {pill}
        </div>
      </div>


      {/* Vignette + grain */}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />
      <AbsoluteFill style={{ backgroundImage: grain, opacity: 0.07, mixBlendMode: "overlay" }} />
    </AbsoluteFill>
  );
};
