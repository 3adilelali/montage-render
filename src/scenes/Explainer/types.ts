import type { Caption } from "@remotion/captions";
import type { ToneName } from "../../brand/colors";
import type { SfxName } from "../../brand/sfx";

// ---------- Pipeline data (public/explainer/) ----------

// scripts/prepare.mjs
export type Timeline = {
  source: string;
  durationMs: number;
  audio: string; // file name inside public/explainer/
};

// scripts/sync-assets.mjs — what is available to the plan.
export type AssetInfo = { src: string; kind: "image" | "video"; w: number; h: number; durationS?: number };
export type Assets = {
  files: Record<string, AssetInfo>; // key = file name in العناصر/ (with and without extension)
  icons: string[]; // "set:name" resolved to public/explainer/icons/<set>--<name>.svg
  icons3d?: string[]; // subset rendered as 3D PNG instead (public/explainer/icons/<set>--<name>.png), see scripts/icons3d.mjs
  logo: AssetInfo | null; // العناصر/شعاري.*
  music: string | null; // public/explainer/<file>
  sfxUser: string[]; // overrides in public/assets/sfx-user/
};

// Per-frame voice loudness (0–1) + spectrum bands (0–1), scripts/prepare.mjs.
export type Levels = { fps: number; bands: number; level: number[]; spectrum: number[][] };

// ---------- Creative layer (public/explainer/plan.json), written by the /montage skill ----------
// Every `word` / `from` / `out` is an index into captions.json. Rules: الأسلوب/أسلوب-المونتاج.md §11–12.

export type Size = "s" | "m" | "l" | "xl";
export type Enter = "pop" | "chars" | "words" | "slide" | "drop" | "rise" | "spin" | "flip" | "slam" | "soft" | "none";
export type Look = "sticker" | "plain" | "card" | "screen" | "circle" | "full" | "phone";

type Base = {
  word: number; // appears when this word is spoken
  out?: number; // leaves (and the layout closes the gap) when this word is spoken
  enter?: Enter;
  size?: Size;
  sfx?: SfxName | "none";
  // Fine placement, px (applied after layout). tilt = degrees.
  dx?: number;
  dy?: number;
  tilt?: number;
  // YouTubeSkool layer (2026-11-02): float = sits over the group's centre (+dx/dy) without taking layout space
  // (an X over an icon, a banner over its icon); idle = inner life by meaning; burst = shock rings on entry.
  float?: boolean;
  idle?: "sway" | "pulse" | "bob" | "echo" | "spin";
  burst?: "orange" | "magenta";
};

export type TextItem = Base & {
  type: "text";
  text: string; // "\n" = new line
  tone?: ToneName;
  toneAt?: number; // turns `toneTo` at this word (e.g. white → green)
  toneTo?: ToneName;
};

export type Highlight = { x: number; y: number; w: number; h: number; tone?: "red" | "green"; word?: number }; // % of the image

export type VisualItem = Base & {
  type: "visual";
  icon?: string; // "fluent-emoji-flat:rocket", "logos:youtube-icon" …
  file?: string; // file name in العناصر/
  fallback?: string; // icon used when `file` is missing
  look?: Look;
  tint?: "red" | "green" | "gray"; // recolour the whole visual (refs: icon turns red when it fails)
  tintAt?: number;
  highlights?: Highlight[];
  credit?: string; // small source line under a card/screen clip, e.g. "المصدر: Zinho Automates"
  corner?: string; // small icon/char pinned to the top-left corner, e.g. "?" or an icon id
  cornerAt?: number;
};

