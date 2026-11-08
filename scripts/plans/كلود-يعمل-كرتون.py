# «كلود صار يعمل أفلام كرتون» (2026-11-07). First video in the calm teaching mode (§19): energetic hook (0–82),
# then plan.calm from word 83 — soft fades, plain lighter text, long real shots, few quiet sounds.
# Word indices = public/explainer/captions.json after eleven-cut --apply (703 words) + insert-pauses (1.6s + 7×2.2s).
# Shots = clips cut from the source video (Mr omi), crops avoid channel names; GitHub page via firecrawl.
# Run: python scripts/plans/كلود-يعمل-كرتون.py
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PLAN = ROOT / "public/explainer/plan.json"

def V(icon, w, **k): return {"type": "visual", "icon": icon, "word": w, **k}
def F(file, w, **k): return {"type": "visual", "file": file, "word": w, **k}
def T(text, w, **k): return {"type": "text", "text": text, "word": w, **k}
def BAN(text, at, **k): return {"type": "banner", "text": text, "word": at[0], "at": at, **k}
def BAR(text, at, **k): return {"type": "bar3d", "text": text, "word": at[0], "at": at, **k}
def DISC(n, w, **k): return {"type": "disc", "text": str(n), "word": w, **k}
def X(at_, **k): return {"type": "xstamp", "word": at_, "float": True, **k}
def ARR(at_, **k): return {"type": "arrow", "word": at_, **k}
def S(*items, gap=None): return {"type": "group", "dir": "stack", "items": list(items), **({"gap": gap} if gap else {})}
def R(*items, gap=None): return {"type": "group", "dir": "row", "items": list(items), **({"gap": gap} if gap else {})}
def IC(icon, w, label, lw=None, size=None, **k):
    v = V(icon, w, **({"size": size} if size else {}), **k)
    return S(v, T(label, lw if lw is not None else w, size="s"))
def SH(file, w, zoom=None, marks=None, label=None):
    d = {"type": "shot", "file": file, "word": w}
    if zoom: d["zoom"] = [{"word": a, "x": x, "y": y, "s": s} for a, x, y, s in zoom]
    if marks: d["marks"] = marks
    if label: d["label"] = label
    return d
def M(w, x, y, ww, hh, label=None, kind="box", out=None):
    d = {"word": w, "x": x, "y": y, "w": ww, "h": hh, "kind": kind}
    if label: d["label"] = label
    if out is not None: d["out"] = out
    return d

CLAUDE = "logos:claude-icon"
FE = lambda n: f"fluent-emoji-flat:{n}"
COVER = "غلاف-الماستر-كلاس"
K = "كرتون-"

scenes = []
def sc(frm, *items, **kw):
    scenes.append({"from": frm, "items": list(items), **kw})

# ---------------- HOOK (0–82): full energy
sc(0, SH(K + "الفيديوهين", 0, marks=[M(6, 2, 4, 46, 80, "29 مليون مشاهدة", "box", out=13), M(22, 52, 4, 46, 80, "كلود بناه")]))
sc(13, S(T("آخر 80 فيديو", 13, size="m", enter="pop"), BAR("+200 مليون مشاهدة", [18, 20, 21]), gap=40), transition="zoom", bg="rays")
sc(22, SH(K + "الجسر", 22, label="ما عمله ولا مولّد فيديو"), transition="push")
sc(28, R(V(CLAUDE, 28, size="l", idle="pulse"), ARR(30, w=150, flip=True), IC(FE("laptop"), 34, "بالكود، صورة صورة", 31, size="l"), gap=50), transition="through")
sc(37, SH(K + "غيت-هاب", 37, marks=[M(41, 7, 19, 21, 7, "Mr omi")], label="نزّل طريقته كلها مجاناً"), transition="push")
sc(47, R(IC(FE("graduation-cap"), 51, "كيف علّم Claude"), IC(FE("scroll"), 56, "الوصفة السرية"), IC(FE("wrapped-gift"), 64, "السكيل المجانية"), gap=110), transition="push")
sc(67, R(V(FE("bullseye"), 68, size="l", burst="orange"), BAN("الدرس الأهم: نفس الطريقة بمجالك", [68, 69, 70, 73, 74], tone="orange"), gap=50), transition="zoom", bg="rays")

