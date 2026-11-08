# Scene plan: «6 تحديثات بخوارزمية إنستغرام» (السكربتات/تحديثات-خوارزمية-انستغرام-نهائي.md)
# Run from المحرك/: PYTHONIOENCODING=utf-8 python scripts/plans/تحديثات-خوارزمية-انستغرام.py
# Creative brief (Adil, 2026-10-11): act out every metaphor, real screens on a phone, meters/bars for numbers, a carousel when carousels come up.
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from planlib import Plan

p = Plan()
F = "fluent-emoji-flat:"
IG = "skill-icons:instagram"


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


def NUM(n, phrase, tone="green", **k):
    return {"type": "number", "text": str(n), "word": p.at(phrase), "tone": tone, **k}


def LBL(icon, label, phrase, label_phrase=None, tone=None, **k):
    """Icon with its caption under it (the caption lands on its own word)."""
    t = {"tone": tone} if tone else {}
    return STACK(I(icon, phrase, size="s", **k), T(label, label_phrase or phrase, size="s", **t), gap=24)


def TITLE(n, title, phrase, title_phrase=None):
    """Section card: big number + the update's name (Adil reads these headings out loud)."""
    p.go(phrase)
    p.add([ROW(NUM(n, phrase, size="l"), T(title, title_phrase or phrase, size="l"), gap=70)], transition="zoom", bg="rays")


LOGO = {"type": "visual", "file": "شعاري.jpg", "look": "circle"}

# ───────────────────────── HOOK ─────────────────────────
p.go("ليش في")
p.add([ROW(STACK(I("fire", "بتجيب", size="s"), {"type": "counter", "to": 100000, "word": p.at("مية"), "size": "s", "tone": "green", "frames": 16}, gap=20),
           STACK(I("yawning-face", "وريلز", size="s"), {"type": "counter", "to": 1000, "word": p.at("الألف"), "size": "s", "tone": "red", "frames": 10}, gap=20), gap=220),
       T("بنفس الجودة!", "بنفس", size="s")], transition="cut")

p.go("وليش إنستغرام صار يحط")
p.add([FILE("ai-info-علامة-على-بوست.png", "علامة", look="card", size="l", corner="?", cornerAt=p.at("علاقة")),
       T("علامة AI… على بوستات عادية؟", "بوستات", size="s", tone="red")], transition="whip")

p.go("إنستغرام غيّر طريقة")
p.add([ROW(I(IG, "إنستغرام"), I("balance-scale", "حكمه"), gap=120), T("غيّر طريقة حكمه على محتواك", "غيّر", size="s")], transition="glitch")

p.go("وبهالفيديو")
p.add([{"type": "steps", "labels": ["1", "2", "3", "4", "5", "6"], "style": "chips", "word": p.at("6")}, T("6 تحديثات", "تحديثات", size="l")])

p.go("أغلبها من مدير")
p.add([ROW(FILE("آدم-موسيري-مدير-انستغرام.jpg", "مدير", look="circle", size="m"), T("آدم موسيري\nمدير إنستغرام", "مدير", size="m", tone="green"), gap=60)], transition="trail")

p.go("وآخر تحديث")
p.add([{"type": "badge", "text": "6", "shape": "diamond", "word": p.at("وآخر")}, T("بيغيّر نوع المحتوى اللي بتنزله", "يغيّر", size="s", tone="green")], transition="whip")

# ───────────────────────── 1. القمع ─────────────────────────
TITLE(1, "القمع", "القمع")
p.go("أول تحديث")
p.add([STACK(I(IG, "إنستغرام", size="s"), T("الاحتفاظ… أهم من أي وقت", "بالاحتفاظ", size="m", tone="green"))])

p.go("يعني كلما")
p.add([ROW(LBL("stopwatch", "تفرّج أطول", "أطول"), I("left-arrow", "كلما بيوصل", size="s"), LBL("chart-increasing", "وصول أكثر", "لناس", tone="green"), gap=70)], transition="cut")

p.go("بس الحكم")
p.add([{"type": "steps", "labels": ["1", "2", "3"], "style": "chips", "word": p.at("ثلاث")}, T("3 مراحل", "مراحل", size="l")])

# The shop on the street — acted out.
p.go("مثل محل")
p.add([I("convenience-store", "محل", size="xl")], transition="zoom", bg="rays")

