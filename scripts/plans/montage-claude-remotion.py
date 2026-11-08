# Scene plan: «كل هالفيديو منتجه الذكاء الاصطناعي» (السكربتات/مونتاج-كلود-ريموشن-نهائي.md)
# Run from المحرك/: python scripts/plans/montage-claude-remotion.py
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

def NUM(n, phrase, tone="red", **k):
    return {"type": "number", "text": str(n), "word": p.at(phrase), "tone": tone, **k}

LOGO = {"type": "visual", "file": "شعاري.jpg", "look": "circle"}

# ───────────────────────── HOOK ─────────────────────────
p.go("كل اللي عم تشوفه")
p.add([T("كل اللي عم تشوفه", "كل اللي", size="l"), I("film-frames", "بهالفيديو", size="s")])

p.go("ما لمسه مونتير")
p.add([I("man-technologist", "ما لمسه", tint="red", tintAt=p.at("مونتير"), corner="fluent-emoji-flat:cross-mark", cornerAt=p.at("مونتير"))], transition="cut")

p.go("لا القص")
p.add([ROW(I("scissors", "القص", size="s"), I("framed-picture", "الصور", size="s"), {"type": "counter", "to": 100, "word": p.at("الأرقام"), "size": "s", "frames": 14}, I("high-voltage", "الحركة", size="s"), gap=90)], transition="cut")

p.go("كله عمله الذكاء")
p.add([STACK(I("robot", "الذكاء", size="l"), T("كله عمله الذكاء الاصطناعي", "الذكاء", size="s", tone="green"))], transition="zoom", bg="rays")

p.go("أنا بس سجلت")
p.add([ROW(I("studio-microphone", "سجلت"), I("open-file-folder", "الملف", sfx="pop"))])

p.go("وكتبت جملة")
p.add([FILE("لقطة-2-ابدأ-المونتاج.mp4", "وكتبت", look="card", size="xl"), T("ابدأ المونتاج", "ابدأ المونتاج", size="m", tone="green", enter="pop")], transition="whip")

p.go("وبعد دقائق طلع")
p.add([FILE("لقطة-4-الفيديو-يشتغل.mp4", "طلع", look="card", size="xl")], transition="zoom")

p.go("إذا عندك مشروع")
p.add([ROW(I("briefcase", "مشروع"), I("mobile-phone", "محتوى"))])

p.go("فأكيد المونتاج")
p.add([ROW(I("hourglass-done", "وقتك", tint="red", tintAt=p.at("وقتك")), I("money-with-wings", "فلوسك")), T("المونتاج بياكل وقتك وفلوسك", "المونتاج", size="s")])

p.go("وغالبا جربت")
p.add([ROW(I("robot", "الذكاء"), {"type": "visual", "icon": "logos:claude-icon", "word": p.at("منتج"), "size": "s"})], transition="whip")

p.go("وطلعت النتيجة")
p.add([{"type": "card", "text": "النتيجة: عادية", "word": p.at("نتيجة")}, T("شكلها سيء\nوما بتشبهك", "شكلها", size="s", tone="red", enter="words")], transition="glitch")

p.go("بهالفيديو راح أشوفك")
p.add([STACK({"type": "steps", "labels": ["1", "2", "3", "4", "5"], "style": "chips", "word": p.at("الخمس")}, T("من مونتاج عادي ← لمونتاج احترافي", "مونتاج عادي", size="s"))])

p.go("وبالآخر راح أحكي")
p.add([I("gem-stone", "اهم شي", size="l", corner="?", cornerAt=p.at("فيهم")), T("أهم شي… بالآخر", "اهم", size="s", tone="green")], transition="trail")

p.go("ما كان هالفيديو")
p.add([{"type": "host", "word": p.at("ما كان"), "size": "m"}])

# ───────────────────────── الفكرة ─────────────────────────
p.go("خليني اوضح")
p.add([FILE("شعار-ريموشن-رمز.png", "اسمها", look="plain", size="m"), T("Remotion", "ريموشن", size="l")], transition="whip")

p.go("بدل ما تمنتج")
p.add([ROW(STACK(I("logos:adobe-premiere", "تمنتج", size="s"), T("تايملاين", "التايم", size="s"), gap=30),
           STACK(I("speaking-head", "بتوصف", size="s"), T("بالكلام", "بالكلام", size="s", tone="green"), gap=30), gap=220)], transition="cut")

p.go("وهي بتبنيه")
p.add([FILE("موقع-ريموشن.png", "بتبنيه", look="screen", size="xl")], transition="zoom")

