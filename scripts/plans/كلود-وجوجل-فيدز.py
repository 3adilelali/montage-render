# «كلود وجوجل فيدز» (2026-11-09). Honest practical test: Claude drives Google Vids in the app's browser.
# Energetic hook (0–110) → calm teaching (111–831) → energetic close (832–872).
# Voice: eleven-cut (873 words) + 1 pause for the result (26.4 s after word 528); the result's own audio is mixed into
# voice.wav at 192.65 s (voice.no-result.wav = before the mix). If insert-pauses runs again, redo the mix.
# Screen clips: Adil's OBS recording المدخلات/2026-11-09 00-57-01.mp4 (chat left, Vids right, sidebar cropped out).
# FORBIDDEN: 67.5–75 s (the «النص كامل جاهز للنسخ» table + his request for it) and 23.5–27.3 s (terms popup, cut from script).
# Run: python scripts/plans/كلود-وجوجل-فيدز.py [--clips]   (--clips re-cuts the screen clips)
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CH = ROOT.parent
PLAN = ROOT / "public/explainer/plan.json"
CAP = json.loads((ROOT / "public/explainer/captions.json").read_text(encoding="utf8"))
REC = CH / "المدخلات/2026-11-09 00-57-01.mp4"
OUTD = CH / "العناصر/كلود-وجوجل-فيدز"
BAD = [(23.5, 27.3), (67.5, 75.0)]

def wt(i): return CAP[i]["startMs"] / 1000 - 0.1

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
    return S(V(icon, w, **({"size": size} if size else {}), **k), T(label, lw if lw is not None else w, size="s"))
def SH(file, at, label=None, pointer=None, **k):
    d = {"type": "shot", "file": file, "word": at, **k}
    if label: d["label"] = label
    if pointer: d["pointer"] = [{"word": a, "x": x, "y": y} for a, x, y in pointer]
    return d

CLAUDE = "logos:claude-icon"
GOOGLE = "logos:google-icon"
FE = lambda n: f"fluent-emoji-flat:{n}"

scenes, clips = [], []
def sc(frm, *items, **kw): scenes.append({"from": frm, "items": list(items), **kw})

# crop of the recording (1280×720): chat = Claude conversation, vids = Google Vids pane, full = both (no sidebar)
LOOK = {
    "chat": ("crop=440:635:176:25,scale=660:952:flags=lanczos,unsharp=5:5:0.6", 610, 880),
    "vids": ("crop=655:560:625:90,scale=1170:1000:flags=lanczos,unsharp=5:5:0.5", 936, 800),
    # full: blur the browser tab/URL row of the Vids pane (doc id)
    "full": ("crop=1104:662:176:28,split[m][s];[s]crop=660:40:444:0,boxblur=8:2[bl];[m][bl]overlay=444:0,"
             "scale=1600:960:flags=lanczos,unsharp=5:5:0.5", 1460, 876),
}
def CLIP(scene, kind, a, b=None, **sh):
    """Screen clip [a,b] of the recording (b=None → still at a), fitted to the length of the scene that starts at `scene`."""
    for x, y in BAD:
        assert (b or a + 0.1) <= x or a >= y, f"clip {a}-{b} touches forbidden {x}-{y}"
    name = f"كجف-{len(clips) + 1:02d}"
    clips.append({"name": name, "kind": kind, "a": a, "b": b if b is not None else a + 0.1, "from": scene, "still": b is None})
    _, w, h = LOOK[kind]
    return SH(name, scene, w=w, h=h, loop=False, **sh)

# ---------------- HOOK (0–110): energy
sc(0, S(SH("سالم-هوك", 0, w=1440, h=810, loop=False), gap=10), transition="zoom")
sc(12, S(R(S(V(FE("artist-palette"), 13, size="l"), X(14, w=150)), S(V(FE("studio-microphone"), 15, size="l"), X(16, w=150)),
           S(V(FE("clapper-board"), 18, size="l"), X(20, w=150)), gap=110),
         BAN("Claude عمله كله لحاله", [22, 23, 24, 25], tone="orange"), gap=60), transition="push")
