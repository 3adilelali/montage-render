# «80% من كلود: 7 أشياء» (2026-11-04). Skool format + chapter tracker + the long diagrams in MotionCards4.tsx
# (mc-devices, mc-project, mc-prompt, mc-hub, mc-skill, mc-models): Adil asked for drawings that stay and explain.
# Word indices = public/explainer/captions.json after prepare (738 words) + 8 chapter pauses of 2.2s (insert-pauses).
# Run: python scripts/plans/80-من-كلود.py
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

CLAUDE = "logos:claude-icon"
FE = lambda n: f"fluent-emoji-flat:{n}"
COVER = "غلاف-الماستر-كلاس"

scenes = []
def sc(frm, *items, **kw):
    scenes.append({"from": frm, "items": list(items), **kw})

# ---------------- HOOK
sc(0, S(V(CLAUDE, 3, size="l", idle="pulse"), BAN("أغلب الناس بتستعمل كلود", [0, 1, 2, 3], tone="purple")))
sc(4, R(V(CLAUDE, 4, size="l"), T("=", 5, size="l", enter="pop"), V("logos:google-icon", 7, size="l", burst="orange"), gap=70), transition="push")
sc(8, R(BAN("سؤال", [8], tone="purple"), BAN("وجواب", [9], tone="purple"), BAN("وخلص", [10], tone="magenta"), gap=30), transition="through")
sc(11, S({"type": "meter", "value": 8, "label": "اللي عم يستعملوه من قدرات كلود", "word": 14}, BAN("شي بسيط جداً", [14, 15, 16], tone="magenta"), gap=40), transition="push")
sc(19, S({"type": "counter", "to": 7, "word": 22, "frames": 14, "size": "xl"}, BAR("أشياء", [23])), transition="zoom", bg="rays")
sc(24, S({"type": "counter", "to": 80, "suffix": "%", "word": 28, "frames": 22, "rays": True, "size": "xl"}, BAN("من اللي بتحتاجه من كلود", [30, 32, 34], tone="orange")), transition="zoom", bg="rays")
sc(35, S(R(*[DISC(i + 1, w, size="s") for i, w in enumerate([35, 37, 38, 39, 40, 42, 43])], gap=26),
         BAN("من أول مرة… لحد ما يشتغل عنك", [36, 38, 40, 43, 44], tone="orange"), gap=50), transition="push")

# ---------------- 1: المكان الصح
sc(45, {"type": "mc-devices", "word": 45, "labels": ["المتصفح", "الموبايل", "الكمبيوتر"], "at": [51, 53, 55], "pickAt": 60,
        "chips": [{"text": "ملفات جهازك", "word": 69, "icon": FE("open-file-folder")}, {"text": "بيقرأ", "word": 71, "icon": FE("eyes")},
                  {"text": "بيرتّب", "word": 72, "icon": FE("card-index-dividers")}, {"text": "ملفات جديدة", "word": 74, "icon": FE("sparkles")}],
        "badge": {"text": "Claude Code", "word": 82}})
sc(85, R(IC(FE("hammer-and-wrench"), 88, "أدوات"), IC(FE("globe-with-meridians"), 89, "مواقع"), IC(FE("gear"), 90, "أنظمة متكاملة", idle="spin"), gap=90), transition="push")
sc(92, R(V(FE("seedling"), 93, size="l", idle="sway", burst="orange"), BAN("كمبتدئ: ابدأ بكلود العادي", [93, 94, 95, 96], tone="orange")), transition="through")

