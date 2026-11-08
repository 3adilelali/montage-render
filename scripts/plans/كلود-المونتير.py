# «خليت كلود يدرس 30 فيديو… وصار المونتير تبعي» (2026-11-02). First video in the YouTubeSkool format (Skool.tsx).
# Word indices = public/explainer/captions.json after prepare (529 words, 3:33). Run: python scripts/plans/كلود-المونتير.py
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

CLAUDE = "logos:claude-icon"
TECH = "fluent-emoji-flat:man-technologist"
POST = {"type": "mc-post", "text": "كلود عمل هالفيديو كله ببرومبت واحد 🤯", "name": "AI Tools Daily", "handle": "@ai.tools.daily", "likes": 48200}

scenes = []
def sc(frm, *items, **kw):
    scenes.append({"from": frm, "items": list(items), **kw})

# ---------------- HOOK
sc(0, {"type": "fly3d", "words": ["كل", "حركة", "بتشوفها", "بهالفيديو"], "word": 0, "at": [0, 1, 2, 3]})
sc(4, S(V(TECH, 4, size="l", idle="bob"), X(6, w=460)), transition="push")
sc(7, S(V(CLAUDE, 7, size="l", burst="orange", idle="pulse"), BAN("كلود عملها", [7, 8], tone="orange")), transition="through")
sc(9, S(MUL(30, 12, cols=6, cell=112, tile=True, spreadAt=15), BAN("درس +30 فيديو ناجح", [15, 15, 16, 19])))
sc(20, R(V("fluent-emoji-flat:hourglass-not-done", 20, size="l", idle="sway"), BAN("ساعات لكل فيديو", [24, 25, 26])))
sc(27, R(V(CLAUDE, 29, size="l", burst="orange"), BAN("أقل من نص ساعة", [32, 33, 34, 35], tone="orange")), transition="glitch")
sc(36, S(R(DISC(1, 39, size="s"), DISC(2, 40, size="s"), DISC(3, 41, size="s"), gap=70), BAN("خطوة بخطوة", [40, 41])))
sc(42, S(MUL(12, 43, cols=6, cell=130, tile=True, spreadAt=44, grayAt=48), BAN("فيديوهات كلود شكلها سيء", [44, 45, 48, 49])))
sc(50, R(V("fluent-emoji-flat:shushing-face", 51, size="l", idle="bob"), BAN("الحقيقة اللي ما حدا بيحكيها", [51, 52, 53, 54, 56])))
sc(57, R(V("fluent-emoji-flat:money-with-wings", 57, size="l", corner="?", cornerAt=60, idle="bob"), T("مجاني؟", 60, size="xl", tone="green")))
sc(61, S(F("شعاري", 61, look="circle", size="l", burst="orange"), BAN("عادل العلي", [62], tone="purple")), transition="through")
sc(63, T("يلا نبدأ", 63, size="xl"), transition="push")