p.go("انت ما بتكتب")
p.add([ROW(I("keyboard", "بتكتب", tint="gray", tintAt=p.at("سطر"), corner="fluent-emoji-flat:cross-mark", cornerAt=p.at("سطر")), I("logos:claude-icon", "سطر"))], transition="whip")

p.go("بتعمل مجلد")
p.add([FILE("لقطة-1-سحب-الملف.mp4", "مجلد", look="card", size="xl")], transition="cut")

p.go("بتطلب من كلاود")
p.add([ROW(I("logos:claude-icon", "كلاود"), FILE("شعار-ريموشن-رمز.png", "يثبت", look="plain", size="m")), T("طلب واحد، وخلاص", "واحد", size="s", tone="green")], transition="whip")

p.go("بعدها بتحكي")
p.add([{"type": "search", "text": "اعمل لي فيديو خلفيته سودا…", "word": p.at("اعمل"), "end": p.at("سودا")}], transition="whip")

p.go("وكلمة مرحبا")
p.add([T("مرحبا", "مرحبا", size="xl", enter="drop", sfx="whoosh")], transition="cut")

p.go("ما عجبك اللون")
p.add([T("مرحبا", "ما عجبك", size="xl", enter="none", toneAt=p.at("غيره"), toneTo="green"), I("artist-palette", "اللون", size="s")], transition="cut")

p.go("بدك الكلمة اسرع")
p.add([T("أسرع", "اسرع", size="xl", enter="slide", sfx="whoosh")], transition="cut")

p.go("انت بتطلب")
p.add([ROW(STACK(I("speaking-head", "بتطلب", size="s"), T("إنت بتطلب", "بتطلب", size="s"), gap=30), STACK(I("robot", "بنفذ", size="s"), T("وهو بينفذ", "بنفذ", size="s", tone="green"), gap=30), gap=200)], transition="whip")

p.go("ومو بس نصوص")
p.add([ROW(I("memo", "ترجمة", size="s"), {"type": "counter", "to": 99, "word": p.at("وارقام"), "size": "s", "frames": 12}, I("star", "وايقونات", size="s"), I("framed-picture", "وصور", size="s"), I("desktop-computer", "شاشة", size="s"), I("film-frames", "مقاطع فيديو", size="s"), gap=60)], transition="whip")

p.go("اي شي بتقدر توصفه")
p.add([T("أي شي بتوصفه\nبيعمله", "بتقدر", size="l", tone="green", enter="words")], transition="zoom", bg="rays")

p.go("ونصيحة صغيرة")
p.add([I("light-bulb", "ونصيحة", size="m"), T("احكي طلباتك بصوتك", "احكي", size="s")], transition="whip")

p.go("لما بتحكي")
p.add([ROW(STACK(I("keyboard", "بتحكي", size="s", tint="gray"), T("كتابة", "بتحكي", size="s"), gap=30), STACK(I("studio-microphone", "تفاصيل", size="s"), T("تفاصيل أكثر", "تفاصيل", size="s", tone="green"), gap=30), gap=200), T("النتيجة أحسن", "احسن", size="s", tone="green", enter="pop")])

# ───────────────────────── المشكلة ─────────────────────────
p.go("لحد هون كلها حلو")
p.add([{"type": "host", "word": p.at("لحد"), "size": "m"}], transition="trail")

p.go("بس هون بتبلش المشكلة")
p.add([I("warning", "المشكلة", size="l"), T("المشكلة", "المشكلة", size="m", tone="red", enter="pop")], transition="glitch")

p.go("لما تعطيه فيديو")
p.add([FILE("لقطة-4-الفيديو-يشتغل.mp4", "فيديو حقيقي", look="card", size="l"), T("النتيجة… مقبولة، مو أكثر", "مقبولة", size="s")], transition="whip")

p.go("العناصر بتطلع بالوقت")
p.add([STACK(ROW(I("alarm-clock", "بالوقت", size="s", tint="red", tintAt=p.at("الغلط")), I("scissors", "والقص", size="s", tint="red", tintAt=p.at("نظيف")), I("busts-in-silhouette", "عام", size="s", tint="gray", tintAt=p.at("لأي")), gap=130),
             T("توقيت غلط · قص مو نظيف · شكل عام", "والقص", size="s", tone="red"))], transition="cut")

p.go("تحكي له حط")
p.add([{"type": "counter", "from": 0, "to": 10, "suffix": "x", "word": p.at("رقم"), "size": "l", "tone": "white", "out": p.at("بيختفي")}, T("بيختفي وإنت لسه عم تحكي", "بيختفي", size="s", tone="red")], transition="whip")