# ---------------- 2: المشاريع
sc(97, S(V(FE("open-file-folder"), 97, size="l", burst="orange", idle="pulse"), BAN("أهم ميزة للمبتدئ", [99, 100, 101], tone="orange")), transition="push")
sc(102, R(V(FE("busts-in-silhouette"), 102, size="l"), S(BAN("أغلب الناس ما بتستعملها", [102, 103, 105], tone="magenta"), X(105, w=420))), transition="glitch")
sc(106, {"type": "mc-project", "word": 106, "title": "مشروع: صناعة المحتوى",
         "instructions": [{"text": "مين إنت", "word": 115}, {"text": "شو بتشتغل", "word": 117}, {"text": "كيف بدك الجواب", "word": 119}],
         "files": [{"text": "منشوراتك", "word": 126, "icon": FE("memo")}, {"text": "خدماتك", "word": 127, "icon": FE("briefcase")}, {"text": "عن عملك", "word": 133, "icon": FE("page-facing-up")}],
         "chats": [{"text": "محادثة جديدة", "word": 135}, {"text": "محادثة جديدة", "word": 139}, {"text": "محادثة جديدة", "word": 142}],
         "multiAt": 149,
         "projects": [{"text": "صناعة المحتوى", "word": 155, "tone": "orange"}, {"text": "العملاء", "word": 158, "tone": "purple"}, {"text": "شغلك", "word": 160, "tone": "magenta"}]})

# ---------------- 3: الطلب الصح
sc(162, R(V(FE("memo"), 162, size="m", idle="sway"), BAN("الطلب الضعيف: سطر واحد", [162, 163, 164, 165], tone="magenta")), transition="push")
sc(166, S(BAR("الطلب القوي", [166, 167]), R(DISC(4, 169, size="s"), BAN("أشياء", [170], tone="orange"), gap=30), gap=40), transition="through")
sc(171, R(IC(FE("bust-in-silhouette"), 171, "مين إنت والجمهور", 173), IC(FE("bullseye"), 176, "الهدف"), IC(FE("light-bulb"), 177, "مثال"),
          IC(FE("page-facing-up"), 181, "شكل النتيجة", 182), gap=60), transition="push")
sc(183, R(BAN("الطول", [183], tone="purple"), BAN("والنبرة", [184], tone="purple"), BAN("والترتيب", [185], tone="orange"), gap=30), transition="through")
sc(186, {"type": "mc-prompt", "word": 186, "weak": "اكتب لي فكرة بوست", "crossAt": 195, "title": "الطلب القوي",
         "parts": [{"tag": "مين إنت", "text": "أنا مدرب ذكاء اصطناعي", "word": 197, "tone": "purple"},
                   {"tag": "الجمهور", "text": "أصحاب المشاريع والمهتمين باستخدام الـ AI", "word": 201, "tone": "purple"},
                   {"tag": "الهدف", "text": "فكرة مناسبة لهالجمهور، تكون بوست لحسابي على الإنستغرام", "word": 209, "tone": "orange"},
                   {"tag": "مثال", "text": "أمثلة عن بوستات سابقة كتبتها بنفسي", "word": 221, "tone": "magenta"},
                   {"tag": "شكل النتيجة", "text": "ملف تيكست فيه السكربت والكابشن وطريقة التصميم", "word": 228, "tone": "claude"},
                   {"tag": "سر إضافي", "text": "اسألني 3 أسئلة قبل ما تبدأ", "word": 249, "tone": "orange"}]}, transition="push")
sc(255, R(V(FE("thinking-face"), 257, size="l", idle="sway"), BAN("أول إجابة ما عجبتك؟", [256, 257, 259, 260], tone="magenta")), transition="push")
sc(261, R(V(FE("magnifying-glass-tilted-left"), 261, size="l", burst="orange"), BAN("المشكلة بطريقة الطلب", [261, 262, 263], tone="orange")), transition="through")
sc(267, {"type": "bars", "word": 268, "bars": [
    {"label": "رد 1", "value": 45, "word": 268, "tone": "purple"},
    {"label": "رد 2", "value": 70, "word": 271, "tone": "purple"},
    {"label": "رد 3", "value": 94, "text": "بيتحسّن", "word": 273, "tone": "green"}]}, transition="push")

