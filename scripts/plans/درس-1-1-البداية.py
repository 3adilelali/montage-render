# Scene plan: درس 1.1 «البداية وخطة الاستفادة من الدورة» (درس داخل الدورة، مش يوتيوب)
# Run from المحرك/: PYTHONIOENCODING=utf-8 python scripts/plans/درس-1-1-البداية.py
# Brief (Adil 2026-10-29): مونتاج بسيط وسريع، توضيحي: أيقونات ونصوص وترتيب الخطوات. بدون مقاطع من برا وبدون ديمو.
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from planlib import Plan

p = Plan()
F = "fluent-emoji-flat:"


def T(text, phrase, **k):
    return {"type": "text", "text": text, "word": p.at(phrase), **k}


def I(icon, phrase, **k):
    return {"type": "visual", "icon": icon if ":" in icon else F + icon, "word": p.at(phrase), **k}


def ROW(*items, gap=None):
    g = {"type": "group", "dir": "row", "items": list(items)}
    if gap:
        g["gap"] = gap
    return g


def STACK(*items, gap=None):
    g = {"type": "group", "dir": "stack", "items": list(items)}
    if gap:
        g["gap"] = gap
    return g


def LBL(icon, label, phrase, label_phrase=None, tone=None, **k):
    t = {"tone": tone} if tone else {}
    return STACK(I(icon, phrase, size="s", **k), T(label, label_phrase or phrase, size="s", **t), gap=20)


def CARD(text, phrase, **k):
    return {"type": "card", "text": text, "word": p.at(phrase), **k}


def NUM(n, phrase, **k):
    return {"type": "number", "text": str(n), "word": p.at(phrase), **k}


LOGO = {"type": "visual", "file": "شعاري.jpg", "look": "circle"}

# ───────────────────────── الافتتاح ─────────────────────────
p.go("السلام عليكم")
p.add([STACK(I("logos:claude-icon", "السلام", size="m"), T("أهلاً فيك بـ\nكلود يعمل عنك", "وأهلاً", size="l"), gap=30)], transition="cut")

p.go("أول شي مبروك")
p.add([STACK(I("party-popper", "مبروك", size="l"), T("مبروك!", "مبروك", size="l", tone="green"))], transition="zoom", bg="rays")

p.go("أنت أخذت أنظمة")
p.add([ROW(I("gear", "أنظمة", size="m"), CARD("أنظمة جاهزة", "أنظمة"), gap=60)], transition="whip")

p.go("ستخلي Claude يكتب")
p.add([ROW(LBL("pencil", "يكتب", "يكتب"), LBL("artist-palette", "يصمم", "ويصمم"), LBL("clapper-board", "يعمل المونتاج", "المونتاج"),
           LBL("rocket", "ينشر", "وينشر"), gap=70),
       T("وأنت بس بتراجع", "وأنت", size="m", tone="green")], transition="whip")

p.go("بهالفيديو رح")
p.add([STACK(I("world-map", "بهالفيديو", size="m"), T("كيف تمشي بالدورة", "تمشي", size="l"))], transition="cut")

p.go("لحتى توصل")
p.add([ROW(LBL("high-voltage", "بأسرع وقت", "بأسرع", tone="green"), LBL("compass", "بدون ما تضيع", "تضيع"), gap=160)], transition="whip")

# ───────────────────────── النهاية قبل البداية ─────────────────────────
p.go("خليني أشوفك")
p.add([STACK(I("chequered-flag", "النهاية", size="l"), T("النهاية قبل البداية", "النهاية", size="l"))], transition="zoom")

p.go("بآخر الدورة")
p.add([ROW(I("robot", "نظام", size="m"), CARD("نظام القيادة الذاتية", "القيادة"), gap=60)], transition="whip")

p.go("بتكتب له أعطيني")
p.add([{"type": "mc-typing", "word": p.at("بتكتب"), "title": "Claude", "text": "أعطيني زوايا", "end": p.at("زوايا"), "w": 900, "h": 220}], transition="cut")

