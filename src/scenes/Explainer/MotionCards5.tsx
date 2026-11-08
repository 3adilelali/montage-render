// Course-page video cards (2026-11-04, «فيديو صفحة الدورة 2»). Calm, real screens, long holds.
//   mc-page  — a browser window showing a real (tall) screenshot that scrolls smoothly to each `scroll` stop on its word,
//              a cursor glides to `cursor` and clicks on `clickAt` (ripple + press), `highlights` ring parts of the page.
//   mc-email — an inbox: the access email slides in, opens on `openAt`, its button gets clicked on `clickAt`.
import { Easing, Img, interpolate, spring } from "remotion";
import { colors } from "../../brand/colors";
import { FONT_FAMILY } from "../../brand/fonts";
import { SPRINGS } from "../../brand/motion";
import { clamp } from "./anim";
import { type Ctx, startOf } from "./layout";
import type { McCommunity, McEmail, McMember, McPage } from "./types";
import { resolveVisual } from "./VisualLeaf";

const CLAUDE = "#D97757";
const C = { card: "#FBF7FF", ink: "#1d0b33", soft: "#8a7aa6", line: "#e9def6" };
const inOut = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const txt = (size: number, color = C.ink, weight = 800): React.CSSProperties => ({ fontFamily: FONT_FAMILY, fontWeight: weight, fontSize: size, color, direction: "rtl" });
const wAt = (ctx: Ctx, base: number, w: number | undefined, fb: number) => (w == null ? fb : startOf(ctx, w) - base);

