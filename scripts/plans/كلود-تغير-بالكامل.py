# «كلود تغيّر بالكامل: 7 أشياء» (2026-11-06). First video with the new `shot` element: real screens (clips cut from the
# most-watched source video, creator face + names covered) that zoom into the exact button and get an orange ring/box.
# Word indices = public/explainer/captions.json after eleven-cut --apply (847 words) + insert-pauses (7×2.2s + 2×1.0s).
# Run: python scripts/plans/كلود-تغير-بالكامل.py
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
def IC(icon, w, label, lw=None, **k): return S(V(icon, w, **k), T(label, lw if lw is not None else w, size="s", enter="pop"))
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
ANTH = "logos:anthropic-icon"
FE = lambda n: f"fluent-emoji-flat:{n}"
COVER = "غلاف-الماستر-كلاس"

scenes = []
def sc(frm, *items, **kw):
    scenes.append({"from": frm, "items": list(items), **kw})

# ---------------- HOOK (0–57)
sc(0, S(V(CLAUDE, 0, size="l", idle="pulse"), BAN("Claude اللي بتعرفها تغيّرت", [0, 1, 2, 3], tone="purple")))
sc(4, R(V(ANTH, 4, size="l"), ARR(6, w=160, flip=True), IC(FE("desktop-computer"), 6, "تطبيق جديد من الصفر", 9), gap=50), transition="push")
sc(11, S(BAR("Claude 2.0", [14, 15]), T("هيك سمّاه واحد من مهندسيها", 12, size="s", enter="pop"), gap=40), transition="zoom", bg="rays")
sc(16, R(S(V(FE("speech-balloon"), 18, size="l"), X(23, w=240)), BAN("بتفتح الـ chat وبتسأل وبس؟", [18, 20, 21, 22, 23], tone="magenta"), gap=50), transition="push")
sc(24, R(S(V(FE("laptop"), 26, size="l"), X(29, w=240)), BAN("تبويب الـ code للمبرمجين؟", [26, 28, 29], tone="magenta"), gap=50), transition="through")
sc(30, R(V(FE("money-with-wings"), 33, size="l", idle="sway"), BAN("عم تخسر أقوى شي صار فيه", [32, 33, 34, 35, 36], tone="orange")), transition="push")
sc(38, S(R(*[DISC(i + 1, 41, size="s") for i in range(7)], gap=26), BAN("7 أشياء: من السهل للأقوى", [41, 42, 44, 45, 46], tone="orange"), gap=50), transition="zoom", bg="rays")
sc(47, R(V(FE("robot"), 51, size="l", idle="bob", burst="orange"), S(BAN("Claude بيدير شغلك كله", [50, 51, 52, 53, 54], tone="orange"), BAN("من محادثة وحدة", [55, 56, 57], tone="purple"), gap=24), gap=50), transition="push")

# ---------------- 1: الكود مو للمبرمجين (58–138)
sc(58, SH("تطبيق-جديد", 58, label="تطبيق Claude الجديد"), transition="push")
sc(65, SH("تبويب-تشات-كود", 65,
          marks=[M(67, 67, 18, 11, 30, "Chat", "ring", out=71), M(69, 83, 18, 11, 30, "Code", "ring", out=75),
                 M(79, 63, 80, 18, 18, kind="box")], label="Cowork صار جوا الـ Chat"), transition="push")
sc(83, R(V(FE("fearful-face"), 85, size="l", idle="sway"), S(BAN("الاسم بيخوّف", [84, 85, 86], tone="magenta"), BAN("ولا سطر code", [92, 93, 94], tone="purple"), gap=24), gap=50), transition="push")
sc(95, R(V(FE("speech-balloon"), 95, size="l", burst="orange"), BAN("بتحكي معه بالعربي متل الـ chat", [95, 96, 97, 98, 99, 101], tone="orange")), transition="through")
sc(103, R(IC(FE("open-file-folder"), 105, "بيشتغل على ملفات جهازك", 107), IC(FE("sparkles"), 110, "كل الميزات الجديدة", 111), gap=110), transition="push")
sc(113, R(V(ANTH, 114, size="l"), BAN("كل جديد بينزل هون أول شي", [116, 117, 118, 119, 120, 121], tone="orange")), transition="through")
sc(122, R(V(FE("credit-card"), 125, size="l"), BAN("اشتراك مدفوع ومو مستعمل الـ code؟", [123, 125, 126, 127, 128, 131], tone="magenta"), gap=50), transition="push")
sc(132, S({"type": "meter", "value": 50, "label": "اللي عم تستعمله من Claude", "word": 135}, BAN("قسم واحد بس", [135, 136], tone="magenta"), gap=40), transition="through")

