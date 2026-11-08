# «بدك تفتح قناة يوتيوب؟ خلي كلود يعمل أغلب الشغل» (2026-11-03). Skool format + the new chapter tracker (Chapters.tsx).
# Word indices = public/explainer/captions.json after prepare (582 words) + 8 chapter pauses of 2.2s (insert-pauses).
# Run: python scripts/plans/قناة-يوتيوب-بكلود.py
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
def MUL(count, w, **k): return {"type": "multiply", "count": count, "word": w, **k}
def IC(icon, w, label, lw=None, **k): return S(V(icon, w, **k), T(label, lw if lw is not None else w, size="s", enter="pop"))

CLAUDE = "logos:claude-icon"
YT = "logos:youtube-icon"
FE = lambda n: f"fluent-emoji-flat:{n}"
THUMB = "مصغرة-كلود-المونتير"

scenes = []
def sc(frm, *items, **kw):
    scenes.append({"from": frm, "items": list(items), **kw})

# ---------------- HOOK
sc(0, {"type": "fly3d", "words": ["لو", "بدك", "تفتح", "قناة", "يوتيوب"], "word": 0, "at": [0, 1, 2, 3, 4]})
sc(6, S({"type": "counter", "to": 5, "word": 7, "frames": 14, "size": "xl"}, BAR("أشخاص", [8])), transition="zoom", bg="rays")
sc(9, R(IC(FE("light-bulb"), 10, "الأفكار", 11), IC(FE("pencil"), 13, "الكتابة"), IC(FE("framed-picture"), 15, "الصورة المصغّرة", 16),
        IC(FE("clapper-board"), 19, "المونتاج"), IC(FE("magnifying-glass-tilted-left"), 21, "المنافسين", 22), gap=40), transition="push")
sc(23, S(V(CLAUDE, 27, size="l", burst="orange", idle="pulse"), BAN("عندي واحد بس", [24, 25, 26], tone="orange")), transition="through")
sc(28, R(F("شعاري", 33, look="circle", size="l", burst="orange"), BAN("عملناه فعلاً على هالقناة", [33, 34, 36], tone="orange")))
sc(37, S(MUL(12, 37, cols=6, cell=130, tile=True, spreadAt=38), BAN("وقنوات غيرها كتير", [37, 38, 39])))
sc(40, R(V(YT, 43, size="l"), BAN("قناة كاملة بكلود", [43, 45, 46], tone="orange"), V(CLAUDE, 46, size="l", burst="orange"), gap=50), transition="through")
sc(47, {"type": "mc-flow", "word": 47, "nodes": [
    {"label": "المجال", "icon": FE("bullseye"), "word": 49},
    {"label": "الأفكار", "icon": FE("light-bulb"), "word": 50},
    {"label": "السكربت", "icon": FE("memo"), "word": 51},
    {"label": "المونتاج", "icon": FE("clapper-board"), "word": 52},
    {"label": "ينزل", "icon": YT, "word": 53}]})
sc(54, R(V(CLAUDE, 61, size="l", corner="?", cornerAt=63, idle="sway"), BAN("الشي الوحيد اللي ما بيعمله", [58, 59, 62, 63, 64], tone="magenta")), transition="glitch")