export type NumberItem = Base & { type: "number"; text: string; tone?: "red" | "green" | "white" };
export type CounterItem = Base & {
  type: "counter";
  from?: number;
  to: number;
  frames?: number;
  prefix?: string;
  suffix?: string;
  tone?: ToneName;
  rays?: boolean;
};
export type StepsItem = Base & {
  type: "steps";
  labels: string[]; // ["1","2","3"]
  style?: "plain" | "chips";
  done?: { word: number; upto: number }[]; // at `word`, labels[0..upto-1] turn green
};
export type CardItem = Base & { type: "card"; text: string };
export type BadgeItem = Base & { type: "badge"; text?: string; icon?: string; shape?: "octagon" | "pentagon" | "diamond" };
export type RibbonItem = Base & { type: "ribbon"; text: string };
export type RingItem = Base & { type: "ring"; text: string };
export type SearchItem = Base & { type: "search"; text: string; end?: number };
export type ScribbleItem = Base & { type: "scribble"; tone?: "red" | "white" };
export type SubscribeItem = Base & { type: "subscribe"; clickAt?: number };
export type HostItem = Base & { type: "host" };
// MotionCards.tsx (2026-10-12): light UI cards that animate the idea, timed to words.
export type McSearch = Base & { type: "mc-search"; query: string; result?: string; label?: string; end?: number; resultAt?: number };
export type McFlow = Base & { type: "mc-flow"; nodes: { label: string; icon?: string; file?: string; word?: number }[] };
export type McChart = Base & { type: "mc-chart"; values: number[]; labels?: string[]; best?: number; title?: string };
export type McWeek = Base & { type: "mc-week"; title?: string; days?: string[]; tags?: string[] };
export type McForm = Base & { type: "mc-form"; title?: string; fields: { label: string; value: string; word?: number }[] };
export type McTyping = Base & { type: "mc-typing"; text: string; title?: string; cross?: number; end?: number; rtl?: boolean; fontSize?: number; w?: number; h?: number };
export type McGrid = Base & { type: "mc-grid"; to: number; from?: number; prefix?: string; suffix?: string; label?: string; frames?: number; logos: string[]; cols?: number };
// MotionCards2.tsx (2026-10-12, video «4 مستويات»)
export type McCode = Base & { type: "mc-code"; lines: string[]; filename?: string; end?: number; fontSize?: number };
export type McPost = Base & { type: "mc-post"; text: string; name?: string; handle?: string; file?: string; likes?: number };
export type McLevels = Base & { type: "mc-levels"; labels: string[]; active?: number; at?: number[]; results?: string[]; resultsAt?: number[] };
export type McDoc = Base & { type: "mc-doc"; title?: string; w?: number; sections: { head: string; kind: "text" | "ban" | "swatches" | "board"; items?: string[]; colors?: string[]; word?: number; approveAt?: number }[]; h?: number };
export type McRhythm = Base & { type: "mc-rhythm"; title?: string; cuts?: number[]; titles?: { at: number; text: string }[]; legend?: string[]; sweep?: number };
export type McFrames = Base & { type: "mc-frames"; frames: string[] };
// MotionCards3.tsx (2026-10-17, course promo «كلود يعمل عنك»)
// mc-chat: a plain Claude chat (question → answer) that shrinks on `zoomAt` to reveal the unused tools orbiting it.
export type McChat = Base & { type: "mc-chat"; question: string; answer: string; qAt?: number; aAt?: number; zoomAt?: number; nodes: { label: string; icon?: string }[] };
// title-3d: an extruded brand-gradient title that swings in 3D, a light sheen sweeps it, and a subline types under it.
export type Title3D = Base & { type: "title-3d"; text: string; sub?: string; subAt?: number; kicker?: string };
// mc-price: old price struck through on `strikeAt`, the new one slams in on `newAt`, a tag and a spinning guarantee seal.
export type McPrice = Base & { type: "mc-price"; old: string; now: string; strikeAt?: number; newAt?: number; tag?: string; tagAt?: number; seal?: string; sealAt?: number };
// MotionCards4.tsx (2026-11-04, «80% من كلود»): long explanatory diagrams.
type W = { text: string; word?: number };
export type McHub = Base & { type: "mc-hub"; nodes: { label?: string; icon?: string; file?: string; word?: number }[]; manyAt?: number; manyLabel?: string; task?: { text: string; word?: number }; focus?: number[] };
export type McDevices = Base & { type: "mc-devices"; labels: string[]; at?: number[]; pickAt?: number; chips?: { text: string; word?: number; icon?: string }[]; badge?: { text: string; word?: number } };
export type McProject = Base & { type: "mc-project"; title: string; instructions: W[]; files: { text: string; word?: number; icon?: string }[]; chats?: W[]; chatTag?: string; instructionsLabel?: string; filesLabel?: string; multiAt?: number; projects?: { text: string; word?: number; tone?: ToneName }[] };
export type McPrompt = Base & { type: "mc-prompt"; weak?: string; weakLabel?: string; crossAt?: number; title?: string; fontSize?: number; parts: { tag: string; text: string; word?: number; tone?: ToneName }[] };
export type McSkill = Base & { type: "mc-skill"; title: string; fileAt?: number; chat?: { text: string; word?: number }; steps: W[]; runs?: { day: string; text: string; word?: number }[]; stamp?: string };
export type McModels = Base & { type: "mc-models"; models: { name: string; sub: string; power: number; speed: number; use?: string; word?: number; tone?: ToneName }[]; autoAt?: number; autoLabel?: string; powerLabel?: string; speedLabel?: string };
// Extras.tsx (2026-10-11)
export type MeterItem = Base & {
  type: "meter";
  value: number; // 0–100, eased in once (or use `steps`)
  steps?: { word: number; value: number }[]; // move the fill on cue words (50 → 30 → 20)
  label?: string; // right-aligned title above the bar
  tone?: ToneName; // readout colour
  marks?: { at: number; text: string; tone?: ToneName; word?: number }[]; // zone ticks under the bar
};
export type BarsItem = Base & {
  type: "bars";
  bars: { label: string; value: number; text?: string; tone?: ToneName; icon?: string; word?: number }[];
};
export type CarouselItem = Base & {
  type: "carousel";
  slides: { text?: string; icon?: string; file?: string }[];
  at?: number[]; // word that swipes to slide 2, 3… (else every `every` frames)
  every?: number;
};