p.go("بيطلع بلوم")
p.add([ROW(I("artist-palette", "بلوم", tint="red", tintAt=p.at("علاقة")), LOGO | {"word": p.at("بهويتك")}), T("لون ما إله علاقة بهويتك", "علاقة", size="s")], transition="cut")

p.go("كل ما تصلح شي")
p.add([ROW(I("wrench", "تصلح", size="s"), I("collision", "بيطلع", size="s"), I("wrench", "شي ثاني", size="s"), gap=110), T("كل ما تصلّح شي… بيطلع غيره", "تصلح", size="s")], transition="whip")

p.go("والسبب مو")
p.add([I("robot", "والسبب", size="m", corner="?", cornerAt=p.at("السبب")), T("تارك الذكاء الاصطناعي\nيقرر لحاله", "تارك", size="s", enter="words")], transition="zoom")

p.go("وهون الفرق")
p.add([ROW(STACK(I("hammer-and-wrench", "تستخدم", size="m"), T("أداة", "أداة", size="m", tone="red"), gap=30),
           STACK(I("gear", "تبني", size="m", tint="green", tintAt=p.at("نظام")), T("نظام", "نظام", size="m", tone="green"), gap=30), gap=300)], transition="whip", bg="rays")

p.go("وفي خمس اشياء")
p.add([{"type": "steps", "labels": ["1", "2", "3", "4", "5"], "style": "chips", "word": p.at("خمس")}, T("5 أشياء بتعمل الفرق", "اشياء", size="s")], transition="trail")

# ───────────────────────── 1. التوقيت ─────────────────────────
p.go("اول شي نص بتوقيت")
p.add([ROW(NUM(1, "اول شي"), T("نص بتوقيت\nكل كلمة", "نص بتوقيت", size="m", enter="slide"))], transition="flash")

p.go("النص العادي")
p.add([ROW(STACK(I("page-facing-up", "النص العادي", size="s"), T("شو انحكى", "انحكى", size="s"), gap=30),
           STACK(I("stopwatch", "يعرف", size="s"), T("إيمتى انحكت كل كلمة", "تنحكت", size="s", tone="green"), gap=30), gap=200)], transition="whip")

p.go("لأنه كل شي بيبنى")
p.add([STACK(I("stopwatch", "هالتوقيت", size="s"), ROW(I("scissors", "تقص", size="s"), I("framed-picture", "الصورة", size="s"), {"type": "counter", "to": 47, "word": p.at("الرقم"), "size": "s", "frames": 12}, gap=120))], transition="cut")

p.go("وهذا بيعمله برنامج")
p.add([FILE("نص-بتوقيت.png", "تفريغ", look="plain", size="xl")], transition="whip")

p.go("فيه منه مجاني")
p.add([ROW(I("laptop", "جهازك"), T("مجاني\nعلى جهازك", "مجاني", size="m", tone="green"))], transition="cut")

p.go("بهالفيديو كل ايقونة")
p.add([ROW(I("star", "ايقونة", size="s"), I("speaking-head", "الكلمة", size="s"), gap=140), T("هذا مو صدفة… هذا التوقيت", "صدفة", size="s", tone="green")], transition="whip")

p.go("وبدونه احسن")
p.add([I("sparkles", "موشنجرافك", size="m", tint="red", tintAt=p.at("بالمكان")), T("بالمكان الغلط", "بالمكان", size="m", tone="red")], transition="glitch")

# ───────────────────────── 2. القص ─────────────────────────
p.go("والشيء الثاني")
p.add([I("hourglass-done", "بيوفر", size="m"), T("والثاني بيوفر أكثر وقت", "بيوفر", size="s")], transition="trail")

p.go("ثاني شيء القص")
p.add([ROW(NUM(2, "ثاني شي", tone="green"), T("القص قبل\nأي إضافة", "القص", size="m", enter="slide"))], transition="flash")

p.go("وانا بسجل بغلط")
p.add([ROW(I("studio-microphone", "بسجل", size="s"), I("cross-mark", "بغلط", size="s"), I("counterclockwise-arrows-button", "عدتها", size="s"), gap=120)], transition="whip")

p.go("وبيشيل النسخة")
p.add([STACK(T("قبل", "النسخة", size="s", tone="red"), FILE("موجة-قبل.png", "النسخة", look="plain", size="s"), T("بعد", "الوقفات", size="s", tone="green"), FILE("موجة-بعد.png", "الوقفات", look="plain", size="s"), gap=20)], transition="cut")

