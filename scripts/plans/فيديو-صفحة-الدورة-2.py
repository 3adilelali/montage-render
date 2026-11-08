# «فيديو صفحة الدورة 2» (2026-11-04): the video on adilelali.com/claudecontent, for people who watched the masterclass.
# Calm version of the Skool style (style §18): fade transitions, long drawings, real screens (course page scroll + click,
# Hotmart checkout), and the offer list as a side column (chapters.side): each item big in the centre, then it flies to the side.
# Word indices = captions.json after prepare (695 words) + 11 chapter pauses of 2.2s (insert-pauses).
# Run: python scripts/plans/فيديو-صفحة-الدورة-2.py
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PLAN = ROOT / "public/explainer/plan.json"

def V(icon, w, **k): return {"type": "visual", "icon": icon, "word": w, **k}
def F(file, w, **k): return {"type": "visual", "file": file, "word": w, **k}
def BAN(text, at, **k): return {"type": "banner", "text": text, "word": at[0], "at": at, **k}
def BAR(text, at, **k): return {"type": "bar3d", "text": text, "word": at[0], "at": at, **k}
def X(at_, **k): return {"type": "xstamp", "word": at_, "float": True, **k}
def S(*items, gap=None): return {"type": "group", "dir": "stack", "items": list(items), **({"gap": gap} if gap else {})}
def R(*items, gap=None): return {"type": "group", "dir": "row", "items": list(items), **({"gap": gap} if gap else {})}
def T(text, w, **k): return {"type": "text", "text": text, "word": w, **k}
def IC(icon, w, label, lw=None, **k): return S(V(icon, w, **k), T(label, lw if lw is not None else w, size="s", enter="pop"))
def CNT(to, w, label, **k): return S({"type": "counter", "to": to, "word": w, "frames": 18, "size": "l", **k}, T(label, w, size="m", enter="pop"), gap=6)

CLAUDE = "logos:claude-icon"
WA = "logos:whatsapp-icon"
FE = lambda n: f"fluent-emoji-flat:{n}"
PAGE = "صفحة-الدورة-كاملة"   # full screenshot of adilelali.com/claudecontent, 1440 wide
URL = "adilelali.com/claudecontent"
# Positions on that screenshot (from the live page): video 298,414 844x475 · offer box top 7934 · WhatsApp box 442,8450 556x81 · buy button 442,8547 556x68
BOX_Y = 8250   # shows the offer list, the WhatsApp box and the buy button

scenes = []
def sc(frm, *items, **kw):
    scenes.append({"from": frm, "items": list(items), **kw})

# ---------------- OPENING
sc(0, S(F("غلاف-الماستر-كلاس", 0, look="card", size="l"), BAN("شفت الورشة المجانية", [4, 5, 6], tone="purple"), gap=40))
sc(7, R(V(CLAUDE, 9, size="l", idle="pulse"), BAN("وشفت كيف كلود بيشتغل عني", [7, 8, 9, 10, 11], tone="orange"), gap=60))
sc(12, R(V(FE("repeat-button"), 15, size="l"), S(BAN("ما رح أعيد الشرح", [13, 15, 16], tone="magenta"), X(16, w=360)), gap=60))
sc(17, S(BAN("رح أجاوبك عالأسئلة", [17, 18, 20], tone="orange"),
         R(IC(FE("speech-balloon"), 20, "الأسئلة اللي وصلتني", 22), IC(FE("busts-in-silhouette"), 24, "من ناس بنفس مكانك", 26), gap=140), gap=50))
sc(28, {"type": "title-3d", "word": 31, "text": "كلود يعمل عنك", "kicker": "انضموا اليوم لـ", "sub": "دورة كلود الشاملة: من الأساس للاحتراف", "subAt": 33}, bg="rays")
sc(35, S(V(FE("relieved-face"), 39, size="l", idle="sway"), BAN("لتاخد قرارك وانت مرتاح", [35, 36, 37, 38, 39], tone="orange"), gap=40))
sc(40, R(V(FE("wrapped-gift"), 42, size="l", burst="orange"), BAN("بمجرد ما تشترك اليوم", [40, 42, 43], tone="purple"), gap=60))