# ---------------- WHY CLAUDE VIDEOS LOOK BAD
sc(65, dict(POST, word=66), transition="black")
sc(74, R(V("fluent-emoji-flat:star-struck", 75, size="l", idle="pulse"), BAN("حلو أول مرة", [78, 79, 80], tone="orange")))
sc(81, S(MUL(8, 83, cols=4, cell=150, tile=True, spreadAt=85, grayAt=89), BAN("كل شي بيشبه بعضه", [87, 88, 89, 90])))
sc(91, R(V("fluent-emoji-flat:robot", 91, size="l", idle="sway"), BAN("واضح إنه AI", [92, 92, 93])))
sc(94, R(DISC(3, 95, tone="magenta"), BAR("أخطاء", [96])), transition="through")
# Mistake 1
sc(97, R(DISC(1, 97, size="s"), BAR("ما بيعرف أسلوبك", [100, 102, 103])), transition="through")
sc(105, S(MUL(15, 105, cols=5, cell=130, icon="fluent-emoji-flat:clapper-board", spreadAt=107, grayAt=109), BAN("نفس الشكل للكل", [106, 107, 109])))
# Mistake 2
sc(110, R(DISC(2, 110, size="s"), BAR("كل مرة من الصفر", [111, 112, 113, 114])), transition="through")
sc(115, R(BAN("اليوم: ستايل", [115, 116], tone="purple"), BAN("بكرة: ستايل تاني", [117, 118, 119], tone="orange"), gap=60))
sc(120, R(V("fluent-emoji-flat:face-with-spiral-eyes", 120, size="l", idle="sway"), BAN("ما بيحفظ ستايلك", [121, 122, 123])))
# Mistake 3
sc(126, R(DISC(3, 126, size="s"), BAR("من الصورة مش من الكلام", [127, 128, 129, 130, 131])), transition="through")
sc(132, S(V("fluent-emoji-flat:studio-microphone", 134, size="l", idle="pulse"), BAN("المونتاج بيمشي ورا صوتك", [132, 134, 135, 136], tone="orange")))
sc(137, R(BAN("كل كلمة", [137, 138], tone="purple"), ARR(140, w=220, flip=True), V("fluent-emoji-flat:framed-picture", 141, size="m", burst="orange"), T("بنفس\nاللحظة", 142, size="m", tone="green"), gap=50))

# ---------------- MID CTA
sc(144, {"type": "host", "word": 144}, transition="push")
sc(148, R(V(CLAUDE, 150, size="l"), BAN("تتعلّم كلود من الأساس", [150, 151, 152, 153])))
sc(154, R(V("fluent-emoji-flat:robot", 156, size="l", idle="bob"), BAN("يشتغل عنك بالمحتوى", [156, 157, 158], tone="orange")))
sc(159, S(F("غلاف-الماستر-كلاس", 160, look="card", size="xl"), BAN("كورس مجاني كامل", [160, 161, 162], tone="orange")), transition="flash")
sc(163, S(BAN("الرابط بوصف الفيديو", [163, 164, 165], tone="purple"), ARR(164, w=260, rotate=70)))

# ---------------- STEP 1
sc(166, R(DISC(1, 166), BAR("خليه يدرس مرجع", [167, 168, 169])), transition="through")
sc(171, S({"type": "mc-typing", "text": "اعملي مونتاج احترافي", "title": "Claude", "word": 171, "end": 174, "cross": 175, "w": 1000, "h": 300, "rtl": True}))
sc(176, S(MUL(12, 176, cols=6, cell=130, tile=True, spreadAt=176, pickAt=177, pick=3), BAN("فيديوهات ناجحة", [176, 177], tone="orange")))
sc(178, R(V("fluent-emoji-flat:brain", 178, size="l", idle="pulse", burst="magenta"), BAN("ادرسهم", [180], tone="purple")))
sc(181, R(S(V("fluent-emoji-flat:light-bulb", 182), T("الأفكار", 182, size="s")),
          S(V("fluent-emoji-flat:rocket", 184), T("البداية", 184, size="s")),
          S(V("fluent-emoji-flat:speaking-head", 188), T("طريقة الحكي", 188, size="s"))))
sc(189, S({"type": "mc-frames", "frames": [f"لقطة-{i}" for i in range(1, 7)], "word": 193}, BAN("كل نص ثانية صورة", [195, 196, 197, 198], tone="orange")))
sc(199, R(V("fluent-emoji-flat:memo", 199, size="l", idle="bob"), BAN("شو بيصير بكل لحظة", [200, 201, 202, 203])))
sc(204, S(BAN("إيمتى بتطلع الكلمة", [204, 205, 206], tone="purple"),
          BAN("كيف بيدخل الرقم", [207, 208, 209], tone="magenta"),
          BAN("وين بينحط الخط", [210, 211, 212], tone="orange"),
          {"type": "scribble", "word": 214, "tone": "white"}, gap=30))
