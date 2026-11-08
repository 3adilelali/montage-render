# Scene plan: «4 مستويات لاستخدام Claude» (33:19, first long video), 2026-10-25.
# Reference: السكربتات/4-مستويات-كلود-مرجع.md. Board mode (Board.tsx, الأسلوب §15): fast hook in the usual style,
# then a pinned section title per level, a subtitle per point, the level ladder in the corner, and calm content
# that explains what he says (tools, examples). The 3 laptop-screen demos play from screens.json (Screen.tsx),
# with short brand callouts at the bottom on the key moments. Adil asked: less than the shorts style, but every
# idea must be understood from the screen.
# Run from المحرك/: PYTHONIOENCODING=utf-8 python scripts/plans/4-مستويات-كلود.py
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from planlib import Plan, ROOT

p = Plan()
F = "fluent-emoji-flat:"
SCREENS = json.loads((ROOT / "public/explainer/screens.json").read_text(encoding="utf8"))["parts"]


def T(text, phrase, **k):
    return {"type": "text", "text": text, "word": p.at(phrase), **k}


def I(icon, phrase, **k):
    return {"type": "visual", "icon": icon if ":" in icon else F + icon, "word": p.at(phrase), **k}


def FILE(name, phrase, **k):
    return {"type": "visual", "file": name, "word": p.at(phrase), **k}


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


def CHIPS(labels, phrase, done=None):
    it = {"type": "steps", "labels": labels, "style": "chips", "word": p.at(phrase)}
    if done:
        it["done"] = [{"word": p.at(ph), "upto": n} for ph, n in done]
    return it


def ICN(icon):
    return icon if ":" in icon else F + icon


def W(seconds):
    """First word spoken at/after `seconds`."""
    for i, w in enumerate(p.words):
        if w["startMs"] / 1000 >= seconds - 0.05:
            return i
    return len(p.words) - 1


def go_t(seconds):
    p.cursor = W(seconds)
    p.pending = p.cursor
    return p.cursor


def CALL(text, phrase, tone=None):
    """Screen demo callout: brand card at the bottom, over the recording."""
    c = {"type": "card", "text": text, "word": p.at(phrase), "size": "s", "dy": 420}
    return c


def screen_scene(items):
    # Content-free scenes over the recording keep only the callout; the screen layer stays put.
    p.add(items, transition="fade")


LEVELS = ["المحادثة الصح", "Claude بيعرفك", "برّا الشات", "النظام"]
L1 = "المستوى 1: المحادثة الصح"
L2 = "المستوى 2: Claude بيعرفك"
L3 = "المستوى 3: Claude بيطلع من الشات"
L4 = "المستوى 4: النظام"


def H(title, sub=None, sub_phrase=None):
    h = {"title": title}
    if sub:
        h["sub"] = sub
        h["subAt"] = p.at(sub_phrase) if sub_phrase else p.pending
    return h


# ═════════════════════════ HOOK (usual fast style) ═════════════════════════
p.go("بتفتح Claude")
p.add([I("logos:claude-icon", "بتفتح", size="m"),
       ROW(LBL("speech-balloon", "بتسأله", "بتسأله"), LBL("eyes", "بتقرأ", "بتقرأ"), LBL("cross-mark", "وبتسكّر", "وبتسكر"), gap=110)],
      transition="cut", gap=40)

p.go("إذا أنت بتعمل")
p.add([ROW(I("money-with-wings", "اشتراك", size="m"),
           T("نسخة غالية\nمن جوجل", "نسخة", size="l", toneAt=p.at("غالية"), toneTo="red"),
           I("logos:google-icon", "جوجل", size="m"), gap=70)])

p.go("أنا المحتوى")
p.add([ROW(STACK(I("alarm-clock", "المحتوى", size="s"),
                 {"type": "counter", "to": 10, "word": p.at("عشر"), "tone": "red"},
                 T("ساعات بالأسبوع", "ساعات", size="s"), gap=18),
           I("left-arrow", "اليوم", size="s"),
           STACK(I("sparkles", "اليوم", size="s"),
                 T("أقل من\nساعتين", "أقل", size="l", tone="green"), gap=18), gap=90)],
      transition="zoom", bg="rays")

p.go("الفرق مو أداة")
p.add([ROW(STACK(I("robot", "أداة", size="s", tint="red", tintAt=p.at("ذكية")), T("مو أداة أذكى", "أداة", size="s"), gap=20),
           STACK(I("chart-increasing", "بالمستوى", size="m"), T("الفرق بالمستوى", "بالمستوى", size="m", tone="green"), gap=20), gap=150)],
      transition="glitch")

# ═════════════════════════ INTRO (board) ═════════════════════════
H1 = {"title": "Claude ما إله دليل استخدام"}
p.go("والشي اللي بدي")
p.add([I("open-book", "دليل", size="l", corner="?", cornerAt=p.at("الاستخدام")),
       T("ما حدا بيعلّمك كيف تستخدمه", "الاستخدام", size="s")],
      transition="trail", header=H1)