# ---------------- 1: الدورة
sc(44, R(F("غلاف-فيديو-الدورة", 49, look="card", size="l"),
         S(BAN("دورة مسجّلة", [51, 52], tone="orange"), BAN("بشرح مفصّل", [53, 54], tone="purple"), BAN("من الأساسيات للاحتراف", [55, 56, 57], tone="orange"), gap=26), gap=70))
sc(58, S(R(S(V(FE("spiral-calendar"), 61, size="l"), X(61, w=260)), S(V(FE("satellite-antenna"), 63, size="l"), X(64, w=260)), gap=140),
         R(BAN("بأي وقت", [69, 70], tone="orange"), BAN("وأكتر من مرة", [71, 72, 73], tone="orange"), gap=30), gap=50))
sc(74, {"type": "mc-member", "word": 74, "w": 1300, "cover": "غلاف-فيديو-الدورة", "listAt": 74, "progressAt": 78, "progressFrames": 60, "chip": {"text": "حوالي 6 ساعات", "word": 81}})
sc(84, R(V(FE("laptop"), 87, size="l", idle="sway"), S(BAN("كل درس قصير", [84, 85, 86], tone="purple"), BAN("ومصوّر خطوة بخطوة", [87, 89, 90, 91], tone="orange"), gap=26), gap=60))
sc(92, R(V(FE("unlocked"), 95, size="l", burst="orange"), S(BAN("بتدخل فوراً للمنصة", [95, 96, 97], tone="orange"), BAN("والدخول دائم", [98, 99], tone="purple"), gap=26), gap=60))
sc(100, R(V(FE("bell"), 104, size="l", idle="pulse"), S(BAN("أي درس أو تحديث جديد", [101, 102, 103, 104], tone="purple"), BAN("بيوصلك مباشرة", [108, 109, 110], tone="orange"), gap=26), gap=60))
sc(111, S(R(IC(FE("open-file-folder"), 114, "الملفات"), IC(FE("memo"), 115, "البرومبتات"), IC(FE("clipboard"), 118, "انسخ وطبّق"), gap=120),
          BAN("جاهزة تحت كل درس", [112, 113, 116], tone="orange"), gap=40))

# ---------------- 2: نظام القيادة الذاتية
sc(120, {"type": "mc-flow", "word": 125, "nodes": [
    {"label": "بيبحث", "icon": FE("magnifying-glass-tilted-left"), "word": 129},
    {"label": "بيكتب", "icon": FE("writing-hand"), "word": 130},
    {"label": "بيصمم", "icon": FE("artist-palette"), "word": 131},
    {"label": "بينشر عنك", "icon": FE("rocket"), "word": 132}]})
sc(133, R(F("شغلي-كاروسيل.png", 133, look="card", size="m"),
          S(BAN("على منصات السوشال ميديا", [134, 136, 137], tone="orange"), R(V("skill-icons:instagram", 135, size="s"), V("logos:tiktok-icon", 136, size="s"), V("logos:facebook", 137, size="s"), gap=40), gap=30), gap=60))

# ---------------- 3: نظام المونتاج الشامل
sc(139, S(V(FE("clapper-board"), 145, size="l", idle="pulse", burst="orange"), BAN("نظام المونتاج الشامل", [145, 146, 147], tone="orange"), gap=40))
sc(148, R(F("مونتاج-ريل-1.mp4", 150, look="phone", size="m"), S(BAN("أي ستايل مونتاج", [153, 154, 155], tone="orange"), BAN("بيعجبك، مهما كان", [156, 157, 158], tone="purple"), gap=26),
          F("مونتاج-ريل-2.mp4", 155, look="phone", size="m"), gap=50))