// Mouse arrow (white with dark outline), tip at (0,0).
const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <svg width={46} height={56} viewBox="0 0 23 28" style={{ position: "absolute", left: x - 3, top: y - 2, transform: `scale(${1 - 0.15 * press})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }}>
    <path d="M2 1 L2 22 L7.5 17 L11 25.5 L14.5 24 L11 15.8 L18.5 15.8 Z" fill="#fff" stroke="#1d0b33" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

const Ripple: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t < 0 || t > 1) return null;
  const r = 20 + 70 * t;
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, border: `5px solid ${CLAUDE}`, opacity: 1 - t, boxShadow: `0 0 24px ${CLAUDE}` }} />;
};

// Window chrome shared by both cards.
const Chrome: React.FC<{ w: number; h: number; url?: string; k: number; children: React.ReactNode }> = ({ w, h, url, k, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: w,
      height: h,
      borderRadius: 26,
      overflow: "hidden",
      background: "#fff",
      border: "3px solid rgba(255,255,255,0.75)",
      boxShadow: `0 30px 70px rgba(0,0,0,0.6), 0 0 60px ${colors.brandPurple}55`,
      opacity: Math.min(1, k * 1.4),
      transform: `translateY(${(1 - k) * 60}px) scale(${0.94 + 0.06 * k})`,
    }}
  >
    <div style={{ height: 58, background: "#F1ECF7", borderBottom: `2px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 10 }}>
      {["#E04BA8", "#FFA733", "#A04ED7"].map((c) => (
        <div key={c} style={{ width: 16, height: 16, borderRadius: 99, background: c }} />
      ))}
      {url ? (
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 24, color: C.soft, background: "#fff", borderRadius: 99, padding: "6px 34px", border: `2px solid ${C.line}`, direction: "ltr" }}>🔒 {url}</div>
        </div>
      ) : null}
    </div>
    <div style={{ position: "absolute", top: 58, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>{children}</div>
  </div>
);

// ---------- mc-page
export const PageMC: React.FC<{ item: McPage; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const W = item.w ?? 1300;
  const H = item.h ?? 780;
  const vh = H - 58;
  // viewX/viewW: show only a horizontal slice of the screenshot (zoom on the useful column of a wide page).
  const viewX = item.viewX ?? 0;
  const scale = W / (item.viewW ?? item.imgW ?? 1440);
  const k = spring({ frame: local, fps: ctx.fps, config: SPRINGS.layout });
  const v = resolveVisual({ file: item.file }, ctx.assets);
  // Scroll: piecewise smooth moves, each starting on its word and taking `frames` (default 45).
  let y = item.startY ?? 0;
  for (const s of item.scroll ?? []) {
    const t0 = wAt(ctx, base, s.word, 10);
    const d = s.frames ?? 45;
    y = interpolate(local, [t0, t0 + d], [y, s.y], inOut);
  }
  const toScreen = (px: number, py: number) => ({ x: (px - viewX) * scale, y: (py - y) * scale });
  // Cursor: glides in from the lower left over 26 frames, ending just before the click.
  let cur: { x: number; y: number } | null = null;
  let press = 0;
  let rip = -1;
  if (item.cursor) {
    const click = wAt(ctx, base, item.clickAt ?? item.cursor.word, 30);
    const startAt = wAt(ctx, base, item.cursor.word, click - 30);
    const tgt = toScreen(item.cursor.x, item.cursor.y);
    const m = interpolate(local, [startAt, Math.max(startAt + 8, click - 4)], [0, 1], inOut);
    if (local >= startAt) cur = { x: interpolate(m, [0, 1], [W * 0.18, tgt.x]), y: interpolate(m, [0, 1], [vh + 40, tgt.y]) };
    press = interpolate(local, [click - 2, click + 2, click + 8], [0, 1, 0], clamp);
    rip = (local - click) / 18;
  }
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Chrome w={W} h={H} url={item.url} k={k}>
        {v ? <Img src={v.src} style={{ position: "absolute", left: -viewX * scale, top: -y * scale, width: (item.imgW ?? 1440) * scale, maxWidth: "none" }} /> : null}
        {(item.highlights ?? []).map((h, i) => {
          const t = wAt(ctx, base, h.word, 20);
          const a = interpolate(local, [t, t + 12], [0, 1], out);
          if (a <= 0) return null;
          const p = toScreen(h.x, h.y);
          const pulse = 0.5 + 0.5 * Math.sin((local - t) / 6);
          const col = h.tone === "purple" ? colors.brandPurple : CLAUDE;
          return (
            <div key={i} style={{ position: "absolute", left: p.x - 10, top: p.y - 10, width: h.w * scale + 20, height: h.h * scale + 20, borderRadius: 22, border: `6px solid ${col}`, boxShadow: `0 0 ${18 + 14 * pulse}px ${col}, inset 0 0 20px ${col}44`, opacity: a, transform: `scale(${1.08 - 0.08 * a})` }}>
              {h.label ? (
                <div style={{ position: "absolute", top: -64, right: 0, ...txt(30, "#fff", 900), background: col, padding: "6px 22px 10px", borderRadius: 14, whiteSpace: "nowrap", boxShadow: "0 8px 18px rgba(0,0,0,0.35)" }}>{h.label}</div>
              ) : null}
            </div>
          );
        })}
        {item.cursor ? <Ripple {...toScreen(item.cursor.x, item.cursor.y)} t={rip} /> : null}
        {cur ? <Cursor x={cur.x} y={cur.y} press={press} /> : null}
      </Chrome>
    </div>
  );
};

