# Scene plan: course promo «كلود يعمل عنك» (sales page video, 2026-10-17)
# Script: ../كلود وصناعة المحتوى - فيديوهات الدورة/صفحة_الدورة/سكربت_الفيديو_التسويقي.md
# Run from المحرك/: PYTHONIOENCODING=utf-8 python scripts/plans/فيديو-صفحة-الدورة.py
# Brief (Adil): full creative freedom, very professional, 3D touches; it doubles as a montage example for students.
# New cards for this video (MotionCards3.tsx): mc-chat (chat → orbit of unused tools), title-3d (course name), mc-price.
# Real work clips from his own systems in العناصر/فيديو-صفحة-الدورة/ (reels, carousel, YouTube, Emaar).
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


def LBL(icon, label, phrase, label_phrase=None, tone=None, **k):
    t = {"tone": tone} if tone else {}
    return STACK(I(icon, phrase, size="s", **k), T(label, label_phrase or phrase, size="s", **t), gap=20)


def WORK(name, label, phrase, look="phone", size="s"):
    return STACK(FILE(name, phrase, look=look, size=size), T(label, phrase, size="s"), gap=26)


# ───────────────────────── HOOK: 4 people, one Claude ─────────────────────────
p.go("إذا عندك مشروع")
p.add([ROW(FILE("غلاف-الدورة.png", "مشروع", look="plain", size="xl"), T("عندك مشروع\nعلى إنستغرام؟", "مشروع", size="m"), gap=30)], transition="cut")

p.go("Claude فيه يعمل")
p.add([ROW(I("logos:claude-icon", "Claude", size="l"),
           T("بيعمل عنك\nأغلب شغلك", "عنك", size="l", tone="green"), gap=70),
       T("كل يوم", "يوم", size="s")], transition="zoom", bg="rays")

p.go("إذا موظّف")
p.add([ROW(LBL("man-office-worker", "موظّف", "موظّف"), I("backhand-index-pointing-left", "بيخلص", size="s"),
           LBL("page-facing-up", "تقارير", "التقارير"), LBL("e-mail", "إيميلات", "والإيميلات"), LBL("bar-chart", "عروض", "والعروض"), gap=56)], transition="whip")

p.go("إذا عندك قناة يوتيوب")
p.add([ROW(LBL("logos:youtube-icon", "يوتيوبر", "قناة"), I("backhand-index-pointing-left", "بيكتب", size="s"),
           LBL("writing-hand", "السكربت", "السكريبت"), LBL("clapper-board", "المونتاج", "المونتاج"), gap=70)], transition="whip")

p.go("وإذا فريلانسر")
p.add([ROW(LBL("man-technologist", "فريلانسر", "فريلانسر"), LBL("file-folder", "شغل عملائك", "عملائك"), gap=120),
       {"type": "meter", "label": "وقت التسليم", "value": 100, "word": p.at("تسلم"), "tone": "green",
        "steps": [{"word": p.at("تسلم"), "value": 100}, {"word": p.at("بنص"), "value": 50}],
        "marks": [{"at": 50, "text": "بنص الوقت", "tone": "green", "word": p.at("بنص")}]}], transition="whip")

# ───────────────────────── THE PROBLEM: used like any chat ─────────────────────────
p.go("بس المشكلة")
p.add([T("بس المشكلة؟", "المشكلة", size="xl", tone="red")], transition="glitch")

p.go("أغلب الناس بيستخدم")
p.add([{"type": "mc-chat", "word": p.at("أغلب"), "question": "اكتبلي كابشن لمنشوري", "answer": "أكيد! هذا كابشن مقترح…",
        "qAt": p.at("سؤال"), "aAt": p.at("وجواب"), "zoomAt": p.at("وبيضيع"),
        "nodes": [{"label": "المشاريع", "icon": F + "file-folder"}, {"label": "الذاكرة", "icon": F + "brain"},
                  {"label": "المهارات", "icon": F + "puzzle-piece"}, {"label": "Claude Code", "icon": F + "laptop"},
                  {"label": "الأرتيفاكتس", "icon": F + "sparkles"}, {"label": "الربط بأدواتك", "icon": F + "link"},
                  {"label": "البحث", "icon": F + "magnifying-glass-tilted-left"}, {"label": "التصميم", "icon": F + "artist-palette"}]}],
      transition="whip")