sc(159, R(F("شغلي-ريل-خطة.mp4", 162, look="phone", size="m"),
          S(BAN("فيديوهات طولية", [162, 163], tone="orange"), R(V("skill-icons:instagram", 165, size="s"), V("logos:tiktok-icon", 168, size="s"), V(FE("mobile-phone"), 171, size="s"), gap=40), gap=30), gap=70))
sc(173, S(F("مونتاج-يوتيوب-1.mp4", 176, look="card", size="l"), R(V("logos:youtube-icon", 179, size="s"), BAN("وفيديوهات يوتيوب", [179, 180], tone="orange"), gap=24), gap=30))

# ---------------- 4: المختبر
sc(181, S(V(FE("test-tube"), 189, size="l", idle="pulse", burst="orange"), BAN("محور منفصل", [193, 194], tone="purple"), gap=40))
sc(195, R(IC(CLAUDE, 197, "كلود بيتغيّر", 198), IC(FE("sparkles"), 201, "ميزة جديدة", 202), IC(FE("books"), 204, "درس مهم", 205), IC(FE("light-bulb"), 207, "طريقة احترافية", 210), gap=90))
sc(213, {"type": "mc-member", "word": 213, "w": 1300, "cover": "غلاف-فيديو-الدورة", "listAt": 213, "listFrames": 2, "focus": 13, "focusAt": 216, "chip": {"text": "بيتحدّث بشكل دائم", "word": 222}})

# ---------------- 5: مجتمع واتساب
sc(225, S(V(WA, 230, size="l", idle="pulse"), BAN("مجتمع واتساب للتحديثات", [230, 231, 233], tone="orange"), gap=40))
sc(234, {"type": "mc-community", "word": 234, "logo": "شعاري-2026-11-03", "posts": [
    {"text": "تحديث مهم بكلود", "emoji": "📢", "word": 239}, {"text": "أداة ذكاء اصطناعي بتستاهل", "emoji": "🛠️", "word": 242}, {"text": "ملاحظة صوتية مني", "emoji": "🎙️", "word": 246}]})
sc(248, R(V(FE("eyes"), 250, size="l", idle="sway"), BAN("متابع لأي تطوّر", [249, 250, 251, 252], tone="orange"), V(CLAUDE, 255, size="m"), gap=50))

# ---------------- 6: البونص لأول 100
sc(258, S(V(FE("bullseye"), 259, size="l", burst="orange"), BAN("ركّز معي، هاد مهم جداً", [258, 259, 266, 267], tone="orange"), gap=40))
sc(268, S({"type": "counter", "to": 100, "word": 271, "frames": 22, "size": "xl", "rays": True}, BAN("أول 100 مشترك", [271, 272, 273], tone="orange"), gap=20), bg="rays")
sc(274, S(V(FE("wrapped-gift"), 277, size="l", burst="orange", idle="pulse"), R(BAN("بونص كهدية", [276, 277], tone="purple"), BAN("قيمة عالية جداً", [283, 284, 285], tone="orange"), gap=30), gap=40))
sc(286, R({"type": "host", "word": 286, "size": "l"},
          S(BAN("دعم شخصي مني", [290, 291, 292], tone="orange"), R(V(WA, 298, size="s"), BAN("على رقمي الشخصي", [294, 295, 296], tone="purple"), gap=20), BAN("لمدة 30 يوم", [300, 301, 302], tone="orange"), gap=26), gap=70))
sc(303, {"type": "mc-flow", "word": 303, "nodes": [
    {"label": "بتشوف الفيديوهات", "icon": FE("play-button"), "word": 303},
    {"label": "بتطبّق", "icon": FE("hammer-and-wrench"), "word": 306},
    {"label": "واجهتك مشكلة؟", "icon": FE("thinking-face"), "word": 307},
    {"label": "بتحكيني مباشرة", "icon": WA, "word": 310}]})