sc(26, R(IC(CLAUDE, 26, "Claude", size="xl"), T("+", 28, size="l"), IC(GOOGLE, 29, "أداة من Google", size="xl"), gap=110), transition="push")
sc(32, S(BAN("وفي مشكلة", [32, 33], tone="magenta"), T("ما حدا من اللي شرحوها حكى عنها", 36, size="m"), gap=44), transition="glitch")
sc(43, S(R(V(FE("television"), 44, size="l"), T("كذا فيديو أجنبي", 45), gap=60), BAR("+200 ألف مشاهدة", [46, 47]), gap=40), transition="zoom", bg="rays")
sc(51, R(IC(CLAUDE, 51, "Claude", size="l"), ARR(52, w=130, flip=True), IC(GOOGLE, 54, "أداة Google للفيديو", size="l"),
         ARR(56, w=130, flip=True), IC(FE("clapper-board"), 57, "فيلم كرتون كامل", size="l"), gap=50), transition="push")
sc(61, R(BAN("autopilot", [63, 64], tone="purple"), S(V(FE("computer-mouse"), 65, size="l"), X(66, w=160)), gap=90), transition="push")
sc(69, R(V(FE("test-tube"), 76, size="l"), S(T("بدل ما تجرّبها إنت… أنا بجرّبها", 69), T("النتيجة الحقيقية: الجيد والسيء", 78, size="s"), gap=20), gap=70), transition="push")
sc(84, S(T("بهالفيديو", 84, size="m"),
         R(IC(FE("shopping-cart"), 88, "شو بتحتاج"), IC(FE("memo"), 90, "البرومبت"), IC(FE("gear"), 97, "كيف اشتغل"),
           IC(FE("clapper-board"), 100, "النتيجة"), IC(FE("warning"), 102, "المشكلة"), gap=80), gap=40), transition="push")
sc(105, R(V(FE("thinking-face"), 106, size="l"), BAN("وليش مو الطريقة الصح", [105, 107, 108, 109], tone="magenta"), gap=60), transition="flash")

# ---------------- 1: شو بتحتاج (111–175) — calm from here
sc(111, R(IC(CLAUDE, 115, "تطبيق Claude عالكمبيوتر", size="l"), IC(FE("credit-card"), 119, "اشتراك مدفوع", size="l"),
          IC(GOOGLE, 121, "حساب Google", size="l"), gap=120), transition="push")
sc(123, R(CLIP(123, "vids", 96.0, label="Google Vids"),
          S(T("Google Vids", 125), R(IC(FE("film-frames"), 135, "مقاطع", size="s"), IC(FE("studio-microphone"), 136, "صوت", size="s"),
            IC(FE("scissors"), 137, "مونتاج", size="s"), gap=40), T("كلها بمكان واحد", 138, size="s", tone="green"), gap=30), gap=80), transition="fade")
sc(141, R(V(FE("wrapped-gift"), 142, size="l"), S(T("الحساب المجاني", 141), T("عدد قليل من المقاطع بالشهر", 145, size="m"),
                                                 T("بيكفّي لكم فيديو قصير", 151, size="s", tone="green"), gap=20), gap=70), transition="fade")
sc(160, CLIP(160, "full", 96.0, label="متصفح جوا تطبيق Claude", labelBelow=True,
             pointer=[(160, 20, 55), (166, 68, 30), (172, 74, 40)]), transition="fade")

# ---------------- 2: البداية (176–217)
sc(176, R(CLIP(176, "chat", 1.6, 4.6, pointer=[(179, 70, 8), (190, 45, 32)]),
          S(T("أول برومبت: بسيط", 179), T("«افتح Google Vids…\nولما يطلب تسجيل دخول،\nوقّف واستنّاني»", 183, size="m"), gap=26), gap=80), transition="push")
