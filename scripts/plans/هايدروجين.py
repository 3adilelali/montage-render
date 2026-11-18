# «أنيميشن وألعاب 3D مجاناً بـ Gemini 4 Hydrogen» (2026-11-18). Lesson «درس كامل», 3 levels, screen-first.
# Voice: intro (22-07-05) + main (21-47-16) + outro (22-11-15) joined → eleven-cut (1485 words) + 6 show-pauses (603 s).
# Screen clips come from المدخلات/مقطّع/ (already free of every OBS frame and taskbar preview; checked frame by frame).
# Energetic hook 0–160 → calm teaching 161–1360 → energetic close 1361–1484.
# Run: python scripts/plans/هايدروجين.py [--clips]
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CH = ROOT.parent
PLAN = ROOT / "public/explainer/plan.json"
CAP = json.loads((ROOT / "public/explainer/captions.json").read_text(encoding="utf8"))
SRC = CH / "المدخلات/مقطّع"
OUTD = CH / "العناصر/هايدروجين"
OUTD.mkdir(parents=True, exist_ok=True)
CLIPS = {int(p.name[:2]): p for p in SRC.glob("*.mp4")}

def wt(i): return CAP[i]["startMs"] / 1000 - 0.1

def V(icon, w, **k): return {"type": "visual", "icon": icon, "word": w, **k}
def T(text, w, **k): return {"type": "text", "text": text, "word": w, **k}
def BAN(text, at, **k): return {"type": "banner", "text": text, "word": at[0], "at": at, **k}
def BAR(text, at, **k): return {"type": "bar3d", "text": text, "word": at[0], "at": at, **k}
def DISC(n, w, **k): return {"type": "disc", "text": str(n), "word": w, **k}
def X(at_, **k): return {"type": "xstamp", "word": at_, "float": True, **k}
def ARR(at_, **k): return {"type": "arrow", "word": at_, **k}
def S(*items, gap=None): return {"type": "group", "dir": "stack", "items": list(items), **({"gap": gap} if gap else {})}
def R(*items, gap=None): return {"type": "group", "dir": "row", "items": list(items), **({"gap": gap} if gap else {})}
def IC(icon, w, label, lw=None, size=None, **k):
    return S(V(icon, w, **({"size": size} if size else {}), **k), T(label, lw if lw is not None else w, size="s"))
def CNT(to, w, label, **k): return S({"type": "counter", "to": to, "word": w, "size": k.pop("size", "xl"), **k}, T(label, w, size="s"), gap=6)

FE = lambda n: f"fluent-emoji-flat:{n}"
GEM = "logos:google-gemini"
CLAUDE = "logos:claude-icon"
GOOGLE = "logos:google-icon"

scenes, clips = [], []
def sc(frm, *items, **kw): scenes.append({"from": frm, "items": list(items), **kw})

# Crops of the 1920×1080 browser recording. Email (bottom-left of the AI Studio home) and the owner row of the
# Share dialog are blurred. The tab bar, URL bar and Windows taskbar are always cut off.
EMAIL = "[m];[m]split[a][b];[b]crop=300:50:0:880,boxblur=10:3[e];[a][e]overlay=0:880"
SHARE = ",split[a][b];[b]crop=530:60:1385:247,boxblur=12:3[e2];[a][e2]overlay=1385:247"
LOOK = {
    # whole AI Studio page (home / build / share), 1920×942
    "page": ("crop=1920:942:0:88,split[m0][m1];[m1]crop=320:60:0:875,boxblur=12:3[e];[m0][e]overlay=0:875" + SHARE
             + ",scale=1640:806:flags=lanczos", 1640, 806),
    # chat column of the app view, 540×860
    "chat": ("crop=540:860:0:170,scale=560:892:flags=lanczos,unsharp=5:5:0.5", 560, 892),
    # preview pane of the app view, 1380×855
    "prev": ("crop=1380:855:540:175,scale=1420:880:flags=lanczos", 1420, 880),
    # app view, both panes (no tab bar, no taskbar)
    "app": ("crop=1920:942:0:88,scale=1640:806:flags=lanczos", 1640, 806),
    # fullscreen preview of the vertical Burj short
    "fs": ("crop=720:895:600:135,scale=680:846:flags=lanczos,unsharp=5:5:0.4", 680, 846),
    # fullscreen game tab (shared link)
    "game": ("crop=1920:942:0:88,scale=1640:806:flags=lanczos", 1640, 806),
    # the downloaded 720×1280 video
    "vert": ("scale=506:900:flags=lanczos", 506, 900),
}