p.go("تعرف هاي شو")
p.add([ROW(LBL("hammer-and-wrench", "هالأداة؟", "تستخدمها"),
           LBL("gear", "هالميزة؟", "الميزة"),
           LBL("sparkles", "شو بتعمل؟", "تعمل"), gap=120)],
      transition="fade", header={**H1, "sub": "شو بتستخدم؟ وشو بتعمل؟", "subAt": p.at("تعرف")})

p.go("فأغلب الناس")
p.add([{"type": "meter", "value": 12, "label": "اللي بيستخدمه أغلب الناس", "tone": "red", "word": p.at("جزء")},
       T("جزء بسيط منه", "بسيط", size="m", tone="red")],
      transition="fade", header={**H1, "sub": "أغلب الناس بيستخدموا جزء صغير", "subAt": p.at("فأغلب")})

H2i = {"title": "4 مستويات: من المبتدئ للمحترف"}
p.go("بهذا الفيديو")
p.add([{"type": "mc-levels", "labels": LEVELS, "word": p.at("لأربع"),
        "at": [p.at("لأربع"), p.at("مستويات"), p.at("المبتدأ"), p.at("للمحترف")]}],
      transition="trail", header=H2i)

p.go("وكل مستوى")
p.add([ROW(LBL("puzzle-piece", "مشكلة", "مشكلة", tone="red"),
           I("left-arrow", "المستوى", size="s"),
           LBL("light-bulb", "حلّها بالمستوى الجاي", "قبله", tone="green"), gap=80)],
      transition="fade", header={**H2i, "sub": "كل مستوى بيحل مشكلة اللي قبله", "subAt": p.at("وكل")})

p.go("ورح تعرف")
p.add([I("pushpin", "بأي", size="l"), T("ابدأ من مستواك", "ابدأ", size="m", tone="green")],
      transition="fade", header={**H2i, "sub": "اعرف وين إنت", "subAt": p.at("بأي")})

p.go("طبعا بالمستوى الرابع")
p.add([ROW(I("wrapped-gift", "الرابع", size="m", corner="?", cornerAt=p.at("الفيديو")),
           STACK(T("بالمستوى الرابع", "الرابع", size="s"),
                 T("شي ما بتتوقعه\nعن هالفيديو", "تتوقعه", size="m", tone="green"), gap=20), gap=90)],
      transition="fade", header={**H2i, "sub": "وعد: آخر الفيديو", "subAt": p.at("الرابع")})

# ═════════════════════════ LEVEL 1 ═════════════════════════
p.go("رح نجي حاليا للمستوى")
p.add([I("speech-balloon", "للمستوى", size="l"), T("المحادثة الصح", "المحادثة", size="l", tone="green")],
      transition="trail", header=H(L1, "كيف تحكي مع Claude", "الأول"))

p.go("المشكلة اللي بيعملها")
p.add([ROW({"type": "mc-typing", "text": "اكتب لي كابشن", "title": "Claude", "word": p.at("اكتب"), "end": p.at("كابشن"), "rtl": True},
           STACK(I("busts-in-silhouette", "الآلاف", size="s"), T("كلام عام\nبيستخدمه الآلاف", "الآلاف", size="s", tone="red"), gap=18), gap=90)],
      transition="fade", header=H(L1, "الغلط اللي الكل بيعمله", "المشكلة"))

p.go("بس أنا راح أحاول")
p.add([CHIPS(["السياق", "ورجيه", "خلّيه يسألك"], "ثلاث"), T("3 أشياء بتغيّر النتيجة", "بتغير", size="m", tone="green")],
      transition="fade", header=H(L1, "3 أشياء بتغيّر النتيجة", "ثلاث"))

p.go("الشيء الأول اللي بدنا")
p.add([ROW(LBL("person", "مين إنت", "مين أنت"), LBL("busts-in-silhouette", "جمهورك", "جمهورك"), LBL("bullseye", "الهدف", "الهدف"), gap=120)],
      transition="fade", header=H(L1, "1. السياق", "السياق"))

p.go("مثلاً أنا عادل علي")
p.add([{"type": "mc-form", "title": "السياق", "word": p.at("عادل"),
        "fields": [{"label": "مين إنت", "value": "عادل، مدرب Claude والتسويق بالمحتوى", "word": p.at("عادل")},
                   {"label": "الجمهور", "value": "أصحاب المشاريع وصنّاع المحتوى", "word": p.at("أصحاب")},
                   {"label": "الهدف", "value": "برنامج يعلّم Claude من الصفر", "word": p.at("برنامج")}]}],
      transition="fade", header=H(L1, "1. السياق"))

p.go("الهدف اللي أنت بدك إياه عندك")
p.add([ROW(LBL("package", "منتج", "منتج"), LBL("handshake", "خدمة", "خدمة"), LBL("logos:youtube-icon", "قناة يوتيوب", "يوتيوب"), gap=120),
       T("أي هدف شغّال عليه", "هدف", size="s")],
      transition="fade", header=H(L1, "1. السياق"))

p.go("ممكن يأخذ هذا")
p.add([ROW(STACK(I("alarm-clock", "دقيقة", size="s"), T("دقيقة زيادة", "دقيقة", size="s"), gap=18),
           I("left-arrow", "بيعطيك", size="s"),
           STACK(I("sparkles", "أفضل", size="s"), T("نتيجة أحسن بكثير", "أفضل", size="m", tone="green"), gap=18), gap=90)],
      transition="fade", header=H(L1, "1. السياق"))