sc(196, R(V(FE("locked"), 196, size="l"), S(T("تسجيل الدخول بتعمله إنت بإيدك", 200), T("الإيميل وكلمة السر… وهو بكمّل عنك", 205, size="s"), gap=20), gap=70), transition="fade")
sc(212, R(CLIP(212, "chat", 6.5, pointer=[(213, 55, 40)]), S(T("وClaude وقف فعلاً", 212), T("واستناني لحتى سجّلت", 215, size="m", tone="green"), gap=20), gap=80), transition="fade")

# ---------------- 3: أمر المخرج (218–384)
sc(218, S(T("البرومبت الأساسي", 220), BAN("وهون السر كله", [223, 224, 225], tone="orange"), gap=40), transition="push")
sc(226, R(CLIP(226, "chat", 9.5, 14.5), S(T("البرومبت 2: أمر المخرج", 228), T("كامل بوصف هالفيديو", 233, size="m", tone="green"),
                                          ARR(235, w=200, rotate=70), gap=24), gap=80), transition="fade")
sc(244, {"type": "mc-typing", "word": 244, "title": "أول سطر: الموضوع على شكل سؤال",
         "text": "كيف كان البدو يلاقوا طريقهم بالصحرا قبل الخرائط؟", "end": 258}, transition="fade")
sc(259, R(V(FE("eyes"), 259, size="l"), S(T("السؤال هو يلي بيخلّي الناس", 260), T("تكمّل الفيديو", 265, size="m", tone="green"), gap=16), gap=70), transition="fade")
sc(267, R(S({"type": "counter", "to": 9, "word": 270, "size": "xl"}, T("مشاهد", 271, size="m"), gap=6),
          S({"type": "counter", "to": 4, "word": 274, "size": "xl"}, T("ثواني كل مشهد", 275, size="m"), gap=6), gap=200), transition="fade")
sc(276, S(T("قصة، مش قائمة مشاهد", 276, size="m"),
          R(S(DISC(1, 280, size="s"), T("شخصية", 280, size="s")), S(DISC(2, 281, size="s"), T("مشكلة", 281, size="s")),
            S(DISC(3, 282, size="s"), T("شي بيخرب", 283, size="s")), S(DISC(4, 284, size="s"), T("جواب مفاجئ", 285, size="s")), gap=110), gap=50), transition="fade")
sc(287, R(F("سالم-1", 287, size="l", look="card"), S(V(FE("high-voltage"), 290, size="m"), T("أول مشهد = أقوى لحظة", 290), gap=16), gap=80), transition="fade")
sc(293, R(F("سالم-3", 300, size="l", look="card"),
          S(T("أهم حيلة: وصف الشخصية", 294, size="m"), T("ولد اسمه سالم", 300, size="s"), T("راسه أبيض ودائري", 303, size="s"),
            T("شماغ أحمر وأبيض", 307, size="s"), T("وثوب بني", 310, size="s"), gap=14), gap=80), transition="fade")
sc(312, S(BAN("نفس الوصف، حرفياً، بكل مشهد", [314, 315, 316, 317], tone="orange"), T("بدون ما تغيّر ولا كلمة", 318, size="m"), gap=40), transition="fade")
sc(319, S(R(F("سالم-1", 320, size="m", look="card"), F("سالم-2", 321, size="m", look="card"), F("سالم-نجمة", 322, size="m", look="card"), gap=40),
          T("سالم نفس الشكل من أول الفيديو لآخره", 322, size="m", tone="green"), gap=40), transition="fade")
sc(328, S(T("سالم بكل مشهد لازم يعمل شي", 330, size="m"),
          R(IC(FE("person-walking"), 336, "بيمشي", size="l"), IC(FE("backhand-index-pointing-up"), 337, "بيأشّر", size="l"),
            IC(FE("person-running"), 338, "بيركض", size="l"), gap=120), gap=40), transition="fade")
