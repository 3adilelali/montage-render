# Scene plan: «4 مستويات من البرومبت» (السكربتات/موشن-جرافيكس-بالبرومبت-نهائي.md)
# Run from المحرك/: PYTHONIOENCODING=utf-8 python scripts/plans/موشن-جرافيكس-بالبرومبت.py
# Brief (Adil 2026-10-12): "إبداعك لأبعد الحدود". Video-specific cards: mc-code, mc-post, mc-levels, mc-doc, mc-rhythm, mc-frames
# + source clips (short, muted, credited), all word-timed.
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from planlib import Plan

p = Plan()
F = "fluent-emoji-flat:"
CR = "المصدر: Zinho Automates"
LEVELS = ["سطر", "بريف", "مرجع", "صوت"]


def T(text, phrase, **k):
    return {"type": "text", "text": text, "word": p.at(phrase), **k}


def I(icon, phrase, **k):
    return {"type": "visual", "icon": icon if ":" in icon else F + icon, "word": p.at(phrase), **k}


def CLIP(name, phrase, **k):
    return {"type": "visual", "file": name, "word": p.at(phrase), "look": "card", **k}


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


def STAIRS(phrase, active, **k):
    return {"type": "mc-levels", "word": p.at(phrase), "labels": LEVELS, "active": active, **k}


LOGO = {"type": "visual", "file": "شعاري.jpg", "look": "circle"}

# ───────────────────────── HOOK ─────────────────────────
p.go("هذا الفيديو")
p.add([CLIP("مصدر-ترايلر-1.mp4", "هذا", size="xl")], transition="cut")

p.go("ما أنا عمل")
p.add([ROW(I("clapper-board", "برنامج", tint="gray", corner=F + "cross-mark", cornerAt=p.at("مونتاج")),
           I("movie-camera", "صوره", tint="gray", corner=F + "cross-mark", cornerAt=p.at("صوره")), gap=140),
       T("لا مونتاج… ولا تصوير", "مونتاج", size="m")], transition="whip")

p.go("Claude كتبه")
p.add([ROW({"type": "mc-code", "word": p.at("كتبه"), "filename": "Trailer.tsx", "end": p.at("بسطر"), "fontSize": 34,
            "lines": ["export const Trailer = () => {", "  const glow = spring(frame);", "  return <Title text=\"ONE BY ONE\"", "    color=\"#39FF8B\" slam />;", "};"]},
           T("Claude كتبه\nكود", "كتبه", size="m", tone="green"), gap=60)], transition="zoom")

p.go("وغالباً شفت")
p.add([ROW({"type": "mc-post", "word": p.at("منشور"), "text": "I made this with ONE prompt 🤯", "file": "اطار-كسول-2.jpg", "likes": 48200},
           T("«عملته\nببرومبت واحد»", "عملته", size="m"), gap=70)], transition="whip")

p.go("بتنسخ لبرومبت")
p.add([STACK(I("clipboard", "بتنسخ", size="m"), T("بتنسخ البرومبت…", "بتنسخ", size="m"))], transition="cut")

p.go("وبيطلع لك شي حلو")
p.add([{"type": "mc-frames", "word": p.at("حلو"), "frames": ["اطار-كسول-1.jpg", "اطار-كسول-2.jpg", "اطار-كسول-3.jpg", "اطار-كسول-4.jpg", "اطار-كسول-2.jpg", "اطار-كسول-1.jpg"]},
       T("بس شبه كل اللي شفته قبل", "شبه", size="m", tone="red")], transition="whip")

p.go("بهالفيديو رح")
p.add([STAIRS("مستويات", 4, at=[p.at("4"), p.at("مستويات"), p.at("نتيجة"), p.at("لنتيجة")],
              results=["بتشبه الكل", "", "", "بتشبهك إنت"], resultsAt=[p.at("بتشبه"), None, None, p.at("بتشبهك")])], transition="zoom", bg="rays")