# ---------------- STEP 1: المجال
sc(66, R(V(FE("warning"), 67, size="l", idle="pulse"), BAN("أول غلطة", [66, 67], tone="magenta")), transition="push")
sc(73, S(R(V(FE("red-heart"), 76, size="l", idle="pulse"), BAN("المجال اللي بتحبه بس", [74, 76, 77])), X(77, w=420)))
sc(78, S(R(DISC(1, 79, size="s"), DISC(2, 80, size="s"), DISC(3, 81, size="s"), gap=70), BAN("3 أسئلة مع بعض", [79, 80, 81, 82], tone="orange")), transition="through")
sc(83, R(DISC(1, 83), S(V(FE("speaking-head"), 87, size="m", idle="bob"), BAN("شو بتقدر تحكي عنه بلا تعب؟", [84, 87, 88, 90, 92], tone="purple"))), transition="through")
sc(93, R(DISC(2, 93), S(V(FE("magnifying-glass-tilted-left"), 98, size="m", idle="sway"), BAN("شو الناس عم تدوّر عليه؟", [94, 96, 98, 100], tone="purple"))), transition="through")
sc(101, R(DISC(3, 101), S(V(FE("money-bag"), 106, size="m", idle="bob", burst="orange"), BAN("شو مستعدين يدفعوا عشانه؟", [104, 105, 106, 107], tone="orange"))), transition="through")
sc(108, R(V(CLAUDE, 110, size="l"), S(BAN("شغلك", [113], tone="purple"), BAN("خبرتك", [114], tone="purple"), BAN("شو بتحب", [115, 116], tone="orange"), gap=24), gap=80), transition="push")
sc(117, {"type": "mc-typing", "text": "أعطيني 5 مجالات بيجمعوا الـ3 أسئلة، ومع كل مجال ليش", "title": "Claude", "word": 118, "end": 128, "w": 1250, "h": 320, "rtl": True, "fontSize": 50})
sc(129, S(MUL(5, 130, cols=5, cell=170, icon=FE("bullseye"), spreadAt=130, pickAt=132, pick=2), BAN("خيارات، مو تخمين", [132, 133], tone="orange")))

# ---------------- STEP 2: ادرس قناة ناجحة
sc(134, R(V(FE("thinking-face"), 135, size="l", idle="sway"), S(BAN("تخترع من الصفر", [136, 137, 138], tone="magenta"), X(138, w=360))), transition="push")
sc(139, R(V(CLAUDE, 140, size="l"), ARR(141, w=200, flip=True), S(V(YT, 142, size="m", corner=FE("glowing-star"), cornerAt=143), BAN("قناة ناجحة بمجالك", [142, 143, 144], tone="orange")), gap=60))
sc(145, R(F("شعاري", 145, look="circle", size="l", burst="orange"), BAN("عملناه بالضبط", [146, 149], tone="orange")), transition="through")
sc(150, S(MUL(30, 152, cols=6, cell=112, tile=True, spreadAt=155), BAN("درس أفكار +30 فيديو", [155, 156, 157, 159, 160])))
sc(161, S(MUL(12, 161, cols=6, cell=130, tile=True, spreadAt=161, pickAt=164, pick=4), BAN("الأفكار اللي بتتكرر", [162, 164], tone="orange")))
sc(167, S({"type": "mc-frames", "frames": [f"لقطة-{i}" for i in range(1, 7)], "word": 169}, BAN("لقطة لقطة", [174, 175], tone="orange")))
sc(176, S({"type": "counter", "to": 75, "prefix": "+", "word": 179, "frames": 26, "rays": True, "size": "xl"}, BAR("حركة مونتاج مميزة", [180, 181, 182])), transition="zoom", bg="rays")
sc(183, R(V(FE("studio-microphone"), 186, size="l", idle="pulse"), BAN("قبل أول كلمة", [184, 187, 188], tone="purple")))
sc(189, R(IC(FE("chart-increasing"), 191, "شو بيشتغل", 192), IC(FE("light-bulb"), 194, "ليش"), IC(FE("gear"), 195, "وكيف", idle="spin"), gap=90))