p.go("وكمان بنظف الصوت")
p.add([ROW(I("broom", "بنظف", size="s"), I("speaker-high-volume", "الصوت", size="s"), I("logos:youtube-icon", "يوتيوب", size="s"), gap=120), T("صوت نظيف بمقاس يوتيوب", "مقاس", size="s")], transition="whip")

p.go("تسجيل فيه غلطات")
p.add([ROW(STACK(I("studio-microphone", "تسجيل", size="s", tint="red", tintAt=p.at("غلطات")), T("فيه غلطات", "غلطات", size="s", tone="red"), gap=30),
           STACK(I("sparkles", "نظيف", size="s"), T("نظيف", "نظيف", size="s", tone="green"), gap=30), gap=220)], transition="cut")

p.go("وانا ما فتحت")
p.add([I("logos:adobe-premiere", "برنامج", size="m", tint="gray", tintAt=p.at("مونتاج"), corner="fluent-emoji-flat:cross-mark", cornerAt=p.at("مونتاج"))], transition="cut")

p.go("القاعدة هون بسيطة")
p.add([{"type": "card", "text": "نظّف أول… وبعدين منتج", "word": p.at("نظف")}], transition="zoom")

p.go("لأنه ما في أي تأثير")
p.add([I("sparkles", "تأثير", size="m", tint="gray", tintAt=p.at("مليان")), T("ما في تأثير بينقذ فيديو\nمليان وقفات وغلطات", "مليان", size="s", tone="red", enter="words")], transition="whip")

p.go("وهون في فكرة مهمة")
p.add([I("light-bulb", "فكرة", size="l"), T("فكرة مهمة كثير", "مهمة", size="s", tone="green")], transition="trail")

p.go("اول مرة القص")
p.add([I("scissors", "القص", size="m", corner="?", cornerAt=p.at("مثالي")), T("أول مرة… مو مثالي", "مثالي", size="s")], transition="whip")

p.go("ممكن يترك")
p.add([ROW(STACK(I("pause-button", "يترك", size="s"), T("وقفات أطول", "اطول", size="s", tone="red"), gap=30), STACK(I("scissors", "يقص", size="s"), T("يقص حرف", "حرف", size="s", tone="red"), gap=30), gap=220)], transition="cut")

p.go("الحل مو أنك")
p.add([I("counterclockwise-arrows-button", "تصلح", size="m", tint="red", tintAt=p.at("جديد")), T("تصلّح كل مرة من جديد", "تصلح", size="s", tone="red")], transition="glitch")

p.go("الحل أنك تحول")
p.add([{"type": "card", "text": "كل تصليح ← قاعدة ثابتة", "word": p.at("تحول")}, I("pushpin", "ثابتة", size="s")], transition="zoom")

p.go("صلحتها مرة")
p.add([ROW(I("wrench", "صلحتها", size="s"), I("memo", "اكتبها", size="s"), I("check-mark-button", "تتكرر", size="s"), gap=120), T("صلّحتها مرة؟ اكتبها قاعدة", "اكتبها", size="s")], transition="whip")

p.go("وهيك النظام كل فيديو")
p.add([I("brain", "أذكى", size="l"), T("كل فيديو أذكى من اللي قبله", "أذكى", size="s", tone="green")], transition="whip", bg="rays")

# ───────────────────────── 3. الذوق ─────────────────────────
p.go("ثالث شي وهو أصعب")
p.add([ROW(NUM(3, "ثالث شي", tone="green"), T("إيمتى يحط شي\nعلى الشاشة", "يعرف", size="m", enter="slide"))], transition="flash")

p.go("إذا ذكرت ثلاث نقاط")
p.add([STACK({"type": "steps", "labels": ["1", "2", "3"], "word": p.at("نقاط")}, T("3 نقاط ← قدامك", "يطلعوا", size="s"))], transition="whip")

p.go("إذا ذكرت رقم")
p.add([{"type": "counter", "from": 0, "to": 1000, "word": p.at("رقم"), "size": "xl", "tone": "green", "rays": True}], transition="cut", bg="rays")

p.go("إذا قلت إنستجرام")
p.add([I("skill-icons:instagram", "انستجرام", size="l")], transition="cut")

p.go("بس كلمة مثل يعني")
p.add([T("«يعني»… «بعدين»", "يعني", size="m", toneAt=p.at("بتستاهل"), toneTo="red"), {"type": "scribble", "word": p.at("بتستاهل")}], transition="whip")

p.go("ولكل نوع كلام")
p.add([T("لكل نوع كلام… شكل", "ولكل", size="s")], transition="whip")