sc(313, R(V(FE("building-construction"), 315, size="l"), S(BAN("بدك تبني نظام جديد؟", [313, 315, 316, 317], tone="purple"), BAN("اسألني، وبساعدك بكل التفاصيل", [323, 327, 328, 329, 330], tone="orange"), gap=26), gap=60))
sc(331, {"type": "checklist", "word": 331, "doneAt": 349, "fs": 40, "w": 1000, "row": 92, "items": [
    {"text": "شفت الشرح", "word": 339},
    {"text": "تعلّمت", "word": 341},
    {"text": "طبّقت", "word": 342},
    {"text": "النظام اشتغل معك", "word": 343},
    {"text": "بلا أي مشكلة", "word": 346}]})

# ---------------- هل بيناسبني؟
sc(351, R(IC(FE("building-construction"), 356, "شركة مقاولة"), IC(FE("fork-and-knife-with-plate"), 360, "مطعم"), IC(FE("health-worker"), 362, "طبيب"), IC(FE("teacher"), 364, "مدرب"), gap=90))
sc(366, R(IC(FE("video-camera"), 367, "صانع محتوى"), IC("logos:youtube-icon", 372, "قناة يوتيوب"), IC(FE("office-worker"), 376, "موظف"), IC(FE("seedling"), 386, "بلا خبرة تقنية", 389), gap=90))
sc(397, R(V(FE("thinking-face"), 397, size="l", idle="sway"), BAN("هل البرنامج فعلاً بيفيدني؟", [397, 398, 399, 400, 401], tone="purple"), gap=60))
sc(402, S({"type": "counter", "to": 100, "suffix": "%", "word": 403, "frames": 20, "size": "xl", "rays": True}, BAN("بيفيدك", [405], tone="orange"), gap=20), bg="rays")
sc(406, R(S(BAN("مو بنوع المجال", [407, 408, 409], tone="magenta"), X(409, w=380)), gap=40))
sc(410, R(V(CLAUDE, 417, size="l", idle="pulse", burst="orange"), BAN("كلود يشتغل عنك جوّا أي أداة", [416, 417, 418, 419, 421, 422], tone="orange"), gap=60))
sc(424, S(BAR("صاحب مشروع", [426, 427]), R(IC(FE("fork-and-knife-with-plate"), 428, "مطعم"), IC(FE("hospital"), 429, "عيادة"), IC(FE("convenience-store"), 430, "متجر"), IC(FE("handshake"), 431, "مقدّم خدمة", 432), gap=90), gap=40))
sc(433, R(V(CLAUDE, 433, size="l"), {"type": "checklist", "word": 434, "fs": 38, "w": 760, "row": 84, "items": [
    {"text": "المحتوى", "word": 436}, {"text": "التصاميم", "word": 437}, {"text": "المونتاج", "word": 438},
    {"text": "الرد على عملائك", "word": 439}, {"text": "الحملات الإعلانية", "word": 444}]}, gap=80))
sc(448, S(BAR("صانع محتوى", [451, 452]), R(IC(FE("light-bulb"), 460, "الأفكار"), IC(FE("writing-hand"), 461, "السكربت"), IC(FE("clapper-board"), 462, "المونتاج"), gap=110), gap=40))
sc(463, R(V(FE("stopwatch"), 466, size="l", idle="pulse"), S(BAN("نفس الجودة", [464, 465], tone="orange"), BAN("وبوقت أقل", [466, 467], tone="orange"), gap=26), gap=60))
sc(468, S(BAR("موظف أو فريلانسر", [470, 471, 472]), BAN("مستوى احترافي بالذكاء الاصطناعي", [476, 477, 478, 479], tone="purple"), gap=40))
sc(480, R(V(FE("robot"), 483, size="l", idle="bob"), BAN("موظفين لكل مهمة بتتكرر", [482, 483, 484, 485, 486], tone="orange"), gap=60))