p.go("وهالقاعدة")
p.add([ROW(LBL("film-frames", "موشن", "للموشن"), LBL("memo", "كابشن", "لكل"), LBL("framed-picture", "كاروسيل", "بتطلبه"), LBL("robot", "أي طلب من AI", "الذكاء"), gap=60),
       T("القاعدة لكل شي", "لكل", size="s", tone="green")], transition="whip")

# ───────────────────────── شو بيقدر يعمل ─────────────────────────
p.go("أول شي لازم")
p.add([ROW(I("logos:claude-icon", "Claude", size="m"), {"type": "card", "text": "مو مولّد فيديو", "word": p.at("مولّد")}, gap=60)], transition="glitch")

p.go("ما بيعمل ناس")
p.add([ROW(LBL("person", "ناس حقيقيين", "ناس", tint="gray", corner=F + "cross-mark", cornerAt=p.at("حقيقيين")),
           LBL("video-camera", "تصوير", "تصوير", tint="gray", corner=F + "cross-mark", cornerAt=p.at("تصوير")), gap=160)], transition="cut")

p.go("بيعمل أشكال")
p.add([ROW(LBL("large-orange-diamond", "أشكال", "أشكال"), LBL("input-latin-letters", "نصوص", "ونصوص"), LBL("star", "أيقونات", "وعيقونات"),
           LBL("desktop-computer", "واجهات", "وواجهات"), LBL("light-bulb", "ضوء", "وضوء"), LBL("sparkles", "جزيئات", "وجزيئات"), gap=36)], transition="whip")

p.go("يعني يفكر")
p.add([ROW(STACK(I("bar-chart", "بعرض", size="m"), T("عرض تقديمي فخم", "تقديمي", size="s", tone="green"), gap=20),
           STACK(I("film-projector", "فيلم", size="m", tint="gray", tintAt=p.at("سينما")), T("مو فيلم سينما", "فيلم", size="s"), gap=20), gap=200)], transition="cut")

p.go("وبس تفهم")
p.add([STACK(I("bullseye", "تفهم", size="m"), T("بتعرف شو تطلب منه", "بتعرف", size="m", tone="green"))], transition="whip")

# ───────────────────────── المستوى 1 ─────────────────────────
p.go("المستوى الأول")
p.add([STAIRS("المستوى", 1, at=[p.at("الأول"), p.at("الأول"), p.at("الأول"), p.at("الأول")]), T("الطلب الكسول", "سطر", size="m", tone="green")], transition="zoom", bg="rays")

p.go("أعمل فيديو")
p.add([{"type": "mc-typing", "word": p.at("أعمل"), "title": "Claude", "text": "اعمل فيديو موشن جرافيكس 15 ثانية، بشكل احترافي جدا جدا", "end": p.at("جدا", 1), "w": 1250, "h": 260}], transition="whip")

p.go("والنتيجة بصراحة")
p.add([CLIP("مصدر-برومبت-كسول.mp4", "والنتيجة", size="xl")], transition="zoom")

p.go("بس المشكلة")
p.add([STACK({"type": "counter", "to": 20, "prefix": "×", "word": p.at("20"), "size": "l", "tone": "red", "frames": 14}, T("شفت هالشكل 20 مرة", "هالشكل", size="m"))], transition="glitch")

p.go("ما فيه هويتك")
p.add([ROW({**LOGO, "word": p.at("هويتك"), "size": "m", "tint": "gray", "corner": "?", "cornerAt": p.at("هويتك")}, T("ما فيه هويتك", "هويتك", size="m", tone="red"), gap=60)], transition="cut")

p.go("والسطر الواحد")
p.add([{"type": "mc-typing", "word": p.at("والسطر"), "title": "Claude", "text": "اعمل فيديو موشن جرافيكس 15 ثانية، بشكل احترافي جدا جدا", "end": p.at("عمل"), "cross": p.at("مو هو"), "w": 1250, "h": 260},
       T("مو هو السر", "الحلوة", size="m", tone="red")], transition="whip")