# ---------------- 1: شو هالنوع (83–129) — calm from here
sc(83, SH(K + "هوكات", 83, label="أكيد شفتها على الريلز والشورتس"), transition="fade")
sc(94, SH(K + "الجسر-نظيف", 94, zoom=[(104, 50, 60, 1.15)], label="شخصيات مرسومة جوا عالم 3D"), transition="fade")
sc(111, R(V(FE("scroll"), 112, size="l"), T("معلومة غريبة\nمن التاريخ", 113), gap=70), transition="fade")
sc(117, R(V(FE("see-no-evil-monkey"), 120, size="l"), S(T("أقوى محتوى بدون الظهور", 117), T("إنت ما بتطلع بالفيديو أبداً", 124, size="s"), gap=20), gap=70), transition="fade")

# ---------------- 2: خلّيه يشوف كل صورة (130–233)
sc(130, SH(K + "20-فيديو", 130, label="نزّل آخر 20 فيديو من القناة"), transition="fade")
sc(142, R(V(FE("key"), 145, size="l"), T("سر أغلب الناس\nما بتعرفه", 145), gap=70), transition="fade")
sc(150, R(V(CLAUDE, 150, size="l"), S(T("«حلّل هالفيديو»", 154), T("ما بيشوفه كله… بياخد كذا لقطة على السريع", 156, size="s"), gap=24), gap=70), transition="fade")
sc(168, S({"type": "counter", "to": 30, "word": 171, "size": "xl"}, T("صورة بكل ثانية", 172, size="m"), gap=20), transition="fade")
sc(174, S(T("الفرق بالتفاصيل اللي ما بيدرسها Claude", 181, size="m"),
          R(IC(FE("movie-camera"), 187, "حركة كاميرا", size="s"), IC(FE("new-moon"), 190, "ظل", size="s"), IC(FE("light-bulb"), 191, "ضو", size="s"), gap=110), gap=50), transition="fade")
sc(196, SH(K + "كل-صورة", 196, zoom=[(205, 50, 50, 1.2)], label="كل صورة من كل ثانية"), transition="fade")
sc(218, S({"type": "counter", "to": 32000, "word": 221, "size": "xl"}, T("صورة فحصها Claude", 223, size="m"), gap=20), transition="fade")
sc(225, SH(K + "كتاب-القواعد", 225, zoom=[(229, 45, 40, 1.15)], label="رجع بكتاب قواعد كامل"), transition="fade")

# ---------------- 3: الوصفة السرية (234–331)
sc(234, R(V(FE("wrapped-gift"), 237, size="l"), T("أكثر جزء بيفيدك", 237), gap=70), transition="fade")
sc(248, SH(K + "كتاب-القواعد", 248, marks=[M(255, 17, 23, 80, 43, "كلهم نفس الوصفة")], label="Claude فرّغ الـ 20 فيديو"), transition="fade")
sc(259, R(DISC(1, 259), S(T("أول جملة: شي بيبين مستحيل", 259), T("«74 جندي وقّعوا جسر حديد… بس لأنهم مشيوا عليه»", 264, size="s"), T("بلا مقدمة، بلا تعريف", 275, size="s"), gap=22), gap=60), transition="fade")
sc(279, R(DISC(2, 279), S(T("القصة بتكبر", 279), T("والمشاهد بيستغرب أكثر", 282, size="s"), gap=22), gap=60), transition="fade")
sc(285, R(DISC(3, 285), S(BAR("You see", [287, 288]), T("يعني «شوف»… ومنها بيبلّش الشرح", 289, size="s"), T("14 فيديو من 20", 295, size="s", tone="green"), gap=22), gap=60), transition="fade")
sc(302, R(DISC(4, 302), T("آخر جملة: مفاجأة بتقلب كل شي", 302), gap=60), transition="fade")
sc(308, R(V(FE("high-voltage"), 311, size="l"), S(T("4 كلمات بالثانية", 311), T("بلا ولا لحظة سكوت", 315, size="s"), gap=22), gap=70), transition="fade")
sc(319, R(V(FE("clapper-board"), 321, size="l"), BAN("جرّبها بأول ريل… ورح تنجح معك", [324, 325, 326, 329, 330, 331], tone="orange"), gap=50), transition="fade")