# ---------------- 2: لوحة الجلسة (139–230)
sc(139, SH("ريموت-كونترول", 139, zoom=[(150, 50, 80, 1.35)],
           marks=[M(155, 2, 84, 86, 10, "Remote Control", "box")], label="لوحة عاليمين"), transition="push")
sc(163, SH("جوال", 163, marks=[M(169, 80, 10, 14, 76, "موبايلك", "ring")], label="بتكمل من موبايلك"), transition="push")
sc(173, SH("كرت-الذاكرة", 173, zoom=[(220, 30, 58, 1.45)],
           marks=[M(183, 3, 14, 20, 8, "قديش صارت", out=189), M(189, 3, 34, 55, 6, "ملفاتك", out=191),
                  M(191, 3, 57, 55, 6, "المهارات", out=197), M(197, 3, 49, 55, 6, "connectors", out=220),
                  M(222, 3, 57, 55, 6, "لازم تنظفها")], label="كرت الـ context"), transition="push")

# ---------------- 3: الأقسام (231–277)
sc(231, S({"type": "counter", "to": 50, "word": 233, "frames": 16, "size": "xl"}, BAN("محادثة… وساعة لتلاقي وحدة", [234, 239, 240, 241, 242], tone="magenta"), gap=30), transition="push")
sc(246, R(V(FE("card-index-dividers"), 249, size="l", burst="orange"), BAN("أقسام متل المجلدات", [249, 250, 251], tone="orange")), transition="through")
sc(252, SH("الأقسام", 252, zoom=[(254, 35, 45, 1.35), (264, 50, 50, 1)],
           marks=[M(254, 31, 12, 6, 7, "النقاط التلاتة", "ring", out=259), M(259, 31, 72, 31, 8, "Move to section", out=264),
                  M(264, 0, 2, 33, 8, "سمّي القسم", out=273), M(274, 0, 10, 38, 85, "اسحب المحادثة")]), transition="push")

# ---------------- 4: المحادثة الجانبية والشاشة المقسومة (278–391)
sc(278, R(V(CLAUDE, 282, size="l", idle="pulse"), S(BAN("Claude شغّال بمهمة طويلة", [281, 282, 283, 284], tone="purple"), BAN("وببالك سؤال", [285, 286], tone="orange"), gap=24), gap=50), transition="push")
sc(287, R(S(V(FE("speech-balloon"), 289, size="l"), X(292, w=240)), S(BAN("بتقاطعه", [292], tone="magenta"), BAN("وبتصرف limit عالفاضي", [293, 296, 298], tone="magenta"), gap=24), gap=50), transition="through")
sc(299, S(BAR("المحادثة الجانبية", [301, 302]), T("Side chat", 305, size="m", tone="green", enter="pop"), gap=30), transition="zoom", bg="rays")
sc(307, SH("سايد-تشات", 307, zoom=[(324, 75, 45, 1.4), (336, 50, 50, 1)],
           marks=[M(308, 65, 33, 31, 7, "Side chat", out=313), M(315, 52, 2, 47, 94, "جنب الأساسية", out=324),
                  M(325, 52, 50, 47, 18, "وين وصل؟", out=336)]), transition="push")
sc(342, SH("سبليت-فيو", 342, marks=[M(366, 0, 8, 100, 88, "Split View")], label="الشاشة المقسومة"), transition="push")
sc(376, R(V(FE("light-bulb"), 377, size="l", idle="pulse", burst="orange"), S(BAN("نصيحة: ابدأ باتنين بس", [377, 378, 379, 380], tone="orange"), BAN("الضغط عليك مو على Claude", [384, 385, 387, 388, 389, 391], tone="purple"), gap=24), gap=50), transition="push")