# ───────────────────────── PROOF: everything I do runs on Claude ─────────────────────────
p.go("أنا عادل")
p.add([T("أنا عادل", "عادل", size="m"),
       ROW(WORK("شغلي-ريل-كاروسيل.mp4", "محتواي", "محتواي"),
           WORK("شغلي-يوتيوب.mp4", "مونتاجي", "مونتاجي", look="card", size="m"),
           WORK("شغلي-كاروسيل.png", "تصاميمي", "تصاميمي", look="card", size="m"), gap=60)], transition="whip")

p.go("موقعي")
p.add([ROW(LBL("globe-with-meridians", "موقعي", "موقعي"),
           WORK("شغلي-اعمار.mp4", "شغل عملائي", "عملائي"),
           WORK("شغلي-ريل-خطة.mp4", "خطة محتوى", "وشغل"), gap=110)], transition="cut")

p.go("كله صار جوا")
p.add([I("logos:claude-icon", "كله", size="l"), T("كله صار بكلود", "صار", size="l", tone="green")], transition="zoom", bg="rays")

p.go("وحتى هالفيديو")
p.add([{"type": "mc-rhythm", "word": p.at("وحتى"), "title": "مونتاج هالفيديو: Claude", "legend": ["قص الصوت", "المشاهد", "المؤثرات والانتقالات"], "sweep": 95,
        "titles": [{"at": 4, "text": "CLAUDE"}, {"at": 9, "text": "EDIT"}]},
       T("انعمله مونتاج كامل بكلود", "انعمله", size="m", tone="green")], transition="whip")

# ───────────────────────── THE COURSE ─────────────────────────
p.go("لهالشي عملت")
p.add([{"type": "title-3d", "word": p.at("كلود"), "text": "كلود يعمل عنك", "sub": "دورة كلود الشاملة: من الأساس للاحتراف", "subAt": p.at("دورة")}],
      transition="flash", bg="rays")

p.go("بنبلش الصفر")
p.add([{"type": "ribbon", "text": "الأساس", "word": p.at("بنبلش")},
       {"type": "mc-levels", "word": p.at("بنبلش"), "labels": ["من الصفر", "شو هو كلود", "أي خطة", "كيف تطلب"], "active": 4,
        "at": [p.at("الصفر"), p.at("شو"), p.at("خطة"), p.at("تكتب")],
        "results": ["", "", "", "يفهمك من أول مرة"], "resultsAt": [None, None, None, p.at("بيفهمه")]}], transition="trail")

p.go("بعدين بتعلمه")
p.add([ROW({"type": "mc-doc", "word": p.at("بتعلمه"), "title": "نسخة عقلك", "w": 820, "h": 470,
            "sections": [{"head": "مين أنت", "kind": "text", "items": ["شغلك، وجمهورك، وطريقة تفكيرك"], "word": p.at("مين")},
                         {"head": "أسلوبك", "kind": "swatches", "items": ["كلماتك ونبرتك وهويتك"], "word": p.at("بأسلوبك")}]},
           STACK(T("بأسلوبك أنت", "بأسلوبك", size="l", tone="green"),
                 T("مو بأسلوب الذكاء الاصطناعي", "مو", size="s", tone="red"), gap=24), gap=70)], transition="whip")

p.go("وبعدها بيصير")
p.add([{"type": "ribbon", "text": "التطبيق", "word": p.at("وبعدها")}, T("بيصير يشتغل عنك", "يشتغل", size="l", tone="green")], transition="zoom")