sc(339, R(S(IC(FE("framed-picture"), 342, "واقف = سلايد شو", size="l"), X(345, w=180)), T("مو", 346, size="l"),
          IC(FE("film-frames"), 347, "أنيميشن", size="l"), gap=110), transition="fade")
sc(348, R(CLIP(348, "chat", 14.8, label="قواعد الوقوف", pointer=[(353, 60, 25)]),
          S(R(S(V(FE("key"), 364, size="m"), X(366, w=110)), T("لا تكتب كلمة سر", 365, size="s"), gap=30),
            R(S(V(FE("page-facing-up"), 368, size="m"), X(370, w=110)), T("ولا توافق على شروط", 369, size="s"), gap=30),
            R(S(V(FE("credit-card"), 372, size="m"), X(374, w=110)), T("ولا تكبس على دفع", 373, size="s"), gap=30),
            BAN("وقّف واحكيلي", [382, 383, 384], tone="orange", fs=54), gap=18), gap=80), transition="fade")

# ---------------- 4: كيف اشتغل (385–528)
sc(385, R(V(FE("person-walking"), 393, size="l"), S(T("بعد هالبرومبت", 390), T("أنا ما عملت ولا شي", 393, tone="green"), gap=16), gap=70), transition="push")
sc(398, CLIP(398, "full", 16.5, 23.4, label="كتب القصة، وفتح الأداة، وصار يعمل المشاهد", labelBelow=True), transition="fade")
sc(408, R(CLIP(408, "chat", 27.6, 30.2, pointer=[(411, 50, 30)]),
          S(T("كل مشهد بيطلع… بيفحصه", 408, size="m"), T("الشخصية نفسها؟", 416, size="s"), T("في صحرا؟", 418, size="s"),
            T("في كتابة غلط على الشاشة؟", 420, size="s"), gap=20), gap=80), transition="fade")
sc(425, R(CLIP(425, "chat", 38.5, pointer=[(426, 55, 24)]), S(T("بعدين حط الصوت", 425), T("مشهد مشهد", 428, size="m"), gap=16), gap=80), transition="fade")
sc(429, S(BAN("الجمل أطول من المشاهد", [433, 434, 435, 437], tone="magenta"),
          R(S({"type": "counter", "to": 4, "word": 439, "size": "xl"}, T("ثواني المشهد", 440, size="s"), gap=6),
            S({"type": "counter", "to": 5, "word": 442, "size": "xl"}, T("ثواني الجملة", 443, size="s"), gap=6), gap=200), gap=40), transition="fade")
sc(444, R(CLIP(444, "chat", 41.5, 47.5), S(T("فلحاله رجع كتب الجمل أقصر", 444), T("وولّد الصوت مرة ثانية", 449, size="m"),
                                             T("لحتى صارت كل جملة جوا مشهدها", 453, size="s", tone="green"), gap=20), gap=80), transition="fade")
sc(459, R(CLIP(459, "vids", 82.0, 100.0),
          S(R(V(FE("muted-speaker"), 460, size="s"), T("كتم صوت المقاطع", 460, size="s"), gap=20),
            R(V(FE("musical-notes"), 465, size="s"), T("موسيقى هادية", 465, size="s"), gap=20),
            R(V(FE("scissors"), 469, size="s"), T("قصّ كل مشهد على جملته", 469, size="s"), gap=20),
            R(V(FE("play-button"), 476, size="s"), T("شغّله كله ليتأكد", 476, size="s"), gap=20),
            R(V(FE("inbox-tray"), 480, size="s"), T("ونزّله على جهازي", 480, size="s"), gap=20), gap=22), gap=80), transition="fade")