# ---------------- STEP 3: الأفكار من الأرقام
sc(198, R(V(FE("light-bulb"), 199, size="l", idle="pulse"), ARR(201, w=200, flip=True), S(V(FE("bar-chart"), 204, size="l", burst="orange"), T("دليل", 204, size="m", tone="green", enter="pop")), gap=60), transition="push")
sc(205, {"type": "mc-search", "query": "نفس الفكرة على يوتيوب", "result": "أنجح الفيديوهات", "label": "كلود عم يدوّر", "word": 206, "end": 209, "resultAt": 211})
sc(214, {"type": "mc-chart", "word": 214, "title": "كم جابت مشاهدات؟", "values": [18, 46, 12, 92, 30], "labels": ["فيديو 1", "فيديو 2", "فيديو 3", "فيديو 4", "فيديو 5"], "best": 3})
sc(218, R(V(FE("magnifying-glass-tilted-left"), 218, size="l", idle="sway", burst="orange"), BAN("وين في فراغ؟", [219, 220, 221], tone="orange")), transition="through")
sc(222, R(IC(FE("light-bulb"), 223, "نجحت قبل", 224), ARR(227, w=200, flip=True), S(F("شعاري", 232, look="circle", size="m"), T("بأسلوبك وتجربتك", 232, size="s", tone="green", enter="pop")), gap=60))
sc(235, {"type": "mc-doc", "title": "أفكار القناة", "word": 236, "w": 1150, "h": 620, "sections": [
    {"head": "الفكرة", "kind": "text", "items": ["قناة يوتيوب كاملة بكلود"], "word": 238},
    {"head": "العنوان المقترح", "kind": "text", "items": ["بدك تفتح قناة يوتيوب؟ خلي كلود يعمل أغلب الشغل"], "word": 242},
    {"head": "ليش ممكن تنجح", "kind": "text", "items": ["نجحت عند غيرنا · وفي فراغ بالعربي"], "word": 244},
]}, transition="push")
sc(247, R(V(FE("index-pointing-at-the-viewer"), 247, size="l", idle="bob"), BAN("وإنت بتختار", [247, 248], tone="orange")))

# ---------------- MID CTA (chapter row hidden)
sc(249, {"type": "host", "word": 249}, transition="push")
sc(252, R(V(CLAUDE, 255, size="l"), BAN("تتعلّم كلود من الأساس", [254, 255, 256, 257])))
sc(258, R(V(FE("robot"), 260, size="l", idle="bob"), BAN("يشتغل عنك بالمحتوى", [259, 260, 261, 262], tone="orange")))
sc(263, S(F("غلاف-الماستر-كلاس", 264, look="card", size="xl"), BAN("كورس مجاني كامل", [264, 265, 266], tone="orange")), transition="flash")
sc(267, S(BAN("الرابط بوصف الفيديو", [267, 268, 269], tone="purple"), ARR(268, w=260, rotate=70)))

# ---------------- STEP 4: السكربت بصوتك
sc(270, R(V(FE("page-facing-up"), 270, size="l", idle="bob"), BAN("أغلب الناس: مكرر وسيء", [274, 275, 278, 279], tone="magenta")), transition="push")
sc(280, {"type": "mc-typing", "text": "اكتبلي سكربت", "title": "Claude", "word": 282, "end": 285, "cross": 289, "w": 1000, "h": 300, "rtl": True})
sc(290, R(V(FE("robot"), 290, size="l", idle="sway"), BAN("واضح إنه AI", [290, 291], tone="magenta")), transition="glitch")
sc(292, R(V(FE("key"), 294, size="l", burst="orange", idle="sway"), BAN("أشياء واضحة يمشي عليها", [295, 296, 297, 298], tone="orange")), transition="through")
sc(299, R(DISC(1, 299), BAR("صوتك", [299])), transition="through")
sc(300, S(R(V(FE("memo"), 301, size="m"), BAN("نصوص من كلامك الحقيقي", [300, 302, 303], tone="purple"), gap=40),
          R(BAN("كلمات بتحكيها", [304, 305], tone="orange"), BAN("كلمات ما بتحكيها", [306, 307, 308], tone="magenta"), gap=40), gap=50))
sc(309, R(DISC(2, 309), BAR("بنية الفيديو", [309, 310])), transition="through")
sc(311, R(IC(FE("stopwatch"), 311, "هوك بأول 15 ث", 313), IC(FE("handshake"), 315, "وعد واضح", 316), IC(FE("gem-stone"), 317, "نقاط القيمة", 318), IC(FE("check-mark-button"), 319, "الخلاصة"), gap=50))
sc(321, R(DISC(3, 321), BAR("تعديلاتك", [321])), transition="through")
sc(322, R(V(FE("pencil"), 324, size="l", idle="sway"), ARR(327, w=200, flip=True), S(V(FE("brain"), 328, size="m", burst="orange", idle="pulse"), BAN("بيتعلّم منها للمرة الجاية", [328, 329, 330, 331], tone="orange")), gap=60))
sc(332, {"type": "bars", "word": 334, "bars": [
    {"label": "سكربت 1", "value": 45, "word": 334, "tone": "purple"},
    {"label": "سكربت 2", "value": 68, "word": 336, "tone": "purple"},
    {"label": "سكربت 3", "value": 92, "text": "أقرب لصوتك", "word": 338, "tone": "green"}]}, transition="push")

