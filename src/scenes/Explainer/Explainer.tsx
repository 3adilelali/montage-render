import { Audio } from "@remotion/media";
import type { Caption } from "@remotion/captions";
import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  type CalculateMetadataFunction,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY, fontsLoaded } from "../../brand/fonts";
import { CAMERA_PUSH, FPS, OUTRO_FADE, PUSH_BLUR, PUSH_DISTANCE, SCENE_LEAD, TRANSITION, WHIP_BLUR, WHIP_DISTANCE } from "../../brand/motion";
import { SFX, type SfxName } from "../../brand/sfx";
import { Sfx } from "../../components/Sfx";
import { clamp, leafAnim } from "./anim";
import { BadgeLeaf, CardLeaf, CounterLeaf, NumberLeaf, Rays, RibbonLeaf, RingLeaf, ScribbleLeaf, SearchLeaf, StepsLeaf, SubscribeLeaf } from "./Graphics";
import { HostLeaf } from "./Host";
import { type Branch, type Ctx, place, type Placed } from "./layout";
import { TextLeaf } from "./TextLeaf";
import type { Assets, ExplainerProps, Item, Leaf, Levels, Plan, Scene, Screens, Timeline, Transition } from "./types";
import { registerIcons3d, VisualLeaf } from "./VisualLeaf";
import { BarsLeaf, CarouselLeaf, MeterLeaf } from "./Extras";
import { CodeMC, DocMC, FramesMC, LevelsMC, PostMC, RhythmMC } from "./MotionCards2";
import { ChatMC, PriceMC, Title3DLeaf } from "./MotionCards3";
import { DevicesMC, HubMC, ModelsMC, ProjectMC, PromptMC, SkillMC } from "./MotionCards4";
import { CommunityMC, EmailMC, MemberMC, PageMC } from "./MotionCards5";
import { ChartMC, FlowMC, FormMC, GridMC, SearchMC, TypingMC, WeekMC } from "./MotionCards";
import { BoardOverlay, headerBlocks } from "./Board";
import { barShown, chapterCues, ChaptersOverlay } from "./Chapters";
import { inScreen, ScreenLayer } from "./Screen";
import { ShotMC } from "./Shot";
import { ArrowLeaf, BannerLeaf, Bar3DLeaf, Burst, ChecklistLeaf, ClaudeMC, DiscLeaf, Fly3DLeaf, FolderMC, MultiplyLeaf, PlayerMC, XStampLeaf } from "./Skool";

// Explainer (voice → motion graphics, 1920×1080). Style: الأسلوب/أسلوب-المونتاج.md.
// Data: public/explainer/{timeline,captions,plan,assets,levels}.json — see .claude/skills/montage.

const DATA = "explainer";
const VO_DUCK = 0.75;
const toFrame = (ms: number) => Math.round((ms / 1000) * FPS);

const emptyAssets: Assets = { files: {}, icons: [], logo: null, music: null, sfxUser: [] };

const loadJson = async <T,>(file: string): Promise<T> => {
  const res = await fetch(staticFile(`${DATA}/${file}`));
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  return res.json();
};

export const calculateExplainerMetadata: CalculateMetadataFunction<ExplainerProps> = async ({ props }) => {
  try {
    const [timeline, captions, plan] = await Promise.all([
      loadJson<Timeline>("timeline.json"),
      loadJson<Caption[]>("captions.json"),
      loadJson<Plan>("plan.json"),
    ]);
    const assets = await loadJson<Assets>("assets.json").catch(() => emptyAssets);
    const levels = await loadJson<Levels>("levels.json").catch(() => null);
    // Only plans that opt in (plan.screens) use the laptop-screen parts.
    const screens = plan.screens ? await loadJson<Screens>("screens.json").catch(() => null) : null;
    return {
      durationInFrames: Math.max(1, Math.ceil((timeline.durationMs / 1000) * FPS)),
      props: { ...props, timeline, captions, plan, assets, levels, screens },
    };
  } catch {
    return { durationInFrames: 90, props: { ...props, timeline: null } };
  }
};