p.go("المرحلة الأولى")
p.add([ROW(STACK(I("door", "الواجهة", size="m"), T("1. الواجهة", "الواجهة", size="s", tone="green"), gap=20),
           {"type": "card", "text": "= نسبة التخطّي", "word": p.at("نسبة")}, gap=80)])

p.go("يعني كم واحد")
p.add([ROW(I("person-walking", "واحد"), I("stopwatch", "ثواني"), gap=100), T("كمّل بعد أول 3 ثواني؟", "ثلاث", size="m")], transition="cut")

p.go("إذا أغلب الناس")
p.add([ROW(I("dashing-away", "بيتخطوا"), I("door", "الفيديو", tint="gray", tintAt=p.at("الفيديو")), gap=120), T("أغلبهم بيتخطوا؟", "بيتخطوا", size="s", tone="red")], transition="whip")

p.go("إنستغرام ما بيشوف")
p.add([ROW(I("red-heart", "لايكات", tint="gray", tintAt=p.at("ولا حفظ")), I("bookmark", "حفظ", tint="gray", tintAt=p.at("تعليقات")),
           I("speech-balloon", "تعليقات", tint="gray", tintAt=p.at("تعليقات")), gap=90),
       T("ما بيشوف أي شي ثاني", "بيشوف", size="s", tone="red")], transition="cut")

p.go("والأرقام")
p.add([{"type": "meter", "label": "نسبة التخطّي", "value": 50, "word": p.at("والأرقام"), "tone": "white",
        "steps": [{"word": p.at("تقريبا"), "value": 50}, {"word": p.at("30"), "value": 30}, {"word": p.at("20"), "value": 20}],
        "marks": [{"at": 50, "text": "مقبول", "tone": "white", "word": p.at("مقبول")},
                  {"at": 30, "text": "جيد", "tone": "green", "word": p.at("جيد")},
                  {"at": 20, "text": "ممتاز", "tone": "green", "word": p.at("ممتاز")}]}], transition="whip")

p.go("المرحلة الثانية")
p.add([ROW(I("couch-and-lamp", "الجلوس", size="l"), T("2. الجلوس\nلمدة أطول", "الجلوس", size="m", tone="green"), gap=60)], transition="whip")

p.go("وهي الاحتفاظ")
p.add([ROW(I("hourglass-not-done", "الاحتفاظ", size="s"), T("= الاحتفاظ", "الاحتفاظ", size="m"), gap=40),
       T("كم واحد كمّل لآخر الفيديو؟", "لآخر", size="s")], transition="cut")

p.go("وإذا فوق")
p.add([{"type": "meter", "label": "كمّلوا لآخر الفيديو", "value": 58, "word": p.at("فوق"), "tone": "green",
        "marks": [{"at": 50, "text": "50% = احتفاظ قوي", "tone": "green", "word": p.at("قوي")}]}], transition="whip")

p.go("والمرحلة الثالثة")
p.add([ROW(I("person-raising-hand", "اللي"), I("person", "أصحابه", size="s"), I("person-walking", "أصحابه", size="s"), gap=40),
       T("3. الزبون اللي بيجيب أصحابه", "بيجيب", size="s", tone="green")], transition="whip")

p.go("وهي المشاركات")
p.add([ROW(I("mobile-phone-with-arrow", "المشاركات"), T("= المشاركات", "المشاركات", size="m"), gap=40)], transition="cut")

p.go("وهون الفرق")
p.add([ROW(LBL("thumbs-up", "فيديو حلو", "حلو"),
           STACK(I("rocket", "وفيديو", size="s"), {"type": "counter", "to": 1000000, "word": p.at("لمليون"), "size": "s", "tone": "green", "frames": 16}, gap=20), gap=200)], transition="zoom", bg="rays")

# Real screen: Adil's reel insights, skip rate then share rate highlighted.
p.go("طيب شو")
p.add([ROW(FILE("reel-insights-احصائيات.jpg", "افتح", look="phone", size="l",
                highlights=[{"x": 3, "y": 59.5, "w": 94, "h": 7.5, "tone": "red", "word": p.at("وشوف")}]),
           T("افتح إحصائيات\nأي ريلز", "إحصائيات", size="m"), gap=90)], transition="whip")