# ---------------- الربط مع أدواتك
OUTER = ["logos:google-gmail", "logos:slack-icon", "logos:shopify", "logos:hubspot", "logos:dropbox", "logos:zapier-icon", "logos:linkedin-icon", "logos:trello", WA]
sc(488, {"type": "mc-hub", "word": 488, "manyAt": 509, "manyLabel": "وغيرها آلاف الأدوات", "nodes": [
    {"icon": "logos:meta-icon", "label": "ميتا", "word": 497}, {"icon": "skill-icons:instagram", "label": "إنستغرام", "word": 499},
    {"file": "canva-شعار", "label": "Canva", "word": 501}, {"icon": "logos:figma", "label": "Figma", "word": 503},
    {"icon": "logos:notion-icon", "label": "Notion", "word": 505}, {"icon": "logos:google-drive", "label": "Drive", "word": 507}]
    + [{"icon": i, "word": 510} for i in OUTER]})
sc(512, {"type": "mc-flow", "word": 512, "nodes": [
    {"label": "كلود", "icon": CLAUDE, "word": 513},
    {"label": "أداة صور", "icon": FE("framed-picture"), "word": 518},
    {"label": "أداة فيديو", "icon": FE("film-projector"), "word": 519},
    {"label": "النتيجة", "icon": FE("sparkles"), "word": 527}]})

# ---------------- كيف تشترك
sc(530, S(V(FE("footprints"), 535, size="l", idle="sway"), BAN("أهم خطوة ممكن تاخدها لهالسنة", [534, 535, 536, 538, 539], tone="orange"), gap=40))
sc(540, {"type": "mc-page", "word": 540, "file": PAGE, "url": URL, "w": 1500, "h": 820, "viewX": 270, "viewW": 900, "startY": 330,
         "scroll": [{"y": BOX_Y, "word": 552, "frames": 50}],
         "highlights": [{"x": 298, "y": 414, "w": 844, "h": 475, "word": 550, "label": "هالفيديو", "tone": "purple"},
                        {"x": 442, "y": 8547, "w": 556, "h": 68, "word": 556, "label": "اضغط هون"}],
         "cursor": {"x": 720, "y": 8581, "word": 555}, "clickAt": 559})
sc(559, {"type": "mc-page", "word": 559, "file": "صفحة-الدفع-هوتمارت", "url": "pay.hotmart.com", "imgW": 668, "w": 900, "h": 820, "startY": 0,
         "scroll": [{"y": 490, "word": 562, "frames": 40}],
         "highlights": [{"x": 16, "y": 520, "w": 636, "h": 332, "word": 564},
                        {"x": 16, "y": 861, "w": 636, "h": 56, "word": 570},
                        {"x": 16, "y": 925, "w": 636, "h": 56, "word": 572}]})
sc(574, {"type": "mc-page", "word": 574, "file": PAGE, "url": URL, "w": 1500, "h": 820, "viewX": 270, "viewW": 900, "startY": BOX_Y,
         "highlights": [{"x": 442, "y": 8450, "w": 556, "h": 81, "word": 578, "label": "ما عندك بطاقة؟"}]})
sc(582, R(BAN("فودافون كاش", [587], tone="orange"), BAN("شام كاش", [589], tone="orange"), BAN("وغيرها", [591], tone="purple"), gap=30))
sc(592, {"type": "mc-page", "word": 592, "file": PAGE, "url": URL, "w": 1500, "h": 820, "viewX": 270, "viewW": 900, "startY": BOX_Y,
         "highlights": [{"x": 442, "y": 8450, "w": 556, "h": 81, "word": 593, "label": "واتساب"}],
         "cursor": {"x": 760, "y": 8490, "word": 593}, "clickAt": 597})