# ---------------- 4: الملفات
sc(275, R(V(FE("bullseye"), 276, size="l", burst="orange"), BAN("اختار النتيجة صح", [276, 277, 281], tone="orange")), transition="push")
sc(282, R(S(V(FE("speech-balloon"), 285, size="m"), X(286, w=220)), ARR(287, w=180, flip=True), S(V(FE("page-facing-up"), 289, size="l", burst="orange"), BAN("ملف جاهز", [289, 290], tone="orange")), gap=50))
sc(291, R(IC(FE("page-facing-up"), 291, "مستند"), IC(FE("clipboard"), 293, "جدول"), IC(FE("globe-with-meridians"), 295, "صفحة"), IC(FE("film-projector"), 297, "عرض"), gap=70), transition="push")
sc(298, S(BAN("وحتى أدوات صغيرة بتشتغل", [298, 299, 300, 301], tone="purple"),
          R(IC(FE("abacus"), 302, "حاسبة"), IC(FE("spiral-calendar"), 304, "تقويم محتوى", 305), IC(FE("rocket"), 307, "صفحة هبوط", 308), gap=80), gap=40))
sc(309, {"type": "mc-prompt", "word": 309, "weak": "اكتب لي خطة", "crossAt": 316, "title": "اطلب النتيجة نفسها",
         "parts": [{"tag": "الأقوى", "text": "اعمل لي ملف خطة جاهزة", "word": 317, "tone": "orange"}]}, transition="push")

# ---------------- MID CTA (chapter row hidden)
sc(322, R(V(CLAUDE, 325, size="l", burst="orange"), BAN("بدك تتعلّم كلود من الأساس؟", [323, 324, 325, 327])), transition="push")
sc(328, R(BAN("بالتفصيل", [328], tone="purple"), BAN("خطوة خطوة", [329, 330], tone="orange"), gap=40))
sc(331, S(F(COVER, 332, look="card", size="xl"), BAN("كورس مجاني كامل", [332, 333, 334], tone="orange")), transition="flash")
sc(335, S(BAN("الرابط بوصف الفيديو", [335, 336, 337], tone="purple"), ARR(336, w=260, rotate=70)))

# ---------------- 5: الموصّلات
APPS = [("logos:google-gmail", "الإيميل", 344), ("logos:google-calendar", "التقويم", 345), ("logos:google-drive", "الملفات", 346),
        ("logos:figma", "التصميم", 347), ("logos:notion-icon", None, 349), ("logos:slack-icon", None, 349), (None, "Canva", 351), ("logos:trello", None, 352)]
OUTER = ["logos:hubspot", "logos:shopify", "logos:dropbox", "logos:zapier-icon", "logos:linkedin-icon", "skill-icons:instagram", "logos:github-icon", "logos:stripe", "logos:whatsapp-icon"]
def hub_nodes(first=None):
    nodes = []
    for icon, label, w in APPS:
        n = {"word": first if first is not None else w}
        if icon: n["icon"] = icon
        else: n["file"] = "canva-شعار"
        if label: n["label"] = label
        nodes.append(n)
    return nodes
sc(338, {"type": "mc-hub", "word": 338, "nodes": hub_nodes() + [{"icon": i, "word": 353} for i in OUTER], "manyAt": 353, "manyLabel": "آلاف التطبيقات"})
sc(359, S(BAR("الموصّلات", [361]), T("Connectors", 363, size="m", tone="green", enter="pop"), gap=30), transition="zoom", bg="rays")
sc(364, R(V(FE("e-mail"), 368, size="l"), S(BAN("تنسخ إيميل وتلصقه", [368, 369, 370], tone="magenta"), X(370, w=420)), gap=50), transition="push")
sc(371, {"type": "mc-hub", "word": 371, "nodes": hub_nodes(371), "task": {"text": "شوف آخر إيميلات العملاء ولخّص لشو بدهم", "word": 373}, "focus": [0]}, transition="through")
sc(386, {"type": "mc-search", "query": "Notion", "result": "ربط ✓ وخلص", "label": "ابحث عن أداتك", "word": 386, "end": 388, "resultAt": 392}, transition="push")
sc(394, R(V(CLAUDE, 394, size="l", idle="pulse", burst="orange"), BAN("بيعمل الشغل المهم جواتها عنك", [396, 398, 399, 400, 401], tone="orange")), transition="through")