// ---------- mc-member: the real student area, redrawn (Adil's screenshot 2026-11-04): course card with a progress bar
// that fills to 100% on `progressAt`, and the 13 axes as orange-bordered rows that land one by one from `listAt`.
// `focus` = 1-based row to light up on `focusAt` (the lab = 13). `chip` = a pill under the card («6 ساعات»).
export const MemberMC: React.FC<{ item: McMember; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const W = item.w ?? 1560;
  const H = 860;
  const k = spring({ frame: local, fps: ctx.fps, config: SPRINGS.layout });
  const listAt = wAt(ctx, base, item.listAt, 6);
  const step = item.listFrames ?? 4;
  const pAt = item.progressAt == null ? Infinity : wAt(ctx, base, item.progressAt, 30);
  const pFrames = item.progressFrames ?? 70;
  const p = Number.isFinite(pAt) ? interpolate(local, [pAt, pAt + pFrames], [0, 1], inOut) : 0;
  const total = item.total ?? 55;
  const fAt = item.focusAt == null ? Infinity : wAt(ctx, base, item.focusAt, 0);
  const fk = Number.isFinite(fAt) ? interpolate(local, [fAt, fAt + 12], [0, 1], out) : 0;
  const chipAt = item.chip ? wAt(ctx, base, item.chip.word, 0) : Infinity;
  const ck = Number.isFinite(chipAt) ? spring({ frame: local - chipAt, fps: ctx.fps, config: SPRINGS.pop }) : 0;
  const rowH = 50;
  const gap = 9;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Chrome w={W} h={H} url="منطقة الطلاب" k={k}>
        <div style={{ position: "absolute", inset: 0, background: "#fff", direction: "rtl", display: "flex", gap: 26, padding: "18px 26px" }}>
          {/* Axes list (right in RTL) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap }}>
            {AXES.map((a, i) => {
              const t = listAt + i * step;
              const a1 = interpolate(local, [t, t + 10], [0, 1], out);
              const on = item.focus === i + 1 ? fk : 0;
              return (
                <div
                  key={i}
                  style={{
                    height: rowH,
                    boxSizing: "border-box",
                    borderRadius: 10,
                    border: `${2 + 2 * on}px solid ${on > 0 ? CLAUDE : "#F5A623"}`,
                    background: on > 0 ? `rgba(217,119,87,${0.12 * on})` : "#fff",
                    boxShadow: on > 0 ? `0 0 ${24 * on}px ${CLAUDE}aa` : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    opacity: a1,
                    transform: `translateX(${(1 - a1) * 40}px) scale(${1 + 0.03 * on})`,
                  }}
                >
                  <div style={{ ...txt(23, C.ink, on > 0 ? 900 : 600) }}>
                    المحور {i + 1}: {a}
                  </div>
                  <div style={{ ...txt(26, C.soft, 700) }}>‹</div>
                </div>
              );
            })}
          </div>
          {/* Course card */}
          <div style={{ width: W < 1450 ? 400 : 470, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ borderRadius: 14, border: `2px solid ${C.line}`, padding: 14, boxShadow: "0 6px 18px rgba(40,10,70,0.08)" }}>
              <Thumb ctx={ctx} file={item.cover} />
              <div style={{ ...txt(22, C.ink, 600), marginTop: 14 }}>
                دروس تم الانتهاء منها <span style={{ fontFamily: "Barlow Semi Condensed", fontWeight: 800, direction: "ltr", display: "inline-block" }}>{Math.round(p * total)} of {total}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <div style={{ flex: 1, height: 14, borderRadius: 99, background: "#ECE7F2", overflow: "hidden", direction: "rtl" }}>
                  <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 99, background: `linear-gradient(270deg, ${CLAUDE}, ${colors.brandPurple})`, boxShadow: p > 0 ? `0 0 14px ${CLAUDE}` : "none" }} />
                </div>
                <div style={{ ...txt(24, p >= 1 ? CLAUDE : C.ink, 900), fontFamily: "Barlow Semi Condensed", direction: "ltr", minWidth: 62 }}>{Math.round(p * 100)}%</div>
              </div>
            </div>
            {item.chip && ck > 0 ? (
              <div style={{ alignSelf: "center", ...txt(40, "#fff", 900), background: colors.brandGradient, padding: "10px 40px 16px", borderRadius: 99, transform: `scale(${ck})`, boxShadow: "0 14px 30px rgba(0,0,0,0.3)" }}>{item.chip.text}</div>
            ) : null}
          </div>
        </div>
      </Chrome>
    </div>
  );
};

const AXES = [
  "التأسيس والانطلاقة",
  "الذاكرة والأدوات وإعدادات المحادثة",
  "المطالبات الاحترافية (Prompt)",
  "المشاريع والأرتيفاكتس",
  "بناء العقل المستنسخ",
  "مصنع الأفكار والمهارات المخصصة",
  "التصميم والـ Design System",
  "مدخل إلى Claude Code",
  "نظام المونتاج الذاتي",
  "رادار السوق والمنافسين",
  "أتمتة الردود والمبيعات",
  "نظام القيادة الذاتية",
  "«المختبر»: أدوات، مهارات، حيل، تحديثات",
];