// Re-render once the fonts are in, so text is measured with the real glyphs.
const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("Measuring text"));
  useEffect(() => {
    fontsLoaded.then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
};

type TimedScene = Scene & { start: number; end: number; enter: Transition; exit: Transition | null; index: number; under?: boolean; side?: boolean; corner?: boolean };

const buildScenes = (plan: Plan, wordAt: (i: number) => number, total: number): TimedScene[] => {
  const starts = plan.scenes.map((s, i) => (i === 0 ? 0 : Math.max(0, wordAt(s.from) - SCENE_LEAD)));
  // A new step never opens on the old step's last picture (Adil 2026-11-07): the first scene after a chapter word
  // starts on that word, even if the plan starts it a few words later.
  if (!plan.chapters?.corner)
    for (const c of plan.chapters?.items ?? []) {
      const j = plan.scenes.findIndex((s) => s.from >= c.word);
      if (j > 0 && plan.scenes[j].from > c.word && plan.scenes[j - 1].from < c.word) starts[j] = Math.max(starts[j - 1] + 1, wordAt(c.word) - SCENE_LEAD);
    }
  return plan.scenes.map((s, i) => ({
    ...s,
    index: i,
    start: starts[i],
    end: starts[i + 1] ?? total,
    enter: i === 0 ? "cut" : (s.transition ?? plan.transition ?? "whip"),
    exit: plan.scenes[i + 1] ? (plan.scenes[i + 1].transition ?? plan.transition ?? "whip") : null,
    // Under the pinned chapter row: the scene sits lower and a bit smaller.
    under: barShown(plan.chapters, wordAt, Math.max(starts[i], wordAt(s.from)) + 24) > 0.5,
  })).map((s) => ({ ...s, side: !!(s.under && plan.chapters?.side), corner: !!plan.chapters?.corner }));
};

const Background: React.FC<{ rays: boolean; frame: number }> = ({ rays, frame }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.bgTop} 0%, ${colors.bgMid} 38%, ${colors.bgBottom} 100%)` }}>
    {/* Brand aura: a faint deep-purple glow top-right and a warmer magenta/orange hint bottom-left, drifting slowly. */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 60% at ${78 + Math.sin(frame / 140) * 4}% ${12 + Math.cos(frame / 170) * 4}%, ${colors.brandDeep}b3 0%, transparent 70%), radial-gradient(ellipse 45% 45% at ${14 + Math.cos(frame / 160) * 3}% ${92 + Math.sin(frame / 150) * 3}%, ${colors.brandMagenta}2e 0%, transparent 70%)`,
      }}
    />
    {/* Fine diagonal grain (refs 2–3). */}
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.022) 0 2px, transparent 2px 7px)" }} />
    {rays ? (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 0.9 }}>
        <Rays size={2400} spin={frame * 0.25} />
      </AbsoluteFill>
    ) : null}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
  </AbsoluteFill>
);