p.go("بيبحث بيقترح")
p.add([{"type": "steps", "word": p.at("بيبحث"), "style": "chips",
        "labels": ["يبحث", "يقترح", "تختار", "يكتب", "يصمم", "ينشر"],
        "done": [{"word": p.at("بيبحث"), "upto": 0}, {"word": p.at("بيقترح"), "upto": 1}, {"word": p.at("بتختار"), "upto": 2},
                 {"word": p.at("وبيكتب"), "upto": 3}, {"word": p.at("بيصمم"), "upto": 4}, {"word": p.at("وبينشر"), "upto": 5}]}],
      transition="whip")

p.go("عندك أيضا نظام المونتاج")
p.add([ROW(I("clapper-board", "المونتاج", size="m"), CARD("نظام المونتاج الشامل", "المونتاج"), gap=60)], transition="whip")

p.go("بتعطيه أي فيديو")
p.add([STACK(I("film-frames", "فيديو", size="s"), T("أي فيديو… بيمنتجه لك", "بتعطيه", size="m"), gap=24),
       ROW(I("logos:instagram-icon", "ريلز", size="s"), I("logos:youtube-icon", "يوتيوب", size="s"),
           I("logos:tiktok-icon", "للتيك", size="s"), gap=110)],
      transition="cut")

p.go("والآهم رح تفهم")
p.add([STACK(I("logos:claude-icon", "تفهم", size="m"), T("رح تفهم كلود من جوّا", "تفهم", size="l", tone="green"))], transition="zoom")

p.go("أي مهمة بتتكرر")
p.add([ROW(LBL("repeat-button", "أي مهمة بتتكرر", "مهمة"), LBL("hammer-and-wrench", "تبني لها نظام لحالك", "تبني", tone="green"), gap=160)],
      transition="whip")

# ───────────────────────── خريطة الدورة ─────────────────────────
p.go("الدورة عبارة عن")
p.add([STACK({"type": "counter", "to": 13, "word": p.at("13"), "size": "l", "tone": "green", "frames": 18}, T("محور", "محور", size="m")),
       T("مقسومة لقسمين", "ومقسومة", size="s")], transition="zoom", bg="rays")

p.go("القسم الأول")
p.add([ROW(I("books", "الأساس", size="m"), STACK(CARD("الأساس", "الأساس"), T("المحاور 1 ← 4", "المحاور", size="s"), gap=24), gap=60),
       T("تفهم كلود وتتقنه", "بتفهم", size="m", tone="green")], transition="whip")

p.go("أما القسم الثاني")
p.add([ROW(I("gear", "التطبيق", size="m"), STACK(CARD("التطبيق", "التطبيق"), T("المحاور 5 ← 12", "المحاور", size="s"), gap=24), gap=60),
       T("كلود بيشتغل عنك", "بيشتغل", size="m", tone="green")], transition="whip")

p.go("المحور 13")
p.add([ROW(I("test-tube", "المختبر", size="m"), STACK(CARD("المحور 13: المختبر", "المختبر"), gap=20), gap=60),
       ROW(LBL("sparkles", "كل جديد بكلود", "جديد"), LBL("light-bulb", "حيلة بتفرق", "حيلة"), gap=140)], transition="cut")

# ───────────────────────── القواعد الأربع ─────────────────────────
p.go("عشان تستفيد صح")
p.add([STACK({"type": "counter", "to": 4, "word": p.at("أربع"), "size": "l", "tone": "green", "frames": 12}, T("قواعد", "قواعد", size="m")),
       T("وتخلص والنظام شغّال عندك", "والنظام", size="s", tone="green")], transition="zoom", bg="rays")

p.go("أول شيء امشي")
p.add([ROW(NUM(1, "أول", tone="green"), T("امشِ بالترتيب", "امشي", size="l"), gap=50),
       T("خصوصاً من المحور 5 لـ 12", "خصوصا", size="s")], transition="whip")