p.go("والشغلة الثانية")
p.add([ROW(STACK(I("speaking-head", "تشرح", size="s"), T("بدل ما تشرح له", "تشرح", size="s", tone="red"), gap=18),
           I("left-arrow", "تشوف", size="s"),
           STACK(I("framed-picture", "تشوف", size="s"), T("ورجيه أمثلة", "تشوف", size="s", tone="green"), gap=18), gap=90)],
      transition="fade", header=H(L1, "2. ورجيه بدل ما تشرحله", "والشغلة"))

p.go("بدل ما أجي أحكي له")
p.add([STACK(T("لهجة خليجية؟ بيضاء؟ فصحى؟", "خليجية", size="s", tone="red"),
             T("هالكلمة لا… هالكلمة إيه…", "الكلمة", size="s", tone="red"), gap=30)],
      transition="fade", header=H(L1, "2. ورجيه بدل ما تشرحله"))

p.go("لا شو بعمل")
p.add([ROW(LBL("card-index-dividers", "10–15 بوست كاتبهم", "بوستات"), LBL("file-folder", "ملف", "كملف"), LBL("framed-picture", "صور", "كصور"), gap=110)],
      transition="fade", header=H(L1, "2. ورجيه بدل ما تشرحله"))

p.go("أنا هدفي مثلا حاليا")
p.add([ROW(I("logos:youtube-icon", "اليوتيوب", size="m"),
           STACK(T("محتواي القديم", "سابقا", size="s"), T("تعلّم منه واكتبلي فكرة جديدة", "تعلم", size="s", tone="green"), gap=20), gap=80)],
      transition="fade", header=H(L1, "2. ورجيه بدل ما تشرحله"))

p.go("الشغلة الثالثة")
p.add([ROW(I("person-raising-hand", "يسألني", size="m"), T("خلّيه يسألك\nقبل ما يجاوب", "يسألني", size="l", tone="green"), gap=70)],
      transition="fade", header=H(L1, "3. خلّيه يسألك قبل ما يجاوب", "الثالثة"))

p.go("وبدي أبني موقع")
p.add([ROW(I("desktop-computer", "موقع", size="m"), T("اعمل لي موقع\nلمنتجي الرقمي", "موقع", size="m"), gap=70),
       T("بس في أشياء كثيرة نسيتها", "نسيتها", size="s", tone="red")],
      transition="fade", header=H(L1, "3. خلّيه يسألك قبل ما يجاوب"))

p.go("فعشان تضمن")
p.add([{"type": "mc-typing", "text": "اسألني أسئلة قبل ما تبلش", "title": "Claude", "word": p.at("اسألني"), "end": p.at("تبلش"), "rtl": True}],
      transition="fade", header=H(L1, "3. خلّيه يسألك قبل ما يجاوب"))

p.go("فهو شو بيعمل")
p.add([ROW(I("logos:claude-icon", "بيعمل", size="m"),
           STACK(T("نسيت تعطيني الأسعار؟", "أسعار", size="s", tone="green"),
                 T("نسيت كذا؟", "نسيت تعمل", size="s", tone="green"), gap=26), gap=80)],
      transition="fade", header=H(L1, "3. خلّيه يسألك قبل ما يجاوب"))

p.go("وفي قاعدة إضافية")
p.add([ROW(STACK(I("cross-mark", "المهمة", size="s"), T("اعمل لي موقع", "تحكيله", size="s", tone="red"), gap=18),
           I("left-arrow", "النتيجة", size="s"),
           STACK(I("bullseye", "النتيجة", size="s"), T("موقع بيخلّي الزبون يشتري", "يعملك", size="s", tone="green"), gap=18), gap=90)],
      transition="fade", header=H(L1, "قاعدة إضافية: اطلب النتيجة، مو المهمة", "قاعدة"))

p.go("هذا الموقع لما يدخل")
p.add([CHIPS(["كل منتجاتي بسرعة", "رقم الواتساب", "الأشياء المجانية", "مين أنا"], "المنتجات",
             done=[("الواتس", 2), ("المجانية", 3), ("عني", 4)]),
       T("النتيجة اللي بتحلم فيها", "بتحلم", size="m", tone="green")],
      transition="fade", header=H(L1, "قاعدة إضافية: اطلب النتيجة، مو المهمة"))

p.go("أما لما تحكي له مثلا بدي")
p.add([ROW(I("robot", "موقع", size="m", tint="gray"), T("طلب عام = نتيجة عامة", "بشكل", size="m", tone="red"), gap=70)],
      transition="fade", header=H(L1, "قاعدة إضافية: اطلب النتيجة، مو المهمة"))

p.go("فلما تطلع النتيجة")
p.add([I("eyes", "النتيجة", size="l"), T("خلينا نشوف الفرق", "النتيجة", size="m", tone="green")],
      transition="fade", header=H(L1, "شوف الفرق", "فلما"))