sc(216, S({"type": "counter", "to": 75, "word": 218, "frames": 26, "rays": True, "size": "xl"}, BAR("حركة مونتاج", [219, 220])), transition="zoom", bg="rays")
sc(221, {"type": "mc-doc", "title": "مكتبة الحركات (75)", "word": 221, "w": 1100, "h": 640, "sections": [
    {"head": "الانتقالات", "kind": "text", "items": ["الدفعة العمودية · الطيران جوّا العنصر"], "word": 221},
    {"head": "النص", "kind": "text", "items": ["شريط العنوان 3D · اللافتة اللي بتنكتب"], "word": 222},
    {"head": "الأرقام", "kind": "text", "items": ["الرقم اللي بيملا الشاشة وبيصغر"], "word": 223},
]})
sc(224, T("وهذا الفرق", 224, size="xl", tone="green"), transition="glitch")
sc(226, S(S(BAN("اعملي شي احترافي", [228, 229, 230], tone="magenta"), X(230, w=300))))
sc(231, R(V("fluent-emoji-flat:books", 233, size="l", burst="orange"), BAN("نموذج حقيقي يتعلّم منه", [233, 234, 235, 236], tone="orange")))

# ---------------- STEP 2
sc(237, R(DISC(2, 237), BAR("أسلوب ثابت", [238, 238])), transition="through")
sc(240, R(S(V("fluent-emoji-flat:clipboard", 240, size="l"), X(241, w=330)), BAN("ما نسخنا حدا", [240, 241, 242], tone="magenta")))
sc(243, R(S(V("fluent-emoji-flat:gear", 243, idle="spin"), T("الطريقة", 244, size="s")), ARR(245, w=220, flip=True), S(V("fluent-emoji-flat:artist-palette", 245), T("الشكل", 246, size="s", tone="green", enter="pop"))))
sc(247, R(S(V("fluent-emoji-flat:artist-palette", 247), T("ألواني", 247, size="s")),
          S(T("أ ب ت", 249, size="l"), T("خطوطي", 249, size="s")),
          S(F("شعاري", 250, look="circle", size="s"), T("هويتي", 250, size="s"))))
sc(251, {"type": "mc-doc", "title": "أسلوب-المونتاج.md", "word": 252, "w": 1100, "h": 700, "sections": [
    {"head": "الألوان", "kind": "swatches", "colors": ["#FB9F2A", "#E04BA8", "#A04ED7", "#412562"], "items": ["برتقالي · ماجنتا · بنفسجي"], "word": 253},
    {"head": "الحركة", "kind": "text", "items": ["دفعة عمودية · رقم بيملا الشاشة · لافتة بتنكتب"], "word": 255},
    {"head": "ممنوع", "kind": "ban", "items": ["أحمر وأخضر", "شاشة ثابتة", "نص طويل"], "word": 257},
]}, transition="push")
sc(258, R(V(CLAUDE, 258, size="l"), ARR(260, w=220, flip=True), V("fluent-emoji-flat:page-facing-up", 261, size="l", idle="bob"), gap=70))
sc(263, S(R(F("شغلي-يوتيوب", 263, look="card", size="m"), F("شغلي-ريل-كاروسيل", 264, look="card", size="m"), F("شغلي-اعمار", 265, look="card", size="m"), gap=50), BAN("نفس الهوية", [266, 267], tone="orange")))
sc(268, {"type": "bars", "word": 268, "bars": [
    {"label": "فيديو 1", "value": 45, "word": 268, "tone": "purple"},
    {"label": "فيديو 2", "value": 68, "word": 270, "tone": "purple"},
    {"label": "فيديو 3", "value": 92, "word": 272, "tone": "green"}]})
sc(274, R(V("fluent-emoji-flat:memo", 276, size="l", burst="orange"), BAN("كل ملاحظة بتنضاف عليه", [275, 276, 278, 279])))