def CLIP(scene, n, kind, a, b=None, speed_max=None, **sh):
    """Clip n of المقطّع, local seconds [a,b] (b=None → still frame at a), fitted to the scene that starts at word `scene`."""
    name = f"هيد-{len(clips) + 1:02d}"
    clips.append({"name": name, "n": n, "kind": kind, "a": a, "b": b if b is not None else a + 0.1, "from": scene,
                  "still": b is None, "smax": speed_max})
    _, w, h = LOOK[kind]
    d = {"type": "shot", "file": name, "word": scene, "w": w, "h": h, "loop": False}
    if "pointer" in sh: sh["pointer"] = [{"word": p[0], "x": p[1], "y": p[2]} for p in sh["pointer"]]
    if "zoom" in sh: sh["zoom"] = [{"word": z[0], "x": z[1], "y": z[2], "s": z[3]} for z in sh["zoom"]]
    d.update(sh)
    return d

# =============================== HOOK (0–160): energy
sc(0, R(CLIP(0, 10, "prev", 3, 10, w=560, h=347), CLIP(0, 14, "fs", 10, 17, w=300, h=387),
        CLIP(0, 19, "game", 60, 67, w=560, h=275), gap=40), transition="zoom")
sc(9, S(R(S(IC(FE("desktop-computer"), 13, "برنامج 3D", size="l"), X(14, w=170)),
          S(IC(FE("film-projector"), 16, "مولّد فيديو", size="l"), X(18, w=170)), gap=140),
        BAN("جملة بالعربي… ومجاناً", [19, 22, 23, 24], tone="orange"), gap=50), transition="push")
sc(25, S(T("بهالدرس… بإيدك", 25, size="m"), BAR("3 مستويات", [31, 32]), gap=40), transition="zoom", bg="rays")
sc(33, R(CLIP(33, 4, "prev", 14, 21, w=900, h=558), S(DISC(1, 33), T("مشهد 3D", 35, size="l"),
                                                      T("بتحرّكه بالماوس… وبتعدّله بجملة", 38, size="s"), gap=16), gap=70), transition="push")
sc(43, R(CLIP(43, 20, "vert", 4, 12, w=330, h=587), S(DISC(2, 43), T("شورت 3D\nبرج خليفة", 45, size="l"),
                                                       T("فيديو جاهز تنشره", 52, size="s", tone="green"), gap=16), gap=90), transition="push")
sc(59, R(CLIP(59, 19, "game", 70, 78, w=900, h=442), S(DISC(3, 59), T("لعبة كاملة", 61, size="l"),
                                                        T("بتبعتها برابط لصحابك", 63, size="s", tone="green"), gap=16), gap=70), transition="push")
sc(71, R(S(V(FE("camera-with-flash"), 75, size="xl"), {"type": "visual", "icon": FE("locked"), "word": 75, "size": "s"}),
         S(BAN("سر صغير", [75, 76], tone="orange"), T("نتيجة أحسن بكثير", 78, size="m"),
           T("بلا ما تكتب الطلب من جديد", 81, size="s"), gap=20), gap=80), transition="flash")
sc(88, S(R(IC(FE("e-mail"), 91, "حساب Gmail", size="l"), gap=0),
         R(S(IC(FE("laptop"), 94, "برمجة", size="m"), X(94, w=110)), S(IC(FE("package"), 96, "تنصيب", size="m"), X(96, w=110)),
           S(IC(FE("credit-card"), 98, "اشتراك", size="m"), X(98, w=110)), gap=100), gap=40), transition="push")