p.go("الشغل الحقيقي")
p.add([ROW(I("hourglass-not-done", "قبل", size="m"), T("الشغل الحقيقي\nقبل ما تكبس إرسال", "الحقيقي", size="m", tone="green"), gap=60)], transition="cut")

# ───────────────────────── المستوى 2: البريف ─────────────────────────
p.go("المستوى الثاني")
p.add([STAIRS("المستوى", 2, at=[p.at("الثاني")] * 4), T("بريف حقيقي", "بريف", size="m", tone="green")], transition="zoom", bg="rays")

SEC = {
    "role": {"head": "1. الدور", "kind": "text", "items": ["إنت المخرج، والمحرّك، والملحّن، ومصمم الصوت"], "word": p.at("الدور")},
    "ban": {"head": "2. الممنوع", "kind": "ban", "items": ["نص بنص الشاشة", "تدرّجات جاهزة", "حركات عامة"], "word": p.at("الممنوعات")},
    "want": {"head": "المطلوب", "kind": "swatches", "items": ["ألوانك وخطوطك ومسافاتك"], "word": p.at("ألوانك")},
    "board": {"head": "3. اعرض الخطة أول", "kind": "board", "word": p.at("أعرض"), "approveAt": p.at("بتصلحه")},
}


def DOC(phrase, keys, h, w=1000):
    return {"type": "mc-doc", "word": p.at(phrase), "title": "البريف", "h": h, "w": w, "sections": [SEC[k] for k in keys]}


p.go("وفيه ثلاث")
p.add([{"type": "steps", "labels": ["1", "2", "3"], "style": "chips", "word": p.at("ثلاث")}, T("3 أشياء", "ثلاث", size="l")], transition="cut")

p.go("واحد الدور")
p.add([ROW(DOC("واحد", ["role"], 330), T("1. الدور", "الدور", size="l", tone="green"), gap=60)], transition="whip")

p.go("انت المخرج")
p.add([ROW(LBL("clapper-board", "المخرج", "المخرج"), LBL("artist-palette", "المحرّك", "والمحرك"), LBL("musical-keyboard", "الملحّن", "والملحن"), LBL("headphone", "مصمم الصوت", "ومصمم"), gap=70)], transition="cut")

p.go("هالجملة بتغير")
p.add([STACK(I("gear", "قرار", size="m"), T("جملة وحدة… بتغيّر كل قرار", "بتغير", size="m", tone="green"))], transition="whip")

p.go("اثنين دليل")
p.add([ROW(DOC("اثنين", ["role", "ban"], 520), T("2. دليل\nالستايل", "دليل", size="m", tone="green"), gap=60)], transition="whip")

p.go("وبعدها شو بدك")
p.add([DOC("وبعدها", ["role", "ban", "want"], 660, 1150)], transition="cut")

p.go("ثلاثة أعرض")
p.add([ROW(DOC("ثلاثة", ["role", "ban", "want", "board"], 820), T("3. اعرض\nالخطة أول", "أعرض", size="m", tone="green"), gap=50)], transition="whip")

p.go("إذا في شيء")
p.add([STACK(I("wrench", "بتصلحه", size="m"), T("بتصلّحه هون… قبل ما يتعب ويتعبك", "بتصلحه", size="m"))], transition="cut")

p.go("ونفس الأداء")
p.add([ROW(STACK(CLIP("مصدر-برومبت-كسول.mp4", "ونفس", size="m"), T("سطر واحد", "ونفس", size="s"), gap=20),
           STACK(CLIP("مصدر-بريف-تطبيق-الشروق.mp4", "بالبريف", size="m"), T("بريف", "بالبريف", size="s", tone="green"), gap=20), gap=60),
       T("شوف الفرق", "شوف", size="m", tone="green")], transition="zoom")