# ---------------- STEP 3
sc(280, R(DISC(3, 280), BAR("أسهل خطوة", [282, 283])), transition="through")
sc(284, R(V("fluent-emoji-flat:studio-microphone", 285, size="l", idle="pulse"), ARR(287, w=220, flip=True), V("fluent-emoji-flat:open-file-folder", 288, size="l"), gap=70))
sc(289, {"type": "checklist", "word": 289, "doneAt": 302, "items": [
    {"text": "بيقصّ السكوت والأخطاء", "word": 289},
    {"text": "بيكتب الكلام", "word": 293},
    {"text": "بيبني كل مشهد على كلمته", "word": 295},
    {"text": "بيطلّع الفيديو جاهز", "word": 300}]})
sc(303, R(V("fluent-emoji-flat:eyes", 303, size="l", idle="bob"), BAN("خليني أشوفك", [303, 304], tone="orange")), transition="through")

# ---------------- HOW IT REALLY RUNS (motion version of the Claude Code app)
sc(305, {"type": "mc-claude", "word": 305, "prompt": "ابدأ المونتاج", "typeAt": 310, "typeEnd": 312, "sendAt": 313, "zoomAt": 307, "zoom": 0.22, "zoomOrigin": "82% 92%", "lines": []}, transition="push")
sc(313, {"type": "mc-claude", "word": 313, "prompt": "ابدأ المونتاج", "typeAt": 313, "typeEnd": 313, "sendAt": 313, "lines": [
    {"text": "تنظيف صوتك", "word": 313},
    {"text": "قصّ السكوت والإعادات", "word": 315, "bar": True},
    {"text": "تفريغ الكلام", "detail": "529 words", "word": 318},
    {"text": "بناء كل مشهد على كلمته", "detail": "SCENES scenes", "word": 321, "bar": True},
    {"text": "تصدير الفيديو", "word": 326, "bar": True},
    {"text": "الفيديو جاهز بمجلد المخرجات", "word": 329, "done": True}]})
sc(330, {"type": "mc-folder", "word": 330, "title": "المخرجات", "filename": "كلود-المونتير - مونتاج.mp4", "fileAt": 331, "others": ["4 مستويات لاستخدام كلود"], "thumb": "هالفيديو"}, transition="push")
sc(332, S({"type": "mc-player", "word": 332, "file": "هالفيديو", "label": "3:33", "w": 1200}, BAN("هالفيديو نفسه", [334, 337], tone="orange")), transition="through")

# ---------------- THE HONEST TRUTH
sc(339, R(V("fluent-emoji-flat:handshake", 341, size="l"), BAR("بصراحة: 3 أشياء", [341, 343, 344])), transition="trail")
sc(345, R(DISC(1, 345, size="s"), S(BAN("مجاني", [346], tone="purple"), X(346, w=260))), transition="through")
sc(347, R(V(CLAUDE, 348, size="l"), ARR(350, w=220, flip=True), V("fluent-emoji-flat:laptop", 353, size="l"), gap=70))
sc(354, R(V("fluent-emoji-flat:credit-card", 355, size="l", idle="bob"), BAN("اشتراك مدفوع", [355, 356], tone="magenta")))
sc(357, S(V(CLAUDE, 358, size="m"), {"type": "counter", "to": 20, "prefix": "$", "word": 361, "frames": 18, "size": "xl", "tone": "green"}), bg="rays", transition="zoom")
sc(363, S(dict(POST, word=363), X(371, w=520)))
sc(372, R(V("fluent-emoji-flat:index-pointing-at-the-viewer", 372, size="l", idle="bob"), BAN("جرّب بنفسك", [372, 373, 374], tone="orange")))
sc(375, R(DISC(2, 375, size="s"), BAR("مش من أول محاولة", [382, 383, 384, 385])), transition="through")
sc(386, R(V("fluent-emoji-flat:hammer-and-wrench", 388, size="l", idle="sway"), BAN("شوية تعديلات", [388, 389], tone="purple")))
sc(390, S(MUL(15, 390, cols=5, cell=130, tile=True, spreadAt=391, pickAt=392, pick=7), BAN("مميّز عن الكل", [392, 393, 394], tone="orange")))
sc(395, R(DISC(3, 395, size="s"), BAR("كلود استلم المونتاج", [395, 396, 397])), transition="through")
sc(398, R(V("fluent-emoji-flat:artist-palette", 399, size="l", burst="orange"), BAN("الستايل لسا إلك", [399, 400, 402], tone="orange")))
sc(403, R(V(CLAUDE, 403, size="m"), S(V("fluent-emoji-flat:memo", 408), T("بتوصفه", 408, size="s")), S(V("fluent-emoji-flat:books", 411), T("بيدرسه", 411, size="s"))))
sc(412, R(V("fluent-emoji-flat:key", 414, size="l", idle="sway"), BAN("توصّله الستايل صح", [416, 418, 420])))
sc(421, S(V(TECH, 423, size="l", corner="?", cornerAt=425), BAN("مهنة المونتاج انتهت؟", [423, 424, 425], tone="purple")), transition="glitch")
sc(426, T("لأ", 426, size="xl", tone="green", burst="orange", enter="pop"), transition="cut")
sc(427, R(V(TECH, 427, size="l", corner=CLAUDE, cornerAt=431, burst="orange", tint="green", tintAt=433),
          V(TECH, 435, size="m", tint="gray", tintAt=436), gap=160))