# ── SCREEN 1: bad vs good caption inside Claude ──
s1a, s1b = SCREENS[0]["fromS"], SCREENS[0]["toS"]
go_t(s1a)
screen_scene([CALL("طلب بدون سياق", "سيكريبت")])
p.go("هذا الشيء طبيعي")
screen_scene([CALL("النتيجة: كلام عام", "شوف")])
p.go("شوف نتيجة ثانية")
screen_scene([CALL("نفس الطلب… بالشكل الصح", "ثانية")])
p.go("انا عادة علي")
screen_scene([CALL("1. السياق: مين إنت وجمهورك وهدفك", "عادة")])
p.go("قبل ما تجعوبني اسألني")
screen_scene([CALL("3. اسألني 3 أسئلة مع خياراتها", "اسألني")])
p.go("وعطيته بنفس الوقت")
screen_scene([CALL("2. ملف فيه كل شي عني", "الملف")])
p.go("فبنيجي حاليا")
screen_scene([CALL("Claude بيسألك قبل ما يكتب", "اسئلة")])
p.go("هاي النتيجة كلوه")
screen_scene([CALL("النتيجة: بتشبهني", "بتشبهني")])

# ═════════════════════════ LEVEL 1 → problem ═════════════════════════
go_t(s1b)
p.add([ROW(I("counterclockwise-arrows-button", "جديدة", size="m"), T("كل محادثة جديدة\nبتعيد كل شي", "جديدة", size="m", tone="red"), gap=70)],
      transition="fade", header=H(L1, "المشكلة: كل مرة من الصفر"))

# ═════════════════════════ LEVEL 2 ═════════════════════════
p.go("رح ننتقل للمستوى الثاني")
p.add([I("brain", "الثاني", size="l"), T("Claude بيعرفك", "بيعرفك", size="l", tone="green")],
      transition="trail", header=H(L2))

p.go("بالبداية بالمستوى الثاني")
p.add([ROW(I("file-folder", "البروجيكت", size="m"),
           STACK(T("المشاريع (Projects)", "البروجيكت", size="m"), T("مجلد: تعليمات ثابتة + ملفات", "مجلد", size="s", tone="green"), gap=20), gap=70)],
      transition="fade", header=H(L2, "1. المشاريع (Projects)", "البروجيكت"))

p.go("كل محادثة جوا")
p.add([{"type": "tree", "word": p.at("كل محادثة"), "items": [
            I("file-folder", "كل محادثة", size="s"),
            LBL("person", "مين إنت", "مين أنت"),
            LBL("busts-in-silhouette", "جمهورك", "جمهورك"),
            LBL("card-index-dividers", "أسلوبك وبوستاتك", "اسلوبك")]}],
      transition="fade", header=H(L2, "1. المشاريع (Projects)"))

p.go("المميز بهذا")
p.add([ROW(LBL("spiral-calendar", "اليوم", "اليوم"), LBL("spiral-calendar", "بعد أسبوع", "أسبوع"), gap=120),
       T("نفس المكان… نفس المعرفة", "تستفيده", size="m", tone="green")],
      transition="fade", header=H(L2, "1. المشاريع (Projects)"))

p.go("والميزة الثانية هي الذاكرة")
p.add([ROW(I("brain", "الذاكرة", size="m"),
           STACK(T("فعّل خيارين بالإعدادات", "خيارين", size="s"), T("بيتذكّر كل شغلك", "يتذكر", size="m", tone="green"),
                 T("وبيدوّر بالمحادثات القديمة", "يدور", size="s"), gap=18), gap=70)],
      transition="fade", header=H(L2, "2. الذاكرة (Memory)", "الذاكرة"))

p.go("إذا أنت مثلا جاي")
p.add([ROW(STACK(I("speech-balloon", "شات", size="s"), T("ChatGPT / Gemini", "جيميناي", size="s"), gap=18),
           I("left-arrow", "برسالة", size="s"),
           I("logos:claude-icon", "لكلود", size="m"), gap=90),
       T("انقل ذاكرتك برسالة وحدة", "برسالة", size="m", tone="green")],
      transition="fade", header=H(L2, "2. الذاكرة (Memory)"))

p.go("الشيء الثالث اللي لازم")
p.add([ROW(LBL("bar-chart", "Excel", "Excel"), LBL("clipboard", "PowerPoint", "بورو"), LBL("page-facing-up", "PDF", "PDF"), gap=120),
       T("بيطلعلك الملف جاهز", "جاهز", size="m", tone="green")],
      transition="fade", header=H(L2, "3. اطلب ملف جاهز، مو كلام", "الثالث"))

p.go("الشي الرابع والأخير")
p.add([ROW(I("hourglass-done", "حد", size="m"), T("حد استخدام\nكل 5 ساعات", "خمس", size="m"), gap=70)],
      transition="fade", header=H(L2, "4. اختار الموديل الصح", "الرابع"))

p.go("فعنا نحن أنواع")
p.add([ROW(LBL("high-voltage", "Haiku\nسريع", "الهايكو"),
           LBL("gear", "Sonnet\nيومي", "السونت"),
           LBL("rocket", "Opus\nثقيل", "الأوبس"),
           LBL("gem-stone", "Fable\nغالي", "الفابل", tone="red"), gap=110)],
      transition="fade", header=H(L2, "4. اختار الموديل الصح"))