# ---------------- 5: Docs وSlides وDesign (392–535)
sc(392, S(R(IC(FE("page-facing-up"), 398, "Google Docs", 399), IC(FE("film-projector"), 400, "Google Slides", 401), S(F("canva-شعار", 402, size="m"), T("Canva", 402, size="s", enter="pop")), gap=90),
          BAN("نسختهم جوا Claude", [395, 396, 403, 404], tone="orange"), gap=40), transition="push")
sc(405, SH("الآرتيفاكتس", 405, zoom=[(410, 60, 50, 1.2)],
           marks=[M(409, 23, 7, 18, 10, "Artifacts", out=411), M(411, 24, 40, 17, 28, "Docs", "box")]), transition="push")
sc(413, SH("دوكس", 413, zoom=[(416, 62, 50, 1.45)], marks=[M(417, 70, 60, 9, 7, "Claude بيكتب معك", "ring")], label="Docs: مستند مشترك"), transition="push")
sc(421, SH("سلايدز", 421, marks=[M(426, 34, 24, 62, 63, "عرض كامل", out=430), M(430, 72, 5, 8, 6, "PowerPoint", out=433), M(433, 80, 5, 8, 6, "Present")], label="Slides: العروض"), transition="push")
sc(437, SH("ديزاين", 437, marks=[M(443, 22, 36, 23, 42, "post", out=445), M(445, 47, 36, 23, 42, "صفحة")], label="Design: التصميم"), transition="push")
sc(450, SH("سلايدز", 450, zoom=[(456, 60, 45, 1.3)],
           marks=[M(456, 35, 30, 28, 16, "بتحدد الغلط", out=458), M(458, 62, 28, 32, 9, "ملاحظتك", out=461), M(461, 35, 30, 28, 16, "Claude صلّحها")], label="تعليقات عاللوحة"), transition="push")
sc(462, R(V(FE("link"), 465, size="l", burst="orange"), BAN("شاركه برابط لفريقك أو لعميلك", [464, 465, 466, 468], tone="purple"), gap=50), transition="push")
sc(469, S(V(FE("wrapped-gift"), 469, size="l", burst="orange", idle="pulse"), BAN("متاحين لكل الخطط… حتى المجانية", [470, 472, 473, 474, 476], tone="orange"), gap=30), transition="zoom", bg="rays")
sc(477, R(IC(FE("memo"), 482, "سكربت"), ARR(484, w=160, flip=True), IC(FE("framed-picture"), 484, "carousel 7 شرائح", 486), gap=60), transition="push")
sc(488, R(S(F("canva-شعار", 491, size="m"), X(495, w=220)), BAN("عدّل بالتعليقات بلا ما تفتح Canva", [488, 490, 492, 495, 496], tone="orange"), gap=50), transition="through")
sc(497, SH("داشبورد-رسمي", 497, label="Dashboards: لوحات أرقام بتتحدث لحالها"), transition="push")
sc(508, R(V(FE("warning"), 509, size="l", idle="pulse"), BAN("لسه Beta… يعني ممكن تتغيّر", [509, 513, 515, 517], tone="magenta"), gap=50), transition="push")
sc(518, SH("موشن-رسمي", 518, label="Motion: فيديو متحرك"), transition="push")
sc(531, R(V(FE("office-building"), 534, size="l"), BAN("حالياً للشركات بس", [533, 534, 535], tone="magenta"), gap=50), transition="through")