// Skool.tsx (2026-11-02, «كلود-المونتير»): the YouTubeSkool montage, re-drawn in the brand.
export type Bar3D = Base & { type: "bar3d"; text: string; at?: number[]; fs?: number; tone?: "purple" | "orange" };
export type Banner = Base & { type: "banner"; text: string; at?: number[]; fs?: number; tone?: "magenta" | "orange" | "purple" };
export type Disc = Base & { type: "disc"; text: string; tone?: "magenta" | "orange"; doneAt?: number };
export type XStamp = Base & { type: "xstamp"; tone?: "magenta" | "orange"; w?: number };
export type Arrow = Base & { type: "arrow"; tone?: "orange" | "magenta"; rotate?: number; flip?: boolean; loop?: boolean; w?: number };
export type Multiply = Base & { type: "multiply"; count: number; cols?: number; cell?: number; icon?: string; tile?: boolean; spreadAt?: number; grayAt?: number; pickAt?: number; pick?: number };
export type Checklist = Base & { type: "checklist"; items: { text: string; word?: number }[]; doneAt?: number; fs?: number; w?: number; row?: number };
export type Fly3D = Base & { type: "fly3d"; words: string[]; at?: number[]; tone?: boolean };
export type McClaude = Base & {
  type: "mc-claude";
  prompt: string;
  folder?: string;
  typeAt?: number;
  typeEnd?: number;
  sendAt?: number;
  lines: { text: string; detail?: string; word?: number; doneAt?: number; done?: boolean; bar?: boolean }[];
  zoomAt?: number;
  zoom?: number;
  zoomOrigin?: string;
};
export type McFolder = Base & { type: "mc-folder"; title: string; filename: string; fileAt?: number; others?: string[]; thumb?: string };
export type McPlayer = Base & { type: "mc-player"; file: string; label?: string; w?: number };
// MotionCards5.tsx (2026-11-04, course-page video): a real page that scrolls + a cursor click; the access email.
type Pt = { x: number; y: number };
export type McPage = Base & {
  type: "mc-page"; file: string; url?: string; w?: number; h?: number; imgW?: number; viewX?: number; viewW?: number; startY?: number;
  scroll?: { y: number; word?: number; frames?: number }[];
  cursor?: Pt & { word?: number }; clickAt?: number;
  highlights?: { x: number; y: number; w: number; h: number; word?: number; tone?: string; label?: string }[];
};
// Shot.tsx (2026-11-06): a real screen clip, flat, with camera zoom + drawn marks on words.
export type ShotItem = Base & {
  // loop (default true, Adil 2026-11-07): a clip keeps playing for the whole scene, never freezes after 2s.
  type: "shot"; file: string; w?: number; h?: number; label?: string; labelBelow?: boolean; loop?: boolean; pointer?: { word: number; x: number; y: number }[];
  zoom?: { word: number; x: number; y: number; s: number }[];
  marks?: { word: number; x: number; y: number; w: number; h: number; kind?: "ring" | "box"; label?: string; out?: number }[];
};
export type McEmail = Base & { type: "mc-email"; from?: string; subject: string; title: string; badge?: string; lines?: string[]; steps?: { text: string; word?: number }[]; button: string; arriveAt?: number; openAt?: number; clickAt?: number };
export type McMember = Base & { type: "mc-member"; w?: number; cover?: string; total?: number; listAt?: number; listFrames?: number; progressAt?: number; progressFrames?: number; focus?: number; focusAt?: number; chip?: { text: string; word?: number } };
export type McCommunity = Base & { type: "mc-community"; logo?: string; posts: { text: string; emoji?: string; word?: number }[] };