p.go("نظام القيادة الذاتية بالمحور")
p.add([{"type": "tree", "word": p.at("نظام"), "items": [
           CARD("المحور 12: نظام القيادة", "بالمحور"),
           LBL("brain", "المحور 5", "5"), LBL("artist-palette", "المحور 7", "7"), LBL("satellite-antenna", "المحور 10", "10")]}],
      transition="cut")

p.go("إذا قفست")
p.add([STACK(I("warning", "قفست", size="m", tint="red"), T("رح يطلب ملفات\nما عندك", "يطلب", size="m", tone="red"))], transition="glitch")

p.go("ثاني شيء طبق")
p.add([ROW(NUM(2, "ثاني", tone="green"), T("طبّق بعد كل درس", "طبق", size="l"), gap=50)], transition="whip")

p.go("لا تتفرج")
p.add([STACK(I("television", "تتفرج", size="m", tint="gray", corner=F + "cross-mark", cornerAt=p.at("فيديوهات")),
             T("لا تتفرج 10 فيديوهات ورا بعض", "عشر", size="m"))], transition="cut")

p.go("كل درس في شي")
p.add([ROW(LBL("check-mark-button", "كل درس: شي بسيط اعمله", "بسيط"), LBL("trophy", "كل محور: شي شغّال", "محور", tone="green"), gap=120),
       T("مو بس معلومة", "بمعلومة", size="s")], transition="whip")

p.go("ثالث شي")
p.add([ROW(NUM(3, "ثالث", tone="green"), T("كل شي جوّا الدرس", "بالشرح", size="l"), gap=50),
       ROW(LBL("clipboard", "برومبتات", "برومبتات"), LBL("link", "روابط", "وروابط"), LBL("file-folder", "ملفات", "وملفات"), gap=110)],
      transition="whip")

p.go("انسخ والصق")
p.add([STACK(I("clipboard", "انسخ", size="m"), T("انسخ والصق", "انسخ", size="l", tone="green"), T("ما في داعي تكتب من الصفر", "داعي", size="s"))],
      transition="cut")

p.go("رابع شي")
p.add([ROW(NUM(4, "رابع", tone="green"), T("ملفاتك بتكبر معك", "ملفاتك", size="l"), gap=50), I("seedling", "شوي", size="m")],
      transition="whip")

p.go("نسخة العقل والبصمة")
p.add([ROW(LBL("brain", "نسخة العقل", "نسخة"), LBL("memo", "البصمة اللغوية", "والبصمة"), gap=160),
       T("بتتطوّر", "تتطور", size="m", tone="green")], transition="cut")

p.go("كل ما حسيتك")
p.add([ROW(LBL("pencil", "كتب شي ما بيشبهك؟", "بيشبهك"), LBL("package", "منتج أو خدمة جديدة؟", "خدمة"), gap=120),
       T("عدّل الملف", "بتعدل", size="m", tone="green")], transition="whip")

p.go("والنظام بيصير")
p.add([STACK(I("bullseye", "بيشبهك", size="m"), T("بيصير يشبهك أكتر", "بيشبهك", size="l", tone="green"))], transition="zoom")

# ───────────────────────── شو بتحتاج ─────────────────────────
p.go("طيب إيش بتحتاج")
p.add([T("شو بتحتاج لتبلّش؟", "إيش", size="l")], transition="cut", bg="rays")

p.go("رح نحتاج حسابك")
p.add([ROW(I("logos:claude-icon", "حسابك", size="m"),
           STACK(CARD("المجاني: لتتعلّم الأساس", "بالمجاني"), CARD("الأنظمة بتحتاج Pro", "برو"), gap=30), gap=70),
       T("بالمحور 1 منختار الخطة سوا", "نختار", size="s", tone="green")], transition="whip")