# ---------------- 6: أوامر بتوفّر الليمت (536–621)
sc(536, S(T("/", 546, size="xl", tone="green", enter="pop"), BAN("3 أوامر لازم تعرفهم", [549, 550, 551], tone="orange"), gap=30), transition="zoom", bg="rays")
LIST = "الأوامر-قائمة"
sc(552, SH(LIST, 552, zoom=[(553, 38, 30, 1.3)], marks=[M(553, 0, 23, 88, 5, "/doctor")]), transition="push")
sc(554, R(V(FE("magnifying-glass-tilted-left"), 554, size="l", burst="orange"), S(BAN("بيفحص إعداداتك وتعليماتك", [554, 555, 556], tone="purple"), BAN("قديم أو متناقض؟ بيقترح تصلّحه", [560, 562, 563, 566], tone="orange"), gap=24), gap=50), transition="push")
sc(567, SH(LIST, 567, zoom=[(568, 38, 41, 1.3)], marks=[M(568, 0, 34, 88, 5, "/skill-doctor")]), transition="push")
sc(570, R(IC(FE("brain"), 575, "قديش بتاكل من الذاكرة", 577), IC(FE("repeat-button"), 579, "وقديش بتستعملها", 580), gap=110), transition="push")
sc(581, R(V(FE("electric-plug"), 584, size="l", burst="orange"), BAN("اللي ما بتستعملها طفيها ووفّر", [581, 583, 584, 585], tone="orange"), gap=50), transition="through")
sc(586, SH(LIST, 586, zoom=[(588, 38, 52, 1.3)], marks=[M(588, 0, 45, 88, 5, "/advisor")]), transition="push")
sc(589, R(S(BAN("Sonnet", [594], tone="purple"), T("أرخص، شغّال طول الوقت", 592, size="s", enter="pop"), gap=16), ARR(600, w=180, flip=True),
          S(BAN("Opus", [604], tone="orange"), T("بيستشيره بالقرار المهم", 598, size="s", enter="pop"), gap=16), gap=60), transition="push")
sc(606, S(BAN("القوة بس وقت ما بتحتاجها", [607, 608, 609, 611], tone="orange"), BAN("بدل ما تصرف limit عالكبير طول الوقت", [612, 614, 615, 619, 620, 621], tone="purple"), gap=30), transition="through")

# ---------------- 7: الجلسة الرئيسية (622–809)
sc(622, S(V(FE("crown"), 623, size="l", burst="orange", idle="pulse"), BAN("أقوى شي بالتحديث كله", [623, 624, 625, 626], tone="orange"), gap=30), transition="zoom", bg="rays")
sc(627, R(S(V(FE("radio-button"), 630, size="l"), X(630, w=220)), BAN("ما إلها زر… بتطلبها بالكلام", [628, 629, 630, 631, 632], tone="purple"), gap=50), transition="push")
sc(633, SH("الجلسات-الفرعية", 633, zoom=[(651, 20, 40, 1.6), (660, 50, 50, 1)],
           marks=[M(638, 2, 76, 46, 8, "افتح جلسة لكل مهمة", out=645), M(649, 0, 33, 25, 22, "جلسات فرعية", out=658), M(658, 0, 28, 25, 27, "Nested Sessions")]), transition="push")
sc(664, S(R(V(FE("deciduous-tree"), 665, size="l", idle="sway"), BAN("كل فرع بيشتغل على جزء", [664, 665, 666, 668], tone="purple"), gap=40),
          BAN("ولما يخلص بيرجع بتقرير", [669, 670, 671, 674], tone="orange"), gap=30), transition="push")
sc(675, SH("بروجكتس", 675, zoom=[(683, 35, 65, 1.35)],
           marks=[M(679, 30, 18, 62, 14, "طلب واحد", out=683), M(683, 10, 49, 25, 13, "صفحة البيع", out=686),
                  M(686, 10, 66, 25, 13, "الإيميلات", out=688), M(688, 10, 82, 25, 14, "الإعلانات")], label="مثال: إطلاق"), transition="push")
sc(689, R(V(FE("speech-balloon"), 692, size="l", burst="orange"), BAN("كل فرع محادثة حقيقية بتدخلها وتعدّل", [689, 691, 692, 693, 695, 696], tone="purple"), gap=50), transition="push")
sc(699, SH("الجلسة-الرئيسية", 699, zoom=[(720, 70, 20, 1.4), (733, 50, 50, 1)],
           marks=[M(707, 0, 7, 26, 7, "ثبّتها فوق", out=716), M(714, 26, 9, 22, 8, "الجلسة الرئيسية", out=720), M(720, 50, 1, 45, 8, "شو ناطر قرار مني؟", out=733)],
           label="حركة أغلب الناس ما بتعرفها"), transition="push")