# ---------------- 6: المهارات
sc(402, S(V(FE("high-voltage"), 402, size="l", burst="orange", idle="pulse"), BAN("المهارات = السكيلز", [402, 404], tone="orange")), transition="push")
sc(405, R(V(FE("repeat-button"), 408, size="l", idle="spin"), BAN("شغلة كل يوم بنفس الطريقة", [408, 410, 411, 412, 413], tone="purple")), transition="through")
sc(414, R(IC(FE("memo"), 415, "منشور"), IC(FE("speech-balloon"), 417, "رد على عميل", 419), IC(FE("page-facing-up"), 421, "CV", 422), gap=90), transition="push")
sc(424, R(V(FE("repeat-button"), 427, size="l", idle="spin"), BAN("بشكل متكرر", [430, 431], tone="magenta")))
sc(432, {"type": "mc-skill", "word": 432, "title": "مهارة: كتابة منشور", "chat": {"text": "هيك بكتب المنشور… وهي طريقتي بالضبط", "word": 433}, "fileAt": 443,
         "steps": [{"text": "هوك بأول سطر", "word": 444}, {"text": "فكرة وحدة بكل سطر", "word": 445}, {"text": "بنبرتي وكلماتي", "word": 446}],
         "runs": [{"day": "الاثنين", "text": "منشور", "word": 448}, {"day": "الثلاثاء", "text": "منشور", "word": 451}, {"day": "الأربعاء", "text": "منشور", "word": 453}, {"day": "الخميس", "text": "منشور", "word": 455}],
         "stamp": "نفس الطريقة"}, transition="push")
sc(458, R(V(FE("page-facing-up"), 463, size="l", burst="orange"), S(BAN("المهارة = ملف", [458, 463], tone="purple"), R(BAN("الخطوات", [465], tone="orange"), BAN("والقواعد", [466], tone="orange"), gap=20), gap=24), gap=60), transition="push")
sc(467, R(V(CLAUDE, 467, size="l"), ARR(468, w=180, flip=True), V(FE("page-facing-up"), 469, size="l"), BAN("بيرجع لها كل مرة", [468, 470, 471, 472, 473], tone="orange"), gap=40), transition="through")
sc(474, R(V(FE("light-bulb"), 474, size="l", idle="pulse", burst="orange"), BAN("أسهل طريقة لأي مهارة", [474, 475, 476, 478], tone="orange")), transition="push")
sc(479, R(IC(CLAUDE, 480, "اشتغل الشغلة مع كلود", 481), ARR(483, w=160, flip=True), IC(FE("gear"), 484, "بكل تفاصيلها", 485, idle="spin"), gap=50))
sc(486, {"type": "mc-skill", "word": 486, "title": "مهارتك الجديدة", "chat": {"text": "حوّل هالطريقة لمهارة", "word": 487}, "fileAt": 491,
         "steps": [{"text": "الخطوات"}, {"text": "القواعد"}, {"text": "الأخطاء اللي صلّحناها"}]}, transition="push")

# ---------------- 7: الموديل والاشتراك
sc(492, {"type": "mc-models", "word": 492, "autoAt": 546, "autoLabel": "الافتراضي: هو بيختار المناسب", "models": [
    {"name": "Opus", "sub": "الأقوى", "power": 1.0, "speed": 0.4, "use": "للشغل والمهام الصعبة", "word": 499, "tone": "magenta"},
    {"name": "Sonnet", "sub": "اليومي", "power": 0.75, "speed": 0.75, "use": "للمهام العادية والاستخدام اليومي", "word": 506, "tone": "purple"},
    {"name": "Haiku", "sub": "الأخف", "power": 0.45, "speed": 1.0, "use": "للأسئلة السريعة والبسيطة", "word": 519, "tone": "orange"}]}, transition="push")