sc(99, S(T("ليش الآن؟", 99, size="l"), V(FE("chart-increasing"), 109, size="l"), gap=30), transition="glitch")
sc(111, R(S({"type": "counter", "to": 11, "word": 116, "suffix": "M", "size": "xl", "rays": True}, T("مشاهدة", 122, size="m"), gap=6),
          S(T("قناة أجنبية… عمرها أسبوعين", 111, size="m"), T("أنيميشن 3D لبنايات مشهورة", 123, size="s"),
            T("بنفس الطريقة", 130, size="s", tone="green"), gap=18), gap=90), transition="zoom", bg="rays")
sc(133, R(V(GOOGLE, 135, size="l"), S(T("نموذج جديد من أيام: Gemini 4", 133, size="m"), BAR("Hydrogen", [140, 141, 142]),
                                       T("مجاني… وقوي بهالشغلة", 143, size="s", tone="green"), gap=18), gap=80), transition="push")
sc(148, S(BAN("ببلاش، وبالعربي، وطريقة مجرّبة", [148, 154, 155, 156], tone="purple"), T("يلا نبلّش", 159, size="l", tone="green"), gap=40),
   transition="zoom")

# =============================== 1: الأداة (161–244) — calm from here
sc(161, CLIP(161, 1, "page", 0.2, 8.5, label="aistudio.google.com", labelBelow=True,
             pointer=[(169, 50, 6), (175, 50, 40), (181, 38, 50)]), transition="push")
sc(188, CLIP(188, 2, "page", 0, 9, label="Build ← New app", labelBelow=True, pointer=[(188, 4, 24), (196, 50, 52)]), transition="fade")
sc(205, CLIP(205, 1, "page", 9.5, 14.5, label="Gemini 4 Hydrogen", labelBelow=True, pointer=[(205, 55, 30)],
             zoom=[(207, 55, 30, 1.6)]), transition="fade")
sc(222, R(CLIP(222, 1, "page", 14.5, 22, w=1180, h=579, pointer=[(225, 6, 84)], zoom=[(226, 15, 80, 1.7)]),
          S(BAN("Gemini 4 Carbon", [228, 229, 230, 231], tone="magenta", fs=44), T("هذا المدفوع", 232, size="m"),
            T("وما منحتاجه أبداً", 235, size="s"), T("كل الدرس بالمجاني ✓", 238, size="s", tone="green"), gap=20), gap=50), transition="fade")

# =============================== 2: المستوى 1 — الصحراء (245–542)
sc(245, R(CLIP(245, 4, "prev", 14, 26, w=1100, h=682), S(DISC(1, 245), T("مشهد 3D\nبتحرّكه بإيدك", 251, size="l"), gap=16), gap=60), transition="push")
sc(256, R(CLIP(256, 3, "page", 0, 2, w=1180, h=579, zoom=[(266, 50, 47, 1.9)], pointer=[(266, 45, 48)]),
          S(T("بالعربي عادي", 258, size="m"), T("مثل ما بتحكي مع أي حدا", 260, size="s"), gap=16), gap=50), transition="fade")
sc(297, R(CLIP(297, 3, "page", 1, w=1100, h=540, zoom=[(297, 50, 47, 1.9)]),
          S(T("لاحظ شو حكيتله:", 297, size="m"),
            {"type": "checklist", "items": [{"text": "المكان", "word": 303}, {"text": "الوقت", "word": 304},
                                            {"text": "شو بالمشهد", "word": 305}, {"text": "كيف بتتحكّم", "word": 308}], "word": 301, "fs": 46, "w": 520},
            T("الطلب أوضح = نتيجة أقرب", 312, size="s", tone="green"), gap=20), gap=50), transition="fade")