p.go("إذا عم تعدد أشياء")
p.add([ROW(I("keycap-1", "أشياء", size="s"), I("keycap-2", "واحد", size="s"), I("keycap-3", "الثاني", size="s"), gap=110), T("تعداد: واحد ورا الثاني", "بيطلعوا", size="s")], transition="cut")

p.go("إذا عم تقارن")
p.add([ROW(STACK(I("thumbs-up", "تقارن", size="s"), T("يمين", "يمين", size="s", tone="green"), gap=30), STACK(I("thumbs-down", "قسم", size="s"), T("شمال", "وشمال", size="s", tone="red"), gap=30), gap=300)], transition="cut")

p.go("إذا ذكرت مبلغ")
p.add([{"type": "counter", "from": 0, "to": 47, "suffix": "$", "word": p.at("مبلغ"), "size": "l", "tone": "green", "sfx": "cash"}], transition="cut")

p.go("إذا ذكرت غلطة")
p.add([T("غلطة", "غلطة", size="xl", toneAt=p.at("بتتلون"), toneTo="red"), {"type": "scribble", "word": p.at("بتنشط")}], transition="cut")

p.go("هذا ذوق")
p.add([I("artist", "ذوق", size="l"), T("هذا ذوق… وأصعب شي تعلّمه", "والذوق", size="s")], transition="zoom")

p.go("انا حليتها بطريقة")
p.add([I("light-bulb", "حليتها", size="m"), T("حليتها بطريقة بسيطة", "بسيطة", size="s", tone="green")], transition="whip")

p.go("جبت فيديوهات لمونتير")
p.add([FILE("دراسة-المونتير-إطار-إطار.png", "فيديوهات", look="screen", size="xl")], transition="whip")

p.go("طلع قواعده كلها")
p.add([FILE("ملف-القواعد.png", "قواعده", look="plain", size="xl")], transition="zoom")

p.go("وكتبها بملف")
p.add([ROW(I("memo", "بملف", size="m"), I("film-frames", "يطبقها", size="m")), T("وصار يطبّقها على كل فيديو", "يطبقها", size="s", tone="green")], transition="whip")

p.go("ثلاث فيديوهات بس كانوا")
p.add([{"type": "counter", "from": 0, "to": 3, "word": p.at("فيديوهات"), "size": "xl", "frames": 10}, T("فيديوهات بس كانوا كافيين", "كافيين", size="s")], transition="cut", bg="rays")

p.go("وكل ما بلاقي مونتير")
p.add([ROW(I("man-technologist", "مونتير", size="s"), I("film-frames", "فيديو", size="s"), I("memo", "نفس", size="s"), gap=120), T("بيضيف اللي تعلّمه على نفس الملف", "وبيضيف", size="s")], transition="whip")

p.go("بس حتى مع هيك")
p.add([I("puzzle-piece", "ناقص", size="l", corner="?", cornerAt=p.at("وهذا")), T("بيوقع فيه أغلب الناس", "بيوقع", size="s", tone="red")], transition="trail")

# ───────────────────────── 4. المكتبة ─────────────────────────
p.go("رابع شي لا تخليه")
p.add([ROW(NUM(4, "رابع شي", tone="green"), T("لا تخليه\nيخترع كل شي", "تخليه", size="m", enter="slide"))], transition="flash")

p.go("كثير ناس بيربطوه")
p.add([ROW(I("robot", "بيربطوه", size="s"), I("framed-picture", "صور", size="s"), I("framed-picture", "يولد", size="s"), I("framed-picture", "صورة", size="s"), gap=70), T("صورة لكل جملة", "لكل جملة", size="s")], transition="whip")

p.go("النتيجة صور غريبة")
p.add([ROW(I("alien", "غريبة", size="s"), I("shuffle-tracks-button", "بشكل", size="s"), I("money-with-wings", "وتكلفة", size="s"), gap=120), T("غريبة · كل مرة بشكل · تكلفة", "غريبة", size="s", tone="red")], transition="glitch")

p.go("الاحسن انك تعطيه")
p.add([I("books", "مكتبة", size="l"), T("مكتبة جاهزة", "مكتبة", size="m", tone="green")], transition="zoom", bg="rays")

p.go("أيقونات شعارات")
p.add([ROW(I("star", "ايقونات", size="s"), {"type": "visual", "icon": "logos:claude-icon", "word": p.at("شعارات"), "size": "s"}, I("speaker-high-volume", "واصوات", size="s"), I("musical-notes", "وموسيقى", size="s"), gap=90), T("بيختار منها… بدل ما يخترع", "بيختار", size="s")], transition="cut")