# ---------------- STEP 5: العنوان والصورة المصغّرة
sc(342, R(F(THUMB, 342, look="card", size="l"), S(V(FE("eyes"), 349, size="m", idle="bob"), BAN("بتقرر إذا حدا بيدخل", [346, 348, 350], tone="orange")), gap=60), transition="push")
sc(353, S(MUL(40, 355, cols=8, cell=108, tile=True, spreadAt=357), BAN("مئات الصور المصغّرة الناجحة", [357, 358, 360])))
sc(361, R(BAN("عربي", [361], tone="purple"), BAN("وأجنبي", [362], tone="orange"), gap=60), transition="through")
sc(363, BAR("قواعد واضحة", [364, 365]), transition="through")
sc(366, R(F(THUMB, 366, look="card", size="l", highlights=[
            {"x": 47, "y": 6, "w": 50, "h": 86, "tone": "green", "word": 369},
            {"x": 3, "y": 18, "w": 44, "h": 80, "tone": "red", "word": 372}]),
          {"type": "checklist", "word": 366, "fs": 44, "w": 640, "items": [
              {"text": "3 كلمات بالكتير", "word": 366},
              {"text": "الكلام من اليمين", "word": 369},
              {"text": "عنصر قوي باليسار", "word": 372}]}, gap=50), transition="push")
sc(376, R(V(CLAUDE, 376, size="l", idle="pulse"), ARR(377, w=200, flip=True), S(F(THUMB, 378, look="card", size="m", burst="orange"), BAN("هو اللي يصممها", [378, 379, 380], tone="orange")), gap=50))

# ---------------- STEP 6: المونتاج
sc(381, R(V(FE("clapper-board"), 383, size="l", idle="sway", burst="magenta"), BAN("أثقل وحدة", [383, 384], tone="magenta")), transition="push")
sc(386, R(IC(FE("studio-microphone"), 387, "تسجّل صوتك", 393), IC(FE("video-camera"), 391, "تصوّر"), IC(FE("robot"), 397, "صوت بالذكاء الاصطناعي", 399), gap=80))
sc(401, R(V(FE("studio-microphone"), 401, size="m"), ARR(401, w=200, flip=True), V(FE("open-file-folder"), 402, size="l", burst="orange"), gap=60))
sc(403, {"type": "mc-claude", "word": 403, "prompt": "ابدأ المونتاج", "typeAt": 403, "typeEnd": 403, "sendAt": 403, "lines": [
    {"text": "قصّ السكوت والأخطاء", "word": 404, "bar": True},
    {"text": "بناء كل مشهد على كلمته", "word": 407, "bar": True},
    {"text": "الفيديو جاهز بمجلد المخرجات", "word": 412, "done": True}]}, transition="push")
sc(415, S({"type": "mc-player", "word": 416, "file": "مقطع-كلود-المونتير", "label": "كلود المونتير", "w": 980}, BAN("فيديو كامل قبل هذا", [420, 422, 423, 424], tone="orange")), transition="through")