p.go("التخطي عالي")
p.add([ROW(LBL("chart-increasing", "التخطّي عالي؟", "التخطي", tint="red"), I("left-arrow", "يعني", size="s"),
           LBL("fishing-pole", "الهوك ضعيف", "الهوك", tone="red"), gap=60)], transition="cut")

p.go("في نقطة")
p.add([ROW(LBL("yawning-face", "جزء ممل", "ممل"), I("left-arrow", "احذفه", size="s"), LBL("scissors", "احذفه", "احذفه", tone="green"), gap=60)], transition="whip")

p.go("وبس يزبطه")
p.add([STACK(I("mobile-phone-with-arrow", "بيتشارك", size="m"), T("بعدها: محتوى بينشارك", "اشتغل", size="m", tone="green"))], transition="trail")

# ───────────────────────── 2. علامة AI ─────────────────────────
p.go("ثاني تحديث")
p.add([ROW(NUM(2, "ثاني", size="l"), T("علامة AI", "ثاني", size="l"), gap=70), T("ويمكن أكثر واحد بيهمك", "بهمك", size="s", tone="green")], transition="zoom", bg="rays")

p.go("انستغرام صار يحط")
p.add([ROW(FILE("ai-info-علامة-على-بوست.png", "علامة", look="card", size="l"),
           T("على محتوى\nأكثر بكثير", "اكثر", size="m", tone="red"), gap=70)], transition="whip")

p.go("حتى في شخص")
p.add([ROW(I("person", "شخص", size="s"), FILE("canva-شعار.jpg", "بكانفا", look="card", size="s"), gap=80), T("شال خلفية صورته بـ Canva", "خلفية", size="s")], transition="cut")

p.go("ونزل كاروسيل")
p.add([ROW({"type": "carousel", "word": p.at("كاروسيل"), "every": 14,
            "slides": [{"icon": F + "framed-picture", "text": "صورتي"}, {"icon": F + "light-bulb", "text": "نصيحة 1"}, {"icon": F + "bookmark", "text": "احفظه"}]},
           FILE("ai-info-نافذة.png", "علامة", look="card", size="m"), gap=80)], transition="whip")

p.go("السبب انه")
p.add([ROW(I("busts-in-silhouette", "الناس"), I("no-entry", "ضد", size="s"), I("robot", "المولد", tint="gray", tintAt=p.at("بالكامل")), gap=70),
       T("الناس ضد المحتوى المولّد بالكامل", "المولد", size="s", tone="red")], transition="glitch")

p.go("حسابات وهمية")
p.add([ROW(LBL("ghost", "حسابات وهمية", "وهمية"), LBL("performing-arts", "وجوه مزيفة", "ووجوه"),
           LBL("speaker-high-volume", "أصوات مزيفة", "واصوات"), LBL("memo", "كلام منسوخ", "منسوخ"), gap=40)], transition="cut")

p.go("فإنستجرام قرر")
p.add([I("label", "العلامة", size="l"), T("العلامة على أشياء أكثر", "أشياء", size="s")], transition="whip")

p.go("بس الخبر")
p.add([STACK(T("الخبر المهم:", "الخبر", size="s"), I("chart-increasing", "بتقلل", size="m"), T("العلامة ما بتقلل وصولك", "بتقلل", size="m", tone="green"))], transition="flash")

p.go("إنستجرام ما بعاقبك")
p.add([ROW(I(IG, "بعاقبك", size="s"), I("robot", "استخدمت", size="s"), gap=90), T("ما بيعاقبك لأنك استخدمت AI", "بعاقبك", size="s", tone="green")], transition="cut")

p.go("اللي بعاقبك فعلا")
p.add([I("eyes", "المشاهد", size="l"), T("اللي بيعاقبك فعلاً: المشاهد", "فعلا", size="m", tone="red")], transition="zoom")

p.go("لما يحس")
p.add([ROW(LBL("memo", "كلام عام", "عام", tint="gray"), I("left-arrow", "بيتخطاه", size="s"), LBL("dashing-away", "تخطّي", "بيتخطاه", tone="red"), gap=60)], transition="whip")

p.go("يعني المشكلة")
p.add([{"type": "card", "text": "المشكلة مو بالذكاء الاصطناعي", "word": p.at("المشكلة مو")},
       T("المشكلة: محتوى AI ما بيشبهك", "بمحتوى", size="m", tone="red")], transition="cut")