p.go("الهايكو للأشياء السريعة يعني")
p.add([ROW(I("high-voltage", "الهايكو", size="m"),
           STACK(T("Haiku", "الهايكو", size="m", tone="green"), T("سؤال بسيط، ترجمة جملة", "ترجمة", size="s"), gap=18), gap=70)],
      transition="fade", header=H(L2, "4. اختار الموديل الصح"))

p.go("الشغل الطبيعي")
p.add([ROW(I("gear", "الطبيعي", size="m"),
           STACK(T("Sonnet", "السونت", size="m", tone="green"), T("خطة، شغل يومي، عميل جديد", "خطة", size="s"), gap=18), gap=70)],
      transition="fade", header=H(L2, "4. اختار الموديل الصح"))

p.go("الموديل الثالث")
p.add([ROW(I("rocket", "الثالث", size="m"),
           STACK(T("Opus", "الثالث", size="m", tone="green"), T("مونتاج، موقع… الشغل الصعب", "مونتاج", size="s"), gap=18), gap=70)],
      transition="fade", header=H(L2, "4. اختار الموديل الصح"))

p.go("لو انت اشتغلت على كلود بهاي")
p.add([ROW(I("check-mark-button", "اشتغلت", size="m"), T("الموديل الصح\n= حد الاستخدام ما بيخلص", "يخلص", size="m", tone="green"), gap=70)],
      transition="fade", header=H(L2, "4. اختار الموديل الصح"))

# ── SCREEN 2: projects, instructions, memory, models ──
s2a, s2b = SCREENS[1]["fromS"], SCREENS[1]["toS"]
go_t(s2a)
screen_scene([CALL("Projects ← مشروع جديد", "البروجيكت")])
p.go("ونسميه نعطيه")
screen_scene([CALL("الاسم: حسابي على إنستغرام", "انستغرام")])
p.go("Create لهذا")
screen_scene([CALL("كل محادثة جوّاه بتعرفك", "محادثة")])
p.go("ونشوف الاشياء اللي")
screen_scene([CALL("التعليمات: قواعدك وأسلوبك", "قواعد")])
p.go("الكنتكست هذا")
screen_scene([CALL("الملفات (Context)", "الكنتكست")])
p.go("وعنا الشيء الأخير اللي هو هاي الذاكرة")
screen_scene([CALL("الذاكرة: بيتذكّر شغلك بالمشروع", "الذاكرة")])
p.go("الموديل هذا هي")
screen_scene([CALL("الموديلات", "الموديل")])
p.go("الهايكو والسونت والأوبست")
screen_scene([CALL("Haiku · Sonnet · Opus", "الهايكو")])
p.go("هذا اللي هو الفابض")
screen_scene([CALL("Fable: غالي وبيحتاج رصيد", "الفابض")])
p.go("كل فترة بتنزل")
screen_scene([CALL("كل فترة بينزل إصدار جديد", "موديل")])
p.go("فأنت شو بتعمل بتستخدم آخر")
screen_scene([CALL("استخدم آخر إصدار دايماً", "آخر")])

# ═════════════════════════ LEVEL 2 → problem ═════════════════════════
go_t(s2b)
p.add([ROW(I("clipboard", "محبوث", size="m"), T("بتنسخ وبتلصق\nجوّا الشات", "بتنسخ", size="m", tone="red"), gap=70)],
      transition="fade", header=H(L2, "المشكلة: لسّا محبوس بالشات", "المشكلة"))

# ═════════════════════════ LEVEL 3 ═════════════════════════
p.go("وهذا الشي راح نعرفه")
p.add([I("globe-with-meridians", "الثالث", size="l"), T("Claude بيروح لمكان شغلك", "الثالث", size="m", tone="green")],
      transition="trail", header=H(L3))

p.go("الشي اللي كنا بنعمله")
p.add([ROW(STACK(T("قبل: إنت بتجيب الشغل لـ Claude", "نجيب", size="s", tone="red"), gap=10),
           I("left-arrow", "حالياً", size="s"),
           STACK(T("هلق: Claude بيروح للشغل", "يروح", size="s", tone="green"), gap=10), gap=60)],
      transition="fade", header=H(L3, "3 أماكن", "ثلاث"))

p.go("المكان الأول أو الشيء الأول")
p.add([ROW(I("logos:claude-icon", "الكنكترز", size="m"), I("link", "ربط", size="s"), I("logos:google-gmail", "بالجميل", size="m"), gap=60),
       T("الربط (MCP): Claude بيشتغل جوّا التطبيق", "ربط", size="s", tone="green")],
      transition="fade", header=H(L3, "1. تطبيقاتك (Connectors)", "الكنكترز"))

p.go("فبيصير كلود إذا ربطته")
p.add([ROW(LBL("logos:google-gmail", "يكتب ويرتّب إيميلاتك", "بالإيميل"),
           LBL("logos:notion-icon", "قوالب نوشن", "النوشن"),
           LBL("artist-palette", "قوالب Canva", "كامفا"), gap=100)],
      transition="fade", header=H(L3, "1. تطبيقاتك (Connectors)"))

p.go("لو ربطت كلود بالحملات")
p.add([ROW(I("logos:meta-icon", "ميتسا", size="m"),
           STACK(T("حملة إعلانية… بكلامك العادي", "بشكل", size="s", tone="green"),
                 T("السعودية · العراق · سوريا", "السعودية", size="s"), gap=20), gap=70)],
      transition="fade", header=H(L3, "1. تطبيقاتك (Connectors)"))