sc(483, R(CLIP(483, "chat", 31.5, pointer=[(498, 72, 81)]),
          S(T("شغلة ممكن تفيدك", 483, size="m"), T("بلّش يحكي إنجليزي", 489, size="s"),
            BAN("«خلّي كل الشرح بالعربي»", [498, 499, 500, 501], tone="orange", fs=54),
            T("ومن وقتها صار يحكي عربي", 502, size="s", tone="green"), gap=22), gap=80), transition="fade")
sc(515, R(V(FE("hourglass-not-done"), 516, size="l"), S(T("الشغل طوّل شوي", 515), T("بس أنا ما لمست ولا شي", 518, size="m", tone="green"),
                                                       T("وهي النتيجة، مسرّعة شوي", 524, size="s"), gap=16), gap=70), transition="fade")
sc(528, SH("سالم-النتيجة", 528, w=1600, h=900, loop=False), transition="fade")

# ---------------- 5: المشكلة (529–691)
sc(529, S(T("الصراحة؟", 530, size="m"),
          R(T("الرسوم ممتازة ✓", 532, size="s"), T("سالم نفس الشكل ✓", 534, size="s"), gap=60),
          R(T("القصة ماشية ✓", 539, size="s"), T("المعلومة صحيحة ✓", 541, size="s"), gap=60), gap=36), transition="push")
sc(543, BAN("بس مع هذا كله… في مشكلة", [543, 545, 546, 548], tone="magenta"), transition="glitch")
sc(549, R(V(FE("low-battery"), 550, size="l"), S(BAR("الـ Limit", [550]), T("حد الاستخدام تبع الخمس ساعات", 554, size="m"),
                                                T("أكلت منه بشكل مبالغ فيه", 559, size="s", tone="red"), gap=20), gap=70), transition="fade")
sc(562, R(CLIP(562, "chat", 62.0, pointer=[(570, 72, 37)]), S(T("لدرجة إني بنص الشغل", 562), T("كتبتله:", 568, size="m"),
                                                               T("«حاول تنفذ الفيديو بأقل صرف ليمت ممكن»", 570, size="s", tone="green"), gap=20), gap=80), transition="fade")
sc(577, R(V(CLAUDE, 581, size="l"), S(T("ليش صار هيك؟", 577, size="m"), T("Claude ما بيشوف الشاشة مثلنا", 580), gap=16), gap=70), transition="fade")
sc(586, R(V(FE("eyes"), 586, size="l"), S(T("إنت: نظرة وحدة", 590), T("وبتكبس", 594, size="m", tone="green"), gap=16), gap=70), transition="fade")
sc(595, S(T("Claude: لكل كبسة", 596, size="m"),
          R(IC(FE("camera-with-flash"), 600, "يصوّر الشاشة"), ARR(602, w=90, flip=True), IC(FE("magnifying-glass-tilted-left"), 602, "يقرا الصورة"),
            ARR(604, w=90, flip=True), IC(FE("thinking-face"), 604, "يقرر وين"), ARR(606, w=90, flip=True), IC(FE("computer-mouse"), 606, "يكبس"),
            ARR(607, w=90, flip=True), IC(FE("camera-with-flash"), 608, "يرجع يصوّر"), gap=30), gap=40), transition="fade")
sc(610, R(IC(FE("telephone-receiver"), 613, "إنت عالتلفون", size="l"), ARR(617, w=140),
          IC(FE("laptop"), 617, "هو على كمبيوتره", size="l"),
          S(V(FE("camera-with-flash"), 624, size="m"), T("كل خطوة: صورة… ويستنى", 624, size="s"), gap=10), gap=60), transition="fade")
sc(629, S({"type": "counter", "to": 100, "word": 634, "size": "xl"}, T("خطوة لفيديو قصير", 634, size="m"), gap=10), transition="fade")
sc(636, S(SH("صور-كلود-128", 636, w=1560, h=594, loop=False),
          R(S({"type": "counter", "to": 128, "word": 644, "size": "l"}, T("صورة شاشة", 647, size="s"), gap=4),
            S({"type": "counter", "to": 270, "word": 651, "prefix": "+", "size": "l"}, T("حركة", 653, size="s"), gap=4), gap=200), gap=20), transition="fade")