# ---------------- بعد الدفع
sc(605, {"type": "mc-email", "word": 605, "from": "Adil Elali", "subject": "أهلاً فيك، دورتك جاهزة", "title": "دورتك",
         "lines": ["أهلاً فيك،", "وصولك لدورة «كلود يعمل عنك» صار جاهز."],
         "steps": [{"text": "اكبس على زر «ادخل على الدورة» تحت."}, {"text": "بيطلب منك تعيّن كلمة سر خاصة فيك."}, {"text": "بعدها بتدخل مباشرة على دروسك."}],
         "button": "ادخل على الدورة", "arriveAt": 609, "openAt": 611, "clickAt": 614})
sc(616, {"type": "mc-member", "word": 616, "cover": "غلاف-فيديو-الدورة", "listAt": 619, "listFrames": 5, "chip": {"text": "ترجع لهم بأي وقت", "word": 624}})
sc(628, R(IC(FE("books"), 629, "الدورة"), IC(FE("robot"), 630, "القيادة الذاتية"), IC(FE("clapper-board"), 631, "المونتاج"), IC(FE("test-tube"), 633, "المختبر"), gap=90))
sc(639, S(V(FE("rocket"), 641, size="l", burst="orange", idle="bob"), BAN("بتبلّش بنفس اليوم", [640, 641, 642, 643], tone="orange"), gap=40))

# ---------------- السعر
sc(644, {"type": "mc-price", "word": 644, "old": "150$", "now": "47$", "strikeAt": 654, "newAt": 664,
         "tag": "دفعة وحدة · دخول دائم", "tagAt": 666, "seal": "خصم\n68%\n", "sealAt": 657}, bg="rays")
sc(677, R({"type": "host", "word": 677, "size": "m"}, BAN("ومعه الدعم الشخصي 30 يوم", [677, 678, 679, 680, 681], tone="orange"), gap=60))
sc(682, {"type": "mc-page", "word": 682, "file": PAGE, "url": URL, "w": 1500, "h": 820, "viewX": 270, "viewW": 900, "startY": 7990, "scroll": [{"y": BOX_Y, "word": 685, "frames": 30}],
         "highlights": [{"x": 442, "y": 8547, "w": 556, "h": 68, "word": 686, "label": "اضغط هون"}],
         "cursor": {"x": 720, "y": 8581, "word": 686}, "clickAt": 688})
sc(691, S({"type": "host", "word": 691, "size": "l"}, BAN("بشوفك جوّا", [691, 692], tone="orange"), gap=30))

chapters = {
    "corner": True,   # 2026-11-04 Adil: no pauses, no full-screen cards; topic title top-left from its word
    "endWord": 691,
    "items": [
        {"label": "الدورة الكاملة", "short": "الدورة", "word": 44, "kicker": "أول شي"},
        {"label": "نظام القيادة الذاتية", "short": "القيادة الذاتية", "word": 120, "kicker": "تاني شي"},
        {"label": "نظام المونتاج الشامل", "short": "نظام المونتاج", "word": 139, "kicker": "تالت شي"},
        {"label": "المختبر", "short": "المختبر", "word": 181, "kicker": "رابع شي"},
        {"label": "مجتمع واتساب للتحديثات", "short": "مجتمع واتساب", "word": 225, "kicker": "خامس شي"},
        {"label": "دعم شخصي مني 30 يوم", "short": "دعم 30 يوم", "word": 258, "kicker": "هدية لأول 100"},
        {"label": "هل البرنامج بيناسبني؟", "word": 351, "bar": False},
        {"label": "اربط كلود بأدواتك", "word": 488, "bar": False},
        {"label": "كيف تشترك؟", "word": 530, "bar": False},
        {"label": "بعد الدفع شو بيصير؟", "word": 605, "bar": False},
        {"label": "السعر", "word": 644, "bar": False},
    ],
}

plan = json.loads(PLAN.read_text(encoding="utf8"))
PLAN.write_text(json.dumps({"source": plan["source"], "transition": "fade", "music": {"volume": 0.06}, "chapters": chapters, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf8")
print("scenes:", len(scenes))