sc(554, S(BAR("الاشتراك", [555]), R(S(BAN("المجاني", [556], tone="purple"), T("بيكفي لتجرب", 557, size="s", enter="pop"), gap=16),
                                     S(BAN("المدفوع", [566, 567], tone="orange"), T("بيفرق بشكل كبير", 568, size="s", tone="green", enter="pop"), gap=16), gap=120), gap=40), transition="push")
sc(572, R(V("logos:youtube-icon", 575, size="l", burst="orange"), BAN("فيديو كامل: المجاني بيكفيك ولا لازم تدفع؟", [575, 576, 577, 578, 579, 580, 581], tone="orange"), gap=50), transition="through")

# ---------------- SUMMARY
sc(582, {"type": "checklist", "word": 582, "doneAt": 696, "fs": 40, "w": 1150, "row": 96, "items": [
    {"text": "تطبيق الكمبيوتر و Claude Code", "word": 587},
    {"text": "المشاريع: ذاكرة كاملة لشغلك", "word": 600},
    {"text": "الطلب الصح: نتيجة أفضل بوقت أقل", "word": 615},
    {"text": "الملفات: Excel وPDF وأي نوع", "word": 631},
    {"text": "الموصّلات: اربطه بأي تطبيق", "word": 651},
    {"text": "المهارات: بيعملها بطريقتك", "word": 667},
    {"text": "الموديل المناسب لكل مهمة", "word": 686}]}, transition="push")

# ---------------- BRIDGE + CTA
sc(697, R(V(FE("puzzle-piece"), 698, size="l", idle="sway"), BAN("هاي الأساسيات", [697, 698], tone="purple")), transition="trail")
sc(702, R(V(CLAUDE, 705, size="l", burst="orange"), BAN("لما تجمعهم بنظام واحد", [703, 704, 705, 706], tone="orange")), transition="through")
sc(707, R(V(FE("robot"), 711, size="l", idle="bob"), BAN("يشتغل عنك فعلاً", [711, 712, 713], tone="orange")))
sc(714, S(F(COVER, 720, look="card", size="xl"), BAN("كورس مجاني", [720, 721], tone="orange")), transition="flash")
sc(722, R(V(CLAUDE, 724, size="l"), BAN("خطوة بخطوة", [725, 726], tone="purple")))
sc(727, R(V(FE("robot"), 729, size="l", idle="bob"), BAN("وكيف تخليه يشتغل عنك", [727, 728, 729, 730], tone="orange")))
sc(731, S(BAN("الرابط بوصف الفيديو", [731, 732, 733], tone="purple"), ARR(732, w=260, rotate=70)))
sc(734, {"type": "subscribe", "word": 735, "clickAt": 736})

chapters = {
    "endWord": 582,
    "hide": [{"from": 322, "to": 338}],
    "items": [
        {"label": "اختار المكان الصح", "short": "المكان", "word": 45},
        {"label": "المشاريع", "short": "المشاريع", "word": 97},
        {"label": "الطلب الصح", "short": "الطلب الصح", "word": 162},
        {"label": "خليه يعطيك ملفات", "short": "الملفات", "word": 275},
        {"label": "الموصّلات (Connectors)", "short": "الموصّلات", "word": 338},
        {"label": "المهارات (Skills)", "short": "المهارات", "word": 402},
        {"label": "الموديل والاشتراك", "short": "الموديل", "word": 492},
        {"label": "الخلاصة", "word": 582, "bar": False},
    ],
}

plan = json.loads(PLAN.read_text(encoding="utf8"))
PLAN.write_text(json.dumps({"source": plan["source"], "transition": "push", "music": {"volume": 0.07}, "chapters": chapters, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf8")
print("scenes:", len(scenes))