p.go("بس فيه تفصيلة صغيرة")
p.add([I("magnifying-glass-tilted-left", "تفصيلة", size="m"), T("كيف بيعرف أي ملف يستخدم؟", "كيف", size="s")], transition="whip")

p.go("اسم الملف لحاله")
p.add([{"type": "card", "text": "pop.wav", "word": p.at("اسم")}, T("الاسم لحاله ما بيكفي", "بيكفي", size="s", tone="red")], transition="cut")

p.go("فبتعمل قائمة")
p.add([FILE("وصف-المكتبة.png", "قائمة", look="plain", size="xl")], transition="zoom")

p.go("من الوصف بيعرف")
p.add([T("الشي المناسب\nللجملة المناسبة", "يختار", size="l", tone="green", enter="words")], transition="whip")

p.go("وإذا بده صورة لشي حقيقي")
p.add([ROW(I("globe-with-meridians", "موقع", size="s"), I("bust-in-silhouette", "معروف", size="s"), gap=140), T("ما بيولّدها… بيجيبها", "بيولدها", size="s", tone="green")], transition="whip")

p.go("وبيحكي لي بالضبط")
p.add([{"type": "card", "text": "صوّر لي هالشاشة\nوحطها بهالمجلد", "word": p.at("سور")}], transition="cut")

p.go("بهالفيديو مثلا صفحة")
p.add([FILE("صفحة-الدورة.png", "صفحة", look="screen", size="xl")], transition="whip")

p.go("وشعار كلاود")
p.add([{"type": "visual", "icon": "logos:claude-icon", "word": p.at("وشعار"), "size": "l"}], transition="cut")

p.go("وانا بس سجلت لقطة")
p.add([FILE("لقطة-1-سحب-الملف.mp4", "لقطة", look="card", size="xl")], transition="whip")

p.go("حتى الاصوات بأول")
p.add([I("speaker-high-volume", "الأصوات", size="m", tint="red", tintAt=p.at("عجبني")), T("صوت انتقال ما عجبني", "انتقال", size="s", tone="red")], transition="glitch")

p.go("حطيت ثلاث اصوات")
p.add([ROW(I("musical-note", "ثلا", size="s"), I("musical-note", "أصوات", size="s"), I("musical-note", "بحقهم", size="s"), gap=90), T("وصار يستخدمهم لحاله", "يستخدمهم", size="s", tone="green")], transition="whip")

p.go("والآن ضل آخر شي")
p.add([{"type": "host", "word": p.at("آخر شي"), "size": "m"}, T("لو بدك تاخذ شي واحد… خذ هذا", "واحد", size="s", tone="green")], transition="trail")

# ───────────────────────── 5. القوالب ─────────────────────────
p.go("وصلنا للشي اللي وعدتك")
p.add([ROW(NUM(5, "وصلنا", tone="green"), T("القوالب", "القوالب", size="xl", enter="slide"))], transition="flash", bg="rays")

p.go("القالب يعني أنك")
p.add([{"type": "counter", "from": 0, "to": 80, "suffix": "%", "word": p.at("80"), "size": "xl", "tone": "green", "frames": 18}, T("من الشغل… مرة وحدة", "مرة", size="s")], transition="zoom", bg="rays")

p.go("الألوان الخط")
p.add([ROW(I("artist-palette", "الألوان", size="s"), {"type": "text", "text": "Aa", "word": p.at("الخط"), "size": "m"}, NUM(7, "الأرقام", tone="white", size="s"), {"type": "card", "text": "بطاقة", "word": p.at("البطاقات"), "size": "s"}, I("high-voltage", "والحركة", size="s"), gap=70)], transition="cut")

p.go("والذكاء الاصطناعي بيعمل")
p.add([{"type": "counter", "from": 0, "to": 20, "suffix": "%", "word": p.at("20"), "size": "xl", "tone": "white", "frames": 14}, T("بياخذ كلامك… وبيحطه جوا القالب", "بياخذ", size="s")], transition="whip")

p.go("يعني بدل ما يصمم")
p.add([I("building-construction", "يصمم", size="m", tint="gray", tintAt=p.at("الصفر")), T("بدل ما يصمم من الصفر", "الصفر", size="s")], transition="whip")

p.go("عنده قالب للأرقام")
p.add([ROW(NUM(1, "للأرقام", tone="white", size="s"), {"type": "steps", "labels": ["1", "2", "3"], "style": "chips", "word": p.at("للقوائم")}, ROW(I("thumbs-up", "للمقارنات", size="s"), I("thumbs-down", "للمقارنات", size="s"), gap=30), I("framed-picture", "للصور", size="s"), gap=90)], transition="cut")