p.go("كل التطبيقات كل المواقع")
p.add([ROW(I("brain", "العقل", size="m"), T("Claude = العقل تبعك", "العقل", size="l", tone="green"), gap=70)],
      transition="fade", header=H(L3, "1. تطبيقاتك (Connectors)"))

p.go("الشيء الثاني أو المكان الثاني")
p.add([ROW(I("logos:chrome", "المتصفح", size="m"),
           STACK(T("إضافة Claude in Chrome", "كروم", size="m"), T("بيقرأ الصفحة وبيكبس عنك", "يقرأ", size="s", tone="green"), gap=18), gap=70)],
      transition="fade", header=H(L3, "2. المتصفح (Claude in Chrome)", "المتصفح"))

p.go("لو أنا فتحت الانستغرام")
p.add([ROW(I("logos:instagram-icon", "الانستغرام", size="m"), I("left-arrow", "وحلل", size="s"),
           STACK(T("حلّل حسابي", "وحلل", size="m", tone="green"), T("البوستات، الرسائل…", "للرسائل", size="s"), gap=18), gap=70)],
      transition="fade", header=H(L3, "2. المتصفح (Claude in Chrome)"))

p.go("مثلاً أنا بينزمني")
p.add([ROW(LBL("page-facing-up", "ملف معيّن", "ملف"), LBL("magnifying-glass-tilted-left", "موقع منافس", "لمنافس"), gap=120)],
      transition="fade", header=H(L3, "2. المتصفح (Claude in Chrome)"))

p.go("الشيء الثالث اللي إحنا")
p.add([ROW(I("desktop-computer", "كمبيوترك", size="m"),
           STACK(T("Cowork", "الكوورك", size="m"), T("صار جوّا الشات العادي", "التشات", size="s"), gap=18), gap=70)],
      transition="fade", header=H(L3, "3. كمبيوترك (Cowork)", "كمبيوترك"))

p.go("وهذا المجلد يكون على")
p.add([ROW(I("file-folder", "المجلد", size="m"),
           STACK(T("اشتغل جوّا هالمجلد", "اشتغلي", size="s", tone="green"),
                 T("ضيفلي 5 ملفات وسمّيهم", "خمس", size="s"),
                 T("اعملي ملف Excel", "Excel", size="s"), gap=18), gap=70)],
      transition="fade", header=H(L3, "3. كمبيوترك (Cowork)"))

p.go("فأنت فيك تخليك")
p.add([CHIPS(["تطبيقاتك", "المتصفح", "كمبيوترك"], "فيك", done=[("التطبيقات", 1), ("المتصفح", 2), ("بتحدد", 3)]),
       T("حسب احتياجك وشغلك", "احتياجك", size="m", tone="green")],
      transition="fade", header=H(L3, "اختار حسب شغلك", "فيك"))

# ── SCREEN 3: connectors, Chrome extension, Cowork folder ──
s3a, s3b = SCREENS[2]["fromS"], SCREENS[2]["toS"]
go_t(s3a)
screen_scene([CALL("Customize ← Connectors", "الـ Customize")])
p.go("التطبيقات اللي احنا فينا")
screen_scene([CALL("آلاف التطبيقات: Canva، Gmail، Notion…", "بالآلاف")])
p.go("تروح تشوف اضيفها")
screen_scene([CALL("Add custom connector + رابط الـ MCP", "كوستوم")])
p.go("الشيء الثاني هو الاضافة")
screen_scene([CALL("إضافة Claude in Chrome", "كروم")])
p.go("وهذا احسابي الانستغرام")
screen_scene([CALL("ادخل حسابي وحلّل البوستات", "البوستات")])
p.go("فأنت بتستخدمها إلا بحالة")
screen_scene([CALL("استخدمها بس إذا فعلاً محتاجها", "محتاجها")])
p.go("فالطريقة الثالثة")
screen_scene([CALL("Cowork صار جوّا الشات", "الكوورك")])
p.go("سبيل مثال فيه تحط")
screen_scene([CALL("+ ← Add Folder", "Folder")])
p.go("خلاص بعطيه صلاحية")
screen_scene([CALL("بيشتغل جوّا المجلد اللي اخترته", "صلاحية")])

# ═════════════════════════ LEVEL 3 → problem ═════════════════════════
go_t(s3b)
p.add([ROW(I("speaking-head", "اللي", size="m"),
           STACK(T("لسّا إنت اللي بتشرح كل مرة", "بنشرح", size="s", tone="red"),
                 T("بدنا موظف شاطر… نعلّمه مرة وحدة", "موظف", size="m", tone="green"), gap=22), gap=70)],
      transition="fade", header=H(L3, "المشكلة: لسّا إنت اللي بتشتغل"))

# ═════════════════════════ LEVEL 4 ═════════════════════════
p.go("بدنا نروح وننتقل للمستوى الرابع")
p.add([I("gear", "الرابع", size="l"), T("النظام", "النظام", size="xl", tone="green")],
      transition="trail", header=H(L4))