sc(322, S(BAN("كل البرومبتات بوصف هالفيديو", [322, 324, 329, 330, 331], tone="orange"), V(FE("backhand-index-pointing-down"), 331, size="l"), gap=20), transition="fade")
sc(336, R(CLIP(336, 3, "app", 8, 20.9, w=1180, h=579), S(T("هو بيكتب الكود لحاله", 341, size="m"),
          S({"type": "counter", "to": 3, "word": 349, "size": "l"}, T("دقايق تقريباً", 351, size="s"), gap=4),
          T("وما في داعي تفهم ولا سطر", 352, size="s", tone="green"), gap=20), gap=50), transition="fade")
sc(365, CLIP(365, 4, "prev", 0, 37.3, label="النتيجة: صحراء 3D بتحرّكها بالماوس", labelBelow=True,
             pointer=[(376, 50, 50), (386, 77, 93)]), transition="fade")
sc(397, R(V(FE("memo"), 401, size="l"), S(T("بدك تغيّر شي؟", 401, size="m"), T("ما بتعيد الطلب من الأول", 405, size="m"),
          BAN("التعديل = جملة وحدة", [410, 412, 413, 414], tone="orange"), gap=20), gap=70), transition="fade")
sc(420, R(CLIP(420, 5, "chat", 0, 15.1, w=480, h=764), S(DISC(1, 420, size="s"), T("قافلة 3 جمال", 424, size="m"),
          T("والرمل بيتحرّك مع الهوا", 432, size="s"), gap=16), gap=80), transition="fade")
sc(437, CLIP(437, 6, "app", 12, 26, label="أقل من دقيقتين… والقافلة ماشية", labelBelow=True), transition="fade")
sc(453, R(CLIP(453, 7, "chat", 0, 7.8, w=480, h=764), S(DISC(2, 453, size="s"), T("خيمة ونار مولّعة", 459, size="m"), gap=16), gap=80), transition="fade")
sc(463, CLIP(463, 8, "prev", 4, 14, label="الخيمة والنار بتضوي بالليل", labelBelow=True), transition="fade")
sc(475, R(CLIP(475, 9, "chat", 0, 16.6, w=480, h=764), S(DISC(3, 475, size="s"), T("جولة سينمائية\n15 ثانية", 482, size="m"),
          T("وبعدين ترجع لإيدك", 493, size="s"), gap=16), gap=80), transition="fade")
sc(496, CLIP(496, 10, "prev", 0, 41.3, label="جولة الكاميرا… كأنها درون", labelBelow=True), transition="fade")
sc(520, R(CNT(4, 521, "رسائل بس"), S(T("مشهد 3D كامل بإيدك", 524, size="m"),
          R(S(IC(FE("desktop-computer"), 533, "برنامج 3D", size="m"), X(534, w=110)), S(IC(FE("money-bag"), 538, "ولا قرش", size="m"), X(540, w=110)), gap=80),
          gap=24), gap=110), transition="fade")

# =============================== 3: المستوى 2 — برج خليفة (543–1003)
sc(543, R(CLIP(543, 20, "vert", 0, 20, w=380, h=676), S(T("شي بينشر على طول", 545, size="m"), T("فيديو طولي لبرج خليفة", 553, size="s"),
          BAN("وسر بسيط", [557, 559, 560, 561], tone="orange"), T("قليل اللي بيحكوا عنه", 566, size="s"), gap=20), gap=90), transition="push")
sc(570, R(CLIP(570, 11, "page", 0, 14, w=1180, h=579, pointer=[(583, 3, 24)], zoom=[(594, 50, 47, 1.8)]),
          S(DISC(2, 570), T("كيف انبنى\nبرج خليفة؟", 579, size="l"), T("مشروع جديد + Hydrogen", 583, size="s"), gap=16), gap=50), transition="push")