sc(733, R(V(FE("card-index-dividers"), 736, size="l", burst="orange"), BAN("«رتبيلي المحادثات بأقسام»… وبتعملها لحالها", [734, 736, 737, 738, 739, 740], tone="orange"), gap=50), transition="push")
sc(741, S(BAR("Projects", [750]), R(BAN("Pro", [743], tone="purple"), BAN("أو Max", [745], tone="purple"), gap=24), gap=30), transition="zoom", bg="rays")
sc(751, SH("بروجكتس-قائمة", 751, zoom=[(752, 12, 50, 1.8)], marks=[M(752, 1, 28, 10, 7, "Projects")], label="بالشريط الجانبي"), transition="push")
sc(756, R(IC(FE("cloud"), 761, "على السحابة"), S(V(FE("laptop"), 764, size="l"), X(764, w=200)), gap=110), transition="push")
sc(765, S(BAN("بتضل تشتغل حتى لو سكّرت الـ laptop", [766, 767, 768, 770, 772], tone="orange"), R(V(FE("brain"), 777, size="m"), BAN("وكل المحادثات بتشارك نفس الذاكرة", [773, 774, 776, 777, 778], tone="purple"), gap=30), gap=36), transition="through")
sc(779, R(V(FE("hourglass-not-done"), 784, size="l", idle="sway"), BAN("لسه تجريبية… وعم توصل شوي شوي", [782, 783, 784, 786, 788, 789], tone="magenta"), gap=50), transition="push")
sc(790, R(IC(FE("open-file-folder"), 793, "بدّه ملفات جهازك", 794), ARR(795, w=150, flip=True), IC(FE("speech-balloon"), 796, "محادثة عادية مع فروعها", 799), gap=50), transition="push")
sc(800, R(IC(FE("laptop"), 805, "وجهازك مسكّر", 806), ARR(807, w=150, flip=True), IC(FE("cloud"), 809, "Projects"), gap=50), transition="through")

# ---------------- BRIDGE + CTA (810–846)
sc(810, R(S(V(FE("toolbox"), 811, size="l"), X(815, w=220)), BAN("الأدوات لحالها ما بتعمل شي", [811, 812, 813, 814, 815], tone="magenta"), gap=50), transition="push")
sc(816, R(V(FE("robot"), 822, size="l", idle="bob", burst="orange"), BAN("اللي بيفرق: نظام يشتغل عنك", [816, 817, 820, 821, 822, 823], tone="orange"), gap=50), transition="zoom", bg="rays")
sc(824, S(F(COVER, 826, look="card", size="xl"), BAN("masterclass مجاني عن Claude", [826, 827, 829], tone="orange")), transition="flash")
sc(830, R(V(CLAUDE, 831, size="l"), BAN("كيف تبني هالنظام خطوة بخطوة", [831, 832, 833, 834, 835], tone="purple"), gap=50))
sc(836, S(BAN("الرابط أول سطر بالوصف", [836, 837, 838, 839], tone="orange"), ARR(838, w=260, rotate=70)))
sc(840, {"type": "subscribe", "word": 840, "clickAt": 841})

chapters = {
    "endWord": 810,
    "items": [
        {"label": "الكود مو للمبرمجين", "short": "الكود", "word": 58},
        {"label": "لوحة الجلسة", "short": "اللوحة", "word": 139},
        {"label": "الأقسام", "short": "الأقسام", "word": 231},
        {"label": "المحادثة الجانبية والشاشة المقسومة", "short": "الجانبية", "word": 278},
        {"label": "المستندات والعروض والتصميم", "short": "Artifacts", "word": 392},
        {"label": "أوامر بتوفّر الليمت", "short": "الأوامر", "word": 536},
        {"label": "الجلسة الرئيسية", "short": "الرئيسية", "word": 622},
    ],
}

plan = json.loads(PLAN.read_text(encoding="utf8"))
PLAN.write_text(json.dumps({"source": plan["source"], "transition": "push", "music": {"volume": 0.025}, "sfxVolume": 0.5,
                            "chapters": chapters, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf8")
print("scenes:", len(scenes))