const renderLeaf = (p: Placed, ctx: Ctx, local: number, levels: Levels | null) => {
  const { item } = p;
  switch (item.type) {
    case "text":
      return <TextLeaf item={item} ctx={ctx} local={local} />;
    case "visual":
      return <VisualLeaf item={item} ctx={ctx} local={local} />;
    case "number":
      return <NumberLeaf item={item} />;
    case "counter":
      return <CounterLeaf item={item} local={local} />;
    case "steps":
      return <StepsLeaf item={item} ctx={ctx} local={local} />;
    case "card":
      return <CardLeaf item={item} local={local} fps={ctx.fps} />;
    case "badge":
      return <BadgeLeaf item={item} />;
    case "ribbon":
      return <RibbonLeaf item={item} />;
    case "ring":
      return <RingLeaf item={item} local={local} fps={ctx.fps} />;
    case "search":
      return <SearchLeaf item={item} ctx={ctx} local={local} />;
    case "scribble":
      return <ScribbleLeaf item={item} local={local} />;
    case "subscribe":
      return <SubscribeLeaf item={item} ctx={ctx} local={local} />;
    case "host":
      return <HostLeaf item={item} frame={ctx.frame} assets={ctx.assets} levels={levels} />;
    case "mc-code":
      return <CodeMC item={item} ctx={ctx} local={local} />;
    case "mc-post":
      return <PostMC item={item} ctx={ctx} local={local} />;
    case "mc-levels":
      return <LevelsMC item={item} ctx={ctx} local={local} />;
    case "mc-doc":
      return <DocMC item={item} ctx={ctx} local={local} />;
    case "mc-rhythm":
      return <RhythmMC item={item} ctx={ctx} local={local} />;
    case "mc-frames":
      return <FramesMC item={item} ctx={ctx} local={local} />;
    case "mc-hub":
      return <HubMC item={item} ctx={ctx} local={local} />;
    case "mc-devices":
      return <DevicesMC item={item} ctx={ctx} local={local} />;
    case "mc-project":
      return <ProjectMC item={item} ctx={ctx} local={local} />;
    case "mc-prompt":
      return <PromptMC item={item} ctx={ctx} local={local} />;
    case "mc-skill":
      return <SkillMC item={item} ctx={ctx} local={local} />;
    case "mc-models":
      return <ModelsMC item={item} ctx={ctx} local={local} />;
    case "mc-chat":
      return <ChatMC item={item} ctx={ctx} local={local} />;
    case "title-3d":
      return <Title3DLeaf item={item} ctx={ctx} local={local} />;
    case "mc-price":
      return <PriceMC item={item} ctx={ctx} local={local} />;
    case "mc-search":
      return <SearchMC item={item} ctx={ctx} local={local} />;
    case "mc-flow":
      return <FlowMC item={item} ctx={ctx} local={local} />;
    case "mc-chart":
      return <ChartMC item={item} local={local} />;
    case "mc-week":
      return <WeekMC item={item} local={local} />;
    case "mc-form":
      return <FormMC item={item} ctx={ctx} local={local} />;
    case "mc-typing":
      return <TypingMC item={item} ctx={ctx} local={local} />;
    case "mc-grid":
      return <GridMC item={item} ctx={ctx} local={local} />;
    case "meter":
      return <MeterLeaf item={item} ctx={ctx} local={local} />;
    case "bars":
      return <BarsLeaf item={item} ctx={ctx} local={local} />;
    case "carousel":
      return <CarouselLeaf item={item} ctx={ctx} local={local} />;
    case "bar3d":
      return <Bar3DLeaf item={item} ctx={ctx} local={local} />;
    case "banner":
      return <BannerLeaf item={item} ctx={ctx} local={local} />;
    case "disc":
      return <DiscLeaf item={item} ctx={ctx} local={local} />;
    case "xstamp":
      return <XStampLeaf item={item} ctx={ctx} local={local} />;
    case "arrow":
      return <ArrowLeaf item={item} ctx={ctx} local={local} />;
    case "multiply":
      return <MultiplyLeaf item={item} ctx={ctx} local={local} />;
    case "checklist":
      return <ChecklistLeaf item={item} ctx={ctx} local={local} />;
    case "fly3d":
      return <Fly3DLeaf item={item} ctx={ctx} local={local} />;
    case "mc-claude":
      return <ClaudeMC item={item} ctx={ctx} local={local} />;
    case "mc-folder":
      return <FolderMC item={item} ctx={ctx} local={local} />;
    case "mc-player":
      return <PlayerMC item={item} ctx={ctx} local={local} />;
    case "mc-page":
      return <PageMC item={item} ctx={ctx} local={local} />;
    case "mc-email":
      return <EmailMC item={item} ctx={ctx} local={local} />;
    case "mc-member":
      return <MemberMC item={item} ctx={ctx} local={local} />;
    case "mc-community":
      return <CommunityMC item={item} ctx={ctx} local={local} />;
    case "shot":
      return <ShotMC item={item} ctx={ctx} local={local} />;
  }
};

// Glowing dotted branch from a tree root to a leaf, drawn in 10f.
const BranchLine: React.FC<{ b: Branch; frame: number }> = ({ b, frame }) => {
  const draw = interpolate(frame - b.at, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * b.weight;
  if (draw <= 0) return null;
  const mx = b.to.x;
  const my = b.from.y;
  const d = Math.abs(b.to.x - b.from.x) < 4 ? `M ${b.from.x} ${b.from.y} L ${b.to.x} ${b.to.y}` : `M ${b.from.x} ${b.from.y} Q ${mx} ${my} ${b.to.x} ${b.to.y}`;
  const id = `bm-${Math.round(b.to.x)}-${Math.round(b.to.y)}`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <mask id={id}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={20} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeDasharray="0.1 15" mask={`url(#${id})`} style={{ filter: "drop-shadow(0 0 4px #fff) drop-shadow(0 0 10px rgba(255,255,255,0.7))" }} />
    </svg>
  );
};