# ---------------- SUMMARY
sc(438, BAR("الخلاصة", [440]), transition="trail")
sc(444, {"type": "checklist", "word": 444, "doneAt": 468, "items": [
    {"text": "برومبت واحد = فيديو ما بيشبهك", "word": 444},
    {"text": "المرجع الحقيقي بيعلّم كلود", "word": 451},
    {"text": "ملف أسلوب ثابت = هويتك", "word": 461}]}, transition="through")
sc(472, R(V("fluent-emoji-flat:studio-microphone", 475, size="l", idle="pulse"), BAN("بس بتسجّل صوتك", [473, 474, 475], tone="orange")))

# ---------------- BRIDGE + CTA
sc(478, R(V(CLAUDE, 483, size="l", idle="echo"), BAN("جزء بسيط", [479, 480], tone="purple")))
sc(486, S(R(F("شغلي-ريل-كاروسيل", 486, look="card", size="m"), F("شغلي-كاروسيل", 487, look="card", size="m"), F("شغلي-يوتيوب", 488, look="card", size="m"), gap=50), BAN("كله بنظام واحد", [489, 492, 493], tone="orange")))
sc(494, S(F("غلاف-الماستر-كلاس", 499, look="card", size="xl"), BAN("كورس مجاني", [500, 501], tone="orange")), transition="flash")
sc(502, R(V(CLAUDE, 504, size="l"), BAN("خطوة بخطوة", [505, 506], tone="purple")))
sc(507, R(V("fluent-emoji-flat:robot", 508, size="l", idle="bob"), BAN("يشتغل عنك", [509, 510], tone="orange")))
sc(511, R(V("fluent-emoji-flat:wrapped-gift", 513, size="l", idle="pulse", burst="orange"), BAN("أول فيديو مونتاج إلك", [514, 515, 516, 517], tone="orange")))
sc(519, S(BAN("الرابط بوصف الفيديو", [519, 520, 521], tone="purple"), ARR(520, w=260, rotate=70)))
sc(522, {"type": "subscribe", "word": 523, "clickAt": 524})
sc(526, {"type": "host", "word": 526})

plan = json.loads(PLAN.read_text(encoding="utf8"))
n = len(scenes)
txt = json.dumps({"source": plan["source"], "transition": "push", "music": {"volume": 0.07}, "scenes": scenes}, ensure_ascii=False, indent=1)
txt = txt.replace("SCENES scenes", f"{n} scenes")
PLAN.write_text(txt, encoding="utf8")
print("scenes:", n)