sc(603, R(CLIP(603, 11, "page", 13.5, w=1000, h=491, zoom=[(603, 50, 47, 1.8)]),
          {"type": "checklist", "items": [{"text": "عمودي 9:16، 20 ثانية", "word": 605}, {"text": "طابق ورا طابق", "word": 612},
                                          {"text": "عداد طوابق وطول", "word": 618}, {"text": "خلفية دبي وقت الغروب", "word": 625},
                                          {"text": "4 جمل بالعربي", "word": 629}, {"text": "828 م • 163 طابق • 2010", "word": 637}],
           "word": 603, "fs": 40, "w": 640}, gap=40), transition="fade")
sc(642, R(S(V(FE("mobile-phone"), 643, size="xl"), T("9:16", 644, size="m")),
          R(IC("logos:instagram-icon", 650, "Reels", size="m"), IC("logos:youtube-icon", 652, "Shorts", size="m"),
            IC("logos:tiktok-icon", 654, "TikTok", size="m"), gap=60), gap=100), transition="fade")
sc(660, R(V(FE("robot"), 666, size="l"), S(T("ليش كتبتله الأرقام بنفسي؟", 660, size="m"), T("الذكاء الاصطناعي ممكن يغلط بالأرقام", 665, size="s"),
          T("بعطيه الرقم الصح من الأول ✓", 674, size="s", tone="green"), gap=18), gap=70), transition="fade")
sc(686, R(CLIP(686, 11, "app", 15.3, 27.3, w=1180, h=579), S({"type": "counter", "to": 4, "word": 690, "size": "xl"}, T("دقايق تقريباً", 691, size="s"), gap=4), gap=60), transition="fade")
sc(692, CLIP(692, 12, "fs", 3.6, 30.8, label="أول نتيجة", labelBelow=True), transition="fade")
sc(712, R(CLIP(712, 12, "fs", 30.6, w=520, h=671),
          S(BAN("بس إذا دقّقت…", [712, 713, 714], tone="magenta"), T("الخلفية ما بتبين إنها دبي", 720, size="m"),
            T("كم مكعب حوالين البرج بس", 725, size="s"), T("والكتابة صغيرة على الموبايل", 730, size="s"), gap=20), gap=80), transition="fade")
sc(734, R(S(V(FE("writing-hand"), 751, size="l"), X(758, w=170)), S(T("أغلب الناس لما النتيجة ما بتعجبهم", 743, size="m"),
          T("بيرجعوا يكتبوا الطلب من الأول… أطول", 751, size="s"), BAN("وهذا مو الحل", [758, 759, 760], tone="magenta"), gap=20), gap=80), transition="glitch")
sc(761, CLIP(761, 13, "page", 2.5, 23.5, label="⭐ السر: لقطة شاشة… وبتلصقها بخانة الكتابة", labelBelow=True), transition="flash")
sc(781, R(CLIP(781, 13, "chat", 24.7, 41, w=520, h=828), S(T("وبتحكيله شو الغلط بالضبط", 781, size="m"),
          {"type": "checklist", "items": [{"text": "الخلفية ما بتبين دبي", "word": 795}, {"text": "ناطحات سحاب", "word": 800},
                                          {"text": "كبّر الكتابة", "word": 805}, {"text": "الكاميرا تلف حوالين البرج", "word": 807}],
           "word": 795, "fs": 42, "w": 560}, gap=20), gap=70), transition="fade")
sc(811, S(R(S(V(FE("robot"), 814, size="l"), T("كتب كود… وما شاف النتيجة", 821, size="s"), gap=8), ARR(825, w=110, flip=True),
            S(V(FE("framed-picture"), 826, size="l"), T("لما تورجيه الصورة", 826, size="s"), gap=8), gap=80),
          T("بيعرف شو الغلط بالضبط ✓", 828, size="m", tone="green"), T("بدل ما يخمّن من كلامك", 833, size="s"), gap=24), transition="fade")
sc(838, R(IC(FE("artist-palette"), 840, "مصمم", size="l"), ARR(848, w=110, flip=True), IC(FE("framed-picture"), 850, "بتبعتله صورة", size="l"),
          S(T("«هون كبّر الخط»", 853, size="s"), T("«هون غيّر الخلفية»", 858, size="s"), T("بيفهم عليك من أول مرة ✓", 862, size="m", tone="green"), gap=14),
          gap=60), transition="fade")