const Thumb: React.FC<{ ctx: Ctx; file?: string }> = ({ ctx, file }) => {
  const v = file ? resolveVisual({ file }, ctx.assets) : null;
  return v ? <Img src={v.src} style={{ width: "100%", borderRadius: 10, display: "block" }} /> : <div style={{ height: 210, borderRadius: 10, background: "#F3EEF8" }} />;
};

// ---------- mc-community: the WhatsApp community (dark, like his screenshot), then announcement bubbles drop in.
export const CommunityMC: React.FC<{ item: McCommunity; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const W = 1100;
  const H = 820;
  const k = spring({ frame: local, fps: ctx.fps, config: SPRINGS.layout });
  const logo = resolveVisual({ file: item.logo ?? "شعاري" }, ctx.assets);
  const wa = resolveVisual({ icon: "logos:whatsapp-icon" }, ctx.assets);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, borderRadius: 40, background: "#0B0B0D", border: "3px solid rgba(255,255,255,0.18)", boxShadow: `0 30px 70px rgba(0,0,0,0.7), 0 0 60px ${colors.brandPurple}55`, overflow: "hidden", direction: "rtl", opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 60}px)` }}>
      <div style={{ padding: "40px 56px 0", display: "flex", alignItems: "center", gap: 20 }}>
        {wa ? <Img src={wa.src} style={{ width: 70, height: 70 }} /> : null}
        <div style={{ ...txt(76, "#fff", 900) }}>المجتمعات</div>
      </div>
      <div style={{ margin: "34px 56px 0", display: "flex", alignItems: "center", gap: 26 }}>
        {logo ? <Img src={logo.src} style={{ width: 120, height: 120, borderRadius: 30, objectFit: "cover" }} /> : null}
        <div style={{ ...txt(50, "#fff", 900), lineHeight: 1.2 }}>كلود يعمل عنك - عادل العلي</div>
        <div style={{ marginRight: "auto", ...txt(30, "#fff", 800), background: "#262628", padding: "12px 30px 16px", borderRadius: 99 }}>عرض الكل</div>
      </div>
      <div style={{ margin: "40px 56px 0", display: "flex", flexDirection: "column", gap: 18 }}>
        {item.posts.map((p, i) => {
          const t = wAt(ctx, base, p.word, 20 + i * 18);
          const a = spring({ frame: local - t, fps: ctx.fps, config: SPRINGS.pop });
          if (local < t) return null;
          return (
            <div key={i} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 16, background: "#1F2C34", borderRadius: "22px 22px 6px 22px", padding: "16px 26px 20px", transform: `scale(${Math.min(1.05, a)})`, transformOrigin: "right center", opacity: Math.min(1, a * 1.5) }}>
              <div style={{ fontSize: 40 }}>{p.emoji ?? "📢"}</div>
              <div style={{ ...txt(36, "#E9EDEF", 700) }}>{p.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- mc-email (his real access email, redrawn with the course's new name)
export const EmailMC: React.FC<{ item: McEmail; ctx: Ctx; local: number }> = ({ item, ctx, local }) => {
  const base = startOf(ctx, item.word);
  const W = 1200;
  const H = 800;
  const k = spring({ frame: local, fps: ctx.fps, config: SPRINGS.layout });
  const arrive = wAt(ctx, base, item.arriveAt, 14);
  const open = wAt(ctx, base, item.openAt, arrive + 50);
  const click = item.clickAt == null ? Infinity : wAt(ctx, base, item.clickAt, open + 60);
  const ra = spring({ frame: local - arrive, fps: ctx.fps, config: SPRINGS.pop });
  const op = interpolate(local, [open, open + 16], [0, 1], inOut);
  const btn = { x: W / 2, y: 690 };
  const m = Number.isFinite(click) ? interpolate(local, [click - 28, click - 4], [0, 1], inOut) : 0;
  const press = Number.isFinite(click) ? interpolate(local, [click - 2, click + 2, click + 8], [0, 1, 0], clamp) : 0;
  const glow = Number.isFinite(click) ? interpolate(local, [click, click + 10], [0, 1], clamp) : 0;
  const rows = ["إيصال الدفع", "أهلاً بك في المنصة"];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Chrome w={W} h={H} url="mail" k={k}>
        {/* Inbox list */}
        <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 1 - op, padding: "24px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...txt(34, C.ink, 900) }}>البريد الوارد</div>
          <div style={{ transform: `translateY(${(1 - Math.min(1, ra)) * -40}px)`, opacity: Math.min(1, ra * 1.5), display: "flex", alignItems: "center", gap: 18, direction: "rtl", padding: "18px 22px", borderRadius: 18, background: "#FFF3EC", border: `3px solid ${CLAUDE}`, boxShadow: `0 0 26px ${CLAUDE}55` }}>
            <div style={{ width: 62, height: 62, borderRadius: 99, background: CLAUDE, display: "flex", alignItems: "center", justifyContent: "center", ...txt(34, "#fff", 900) }}>✉</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ ...txt(30, C.ink, 900) }}>{item.from ?? "Hotmart"}</div>
              <div style={{ ...txt(28, C.soft, 700) }}>{item.subject}</div>
            </div>
            <div style={{ marginRight: "auto", ...txt(24, CLAUDE, 900) }}>الآن</div>
          </div>
          {rows.map((r) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 18, direction: "rtl", padding: "18px 22px", borderRadius: 18, background: "#F7F3FB", opacity: 0.55 }}>
              <div style={{ width: 62, height: 62, borderRadius: 99, background: "#E3D9EF" }} />
              <div style={{ width: 380, height: 22, borderRadius: 8, background: "#E3D9EF" }} />
            </div>
          ))}
        </div>
        {/* Opened email: his real design (adil · «دورتك جاهزة» · 3 steps · orange button) */}
        <div style={{ position: "absolute", inset: 0, background: "#F7F5F2", opacity: op, transform: `translateX(${(1 - op) * -60}px)`, display: "flex", justifyContent: "center", paddingTop: 22 }}>
          <div style={{ width: 760, background: "#fff", borderRadius: 30, borderTop: `8px solid ${colors.brandPurple}`, boxShadow: "0 10px 30px rgba(40,10,70,0.12)", padding: "26px 44px", direction: "rtl", display: "flex", flexDirection: "column", gap: 14, height: 690, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 44, color: colors.brandDeep }}>adil</div>
              <div style={{ ...txt(20, "#fff", 800), background: colors.brandGradient, padding: "4px 16px 8px", borderRadius: 10 }}>{item.badge ?? "كلود يعمل عنك"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <div style={{ ...txt(52, colors.brandDeep, 900) }}>{item.title}</div>
              <div style={{ ...txt(50, "#fff", 900), background: colors.brandGradient, padding: "0 18px 8px" }}>جاهزة</div>
            </div>
            {(item.lines ?? []).map((l, i) => (
              <div key={i} style={{ ...txt(26, C.ink, 700), lineHeight: 1.5 }}>{l}</div>
            ))}
            {(item.steps ?? []).map((s, i) => {
              const t = wAt(ctx, base, s.word, open + 14 + i * 8);
              const a = interpolate(local, [t, t + 10], [0, 1], out);
              return (
                <div key={i} style={{ display: "flex", gap: 14, ...txt(26, C.ink, 800), opacity: a, transform: `translateX(${(1 - a) * 20}px)` }}>
                  <span style={{ color: [colors.brandPurple, colors.brandMagenta, CLAUDE][i % 3] }}>{["١", "٢", "٣"][i]}.</span>
                  {s.text}
                </div>
              );
            })}
            <div style={{ alignSelf: "center", marginTop: "auto", ...txt(34, "#fff", 900), background: "#F7943E", padding: "14px 60px 20px", borderRadius: 99, transform: `scale(${1 - 0.06 * press})`, boxShadow: `0 ${10 + 10 * glow}px ${24 + 30 * glow}px ${CLAUDE}${glow > 0 ? "cc" : "55"}` }}>{item.button}</div>
          </div>
        </div>
        {Number.isFinite(click) && local >= click - 28 ? <Cursor x={interpolate(m, [0, 1], [W * 0.82, btn.x])} y={interpolate(m, [0, 1], [H - 40, btn.y - 58])} press={press} /> : null}
        {Number.isFinite(click) ? <Ripple x={btn.x} y={btn.y - 58} t={(local - click) / 18} /> : null}
      </Chrome>
    </div>
  );
};