# ---------------- THE ONE THING
sc(426, S(V(CLAUDE, 428, size="l", idle="echo"), BAN("شو بيضل إلك؟", [433, 434, 435], tone="purple")), transition="push")
sc(436, S(BAN("أهم شي", [437, 438], tone="purple"), T("إنت", 439, size="xl", tone="green", enter="pop", burst="orange")), transition="zoom", bg="rays")
sc(440, R(IC(FE("speech-balloon"), 440, "رأيك"), IC(FE("compass"), 441, "تجربتك"), IC(FE("studio-microphone"), 442, "صوتك"), gap=100))
sc(443, S(V(CLAUDE, 443, size="m"), R(BAN("يدرس", [445], tone="purple"), BAN("يكتب", [446], tone="purple"), BAN("يصمم", [447], tone="purple"), BAN("يمنتج", [448], tone="purple"), gap=20), gap=40))
sc(449, R(V(FE("busts-in-silhouette"), 450, size="l"), S(BAN("مش لأنه مرتّب", [451, 452, 455], tone="magenta"), X(455, w=380))), transition="glitch")
sc(456, R(V(FE("handshake"), 458, size="l", burst="orange"), S(BAN("بيثق فيك", [458, 459], tone="orange"), BAN("بيحس في روح", [461, 462], tone="orange"), gap=24)))
sc(465, R(V(FE("robot"), 468, size="l", tint="red", tintAt=466), BAN("مستحيل يعمله الذكاء الاصطناعي", [466, 467, 468, 469], tone="magenta")))
sc(470, S(MUL(15, 470, cols=5, cell=130, tile=True, spreadAt=476, pickAt=476, pick=7), BAN("مميزة عن آلاف القنوات", [476, 477, 478, 479], tone="orange")))
sc(480, R(IC(FE("light-bulb"), 483, "الأفكار"), IC(FE("speech-balloon"), 484, "الكلام"), IC(FE("studio-microphone"), 485, "الصوت"), IC(FE("clapper-board"), 486, "المونتاج"), gap=60))
sc(487, R(IC(CLAUDE, 488, "الشغل الأساسي", 490), ARR(492, w=180, flip=True), S(V(FE("person-raising-hand"), 492, size="m", burst="orange"), T("الشي اللي ما حدا\nغيرك بيعمله", 497, size="s", tone="green", enter="pop")), gap=60))

# ---------------- SUMMARY: every step with its number
sc(502, {"type": "checklist", "word": 502, "doneAt": 535, "fs": 42, "w": 1050, "items": [
    {"text": "المجال من 3 أسئلة", "word": 508},
    {"text": "ادرس قناة ناجحة قبل أول فيديو", "word": 519},
    {"text": "الأفكار من الأرقام", "word": 525},
    {"text": "السكربت بصوتك", "word": 528},
    {"text": "الصورة المصغّرة بقواعد", "word": 530},
    {"text": "المونتاج بنظام ثابت", "word": 533}]}, transition="push")

# ---------------- BRIDGE + CTA
sc(536, R(F("شعاري", 538, look="circle", size="l", burst="orange"), BAN("نظام واحد بيشتغل كل يوم", [540, 541, 542, 544, 545], tone="orange")), transition="trail")
sc(546, S(F("غلاف-الماستر-كلاس", 551, look="card", size="xl"), BAN("كورس مجاني", [552, 553], tone="orange")), transition="flash")
sc(554, R(V(CLAUDE, 556, size="l"), BAN("خطوة بخطوة", [557, 558], tone="purple")))
sc(559, R(V(FE("robot"), 561, size="l", idle="bob"), BAN("يشتغل عنك", [561, 562], tone="orange")))
sc(563, S(BAN("الرابط بوصف الفيديو", [563, 564, 565], tone="purple"), ARR(564, w=260, rotate=70)))
sc(566, R(V(YT, 569, size="l"), V("skill-icons:instagram", 572, size="l"), gap=120))
sc(575, {"type": "subscribe", "word": 575, "clickAt": 576})
sc(578, {"type": "host", "word": 578})

chapters = {
    "endWord": 426,
    "hide": [{"from": 249, "to": 270}],
    "items": [
        {"label": "اختيار المجال", "short": "المجال", "word": 66},
        {"label": "ادرس قناة ناجحة قبل ما تبلّش", "short": "ادرس قناة ناجحة", "word": 134},
        {"label": "الأفكار من الأرقام، مو من المزاج", "short": "الأفكار من الأرقام", "word": 198},
        {"label": "السكربت بصوتك", "short": "السكربت بصوتك", "word": 270},
        {"label": "العنوان والصورة المصغّرة", "short": "الصورة المصغّرة", "word": 342},
        {"label": "المونتاج", "short": "المونتاج", "word": 381},
        {"label": "الشي الوحيد اللي كلود ما بيعمله عنك", "word": 426, "bar": False},
        {"label": "الخلاصة", "word": 502, "bar": False},
    ],
}

plan = json.loads(PLAN.read_text(encoding="utf8"))
PLAN.write_text(json.dumps({"source": plan["source"], "transition": "push", "music": {"volume": 0.07}, "chapters": chapters, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf8")
print("scenes:", len(scenes))