const SceneView: React.FC<{ scene: TimedScene; ctxBase: Omit<Ctx, "sceneStart" | "sceneEnd">; levels: Levels | null }> = ({ scene, ctxBase, levels }) => {
  const { frame } = ctxBase;
  const ctx: Ctx = { ...ctxBase, sceneStart: scene.start, sceneEnd: scene.end, calm: ctxBase.calmFrom !== undefined && scene.start >= ctxBase.calmFrom - 2 && (ctxBase.calmTo === undefined || scene.start < ctxBase.calmTo - 2) };
  const root: Item = { type: "group", dir: scene.layout ?? "stack", gap: scene.gap, items: scene.items };
  // Board mode: content sits lower, under the pinned title.
  // Side column (offer list): content centred in the space left of the column.
  const { out: placed, branches } = place(root, ctx, scene.side ? 760 : 960, scene.header ? 615 : scene.side ? 540 : scene.corner ? 590 : scene.under ? 572 : 540);

  // Enter / exit transitions.
  const tIn = TRANSITION[scene.enter];
  const tOut = scene.exit ? TRANSITION[scene.exit] : 0;
  const pin = tIn ? interpolate(frame, [scene.start, scene.start + tIn], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
  const pout = tOut ? interpolate(frame, [scene.end, scene.end + tOut], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  let x = 0;
  let y = 0;
  let vblur = 0;
  // push alternates direction scene by scene: one scene leaves upwards, the next downwards.
  const dirIn = scene.index % 2 === 0 ? 1 : -1;
  const dirOut = -dirIn;
  // Corner title (top-left): content a bit smaller and lower so tall cards never cover it.
  let scale = (scene.side ? 0.84 : scene.corner ? 0.86 : scene.under ? 0.9 : 1) * (1 + CAMERA_PUSH * (ctx.calm ? 0.35 : 1) * interpolate(frame, [scene.start, scene.end], [0, 1], clamp));
  let hblur = 0;
  let blur = 0;
  let opacity = 1;
  let glitch = 0;
  if (scene.enter === "whip") {
    x += (1 - pin) * WHIP_DISTANCE;
    hblur += (1 - pin) * WHIP_BLUR;
  } else if (scene.enter === "zoom") {
    scale *= 1 + (1 - pin) * 0.45;
    blur += (1 - pin) * 18;
    opacity *= pin;
  } else if (scene.enter === "glitch") {
    glitch = 1 - pin;
    opacity *= interpolate(frame, [scene.start + 2, scene.start + 4], [0, 1], clamp);
  } else if (scene.enter === "fade") {
    opacity *= pin;
    blur += (1 - pin) * 8;
  } else if (scene.enter === "push") {
    y += (1 - pin) * PUSH_DISTANCE * dirIn;
    vblur += (1 - pin) * PUSH_BLUR;
  } else if (scene.enter === "through") {
    // Comes out of the old scene's centre.
    scale *= interpolate(pin, [0, 1], [0.55, 1]);
    blur += (1 - pin) * 22;
    opacity *= interpolate(pin, [0, 0.35], [0, 1], clamp);
  } else if (scene.enter === "black") {
    opacity *= pin;
    blur += (1 - pin) * 16;
    scale *= 1 + (1 - pin) * 0.08;
  }
  if (scene.exit === "whip") {
    x -= pout * WHIP_DISTANCE;
    hblur += pout * WHIP_BLUR;
    opacity *= 1 - pout * 0.6;
  } else if (scene.exit === "zoom") {
    // The old scene clears in 4f so it never sits on top of the incoming reveal.
    scale *= 1 - pout * 0.35;
    blur += pout * 18;
    opacity *= interpolate(frame, [scene.end, scene.end + 4], [1, 0], clamp);
  } else if (scene.exit === "glitch") {
    glitch = Math.max(glitch, interpolate(frame, [scene.end, scene.end + 3], [0, 1], clamp));
    opacity *= interpolate(frame, [scene.end, scene.end + 3], [1, 0], clamp);
  } else if (scene.exit === "fade") {
    opacity *= 1 - pout;
  } else if (scene.exit === "push") {
    y += pout * PUSH_DISTANCE * dirOut;
    vblur += pout * PUSH_BLUR;
    opacity *= 1 - pout * 0.5;
  } else if (scene.exit === "through") {
    // The camera flies into the frame centre.
    scale *= 1 + pout * pout * 5;
    blur += pout * 26;
    opacity *= interpolate(pout, [0.45, 1], [1, 0], clamp);
  } else if (scene.exit === "black") {
    opacity *= 1 - pout;
  } else if (scene.exit === "trail" || scene.exit === "flash") {
    opacity *= interpolate(frame, [scene.end, scene.end + 4], [1, 0], clamp);
  }
  const jitter = glitch > 0 ? (random(`g${frame}`) - 0.5) * 60 * glitch : 0;
  const filterId = `hb-${scene.index}`;
  const filters = [hblur > 0.5 || vblur > 0.5 ? `url(#${filterId})` : "", blur > 0.5 ? `blur(${blur}px)` : "", glitch > 0 ? `drop-shadow(${12 * glitch}px 0 0 rgba(224,75,168,0.85)) drop-shadow(${-12 * glitch}px 0 0 rgba(160,78,215,0.85))` : ""].filter(Boolean).join(" ");

  return (
    <AbsoluteFill style={{ transform: `translate(${x + jitter}px, ${y}px) scale(${scale})`, opacity, filter: filters || undefined }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={`${hblur.toFixed(1)} ${vblur.toFixed(1)}`} />
        </filter>
      </svg>
      {branches.map((b, i) => (
        <BranchLine key={i} b={b} frame={frame} />
      ))}
      {placed.map((p, i) => {
        const a = leafAnim(p, ctx);
        if (!a.visible) return null;
        const it = p.item;
        return (
          <div key={i} style={a.style}>
            {it.burst ? <Burst local={a.local} size={Math.min(p.w, p.h)} tone={it.burst} /> : null}
            {it.idle === "echo" && a.local % 45 < 26 ? (
              <div style={{ position: "absolute", inset: 0, opacity: 0.45 * (1 - (a.local % 45) / 26), transform: `scale(${1 + ((a.local % 45) / 26) * 0.45})` }}>{renderLeaf(p, ctx, a.local, levels)}</div>
            ) : null}
            {renderLeaf(p, ctx, a.local, levels)}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Light trail: a glowing white comet sweeping an S-curve across the frame (refs: between ideas).
const Trail: React.FC<{ at: number; frame: number; seed: number }> = ({ at, frame, seed }) => {
  const len = TRANSITION.trail;
  const t = (frame - (at - len / 2)) / len;
  if (t < 0 || t > 1.2) return null;
  const flip = seed % 2 === 0 ? 1 : -1;
  const d = flip > 0 ? "M -200 820 C 400 980, 700 300, 1100 520 S 1700 200, 2150 120" : "M 2150 860 C 1500 1000, 1200 260, 820 520 S 300 160, -200 140";
  const head = Math.min(1, t);
  const tail = Math.max(0, t - 0.35);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <path d={d} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={`${head - tail} 2`} strokeDashoffset={-tail} style={{ filter: "drop-shadow(0 0 8px #fff) drop-shadow(0 0 22px rgba(255,255,255,0.8))" }} />
    </svg>
  );
};

// Flash: an orange octagon bursting to fill the frame on a deep-purple wash (refs: yellow on red, in brand colours).
const Flash: React.FC<{ at: number; frame: number }> = ({ at, frame }) => {
  const len = TRANSITION.flash;
  const t = (frame - (at - len / 2)) / len;
  if (t < 0 || t > 1) return null;
  const s = interpolate(t, [0, 0.5, 1], [0.1, 3.2, 4], clamp);
  const o = interpolate(t, [0, 0.15, 0.7, 1], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(65,37,98,${0.85 * o})` }}>
      <div style={{ width: 600, height: 600, clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)", background: colors.lime, transform: `scale(${s})`, opacity: o, filter: "blur(4px)" }} />
    </AbsoluteFill>
  );
};

type Cue = { name: SfxName; at: number; prio: number; calm?: boolean };

const leaves = (items: Item[]): Leaf[] => items.flatMap((it) => (it.type === "group" || it.type === "tree" ? leaves(it.items) : [it]));

const defaultSfx = (item: Leaf): SfxName | null => {
  switch (item.type) {
    case "text":
      return item.enter === "none" ? null : "swish";
    case "visual":
      return item.look === "full" ? null : item.file ? "bloop" : "pop";
    case "number":
    case "badge":
      return "impact";
    case "counter":
      return "tick";
    case "card":
      return "bloop";
    case "ribbon":
      return "pop";
    case "ring":
    case "scribble":
      return "swish";
    case "search":
      return "typing";
    case "steps":
      return "tick";
    case "subscribe":
    case "host":
      return null;
    case "mc-search":
    case "mc-typing":
    case "mc-form":
    case "mc-code":
      return "typing";
    case "mc-post":
    case "mc-levels":
    case "mc-doc":
    case "mc-rhythm":
    case "mc-frames":
      return "bloop";
    case "mc-flow":
    case "mc-chart":
    case "mc-week":
    case "mc-grid":
      return "bloop";
    case "meter":
    case "bars":
      return "riser";
    case "carousel":
      return "bloop";
    case "mc-chat":
    case "mc-hub":
    case "mc-devices":
    case "mc-project":
    case "mc-prompt":
    case "mc-skill":
    case "mc-models":
      return "bloop";
    case "title-3d":
      return "whooshBig";
    case "mc-price":
    case "disc":
      return "impact";
    case "bar3d":
      return "whoosh";
    case "banner":
    case "arrow":
      return "swish";
    case "xstamp":
      return "wrong";
    case "multiply":
    case "checklist":
      return "pop";
    case "fly3d":
      return null;
    case "mc-claude":
    case "mc-folder":
    case "mc-player":
    case "mc-page":
    case "mc-email":
    case "mc-member":
    case "mc-community":
    case "shot":
      return "bloop";
  }
};

const buildCues = (scenes: TimedScene[], wordAt: (i: number) => number, plan?: Plan): Cue[] => {
  const cues: Cue[] = [...chapterCues(plan?.chapters, wordAt)];
  const at = (w: number, s: TimedScene) => Math.max(s.start, wordAt(w) - 2);
  for (const s of scenes) {
    if (s.index > 0) {
      const name: SfxName | null =
        s.enter === "glitch" ? "glitch" : s.enter === "trail" ? "whoosh" : s.enter === "zoom" || s.enter === "flash" || s.enter === "through" ? "whooshBig" : s.enter === "cut" || s.enter === "fade" || s.enter === "black" ? null : "whip";
      if (name) cues.push({ name, at: s.start, prio: 3 });
    }
    // Board mode: a new pinned title lands with a whoosh, a new subtitle with an impact.
    const prev = scenes[s.index - 1];
    if (s.header && prev?.header?.title !== s.header.title) cues.push({ name: "whoosh", at: s.start + 2, prio: 4 });
    if (s.header?.sub && prev?.header?.sub !== s.header.sub) cues.push({ name: "impact", at: at(s.header.subAt ?? s.from, s), prio: 4 });
    for (const it of leaves(s.items)) {
      const name = it.sfx === "none" ? null : (it.sfx ?? defaultSfx(it));
      if (name) cues.push({ name, at: at(it.word, s), prio: it.sfx ? 4 : 2 });
      if (it.type === "counter") cues.push({ name: "ding", at: at(it.word, s) + (it.frames ?? 24), prio: 1 });
      if (it.type === "text" && it.toneAt !== undefined && it.toneTo === "green") cues.push({ name: "sparkle", at: at(it.toneAt, s), prio: 3 });
      if (it.type === "steps") for (const d of it.done ?? []) cues.push({ name: "sparkle", at: at(d.word, s), prio: 3 });
      if (it.type === "visual" && it.tint === "red" && it.tintAt !== undefined) cues.push({ name: "wrong", at: at(it.tintAt, s), prio: 3 });
      if (it.type === "visual" && it.tint === "green" && it.tintAt !== undefined) cues.push({ name: "sparkle", at: at(it.tintAt, s), prio: 3 });
      if (it.type === "subscribe") cues.push({ name: "click", at: it.clickAt !== undefined ? at(it.clickAt, s) : at(it.word, s) + 24, prio: 4 });
      if ((it.type === "mc-page" || it.type === "mc-email") && it.clickAt !== undefined) cues.push({ name: "click", at: wordAt(it.clickAt), prio: 4 });
      if (it.type === "shot") for (const m of it.marks ?? []) cues.push({ name: "pop", at: wordAt(m.word), prio: 1 });
      if (it.type === "mc-email" && it.arriveAt !== undefined) cues.push({ name: "notify", at: wordAt(it.arriveAt), prio: 4 });
    }
  }
  // Max one cue per 3f; on a clash keep the higher priority.
  const sorted = cues.map((c) => ({ ...c, at: Math.max(0, c.at) })).sort((a, b) => a.at - b.at || b.prio - a.prio);
  const kept: Cue[] = [];
  for (const c of sorted) {
    const last = kept[kept.length - 1];
    if (last && c.at - last.at < 3) {
      if (c.prio > last.prio) kept[kept.length - 1] = c;
      continue;
    }
    kept.push(c);
  }
  // Teaching mode: no ticks/pops on every element, the rest at half level.
  if (!plan?.calm) return kept;
  const calmAt = wordAt(plan.calm.from) - 2;
  const calmEnd = plan.calm.to !== undefined ? wordAt(plan.calm.to) - 2 : Infinity;
  const inCalm = (at: number) => at >= calmAt && at < calmEnd;
  const QUIET: SfxName[] = ["swish", "pop", "bloop", "tick", "whip"];
  return kept
    .filter((c) => !inCalm(c.at) || c.prio >= 4 || !QUIET.includes(c.name))
    .map((c) => (inCalm(c.at) ? { ...c, calm: true } : c));
};

export const Explainer: React.FC<ExplainerProps> = ({ timeline, captions, plan, assets, levels, screens }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  useFontsReady();
  registerIcons3d(assets.icons3d);
  const wordAt = useMemo(() => (i: number) => toFrame(captions[Math.max(0, Math.min(i, captions.length - 1))]?.startMs ?? 0), [captions]);
  const scenes = useMemo(() => buildScenes(plan, wordAt, durationInFrames), [plan, wordAt, durationInFrames]);
  const cues = useMemo(() => buildCues(scenes, wordAt, plan), [scenes, wordAt, plan]);
  const blocks = useMemo(() => headerBlocks(scenes), [scenes]);

  if (!timeline || scenes.length === 0) {
    return (
      <AbsoluteFill style={{ background: colors.bgTop, alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT_FAMILY, color: "#888", fontSize: 60, direction: "rtl" }}>ضع ملفك في المدخلات وقل: ابدأ المونتاج</div>
      </AbsoluteFill>
    );
  }

  const calmFrom = plan.calm ? wordAt(plan.calm.from) - 2 : undefined;
  const calmTo = plan.calm?.to !== undefined ? wordAt(plan.calm.to) - 2 : undefined;
  const ctxBase = { frame, fps, wordAt, assets, calmFrom, calmTo };
  const current = scenes.find((s) => frame >= s.start && frame < s.end) ?? scenes[scenes.length - 1];
  const onScreen = inScreen(screens ?? null, frame, fps);
  const fadeOut = interpolate(frame, [durationInFrames - OUTRO_FADE, durationInFrames - 1], [0, 1], clamp);
  const musicVolume = plan.music?.volume ?? 0.09;

  return (
    <AbsoluteFill style={{ background: colors.bgTop, overflow: "hidden" }}>
      <Background rays={current.bg === "rays"} frame={frame} />
      {screens ? <ScreenLayer screens={screens} frame={frame} fps={fps} /> : null}
      {scenes.map((s) => {
        const tail = s.exit ? TRANSITION[s.exit] : 0;
        // Over a laptop-screen part only the callout scenes (no pinned title) show.
        if (s.header && onScreen) return null;
        return frame >= s.start && frame < s.end + tail ? <SceneView key={s.index} scene={s} ctxBase={ctxBase} levels={levels} /> : null;
      })}
      {scenes.map((s) => (s.enter === "trail" ? <Trail key={`t${s.index}`} at={s.start} frame={frame} seed={s.index} /> : null))}
      {scenes.map((s) => (s.enter === "flash" ? <Flash key={`f${s.index}`} at={s.start} frame={frame} /> : null))}
      {onScreen ? null : <BoardOverlay blocks={blocks} ladder={plan.ladder} frame={frame} wordAt={wordAt} total={durationInFrames} />}
      {plan.chapters ? <ChaptersOverlay ch={plan.chapters} frame={frame} wordAt={wordAt} /> : null}
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />

      <Audio src={staticFile(`${DATA}/${timeline.audio}`)} />
      {assets.music ? (
        <Audio
          src={staticFile(`${DATA}/${assets.music}`)}
          loop
          volume={(f) => musicVolume * interpolate(f, [0, 30, durationInFrames - 45, durationInFrames], [0, 1, 1, 0], clamp)}
        />
      ) : null}
      {cues.map((c, i) => (
        <Sfx key={i} name={c.name} at={c.at} volume={SFX[c.name].volume * VO_DUCK * (plan.sfxVolume ?? 1) * (c.calm ? 0.5 : 1)} userFiles={assets.sfxUser} />
      ))}
    </AbsoluteFill>
  );
};