# ───────────────────────── المستوى 3: المرجع ─────────────────────────
p.go("المستوى الثالث")
p.add([STAIRS("المستوى", 3, at=[p.at("الثالث")] * 4), T("مرجع", "مرجع", size="m", tone="green")], transition="zoom", bg="rays")

p.go("مثل إعلان فيلم")
p.add([ROW(I("clapper-board", "إعلان", size="m"), T("إعلان فيلم عاجبك", "عاجبك", size="m"), gap=60)], transition="cut")

p.go("بس انتبه")
p.add([ROW({"type": "card", "text": "ينسخ المحتوى", "word": p.at("ينسخ")}, I("cross-mark", "المحتوى", size="s"), gap=40),
       T("ياخد الإيقاع ✓", "الإيقاع", size="m", tone="green")], transition="glitch")

p.go("سرعة القطعات")
p.add([{"type": "mc-rhythm", "word": p.at("سرعة"), "title": "الإيقاع",
        "titles": [{"at": 4, "text": "ONE BY ONE"}, {"at": 8, "text": "SIGNAL LOST"}],
        "legend": ["سرعة القطعات", "إيمتى بتنزل العناوين", "الستايل الأساسي"], "sweep": 110}], transition="whip")

p.go("وكلاود ما بيشوف")
p.add([I("eyes", "بيشوف", size="m", tint="gray", corner=F + "cross-mark", cornerAt=p.at("مثلك")),
       T("ما بيشوف الفيديو مثلك", "بيشوف", size="s")], transition="cut")

p.go("بيقطعه للصور")
p.add([{"type": "mc-frames", "word": p.at("بيقطعه"), "frames": ["اطار-ترايلر-1.jpg", "اطار-ترايلر-2.jpg", "اطار-ترايلر-3.jpg", "اطار-ترايلر-4.jpg", "اطار-ترايلر-5.jpg", "اطار-ترايلر-6.jpg"]},
       T("بيقطّعه لصور… ويدرس توقيته", "توقيته", size="m")], transition="whip")

p.go("والنتيجة إعلان")
p.add([CLIP("مصدر-ترايلر-2.mp4", "إعلان", size="xl")], transition="zoom")

p.go("وهيك بتطلع")
p.add([CLIP("مصدر-ترايلر-3.mp4", "بتطلع", size="l"), T("ستايل مو عند حدا", "بستايل", size="m", tone="green")], transition="cut")

# ───────────────────────── المستوى 4: الصوت ─────────────────────────
p.go("المستوى الرابع")
p.add([STAIRS("المستوى", 4, at=[p.at("الرابع")] * 4), T("بيحرّك الشي على الصوت", "يحرك", size="m", tone="green")], transition="zoom", bg="rays")

p.go("بيألف موسيقى")
p.add([ROW(LBL("musical-notes", "موسيقى بالكود", "موسيقى"), I("left-arrow", "وبعدين", size="s"), LBL("high-voltage", "نبضة مع الإيقاع", "نبضة", tone="green"), gap=60)], transition="whip")

p.go("يعني ما عاد")
p.add([CLIP("مصدر-موسيقى-نابضة.mp4", "يعني", size="xl"), T("صار عندك شي حي", "حي", size="m", tone="green")], transition="zoom")

# ───────────────────────── الصراحة ─────────────────────────
p.go("بس خلينا أكون")
p.add([STACK(I("handshake", "صريح", size="m"), T("خليني أكون صريح", "صريح", size="m"))], transition="flash")

p.go("كلاود بيكون قوي")
p.add([{"type": "meter", "label": "قوة النتيجة = قوة اتجاهك", "value": 92, "word": p.at("قوي"), "tone": "green",
        "steps": [{"word": p.at("قوي"), "value": 92}, {"word": p.at("المتوسط"), "value": 45}],
        "marks": [{"at": 45, "text": "متوسط… مثل الكل", "tone": "red", "word": p.at("المتوسط")}]}], transition="whip")