p.go("يعني أنك أنت تبني")
p.add([T("علّمه مرة… وبيشتغل لحاله", "يعملها", size="m", tone="green"),
       CHIPS(["كل يوم", "كل يومين", "كل أسبوع"], "يوم")],
      transition="fade", header=H(L4, "بيشتغل بدون ما تدخل", "تبني"))

p.go("أول شي بدنا نتعلمه")
p.add([ROW(STACK(I("man-technologist", "مهارة", size="s"), T("مهارتك", "مهارة", size="s"), gap=18),
           I("left-arrow", "تعطيها", size="s"),
           STACK(I("logos:claude-icon", "تعطيها", size="s"), T("Claude بيعملها عنك كل مرة", "يعمل", size="s", tone="green"), gap=18), gap=90)],
      transition="fade", header=H(L4, "1. المهارات (Skills)", "السكيلز"))

p.go("خلينا أوضح لك كيف")
p.add([ROW(I("e-mail", "إيميلات", size="m"),
           CHIPS(["12 سطر", "عنوان بالبداية", "جملة بالآخر", "صورة"], "سطر",
                 done=[("أنوان", 2), ("بالنهاية", 3), ("صورة", 4)]), gap=70)],
      transition="fade", header=H(L4, "مثال: مهارة الإيميل", "إيميلات"))

p.go("فخلاص انت بتصير")
p.add([{"type": "mc-typing", "text": "/email ابعث إيميل لفلان", "title": "Claude", "word": p.at("تستدعي"), "end": p.at("لفلان"), "rtl": True},
       T("بدون ما تعيد الشرح كل مرة", "كالعادة", size="s", tone="green")],
      transition="fade", header=H(L4, "مثال: مهارة الإيميل"))

p.go("فأنا مثلا كعادل")
p.add([ROW(LBL("clapper-board", "سكربت الريل", "السكريبت"),
           LBL("card-index-dividers", "الكاروسيل", "الكاروسيل"),
           LBL("check-mark-button", "المراجعة", "المراجعة"), gap=110),
       T("تعلّمت من مئات فيديوهاتي", "مئات", size="s", tone="green")],
      transition="fade", header=H(L4, "مهاراتي أنا", "كعادل"))

p.go("المراجعة بتراجع المحتوى")
p.add([{"type": "mc-flow", "word": p.at("بتراجع"), "nodes": [
            {"label": "ريل / كاروسيل", "icon": ICN("clapper-board"), "word": p.at("بتراجع")},
            {"label": "المراجعة", "icon": ICN("magnifying-glass-tilted-left"), "word": p.at("أخطاء")},
            {"label": "جاهز 100%", "icon": ICN("check-mark-button"), "word": p.at("100")}]},
       T("مهارات بتشتغل مع بعض", "مع بعض", size="s", tone="green")],
      transition="fade", header=H(L4, "مهارات بتشتغل مع بعض"))

p.go("وعدنا أيضا الشيء اللي هو المهام")
p.add([ROW(I("spiral-calendar", "المجدولة", size="m"),
           STACK(T("كل يوم اثنين الصبح", "الاثنين", size="m"), T("بيدخل ويرد على الإيميلات", "ويرود", size="s", tone="green"), gap=18), gap=70)],
      transition="fade", header=H(L4, "2. المهام المجدولة", "المجدولة"))

p.go("انا بدي عشان اكتب محتوى")
p.add([{"type": "mc-flow", "word": p.at("السوق"), "nodes": [
            {"label": "شوف السوق", "icon": ICN("magnifying-glass-tilted-left"), "word": p.at("السوق")},
            {"label": "أفكار اليوم", "icon": ICN("light-bulb"), "word": p.at("أفكار")},
            {"label": "تصاميم وريل", "icon": ICN("artist-palette"), "word": p.at("تصاميم")},
            {"label": "نشر", "icon": "logos:instagram-icon", "word": p.at("ونشتر")}]}],
      transition="fade", header=H(L4, "2. المهام المجدولة"))

p.go("طبعا هاي الأشياء أو كل نظام")
p.add([CHIPS(["جدولة", "ربط", "مهارات", "أدوات"], "جدولة", done=[("بتربطها", 2), ("مهارات", 3), ("أدوات", 4)]),
       T("كل نظام بيحتاجهم", "نظام", size="m", tone="green")],
      transition="fade", header=H(L4, "شو بيحتاج النظام", "طبعا"))

p.go("في عنا أشياء ديزاين")
p.add([ROW(LBL("artist-palette", "Claude Design: نظام تصميم", "ديزاين"),
           LBL("man-technologist", "Claude Code: مبرمج جنبك", "المبرمج"), gap=140)],
      transition="fade", header=H(L4, "3. Claude Design و Claude Code", "ديزاين"))

p.go("فعشان أنت تبني نظام")
p.add([CHIPS(["Claude Code", "Claude Design", "المهام المجدولة", "الربط", "المهارات"], "Code",
             done=[("Design", 2), ("المجدولة", 3), ("الربط", 4), ("المهارات", 5)]),
       T("كلهم مربوطين… وبيشتغلوا لحالهم", "لوحدهم", size="m", tone="green")],
      transition="fade", header=H(L4, "النظام = كلهم مع بعض", "تبني"))