sc(654, R(V(FE("brain"), 656, size="l"), S(T("ذاكرة المحادثة امتلت بالنص", 656), T("واضطر يلخّص ويكمّل", 660, size="m"), gap=16), gap=70), transition="fade")
sc(663, S(R(T("بتشتغل ✓", 665, size="m"), T("النتيجة حلوة ✓", 666, size="m"), gap=80),
          BAN("بس كلفتها أغلى من قيمتها", [668, 669, 670, 672], tone="magenta"), gap=40), transition="fade")
sc(673, R(IC(FE("spiral-calendar"), 677, "فيديو كل يوم", size="l"), IC(FE("stopwatch"), 682, "فيديو 5 دقايق", size="l"),
          S(V(FE("low-battery"), 685, size="l"), T("الليمت بيخلص قبل الفيديو", 685, size="s", tone="red"), gap=10), gap=110), transition="fade")

# ---------------- 6: الحل (692–777)
sc(692, BAN("وهذا الدرس الأهم", [692, 693, 694], tone="orange"), transition="push")
sc(695, R(S(V(FE("link"), 704, size="l"), T("مع الأداة مباشرة", 701, size="m"), T("عن طريق الربط ✓", 704, size="s", tone="green"), gap=10),
          T("مو", 706, size="l"),
          S(S(V(FE("globe-with-meridians"), 709, size="l"), X(709, w=170)), T("من خلال المتصفح", 709, size="m"), gap=10), gap=130), transition="fade")
sc(710, S(R(IC(CLAUDE, 716, "Claude", size="l"), ARR(719, w=120, flip=True), IC(FE("memo"), 722, "أوامر بس", size="l"),
            ARR(722, w=120, flip=True), IC(FE("clapper-board"), 717, "أداة الفيديو", size="l"), gap=40),
          R(S(V(FE("camera-with-flash"), 724, size="m"), X(725, w=110)), T("بدون ولا صورة شاشة", 724, size="m"), gap=30), gap=50), transition="fade")
sc(728, S(BAN("بيصرف أقل بكثير", [729, 730, 731], tone="orange"), T("من هالتجربة", 733, size="m"), gap=30), transition="fade")
sc(734, R(V(FE("globe-with-meridians"), 734, size="l"), S(T("المتصفح = حل أخير", 734), T("لشغلة ما إلها حل ثاني", 738, size="m"),
                                                         T("مو لفيديو كامل", 744, size="s", tone="red"), gap=16), gap=70), transition="fade")
sc(747, R(V(FE("television"), 747, size="l"), S(T("الفيديوهات الأجنبية ما حكت عنها", 747), T("اشتراك أعلى… أو ما بدهم يذكروا", 753, size="m"), gap=16), gap=70), transition="fade")
sc(764, R(V(FE("light-bulb"), 769, size="l"), S(T("بالفيديوهات الجاية: طرق أذكى", 765), T("نفس النتيجة أو أحسن… ومجاناً", 773, size="m", tone="green"), gap=16), gap=70), transition="fade")

# ---------------- 7: نصايح (778–831)
sc(778, S({"type": "counter", "to": 3, "word": 783, "size": "xl"}, T("نصايح إذا لسا حابب تجرّبها", 778, size="m"), gap=10), transition="push")
sc(785, R(DISC(1, 785), IC(FE("clapper-board"), 788, "ابدأ بفيديو قصير", size="l"), S(BAR("بين 4 و 6 مشاهد", [790, 791, 792]), gap=10), gap=70), transition="fade")
sc(794, R(DISC(2, 794), S(F("سالم-1", 796, size="m", look="card"), T("شوف أول مشهد", 796, size="s"), gap=10),
          S(T("الشخصية أو الستايل غلط؟", 801, size="m"), T("وقّفه وصلّح البرومبت", 807, size="m", tone="green"), gap=16), gap=70), transition="fade")