# ---------------- 4: خلّيه يقيس (332–396)
sc(332, R(S(V(FE("speech-balloon"), 335, size="l"), X(340, w=200)), T("«حاسس إن الكاميرا بطيئة»", 337), gap=70), transition="fade")
sc(343, SH(K + "قياس", 343, label="كتب لحاله أداة بتقيس كل حركة كاميرا"), transition="fade")
sc(361, SH(K + "قيس-لا-رأي", 361, marks=[M(371, 1, 30, 97, 26, "لا تسأل عن رأيه… خلّيه يقيس")], label="أهم جملة بالفيديو"), transition="fade")
sc(379, R(S(IC(FE("thinking-face"), 380, "الرأي ما بيفيدك"), X(384, w=200)), IC(FE("bar-chart"), 387, "الرقم بيطلّعلك نتائج حلوة", 392), gap=160), transition="fade")

# ---------------- 5: كيف انبنى الفيديو (397–513)
sc(397, SH(K + "الجسر", 397, label="قصة جديدة: جسر وقع سنة 1831"), transition="fade")
sc(408, R(V(FE("magnifying-glass-tilted-left"), 413, size="l"), S(T("تحقق من كل معلومة", 413), T("التاريخ · عدد الجنود · عمق النهر", 418, size="s"), gap=22), gap=70), transition="fade")
sc(424, SH(K + "الشخصيات", 424, label="بنى كل شي بالكود"), transition="fade")
sc(433, R(IC("logos:threejs", 434, "three.js: العالم 3D", size="l"), IC(FE("film-frames"), 438, "Remotion: الكود لفيديو", size="l"), gap=160), transition="fade")
sc(444, SH(K + "رخيص", 444, label="أول نسخة: شكلها سيء"), transition="fade")
sc(455, R(V(CLAUDE, 457, size="l"), S({"type": "counter", "to": 12, "word": 462, "size": "xl"}, T("وكيل أو agent", 463, size="s"), gap=10), gap=80), transition="fade")
sc(466, SH(K + "الوكلاء", 466, marks=[M(466, 4, 8, 94, 26, "7 بيقارنوا مع الأصلي", out=477), M(477, 4, 40, 94, 21, "4 بيعيدوا البناء")], label="فريق وكلاء"), transition="fade")
sc(482, SH(K + "ملفات-الوكلاء", 482, label="قسّم الملفات أيضاً"), transition="fade")
sc(496, R(V(FE("file-folder"), 496, size="l"), S(T("كل وكيل إله ملفاته", 496), T("حتى ما يخرّبوا شغل بعض", 500, size="s"), gap=22), gap=70), transition="fade")
sc(505, R(V(FE("hourglass-not-done"), 509, size="l"), T("أقل من 10 ساعات", 510), gap=70), transition="fade")

# ---------------- 6: السكيل المجانية (514–602)
sc(514, SH(K + "غيت-هاب", 514, marks=[M(521, 9, 20, 18, 6, "اسم السكيل", out=528), M(528, 84, 20, 9, 5, "+2000 نجمة")], label="مجاناً على GitHub"), transition="fade")
sc(535, R(V(CLAUDE, 535, size="l"), T("«استعمل السكيل واعملي فيديو عن…»", 540), gap=70), transition="fade")
sc(547, S(T("وبيمشي لحاله", 553, size="m"),
          R(IC(FE("light-bulb"), 556, "المعلومة", size="s"), IC(FE("memo"), 558, "السكربت", size="s"), IC(FE("studio-microphone"), 561, "الصوت", size="s"),
            IC(FE("framed-picture"), 563, "اللقطات", size="s"), IC(FE("film-frames"), 565, "الفيديو", size="s"), gap=60), gap=50), transition="fade")