p.go("بيكتب محتواك")
p.add([ROW(LBL("writing-hand", "محتواك", "بيكتب"), LBL("artist-palette", "تصميم بهويتك", "بيصمم"),
           LBL("clapper-board", "مونتاج", "وبيعمل"), LBL("globe-with-meridians", "موقعك", "وبيبني", corner=F + "rocket", cornerAt=p.at("وبينشره")), gap=80)],
      transition="cut")

p.go("وبيراقب منافسينك")
p.add([ROW(LBL("eyes", "بيراقب منافسينك", "منافسينك"),
           LBL("speech-balloon", "بيرد على التعليقات\nوالرسائل", "وبيرد", corner=F + "check-mark-button", cornerAt=p.at("والرسائل")), gap=200)],
      transition="whip")

p.go("ما بتحتاج تعرف")
p.add([ROW(I("laptop", "برمجة", size="m", tint="gray", corner=F + "cross-mark", cornerAt=p.at("كود")),
           T("بدون برمجة\nولا سطر كود", "برمجة", size="l", tone="green"), gap=80)], transition="glitch")

p.go("كل خطوة مصورة")
p.add([FILE("لقطة-2-ابدأ-المونتاج.mp4", "خطوة", look="card", size="m"), T("كل خطوة مصوّرة قدامك", "مصورة", size="m", tone="green")], transition="whip")

p.go("وكلود كل شهر")
p.add([ROW(LBL("logos:claude-icon", "كلود بيتغيّر", "وكلود", corner=F + "counterclockwise-arrows-button", cornerAt=p.at("بيتغير")),
           I("backhand-index-pointing-left", "والدورة", size="s"),
           LBL("books", "الدورة بتتغيّر معه", "والدورة", tone="green"), gap=90)], transition="whip")

p.go("كل ميزة جديدة")
p.add([{"type": "badge", "text": "درس\nجديد", "word": p.at("كدرس")}, T("كل ميزة جديدة… بتوصلك", "ميزة", size="m")], transition="cut")

p.go("13 محور")
p.add([ROW(STACK({"type": "counter", "to": 13, "word": p.at("13"), "size": "l", "frames": 14}, T("محور", "محور", size="m"), gap=10),
           STACK({"type": "counter", "to": 54, "prefix": "+", "word": p.at("54"), "size": "l", "tone": "green", "frames": 16}, T("درس", "درس", size="m"), gap=10), gap=240)],
      transition="zoom", bg="rays")

p.go("مع القوالب")
p.add([ROW(LBL("card-index-dividers", "القوالب", "القوالب"), LBL("puzzle-piece", "المهارات الجاهزة", "والمهارات"), gap=180),
       T("نفس اللي أنا بستخدمها", "بستخدمها", size="s", tone="green")], transition="whip")

# ───────────────────────── OFFER + CTA ─────────────────────────
p.go("وسعر الإطلاق")
p.add([T("سعر الإطلاق", "وسعر", size="m"),
       {"type": "mc-price", "word": p.at("الإطلاق"), "old": "150$", "now": "47$", "newAt": p.at("47"), "strikeAt": p.at("150"),
        "tag": "لأول 100 مشترك", "tagAt": p.at("لأول"), "seal": "ضمان\n7\nأيام", "sealAt": p.at("ضمان")}],
      transition="flash", bg="rays")

p.go("كلود موجود عند")
p.add([I("logos:claude-icon", "كلود", size="m"), T("موجود عند الكل…", "موجود", size="m"),
       T("بس القليل بيخلّيه يشتغل عنه", "القليل", size="m", tone="green")], transition="whip")

p.go("اكبس على الزر")
p.add([{"type": "card", "text": "ابدأ الآن بـ 47$", "word": p.at("اكبس"), "size": "l"},
       I("backhand-index-pointing-down", "تحت", size="m"), T("وابدأ اليوم", "تحت", size="m", tone="green")], transition="zoom", bg="rays")

p.save(music_volume=0.07)