p.go("بيختار القالب المناسب")
p.add([{"type": "card", "text": "يختار القالب ← يبدّل الكلام", "word": p.at("بيختار")}], transition="whip")

p.go("لاحظ ألوان")
p.add([ROW(*[{"type": "badge", "shape": "octagon", "size": "s", "word": p.at(w)} for w in ["لاحظ", "ألوان هالفيديو", "كلها"]], gap=80), T("كلها ألوان علامتي", "كلها", size="s", tone="green")], transition="zoom")

p.go("ما فيه ولا لون")
p.add([T("ولا لون غريب", "غريب", size="l"), T("القالب بيفرضها", "بيفرضها", size="s", tone="green")], transition="cut")

p.go("ولما بدي أغير")
p.add([ROW(I("gear", "أغير", size="s"), I("film-frames", "الفيديوهات", size="s"), I("film-frames", "الفيديوهات", size="s", dx=-40), I("film-frames", "الفيديوهات", size="s", dx=-80), gap=50), T("بغيّره مرة… وبيتطبق على الكل", "بالقالب", size="s", tone="green")], transition="whip")

p.go("هيك بتصير النتيجة")
p.add([I("trophy", "ثابتة", size="l"), T("نتيجة ثابتة من أول محاولة", "ثابتة", size="s", tone="green")], transition="whip", bg="rays")

p.go("بدون قوالب كل فيديو")
p.add([ROW(STACK(I("game-die", "مغامرة", size="m"), T("بدون قوالب: مقامرة", "بدون", size="s", tone="red"), gap=30),
           STACK(LOGO | {"word": p.at("ومع")}, T("مع القوالب: بيشبهك", "ومع", size="s", tone="green"), gap=30), gap=260)], transition="cut")

# ───────────────────────── نصائح ─────────────────────────
p.go("وإذا بدك تبلش")
p.add([STACK({"type": "steps", "labels": ["1", "2", "3"], "word": p.at("نصائح")}, T("3 نصائح لتبلش اليوم", "اليوم", size="s"))], transition="trail")

p.go("أول نصيحة")
p.add([ROW(NUM(1, "أول نصيحة", tone="green", size="s"), STACK(T("ابدأ بفيديو قصير", "ابدأ", size="m", enter="slide"), {"type": "counter", "to": 60, "suffix": "s", "word": p.at("دقيقة"), "size": "s", "frames": 14}, gap=10))], transition="whip")

p.go("جرب وشوف")
p.add([ROW(I("test-tube", "جرب", size="s"), I("eyes", "وشوف", size="s"), I("wrench", "وصلح", size="s"), gap=120)], transition="cut")

p.go("ثاني نصيحة")
p.add([ROW(NUM(2, "ثاني نصيحة", tone="green", size="s"), T("لا تمنتج بإيدك", "تمنتج", size="m", enter="slide"))], transition="whip")

p.go("اذا في شي مو عاجبك")
p.add([ROW(I("speaking-head", "احكي", size="s"), I("logos:claude-icon", "لكلاود", size="s"), gap=140), T("شغلك تراجع… مو تمنتج", "شغلك", size="s", tone="green")], transition="cut")

p.go("وثالث نصيحة")
p.add([ROW(NUM(3, "وثالث", tone="green", size="s"), T("أي مونتاج بيعجبك\nخلّي Claude يدرسه", "بيعجبك", size="m", enter="slide"))], transition="whip")

p.go("هيك بتبني قوالبك")
p.add([I("building-construction", "قوالبك", size="m"), T("قوالبك من أحسن الشغل الموجود", "أحسن", size="s", tone="green")], transition="cut")

# ───────────────────────── التلخيص ─────────────────────────
p.go("خلينا نلخص")
p.add([{"type": "steps", "labels": ["1", "2", "3", "4", "5"], "style": "chips", "word": p.at("نلخص")}], transition="trail")

p.go("اول شي نص بتوقيت كل كلمة ثاني")
p.add([STACK({"type": "steps", "labels": ["1", "2", "3", "4", "5"], "word": p.at("أول شي"),
              "done": [{"word": p.at("أول شي"), "upto": 1}, {"word": p.at("ثاني شي"), "upto": 2}, {"word": p.at("ثالث شي"), "upto": 3}, {"word": p.at("رابع شي"), "upto": 4}, {"word": p.at("وخامس"), "upto": 5}]},
         T("نص بتوقيت كل كلمة", "نص بتوقيت", size="s", out=p.at("ثاني شي")),
         T("نظّف قبل ما تمنتج", "نظف", size="s", out=p.at("ثالث شي")),
         T("علّمه إيمتى يحط شي", "علمه", size="s", out=p.at("رابع شي")),
         T("مكتبة بدل ما يخترع", "مكتبة", size="s", out=p.at("وخامس")),
         T("القوالب: 80% منك و20% منه", "القوالب", size="s", tone="green"), gap=30)], transition="cut")