sc(867, CLIP(867, 14, "fs", 3.2, 26.3, label="بعد السر: صارت مدينة", labelBelow=True), transition="fade")
sc(876, R(CLIP(876, 14, "fs", 26.2, w=520, h=671), S(T("راجع الأرقام قبل ما تنشر", 876, size="m"),
          R(S({"type": "counter", "to": 163, "word": 897, "size": "l"}, T("طابق", 898, size="s"), gap=4),
            S({"type": "counter", "to": 828, "word": 899, "size": "l"}, T("متر", 900, size="s"), gap=4), gap=90),
          T("الأنيميشن ممكن يكون ممتاز… وفيه رقم غلط", 901, size="s", tone="red"), gap=20), gap=80), transition="fade")
sc(913, R(V(FE("inbox-tray"), 921, size="l"), S(T("كيف بنطلّعه فيديو؟", 921, size="m"),
          R(S(IC(FE("video-camera"), 931, "تسجيل الشاشة", size="m"), gap=0), T("أو", 935, size="m"),
            IC(FE("red-circle"), 940, "زر بيسجّل لحاله", size="m"), gap=60), T("طريقة أسهل بكثير ✓", 937, size="s", tone="green"), gap=20), gap=70), transition="fade")
sc(948, R(CLIP(948, 15, "chat", 0, 19, w=520, h=828), S(T("زيد زر «سجّل فيديو»", 950, size="m"), T("بيعيد الأنيميشن… وبيسجّله", 956, size="s"),
          T("وبينزّل ملف فيديو", 962, size="s", tone="green"), gap=16), gap=80), transition="fade")
sc(966, CLIP(966, 16, "app", 0, 29.3, label="بدقيقة صار في زر «سجّل فيديو»", labelBelow=True, pointer=[(973, 77, 97)]), transition="fade")
sc(985, R(CLIP(985, 20, "vert", 0, 20, w=480, h=853), S(T("الفيديو اللي نزل", 985, size="m"), T("عمودي • 20 ثانية", 990, size="s"),
          T("جاهز Reel أو Short", 993, size="s", tone="green"), T("بلا أي برنامج", 1001, size="s"), gap=18), gap=90), transition="fade")

# =============================== 4: المستوى 3 — سباق الهجن (1004–1214)
sc(1004, R(CLIP(1004, 18, "game", 8, 20, w=1060, h=520), S(DISC(3, 1004), T("لعبة 3D", 1016, size="l"), T("بتلعبها وبتبعتها لأي حدا", 1018, size="s"), gap=16), gap=50), transition="push")
sc(1022, R(CLIP(1022, 17, "page", 0, 14, w=1000, h=491, zoom=[(1028, 50, 47, 1.8)]),
           S(T("«سباق الهجن»", 1035, size="m"),
             {"type": "checklist", "items": [{"text": "جمل بالأسهم يمين ويسار", "word": 1037}, {"text": "تمر بتجمعه", "word": 1048},
                                             {"text": "صخور بتتفاداها", "word": 1052}, {"text": "نقاط ووقت بالعربي", "word": 1055},
                                             {"text": "باللمس على الموبايل", "word": 1075}],
              "word": 1037, "fs": 36, "w": 560}, gap=12), gap=40), transition="fade")
sc(1080, R(CLIP(1080, 17, "app", 15, 86, w=1100, h=540), S(T("كتبتله قواعد اللعبة كاملة", 1080, size="m"),
           T("كيف بتلعب • شو بتجمع • شو بيخسّرك", 1087, size="s"), T("لعبة كاملة من أول مرة ✓", 1098, size="s", tone="green"),
           S({"type": "counter", "to": 3, "word": 1108, "size": "l"}, T("دقايق تقريباً", 1109, size="s"), gap=4), gap=18), gap=50), transition="fade")