sc(566, S(T("بس خليني كون صريح معك", 566, size="m"),
          R(DISC(1, 571, size="s"), T("Claude Code: اشتراك مدفوع", 574, size="s"), gap=30),
          R(DISC(2, 580, size="s"), T("برامج على جهازك ومساحة كبيرة", 581, size="s"), gap=30),
          R(DISC(3, 587, size="s"), T("بالإنجليزي: للعربي حط صوتك أو صوت AI", 589, size="s"), gap=30), gap=26), transition="fade")
sc(600, S(T("رابطها بوصف هالفيديو", 600), ARR(601, w=220, rotate=70), gap=20), transition="fade")

# ---------------- 7: الدرس الأكبر (603–661)
sc(603, R(S(V(FE("wrapped-gift"), 609, size="l"), X(611, w=200)), T("مو السكيل… الأهم هو الطريقة", 612), gap=70), transition="fade")
sc(619, R(IC(FE("trophy"), 620, "أنجح 20 فيديو بمجالك"), ARR(624, w=120, flip=True), IC(CLAUDE, 624, "Claude يدرسهم ويقيسهم"), ARR(632, w=120, flip=True), IC(FE("rocket"), 632, "محتواك بنفس الطريقة"), gap=40), transition="fade")
sc(639, S(T("بتتعلم أي أسلوب ناجح", 639), T("بدل ما تخمّن وتجرب", 644, size="s"), gap=22), transition="fade")
sc(648, R(V(CLAUDE, 658, size="l"), BAN("مونتاج هالفيديو معمول بكلود", [650, 651, 656], tone="orange"), gap=50), transition="fade")

# ---------------- BRIDGE + CTA (662–702)
sc(662, R(S(V(FE("toolbox"), 666, size="l"), X(670, w=220)), BAN("الأدوات لحالها ما بتعمل شي", [666, 667, 668, 669, 670], tone="magenta"), gap=50), transition="push")
sc(671, R(V(FE("robot"), 676, size="l"), BAN("اللي بيفرق: نظام بيشتغل عنك", [671, 672, 675, 676, 678, 679], tone="orange"), gap=50), transition="fade")
sc(680, S(F(COVER, 683, look="card", size="xl"), BAN("ماستر كلاس مجاني عن كلود", [683, 684, 686], tone="orange")), transition="fade")
sc(687, R(V(CLAUDE, 688, size="l"), BAN("كيف تبني هالنظام خطوة بخطوة", [688, 689, 690, 691, 692], tone="purple"), gap=50), transition="fade")
sc(693, S(BAN("الرابط بوصف هالفيديو", [693, 694, 695], tone="orange"), ARR(694, w=260, rotate=70)), transition="fade")
sc(696, {"type": "subscribe", "word": 696, "clickAt": 697}, transition="fade")

chapters = {
    "endWord": 662,
    "items": [
        {"label": "شو هالنوع من الفيديوهات", "short": "النوع", "word": 83},
        {"label": "خلّيه يشوف كل صورة", "short": "كل صورة", "word": 130},
        {"label": "الوصفة السرية", "short": "الوصفة", "word": 234},
        {"label": "خلّيه يقيس، مو يحكي رأيه", "short": "القياس", "word": 332},
        {"label": "كيف انبنى الفيديو", "short": "البناء", "word": 397},
        {"label": "السكيل المجانية", "short": "السكيل", "word": 514},
        {"label": "الدرس الأكبر", "short": "الدرس", "word": 603},
    ],
}

plan = json.loads(PLAN.read_text(encoding="utf8"))
PLAN.write_text(json.dumps({"source": plan["source"], "transition": "push", "music": {"volume": 0.025}, "sfxVolume": 0.5,
                            "calm": {"from": 83}, "chapters": chapters, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf8")
print("scenes:", len(scenes))