sc(814, R(DISC(3, 814), V(FE("locked"), 820, size="l"), S(T("خلّيه يسجّلك خروج من Google", 818), T("عشان ما يضل حسابك مفتوح جوا Claude", 825, size="s"), gap=16), gap=70), transition="fade")

# ---------------- CLOSE (832–872): energy back
sc(832, S(R(S(V(FE("wrench"), 838, size="m"), X(838, w=110)), T("المهم مو الأداة", 836), gap=40),
          BAN("المهم تعرف كيف ومتى وبأي طريقة", [839, 841, 845, 846], tone="purple"), gap=40), transition="push")
sc(848, R(V(CLAUDE, 848, size="l"), BAN("يشتغل عنك بدون ما يحرق الليمت", [848, 849, 850, 853, 855], tone="orange"), gap=50), transition="zoom", bg="rays")
sc(856, S(BAN("البرومبت كامل بوصف هالفيديو", [856, 857, 858, 859], tone="orange"), ARR(859, w=240, rotate=70)), transition="push")
sc(861, {"type": "subscribe", "word": 861, "clickAt": 862}, transition="zoom")

# ---------------- cut the screen clips to fit their scenes
froms = [s["from"] for s in scenes]
END = CAP[-1]["endMs"] / 1000 + 1.5
def scene_len(frm):
    i = froms.index(frm)
    nxt = wt(froms[i + 1]) if i + 1 < len(froms) else END
    return nxt - wt(frm)

if "--clips" in sys.argv:
    full = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(REC)],
                                capture_output=True, text=True).stdout)
    for c in clips:
        dur = scene_len(c["from"]) + 0.8
        a, b = max(c["a"], 1.5), min(c["b"], full - 3.5)   # OBS rule: never the first 1.5 s / last 3.5 s
        look = LOOK[c["kind"]][0] + ",fps=30"
        if c["still"] or (b - a) <= dur:
            speed = 1.0
            vf = f"trim={a}:{b},setpts=PTS-STARTPTS,{look},tpad=stop_mode=clone:stop_duration={dur - (b - a) + 0.5:.2f}"
        else:
            speed = (b - a) / dur
            vf = f"trim={a}:{b},setpts=(PTS-STARTPTS)/{speed:.4f},{look}"
        out = OUTD / f"{c['name']}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(REC), "-filter_complex", vf, "-an", "-t", f"{dur:.2f}",
                        "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", str(out)], check=True)
        print(c["name"], c["kind"], f"{a}-{b}", f"scene {dur:.1f}s", f"x{speed:.2f}")

chapters = {
    "top": True,
    "endWord": 832,
    "hide": [{"from": 528, "to": 529}],
    "items": [
        {"label": "شو بتحتاج", "short": "شو بتحتاج", "word": 111},
        {"label": "البداية", "short": "البداية", "word": 176},
        {"label": "أمر المخرج", "short": "أمر المخرج", "word": 218},
        {"label": "كيف اشتغل", "short": "كيف اشتغل", "word": 385},
        {"label": "المشكلة", "short": "المشكلة", "word": 529},
        {"label": "الحل", "short": "الحل", "word": 692},
        {"label": "نصايح", "short": "نصايح", "word": 778},
    ],
}

src = json.loads((ROOT / "public/explainer/timeline.json").read_text(encoding="utf8"))["source"]
PLAN.write_text(json.dumps({"source": src, "transition": "push", "music": {"volume": 0.025}, "sfxVolume": 0.5,
                            "calm": {"from": 111, "to": 832}, "chapters": chapters, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf8")
print("scenes:", len(scenes), "clips:", len(clips))