sc(1111, CLIP(1111, 18, "app", 0, 15, label="سباق الهجن", labelBelow=True), transition="fade")
sc(1128, R(CLIP(1128, 18, "prev", 18, 33, w=1060, h=657), S(T("وشي ما طلبته:", 1128, size="m"), T("السرعة بتزيد شوي شوي", 1132, size="s"),
           T("وصوت لما تاكل تمرة", 1135, size="s"), T("عمله لحاله ✓", 1147, size="s", tone="green"), gap=16), gap=60), transition="fade")
sc(1150, CLIP(1150, 19, "page", 4, 26.5, label="Share ← الوصول عام ← Copy link", labelBelow=True,
              pointer=[(1160, 59, 2), (1165, 72, 6), (1173, 74, 52)]), transition="push")
sc(1179, CLIP(1179, 19, "game", 55, 68, label="نفس الرابط… بصفحة جديدة", labelBelow=True), transition="fade")
sc(1205, S(BAN("رابط لعبتي بوصف هالفيديو", [1205, 1207, 1208, 1212, 1213], tone="orange"), T("جرّبها", 1214, size="l", tone="green"),
           ARR(1213, w=200, rotate=70), gap=20), transition="fade")

# =============================== 5: بصراحة (1215–1360)
sc(1215, S(T("بصراحة… 3 أشياء", 1215, size="l"), V(FE("handshake"), 1220, size="l"), gap=20), transition="push")
sc(1224, R(DISC(1, 1224), S(BAR("الليمت المجاني", [1226, 1227, 1228]),
           R(CNT(8, 1233, "طلبات"), CNT(3, 1236, "نتائج"), gap=120), T("ولا مرة طلعتلي رسالة ليمت ✓", 1239, size="s", tone="green"), gap=20), gap=70), transition="fade")
sc(1249, R(V(FE("hourglass-not-done"), 1259, size="l"), S(T("بس الليمت مو ثابت", 1249, size="m"), T("Google ممكن تغيّره بأي وقت", 1254, size="s"),
           T("إذا وقفك: استنّى شوي أو كمّل ثاني يوم", 1259, size="s", tone="green"), T("الليمت = كم مرة فيك تستخدمه ببلاش باليوم", 1267, size="s"), gap=16), gap=70), transition="fade")
sc(1285, S(R(DISC(2, 1285), T("Hydrogen ولا Claude؟", 1287, size="l"), gap=40),
           R(S(V(GOOGLE, 1299, size="l"), T("Hydrogen", 1299, size="m"), T("3 دقايق", 1301, size="s", tone="green"), T("أدق • مجاني", 1304, size="s", tone="green"), gap=10),
             S(V(CLAUDE, 1306, size="l"), T("Claude", 1306, size="m"), T("8 دقايق • مدفوع", 1308, size="s", tone="red"), T("أحلى بالقصة والألوان", 1313, size="s", tone="green"), gap=10), gap=220),
           gap=30), transition="fade")
sc(1319, R(S(T("بدك تبلّش ببلاش وبسرعة؟", 1319, size="s"), BAR("Hydrogen", [1325, 1326]), gap=10),
           S(T("بدك لمسة فنية أكثر؟", 1327, size="s"), BAR("Claude", [1332, 1333], tone="orange"), gap=10), gap=150), transition="fade")
sc(1334, R(DISC(3, 1334), S(T("الوقت", 1336, size="l"), R(S(V(FE("stopwatch"), 1339, size="l"), T("دقيقة لـ 3 دقايق", 1341, size="s"), gap=8),
           S(V(FE("spiral-calendar"), 1351, size="l"), T("ببرنامج 3D: أيام + سنين خبرة", 1353, size="s"), gap=8), gap=120), gap=20), gap=70), transition="fade")

# =============================== CLOSE (1361–1484): energy back
sc(1361, S(T("صار عندك 3 أشياء عملتها بإيدك", 1361, size="m"),
           R(CLIP(1361, 10, "prev", 5, 25, w=560, h=347), CLIP(1361, 20, "vert", 0, 20, w=220, h=391), CLIP(1361, 18, "prev", 18, 33, w=560, h=347), gap=50),
           gap=30), transition="zoom")