p.go("وكمان مو كل")
p.add([ROW(LBL("counterclockwise-arrows-button", "كم جولة تعديل", "جولة"), I("check-mark-button", "تعديل", size="s", tint="green"), gap=80),
       T("مو كل مرة من أول محاولة", "محاولة", size="s")], transition="cut")

p.go("الأداء استلمت")
p.add([ROW(STACK(I("robot", "استلمت", size="m"), T("الأداة: المونتاج", "المونتاج", size="s"), gap=20),
           STACK({**LOGO, "word": p.at("إلك"), "size": "s"}, T("الذوق: إلك", "إلك", size="m", tone="green"), gap=90), gap=200)], transition="zoom", bg="rays")

# ───────────────────────── التلخيص ─────────────────────────
p.go("خلينا نلخص")
p.add([STAIRS("نلخص", None, at=[p.at("سطر"), p.at("بريف"), p.at("مرجع"), p.at("وصوت")],
              results=["ترند", "هوية", "ستايل ما عند حدا", "حركة حيّة"],
              resultsAt=[p.at("ترنت"), p.at("هوية"), p.at("ستايل"), p.at("حية")])], transition="zoom", bg="rays")

p.go("ونفس القاعدة")
p.add([ROW(LBL("memo", "الكابشن", "الكابشن"), LBL("framed-picture", "الكاروسيل", "والكاروسيل"), LBL("film-frames", "الريلز", "والريل"), gap=90),
       T("نفس القاعدة", "القاعدة", size="s", tone="green")], transition="whip")

p.go("الذكاء الاصطناعي ما بيعرفك")
p.add([ROW(I("robot", "بيعرفك", size="m", corner="?", cornerAt=p.at("بيعرفك")), T("ما بيعرفك…\nإذا ما عطيته بريف عنك", "بيعرفك", size="m"), gap=60),
       T("رح يكتب ويصمم مثل الكل", "يكتب", size="s", tone="red")], transition="glitch")

# ───────────────────────── الجسر + CTA ─────────────────────────
p.go("وهذا بالضبط")
p.add([FILE("غلاف-الدورة.png", "بنبنيه", look="card", size="l"), T("كلود وصناعة المحتوى", "بدورة", size="s", tone="green")], transition="zoom")

p.go("بريث دائم")
p.add([{"type": "mc-doc", "word": p.at("دائم"), "title": "بريف دائم عنك", "h": 660,
        "sections": [
            {"head": "نسخة من عقلك وأسلوبك", "kind": "text", "items": ["Claude بيكتب بصوتك إنت"], "word": p.at("عقلك")},
            {"head": "نظام تصميم بهويتك", "kind": "swatches", "items": ["ألوانك وخطوطك"], "word": p.at("تصميم")},
            {"head": "نظام مونتاج كامل", "kind": "board", "word": p.at("مونتاج"), "approveAt": p.at("الصف")}]}], transition="whip")

p.go("إذا كنت مهتم")
p.add([FILE("صفحة-الدورة.png", "مهتم", look="card", size="l", highlights=[{"x": 59, "y": 49, "w": 16, "h": 8, "tone": "green", "word": p.at("الرابط")}]),
       T("الرابط بالوصف", "الرابط", size="s", tone="green")], transition="whip")

p.go("ومعك ضمان")
p.add([STACK(I("shield", "ضمان", size="l"), T("ضمان 7 أيام", "سبع", size="m", tone="green"))], transition="cut")

p.go("وإذا استفدت")
p.add([STACK({"type": "subscribe", "word": p.at("اشترك"), "clickAt": p.at("بالقناة")}, {"type": "host", "word": p.at("استفدت"), "size": "s"}, gap=40)], transition="whip")

p.save(music_volume=0.07)