p.go("عشان ما نعقد الموضوع")
p.add([ROW(I("rocket", "بفيديوهات", size="m"), T("بالتفصيل… بفيديوهات جاية", "بالمستقبل", size="m"), gap=70)],
      transition="fade", header=H(L4, "النظام = كلهم مع بعض"))

# ═════════════════════════ REVEAL ═════════════════════════
HR = {"title": "الشي اللي وعدتك فيه"}
p.go("لكم أيضا ببداية الفيديو")
p.add([I("wrapped-gift", "ببداية", size="l"), T("مونتاج هالفيديو\nعمله نظام بـ Claude", "مونتاج", size="l", tone="green")],
      transition="flash", header=HR)

p.go("فعندي فيديوهات مثلاً")
p.add([ROW(LBL("logos:instagram-icon", "إنستغرام", "الانستغرام"), LBL("handshake", "عملائي", "العملائي"), LBL("logos:youtube-icon", "يوتيوب", "لليوتيوب"), gap=110),
       T("8 لـ 10 فيديوهات باليوم… باشتراك واحد", "ثمان", size="s", tone="green")],
      transition="fade", header={**HR, "sub": "نفس النظام اللي شرحته بالمستوى 4", "subAt": p.at("فعندي")})

p.go("الفيديو الواحد سابقا")
p.add([ROW(STACK(I("clapper-board", "الافتر", size="s"), T("قبل: After Effects", "الافتر", size="s"), T("ساعتين ونص لـ 3 ساعات", "ساعتين", size="m", tone="red"), gap=16),
           I("left-arrow", "فحاليا", size="s"),
           STACK(I("sparkles", "فحاليا", size="s"), T("اليوم: النظام بيعمله", "فحاليا", size="m", tone="green"), gap=16), gap=80)],
      transition="fade", header={**HR, "sub": "الفرق بين المستوى 1 و 4", "subAt": p.at("الفيديو")})

p.go("نعمل نظام يشتغل")
p.add([ROW(I("globe-with-meridians", "المجال", size="m"),
           STACK(T("شو ما كان مجالك", "المجال", size="m"), T("تسويق، طب، أي شي", "طب", size="s", tone="green"), gap=18), gap=70)],
      transition="fade", header={"title": "إنت كمان فيك تبنيه"})

p.go("بيكون فعلا بيشتغل عنك")
p.add([ROW(I("artist-palette", "بألوانك", size="m"),
           STACK(T("بألوانك وخطوطك", "ألوانك", size="m"), T("بس باحترافية أكثر", "باحترافية", size="m", tone="green"), gap=18), gap=70)],
      transition="fade", header={"title": "إنت كمان فيك تبنيه"})

# ═════════════════════════ SUMMARY + CTA ═════════════════════════
p.go("الشي اللي بدي إياه منك")
p.add([{"type": "mc-levels", "labels": LEVELS, "word": p.at("مستوى"),
        "at": [p.at("الأول"), p.at("الثاني"), p.at("بالثالث"), p.at("بالراب")]}],
      transition="trail", header={"title": "إنت بأي مستوى؟"})

p.go("وإذا حابب فعلا")
p.add([ROW(FILE("غلاف-الدورة.png", "توصل", look="card", size="l", fallback=ICN("graduation-cap")),
           STACK(T("بيكتب بأسلوبك", "يكتب", size="s"), T("بيصمّم بهويتك", "يصمم", size="s"), T("بيمنتج عنك", "يمنتج", size="s", tone="green"), gap=22), gap=80)],
      transition="flash", header={"title": "دورة Claude وصناعة المحتوى"})

p.go("تستلم مجلدات جاهزة")
p.add([ROW(I("file-folder", "مجلدات", size="m"),
           STACK(T("مجلدات جاهزة + برومبتات", "مجلدات", size="m", tone="green"), T("بتشتغل خلال ساعة أو ساعتين", "ساعة", size="s"), gap=20), gap=70)],
      transition="fade", header={"title": "دورة Claude وصناعة المحتوى"})

p.go("إذا كنت مهتم")
p.add([T("الرابط بوصف الفيديو", "فرابط", size="l", tone="green"),
       {"type": "badge", "text": "ضمان 7 أيام", "word": p.at("ضمان"), "shape": "octagon"}],
      transition="fade", header={"title": "دورة Claude وصناعة المحتوى"})

p.go("أيضا اشترك بالقناة")
p.add([{"type": "subscribe", "word": p.at("اشترك"), "clickAt": p.at("بالقناة")},
       T("كل فيديو… قيمة عالية", "قيمة", size="s", tone="green")],
      transition="whip")

p.go("السلام عليكم")
p.add([{"type": "host", "word": p.at("السلام")}], transition="zoom")

p.plan["ladder"] = {"labels": LEVELS, "word": p.find("لأربع مستويات", start=0), "active": [
    {"word": p.find("المستوى الأول هو", start=0), "level": 1},
    {"word": p.find("ننتقل للمستوى الثاني", start=1200), "level": 2},
    {"word": p.find("نعرفه بالمستوى الثالث", start=2500), "level": 3},
    {"word": p.find("وننتقل للمستوى الرابع", start=3800), "level": 4}]}
p.plan["screens"] = True
p.save(music_volume=0.05)