sc(1378, S(BAN("نفس الطريقة… على أي فكرة", [1378, 1380, 1381, 1385], tone="orange"),
           R(IC(FE("teacher"), 1389, "درس 3D", size="m"), IC(FE("shopping-bags"), 1399, "منتجك من كل الجهات", size="m"),
             IC(FE("house"), 1408, "مجسّم بيت", size="m"), IC(FE("video-game"), 1420, "لعبة لصحابك", size="m"), gap=70), gap=40), transition="push")
sc(1432, R(V(FE("bullseye"), 1432, size="l"), S(T("مهمتك اليوم", 1432, size="m"),
           {"type": "checklist", "items": [{"text": "افتح AI Studio", "word": 1436}, {"text": "انسخ أول برومبت من الوصف", "word": 1439},
                                           {"text": "اعمل مشهدك الأول", "word": 1445}], "word": 1436, "fs": 44, "w": 560},
           T("حوالي 3 دقايق", 1448, size="s", tone="green"), gap=16), gap=70), transition="push")
sc(1453, R(V(FE("speech-balloon"), 1455, size="l"), T("شو أول شي رح تعمله؟", 1456, size="l"), gap=60), transition="push")
sc(1462, S(T("صناعة المحتوى + الذكاء الاصطناعي", 1466, size="m"), T("كل التحديثات والأدوات المهمة", 1471, size="s", tone="green"),
           {"type": "subscribe", "word": 1476, "clickAt": 1478}, T("والجاي أقوى", 1481, size="m"), gap=30), transition="zoom")

# =============================== cut the screen clips to fit their scenes
froms = [s["from"] for s in scenes]
END = CAP[-1]["endMs"] / 1000 + 1.5
def scene_len(frm):
    i = froms.index(frm)
    nxt = wt(froms[i + 1]) if i + 1 < len(froms) else END
    return nxt - wt(frm)

if "--clips" in sys.argv:
    for c in clips:
        src = CLIPS[c["n"]]
        full = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)],
                                    capture_output=True, text=True).stdout)
        dur = scene_len(c["from"]) + 0.8
        a, b = max(0.0, c["a"]), min(c["b"], full - 0.05)
        look = LOOK[c["kind"]][0] + ",fps=30"
        if c["still"] or (b - a) <= dur:
            speed = 1.0
            vf = f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,{look},tpad=stop_mode=clone:stop_duration={dur - (b - a) + 0.5:.2f}"
        else:
            speed = (b - a) / dur
            vf = f"[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{speed:.4f},{look}"
        out = OUTD / f"{c['name']}.mp4"
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter_complex", vf, "-an", "-t", f"{dur:.2f}",
                            "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", str(out)], capture_output=True, text=True)
        if r.returncode: print("FAIL", c["name"], r.stderr[:400]); continue
        print(c["name"], c["n"], c["kind"], f"{a}-{b}", f"scene {dur:.1f}s", f"x{speed:.2f}")

chapters = {
    "top": True,
    "endWord": 1361,
    "items": [
        {"label": "الأداة", "short": "الأداة", "word": 161},
        {"label": "المستوى 1: مشهد 3D", "short": "مشهد 3D", "word": 245},
        {"label": "المستوى 2: شورت برج خليفة", "short": "شورت 3D", "word": 570},
        {"label": "المستوى 3: لعبة برابط", "short": "لعبة", "word": 1004},
        {"label": "بصراحة", "short": "بصراحة", "word": 1215},
    ],
}

src = json.loads((ROOT / "public/explainer/timeline.json").read_text(encoding="utf8"))["source"]
PLAN.write_text(json.dumps({"source": src, "transition": "push", "music": {"volume": 0.025}, "sfxVolume": 0.5,
                            "calm": {"from": 161, "to": 1361}, "chapters": chapters, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf8")
print("scenes:", len(scenes), "clips:", len(clips))