p.go("ورح نرجع")
p.add([I("pushpin", "نرجع", size="m"), T("رح نرجع لها بالآخر", "نرجع", size="s")], transition="trail")

# ───────────────────────── 3. النص اللي بيختفي ─────────────────────────
TITLE(3, "النص اللي\nبيختفي بسرعة", "ثلاثة النص")
p.go("ثالث تحديث")
p.add([STACK(I("high-voltage", "بيومت", size="m"), T("خلص زمن النص اللي بيومض", "زمن", size="m", tone="red"))], transition="glitch")

p.go("بتعرف هالريلز")
p.add([ROW({"type": "card", "text": "فقرة كاملة من النص\nبتطلع على الريلز\nوبتختفي بسرعة…", "word": p.at("فقرة"), "out": p.at("لثانيتين")},
           STACK(I("stopwatch", "لثانيتين", size="m"), T("ثانيتين… واختفت!", "لثانيتين", size="m", tone="red"), gap=20), gap=70)], transition="whip")

p.go("عشان تضطر")
p.add([ROW(LBL("pause-button", "توقف", "توقف"), LBL("counterclockwise-arrows-button", "تعيد", "تعيده"), gap=150)], transition="cut")

p.go("انستغرام قالها")
p.add([ROW(I(IG, "قالها", size="s"), I("chart-decreasing", "أقل", tint="red", tintAt=p.at("أقل")), gap=90), T("هالنوع رح يوصل لناس أقل", "يوصل", size="s", tone="red")], transition="whip")

p.go("والقاعدة بسيطة")
p.add([ROW(I("megaphone", "بصوت"), T("اقرأ النص\nبصوت عالي", "اقرأ", size="m", tone="green"), gap=60)], transition="zoom")

p.go("إذا ما لحقت")
p.add([ROW(I("hourglass-not-done", "لحقت"), T("ما لحقت؟\nطوّل مدته", "طول", size="m", tone="green"), gap=60)], transition="whip")

p.go("والترجمة")
p.add([ROW(I("speech-balloon", "والترجمة"), I("check-mark-button", "مشكلة", size="s", tint="green"), gap=80), T("الترجمة مع كلامك: عادي", "كلامك", size="s", tone="green")], transition="cut")

# ───────────────────────── 4. تطبيقات المونتاج ─────────────────────────
TITLE(4, "تطبيقات المونتاج", "أربعة")
p.go("رابع تحديثه")
p.add([I("partying-face", "حلو", size="l"), T("خبر حلو", "حلو", size="m", tone="green")], transition="whip")

p.go("المونتاج بره")
p.add([ROW(I("clapper-board", "المونتاج"), I(IG, "إنستجرام", size="s"), gap=90), T("ما بيقلل مشاهداتك", "بيقلل", size="m", tone="green")], transition="cut")

p.go("سواء كابكات")
p.add([ROW(FILE("capcut-شعار.png", "كابكات", look="plain", size="s"), I("logos:adobe-premiere", "برنامج", size="s"), I("laptop", "ثاني", size="s"), gap=90)], transition="whip")

p.go("الكلام اللي بينتشر")
p.add([ROW(I("rolled-up-newspaper", "بينتشر", tint="red", tintAt=p.at("غلط"), corner=F + "cross-mark", cornerAt=p.at("غلط")),
           FILE("آدم-موسيري-مدير-انستغرام.jpg", "ومدير", look="circle", size="s"), gap=120),
       T("ومدير إنستغرام نفاه بنفسه", "نفاه", size="s", tone="green")], transition="cut")

p.go("إنستجرام بيهمه")
p.add([STACK(T("بيهمه شي واحد:", "بيهمه", size="s"), I("magnet", "بيشد", size="m"), T("هل المحتوى بيشد الناس؟", "بيشد", size="m", tone="green"), T("مو وين عملته", "عملته", size="s"))], transition="zoom")

# ───────────────────────── 5. Trial Reels ─────────────────────────
TITLE(5, "الـ Trial Reels", "خمسة")
p.go("خامس تحديث")
p.add([FILE("trial-reel-اعداد.jpg", "بتستخدم", look="card", size="l", corner=F + "warning", cornerAt=p.at("انتبه"),
            highlights=[{"x": 78, "y": 30, "w": 20, "h": 18, "tone": "red", "word": p.at("انتبه")}])], transition="whip")