# ───────────────────────── الجسر + الدورة ─────────────────────────
p.go("لما تجمع هالخمسة")
p.add([ROW(STACK(I("hammer-and-wrench", "أداة", size="m", tint="gray", tintAt=p.at("بيصير")), T("أداة", "أداة", size="m", tone="red"), gap=30),
           STACK(I("gear", "نظام", size="m"), T("نظام", "بيصير", size="m", tone="green"), gap=30), gap=300)], transition="zoom", bg="rays")

p.go("بتحط التسجيل بمجلد")
p.add([FILE("لقطة-3-المخرجات.mp4", "بتحط", look="card", size="xl")], transition="whip")

p.go("المونتاج لكل فيديو كان")
p.add([{"type": "counter", "from": 0, "to": 3, "suffix": " ساعات", "word": p.at("ثلاث ساعات"), "size": "l", "tone": "red", "frames": 12}, T("لكل فيديو", "لكل فيديو", size="s")], transition="zoom", bg="rays")

p.go("واليوم بياخذ أقل")
p.add([{"type": "counter", "from": 180, "to": 30, "suffix": " دقيقة", "word": p.at("أقل"), "size": "l", "tone": "green", "frames": 16, "sfx": "sparkle"}, T("وأغلبها مراجعة", "وأغلبها", size="s")], transition="cut", bg="rays")

p.go("والمونتاج جزء واحد")
p.add([{"type": "tree", "word": p.at("والمونتاج"), "items": [
    I("gear", "والمونتاج", size="s"),
    I("writing-hand", "الكتابة", size="s"),
    I("artist-palette", "التصميم", size="s"),
    I("mobile-phone-with-arrow", "النشر", size="s"),
    I("speech-balloon", "الردود", size="s")]}], transition="trail")

p.go("ومحتوى كلها صار")
p.add([ROW({"type": "counter", "from": 10, "to": 2, "suffix": " ساعات", "word": p.at("ساعتين"), "size": "l", "tone": "green", "frames": 16}), T("بالأسبوع… بدل عشرة", "بالاسبوع", size="s")], transition="zoom", bg="rays")

p.go("وهذا بالضبط اللي بنبنيه")
p.add([FILE("غلاف-الدورة.png", "بدورة", look="plain", size="l"), T("كلود وصناعة المحتوى", "وصناعة", size="m")], transition="flash")

p.go("فيها محور كامل")
p.add([{"type": "ribbon", "text": "المحور 9", "word": p.at("محور")}, T("نظام المونتاج الذاتي", "المونتاج", size="m", tone="green")], transition="whip")

p.go("بتستلمه جاهز")
p.add([I("package", "بتستلمه", size="l", corner="fluent-emoji-flat:check-mark-button", cornerAt=p.at("تشغله")), T("بتستلمه جاهز على جهازك", "جاهز", size="s", tone="green")], transition="whip")

p.go("ولو ما بتفهم")
p.add([ROW(I("keyboard", "بالبرمجة", size="s", tint="gray", corner="fluent-emoji-flat:cross-mark"), {"type": "visual", "icon": "logos:claude-icon", "word": p.at("بالبرمجة"), "size": "s"}, gap=160), T("ولا سطر كود… Claude بيكتبه", "بالبرمجة", size="s", tone="green")], transition="cut")

p.go("كل التفاصيل اذا كنت مهتم")
p.add([FILE("صفحة-الدورة.png", "التفاصيل", look="screen", size="xl", highlights=[{"x": 67, "y": 53, "w": 13.5, "h": 7, "tone": "green", "word": p.at("مهتم")}])], transition="whip")

p.go("ومعك ضمان")
p.add([I("shield", "ضمان", size="l", corner="fluent-emoji-flat:check-mark-button", cornerAt=p.at("سبع")), T("ضمان 7 أيام", "سبع", size="m", tone="green")], transition="zoom")

p.go("وإذا استفدت")
p.add([{"type": "subscribe", "word": p.at("سفدت"), "clickAt": p.at("بالقناة")}, {"type": "host", "word": p.at("لأنه"), "size": "s"}], transition="whip")

p.save()