export type Leaf =
  | TextItem
  | VisualItem
  | NumberItem
  | CounterItem
  | StepsItem
  | CardItem
  | BadgeItem
  | RibbonItem
  | RingItem
  | SearchItem
  | ScribbleItem
  | SubscribeItem
  | HostItem
  | MeterItem
  | BarsItem
  | CarouselItem
  | McSearch
  | McFlow
  | McChart
  | McWeek
  | McForm
  | McTyping
  | McGrid
  | McCode
  | McPost
  | McLevels
  | McDoc
  | McRhythm
  | McFrames
  | McChat
  | McHub
  | McDevices
  | McProject
  | McPrompt
  | McSkill
  | McModels
  | McPage
  | McEmail
  | McMember
  | McCommunity
  | ShotItem
  | Title3D
  | McPrice
  | Bar3D
  | Banner
  | Disc
  | XStamp
  | Arrow
  | Multiply
  | Checklist
  | Fly3D
  | McClaude
  | McFolder
  | McPlayer;

export type Group = { type: "group"; dir: "row" | "stack"; gap?: number; items: Item[] };
// items[0] = root on top, the rest = leaves joined to it by glowing dotted branches.
export type Tree = { type: "tree"; word: number; items: Item[] };

export type Item = Leaf | Group | Tree;

// push = vertical motion-blurred push (YouTubeSkool default; direction alternates), through = the camera flies into the frame.
export type Transition = "whip" | "zoom" | "glitch" | "trail" | "flash" | "cut" | "fade" | "push" | "through" | "black";

// Board mode (Board.tsx): the title stays pinned on top across consecutive scenes with the same title.
export type Header = { title: string; sub?: string; subAt?: number };

// Corner staircase of levels, shown from `word` to the end; `active` lights a level (1-based) at a word.
export type Ladder = { labels: string[]; word: number; active?: { word: number; level: number }[] };

// Chapter tracker (Chapters.tsx): a full-screen title before `word` (the ~2s pause comes from insert-pauses),
// then a pinned row of step chips on top (current orange, done gray). `bar: false` = title card only, not a step.
export type Chapter = { label: string; short?: string; word: number; kicker?: string; bar?: boolean; intro?: boolean };
// side: the chips stack in a column on the right (an offer list: «أول شي… تاني شي…»), and the scenes shift left.
// top (Adil 2026-11-07, default): no full-screen title, no pause; the road of steps sits on top from the first
// step, the current one lit and swelling as it's announced, finished ones shrunk with a line through them.
export type Chapters = { items: Chapter[]; endWord?: number; hide?: { from: number; to: number }[]; side?: boolean; corner?: boolean; top?: boolean };

export type Scene = {
  from: number; // word index where the scene starts
  transition?: Transition; // how this scene enters; default whip
  layout?: "stack" | "row"; // root group direction; default stack
  gap?: number;
  bg?: "rays" | "none";
  header?: Header; // board mode: content is centred lower, under the pinned title
  items: Item[];
};

export type Plan = {
  source: string;
  scenes: Scene[];
  ladder?: Ladder;
  chapters?: Chapters;
  screens?: boolean; // show the laptop-screen parts from screens.json (Screen.tsx)
  music?: { volume?: number };
  sfxVolume?: number; // multiplies every sound effect (Adil 2026-11-06: soft, not annoying)
  transition?: Transition; // default scene transition (else whip)
  // Teaching mode (Adil 2026-11-07): from this word on, the montage calms down — soft fades instead of pops,
  // plain lighter text, a slower camera, fewer and quieter sounds. The hook before it keeps the full energy.
  calm?: { from: number; to?: number }; // to (2026-11-08): the CTA at the end gets the hook energy back
};

// scripts/screen-focus.py: the laptop-screen parts of the input and where the camera looks.
export type Screens = { zoom: number; cx: number; parts: { fromS: number; toS: number; keys: { t: number; cy: number }[] }[] };

export type ExplainerProps = {
  timeline: Timeline | null;
  captions: Caption[];
  plan: Plan;
  assets: Assets;
  levels: Levels | null;
  screens?: Screens | null;
};