p.go("كمبيوتر أيضا")
p.add([ROW(LBL("laptop", "الكمبيوتر: الشغل الحقيقي", "كمبيوتر", label_phrase="الحقيقي", tone="green"),
           LBL("mobile-phone", "الجوال: للمتابعة", "الجوال"), gap=160)], transition="whip")

p.go("وساعات التجهيز")
p.add([ROW(LBL("hourglass-not-done", "تجهيز أول مرة وحدة", "التجهيز"), LBL("spiral-calendar", "وبعدها بيشتغل عنك كل يوم", "يوم", tone="green"), gap=140)],
      transition="cut")

# ───────────────────────── الدعم ─────────────────────────
p.go("بالنسبة للدعم")
p.add([ROW(I("logos:whatsapp-icon", "قناة", size="m"), STACK(CARD("قناة التحديثات", "التحديثات"), T("الرابط تحت الفيديو", "الرابط", size="s"), gap=24), gap=60),
       T("كل جديد بيوصلك عليها", "جديد", size="s", tone="green")], transition="whip")

p.go("أما بالنسبة للبونس")
p.add([STACK(I("wrapped-gift", "للبونس", size="m"), T("بونص لأول 100 مشترك", "لأول", size="l", tone="green"))], transition="zoom", bg="rays")

p.go("اللي هو الدعم الشخصي")
p.add([ROW(dict(LOGO, word=p.at("الدعم"), size="m"),
           STACK(T("دعم شخصي معي أنا", "الشخصي", size="m"),
                 {"type": "counter", "to": 30, "word": p.at("ثلاثين"), "suffix": " يوم", "size": "m", "tone": "green", "frames": 16}, gap=20), gap=70)],
      transition="whip")

p.go("بشرط تكون")
p.add([T("بشرط:", "بشرط", size="m"),
       {"type": "steps", "word": p.at("شفت"), "style": "chips", "labels": ["شفت", "جرّبت", "علقت"],
        "done": [{"word": p.at("شفت"), "upto": 0}, {"word": p.at("جربت"), "upto": 1}, {"word": p.at("مشاكل"), "upto": 2}]}],
      transition="cut")

p.go("ورقمي للدعم")
p.add([STACK(I("logos:whatsapp-icon", "ورقمي", size="m"), T("الرقم تحت الفيديو", "تلاقيه", size="m"))], transition="whip")

p.go("فيك تبعث لي")
p.add([T("ابعتلي:", "تبعث", size="m"),
       ROW(LBL("books", "رقم الدرس", "درس"), LBL("memo", "شو عملت", "عملت"), LBL("camera-with-flash", "سكرين شوت", "سكرينشوت"), gap=110)],
      transition="whip")

p.go("أنا برد عليك")
p.add([STACK(dict(LOGO, word=p.at("برد"), size="m"), T("وبرد عليك شخصياً", "برد", size="m", tone="green"))], transition="cut")

p.go("وأيضا إذا عندك")
p.add([ROW(LBL("chart-increasing", "نتائجك وكيف نطوّرها", "نتائج"), LBL("sparkles", "شي جديد بدك تعمله", "جديد"),
           LBL("speech-balloon", "اسألني", "تسألني", tone="green"), gap=100)], transition="whip")

p.go("لمدة ثلاثين يوم من")
p.add([T("30 يوم… معك أول بأول", "ثلاثين", size="l", tone="green")], transition="zoom")

# ───────────────────────── الختام ─────────────────────────
p.go("يلا حاليا")
p.add([STACK(I("rocket", "يلا", size="m"), T("الدرس الجاي:\nنثبّت كلود وننطلق", "الجاي", size="l"))], transition="whip", bg="rays")

p.go("السلام عليكم")
p.add([STACK(dict(LOGO, word=p.at("السلام"), size="m"), T("يلا ننطلق 🚀", "السلام", size="m", tone="green"))], transition="cut")

p.save()