p.go("قبل كنت")
p.add([ROW(STACK(I("film-frames", "الفيديو", size="s"), T("نص أ", "الفيديو", size="s"), gap=16),
           STACK(I("film-frames", "تغير", size="s"), T("نص ب", "النص", size="s", tone="green"), gap=16), gap=160),
       T("نفس الفيديو… نص ثاني", "تجربة", size="s")], transition="cut")

p.go("اليوم إنستجرام")
p.add([ROW(I("repeat-button", "مكرر", tint="red", tintAt=p.at("مكرر")), I("chart-decreasing", "الوصول", size="s"), gap=90), T("= مكرر، ووصول أقل", "مكرر", size="m", tone="red")], transition="glitch")

p.go("بعدك تجربة")
p.add([T("لازم تغيير حقيقي", "حقيقة", size="m", tone="green"),
       ROW(LBL("fishing-pole", "هوك ثاني", "هوك"), LBL("movie-camera", "لقطات ثانية", "لقطات"), LBL("light-bulb", "فكرة ثانية", "فكرة"), gap=70)], transition="whip")

# ───────────────────────── 6. الكاروسيل ─────────────────────────
TITLE(6, "الكاروسيل", "ستة")
p.go("وآخر التحديث")
p.add([ROW({"type": "carousel", "word": p.at("وآخر"), "at": [p.at("وعدتك"), p.at("مسيطر"), p.at("الآن")],
            "slides": [{"icon": F + "light-bulb", "text": "الفكرة"}, {"icon": F + "fishing-pole", "text": "الهوك"}, {"icon": F + "bar-chart", "text": "الأرقام"}, {"icon": F + "bookmark", "text": "احفظه"}]},
           T("مسيطر\nالآن", "مسيطر", size="l", tone="green"), gap=90)], transition="zoom", bg="rays")

p.go("حسب دراسة")
p.add([ROW(I("bar-chart", "دراسة"), I("man-technologist", "خبراء"), gap=110), T("دراسة لأحد أشهر خبراء إنستغرام", "خبراء", size="s")], transition="whip")

p.go("آخر تسعين")
p.add([ROW(I("spiral-calendar", "آخر"), T("آخر 90 يوم", "تسعين", size="l"), gap=60)], transition="cut")

p.go("الكاروسيل جاب")
p.add([{"type": "bars", "word": p.at("الكاروسيل جاب"),
        "bars": [{"label": "ريلز", "value": 1, "text": "1×", "tone": "white", "icon": F + "clapper-board", "word": p.at("الكاروسيل جاب")},
                 {"label": "كاروسيل", "value": 1.9, "text": "1.9×", "tone": "green", "icon": F + "framed-picture", "word": p.at("ضعف")}]}], transition="zoom", bg="rays")

p.go("والسبب عرض")
p.add([I("balance-scale", "عرض", size="l"), T("عرض وطلب", "عرض", size="m")], transition="whip")

p.go("الكل عم ينزل")
p.add([ROW(I("film-frames", "الكل", size="s"), I("film-frames", "ينزل", size="s"), I("film-frames", "الريلز", size="s"), I("film-frames", "الريلز", size="s"), gap=40),
       T("الكل عم ينزل ريلز", "الريلز", size="s"),
       T("وقليل اللي بينزل كاروسيل", "وقليل", size="s", tone="green")], transition="cut")

p.go("وفيه ناس")
p.add([ROW(LBL("open-book", "بتقرأ على راحتها", "بتقرأ"), LBL("muted-speaker", "بدون صوت", "صوت"), LBL("pause-button", "بدون توقيف", "توقف", tint="gray"), gap=60)], transition="whip")

p.go("فإذا كل")
p.add([STACK(I("chart-decreasing", "تخسر", size="m", tint="red", tintAt=p.at("تخسر")), T("كل محتواك ريلز؟", "محتوىك", size="m"), T("عم تخسر كثير", "تخسر", size="m", tone="red"))], transition="glitch")

# ───────────────────────── الخلاصة ─────────────────────────
p.go("خلينا نلخص")
p.add([ROW(LBL("door", "التخطّي", "التخطي"), LBL("couch-and-lamp", "الاحتفاظ", "الاحتفاظ"), LBL("mobile-phone-with-arrow", "المشاركة", "والمشارك"), gap=80)], transition="zoom", bg="rays")

p.go("علامة AI ما")
p.add([ROW(NUM(2, "علامة", size="m"), T("علامة AI ما بتقلل وصولك", "علامة", size="m"), gap=50), T("المحتوى العام بيخسّرك جمهورك", "المحتوى العام", size="s", tone="red")], transition="whip")

p.go("لا تحط نص")
p.add([ROW(NUM(3, "لا تحط", size="m"), T("لا تومّض النص", "نص", size="m"), gap=50)], transition="whip")

p.go("المونتاج برا")
p.add([ROW(NUM(4, "المونتاج", size="m"), T("المونتاج برّا إنستغرام: عادي", "المونتاج", size="m"), gap=50)], transition="whip")

p.go("لترايل ريلز لازم")
p.add([ROW(NUM(5, "لترايل", size="m"), T("Trial Reels مختلفة فعلاً", "مختلفة", size="m"), gap=50)], transition="whip")

p.go("والكاروسيل الآن")
p.add([ROW(NUM(6, "والكاروسيل", size="m"), T("الكاروسيل فرصتك", "فورستك", size="m", tone="green"), gap=50)], transition="whip")

# ───────────────────────── الجسر + CTA ─────────────────────────
p.go("وإذا لاحظت")
p.add([I("bullseye", "واحد", size="l"), T("كلها بترجع لشي واحد", "بترجع", size="m")], transition="zoom", bg="rays")

p.go("محتوى بيشبهك")
p.add([ROW({**LOGO, "word": p.at("بيشبهك"), "size": "m"}, I("spiral-calendar", "باستمرار", size="s"), gap=80), T("محتوى بيشبهك… وبينزل باستمرار", "بيشبهك", size="s", tone="green")], transition="whip")

p.go("هوك قوي")
p.add([ROW(LBL("fishing-pole", "هوك قوي", "هوك"), LBL("artist-palette", "كاروسيل بهويتك", "وكاروسيل"),
           LBL("robot", "بدون ريحة AI", "ريحة", tint="gray", corner=F + "cross-mark", cornerAt=p.at("ريحة")), gap=60)], transition="cut")

p.go("وهذا بالضبط")
p.add([FILE("غلاف-الدورة.png", "بنبنيه", look="card", size="l"), T("كلود وصناعة المحتوى", "بدورة", size="s", tone="green")], transition="zoom")

p.go("بتبني نسخة")
p.add([ROW(LBL("brain", "نسخة من عقلك", "عقلك"), I("logos:claude-icon", "فكلاود", size="s"), LBL("writing-hand", "بصوتك إنت", "بصوتك", tone="green"), gap=60),
       T("مو بصوت الكل", "الكل", size="s")], transition="whip")

p.go("وبتعمل نظام")
p.add([ROW(LBL("artist-palette", "نظام تصميم بهويتك", "تصميم"),
           {"type": "carousel", "word": p.at("فالكاروسيل"), "every": 10,
            "slides": [{"icon": F + "artist-palette", "text": "هويتك"}, {"icon": F + "sparkles", "text": "جاهز"}, {"icon": F + "stopwatch", "text": "بدقايق"}]}, gap=90)], transition="whip")

p.go("إذا كنت مهتم")
p.add([FILE("صفحة-الدورة.png", "مهتم", look="card", size="l", highlights=[{"x": 59, "y": 49, "w": 16, "h": 8, "tone": "green", "word": p.at("الرابط")}]),
       T("الرابط بالوصف", "الرابط", size="s", tone="green")], transition="whip")

p.go("ومعك ضمان")
p.add([STACK(I("shield", "ضمان", size="l"), T("ضمان 7 أيام", "سبع", size="m", tone="green"))], transition="cut")

p.go("وإذا استفدت")
p.add([STACK({"type": "subscribe", "word": p.at("اشترك"), "clickAt": p.at("بالقناة")}, {"type": "host", "word": p.at("استفدت"), "size": "s"}, gap=40)], transition="whip")

p.save(music_volume=0.07)
