# «شورتس بدون ظهور» (2026-11-08). First practical video with the screen-first method (§22 of the style).
# Energetic hook (0–159) → calm teaching (160–1184) → energetic CTA again (plan.calm.to = 1185).
# Voice: eleven-cut (1240 words) + 2 pauses for the shorts (EN ×1.2 after 863, AR ×1.4 after 1021); the shorts' own
# audio is mixed into voice.wav at those pauses (voice.no-shorts.wav = before the mix).
# Screen clips: Adil's OBS recordings (المدخلات/2026-11-08 18-*.mp4) → cropped (no title bar / taskbar), sidebar
# blurred, upscaled, and sped/frozen to fit each scene exactly. No boxes, no zoom: a bigger pointer glides instead.
# Run: python scripts/plans/شورتس-بدون-ظهور.py [--clips]   (--clips re-cuts the screen clips)
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CH = ROOT.parent
PLAN = ROOT / "public/explainer/plan.json"
CAP = json.loads((ROOT / "public/explainer/captions.json").read_text(encoding="utf8"))
INP = CH / "المدخلات"
OUTD = CH / "العناصر/شورتس-بدون-ظهور"
SRC = {i + 1: INP / f"2026-11-08 {n}.mp4" for i, n in enumerate(
    ["18-08-51", "18-18-41", "18-19-14", "18-20-52", "18-27-18", "18-29-21", "18-34-40", "18-35-36", "18-40-34", "18-56-48"])}

def wt(i): return CAP[i]["startMs"] / 1000 - 0.1

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
def IC(icon, w, label, lw=None, size=None, **k):
    return S(V(icon, w, **({"size": size} if size else {}), **k), T(label, lw if lw is not None else w, size="s"))
def SH(file, at, label=None, pointer=None, **k):
    d = {"type": "shot", "file": file, "word": at, **k}
    if label: d["label"] = label
    if pointer: d["pointer"] = [{"word": a, "x": x, "y": y} for a, x, y in pointer]
    return d

CLAUDE = "logos:claude-icon"
FE = lambda n: f"fluent-emoji-flat:{n}"
COVER = "غلاف-الماستر-كلاس"
VERT = dict(h=880, loop=False)

scenes, clips = [], []
def sc(frm, *items, **kw): scenes.append({"from": frm, "items": list(items), **kw})

# screen scene: cut [a,b] of recording n, fitted to the scene length (filled in after all scenes are known)
def SCR(frm, n, a, b, label=None, pointer=None, still=False, site=False, **kw):
    name = f"شبظ-{len(clips) + 1:02d}"
    clips.append({"name": name, "n": n, "a": a, "b": b, "from": frm, "still": still, "site": site})
    sc(frm, SH(name, frm, label=label, pointer=pointer, w=1700, h=877, loop=False, labelBelow=True), **kw)

# ---------------- HOOK (0–159): energy
sc(0, R(SH("شبظ-teaser-en", 0, **VERT),
        S(R(S(V(FE("artist-palette"), 16, size="m"), X(16, w=120)), S(V(FE("studio-microphone"), 18, size="m"), X(19, w=120)),
            S(V(FE("clapper-board"), 23, size="m"), X(24, w=120)), gap=60),
          BAN("جملة وحدة لكلود", [29, 30, 31, 33], tone="orange"), gap=60), gap=120), transition="zoom")
sc(34, R(SH("شبظ-teaser-ar", 34, **VERT), BAR("وبالعربي", [36, 37]), gap=120), transition="push")
sc(38, S(T("تعليقاتكم عالفيديو الماضي", 38, size="m"),
         BAN("«بياخد وقت طويل»", [52, 53, 54], tone="purple"), BAN("«بدها يوم كامل»", [55, 56, 57], tone="purple"),
         BAN("«إذا ما بتدفع ما في فايدة»", [58, 60, 63], tone="magenta"), gap=34), transition="push")
sc(64, R(V(FE("magnifying-glass-tilted-left"), 64, size="l"), S(T("طريقة أسهل وأسرع", 66), T("فيديو أجنبي", 70, size="s"), gap=20), gap=70), transition="push")
sc(72, S(BAR("+400 ألف مشاهدة", [73, 75, 77]), T("بأسبوع واحد", 78, size="m"), gap=40), transition="zoom", bg="rays")
sc(80, R(IC(FE("memo"), 86, "برومبت واحد", size="l"), ARR(86, w=150, flip=True), IC(FE("clapper-board"), 84, "شورت كامل", size="l"), gap=50), transition="push")
sc(89, R(V(FE("money-with-wings"), 92, size="l"), BAN("كلهم بيحكوا: ببلاش!", [90, 92, 94], tone="orange"), gap=50), transition="push")
sc(95, R(V(FE("test-tube"), 96, size="l"), S(T("جرّبتها بنفسي", 96), T("من أول خطوة لآخر خطوة", 98, size="s"), gap=20), gap=70), transition="push")
sc(103, S(BAN("الحقيقة شوي مختلفة", [103, 104, 105], tone="magenta"), T("ورح أحكيلك ياها بصراحة", 106, size="m"), gap=40), transition="glitch")
sc(111, S(T("4 خطوات", 114, size="m"),
          R(IC(FE("shopping-cart"), 116, "شو بتحتاج"), IC(FE("package"), 121, "التركيب"), IC(FE("clapper-board"), 128, "أول شورت"), IC(FE("globe-showing-europe-africa"), 132, "بالعربي"), gap=90),
          T("+ نصايح من التجربة", 138, size="s", tone="green"), gap=40), transition="push")
sc(143, S(BAN("كل البرومبتات بوصف هالفيديو", [143, 145, 149, 151], tone="orange"), ARR(151, w=240, rotate=70)), transition="flash")

# ---------------- 1: شو بتحتاج (160–386) — calm from here
SCR(160, 1, 0.3, 7.6, site=True, label="Faceless Shorts Skill · Nafay 3D", pointer=[(166, 50, 30), (183, 50, 30)], transition="push")
sc(183, {"type": "mc-skill", "word": 183, "title": "SKILL", "chat": {"text": "ملف تعليمات بتعطيه لكلود", "word": 189}, "fileAt": 191,
         "steps": [{"text": "بيعرف يعمل شغلة معينة", "word": 195}, {"text": "بطريقة محترفة", "word": 199}],
         "runs": [{"day": "كل مرة", "text": "نفس الجودة", "word": 201}], "stamp": "نفس الجودة"}, transition="fade")
sc(205, S(R(V(FE("laptop"), 214, size="l"), T("كل شي بالكود على جهازك", 208), gap=60),
          R(IC(FE("artist-palette"), 215, "الرسوم", size="s"), IC(FE("studio-microphone"), 216, "الصوت", size="s"),
            IC(FE("memo"), 217, "الكتابة", size="s"), IC(FE("musical-notes"), 218, "الموسيقى", size="s"), gap=90), gap=50), transition="fade")
sc(219, R(S(IC(FE("framed-picture"), 221, "موقع صور"), X(222, w=180)), S(IC(FE("credit-card"), 225, "اشتراك بأداة ثانية"), X(226, w=180)), gap=200), transition="fade")
STY = [("stick-story", 233, "Stick Story", "شو بتعمل إذا…"), ("deep-dive", 242, "Deep Dive 3D", "شو بيصير لجسمك إذا…"),
       ("inside-out", 254, "Inside Out", "نفس الفكرة، أبسط وأسرع"), ("night-file", 263, "Night File 3D", "قصص غامضة وجرائم"),
       ("paper-atlas", 271, "Paper Atlas", "التاريخ بخرايط من ورق"), ("tall-tale", 281, "Tall Tale 3D", "قصص حقيقية مضحكة")]
sc(228, S({"type": "counter", "to": 6, "word": 229, "size": "xl"}, T("أشكال أو ستايلات", 230, size="m"), gap=10), transition="fade")
for i, (k, w, name, sub) in enumerate(STY):
    sc(w, S(R(DISC(i + 1, w, size="s"), T(f"{name}: {sub}", w, size="m"), gap=30), SH(f"ستايل-{k}", w, w=1300, h=640), gap=26), transition="fade")
sc(289, R(IC(CLAUDE, 301, "Claude Code", size="l"), S(T("مو موجود بالحساب المجاني", 303), X(306, w=220)), gap=90), transition="fade")
sc(308, R(IC(FE("speech-balloon"), 310, "Claude العادي: مستشار بتحكي معه", size="l"),
          IC(FE("man-technologist"), 317, "Claude Code: موظف قاعد على كمبيوترك", size="l"), gap=160), transition="fade")
sc(325, R(IC(FE("open-file-folder"), 325, "بيفتح الملفات", size="m"), IC(FE("inbox-tray"), 327, "بينزّل البرامج", size="m"), IC(FE("gear"), 329, "بيشتغل لحاله", size="m"), gap=110), transition="fade")
sc(331, R(S(V(FE("laptop"), 335, size="l"), X(334, w=200)), T("المجاني ما بيوصل لجهازك أصلاً", 331), gap=70), transition="fade")
sc(337, R(V(FE("credit-card"), 339, size="l"), S(BAR("اشتراك Pro", [339, 340]), T("الشي الوحيد المدفوع", 343, size="m"), gap=24), gap=60), transition="fade")
sc(347, S(BAN("والباقي كله ببلاش", [347, 348, 349], tone="orange"),
          R(IC(FE("scroll"), 351, "السكيل", size="s"), IC(FE("laptop"), 352, "البرامج", size="s"), IC(FE("studio-microphone"), 357, "الصوت", size="s"),
            IC(FE("artist-palette"), 358, "الرسوم", size="s"), IC(FE("film-frames"), 359, "المونتاج", size="s"), gap=70), gap=50), transition="fade")
sc(360, R(V(FE("spiral-calendar"), 365, size="l"), S(T("شورتس كل يوم", 364), T("بدون ولا ليرة زيادة", 368, size="s", tone="green"), gap=20), gap=70), transition="fade")
SCR(374, 1, 9.0, 9.1, still=True, label="تطبيق Claude ← Code", pointer=[(374, 50, 50), (382, 10.6, 2.8)], transition="fade")

# ---------------- 2: التركيب (387–616)
SCR(387, 1, 0.3, 7.8, site=True, label="nafay3d.com", pointer=[(395, 50, 30), (406, 66, 54.5)], transition="push")
SCR(423, 1, 8.6, 12.0, label="فتحت Claude Code واخترت المجلد", pointer=[(430, 60, 70), (433, 56, 40)], transition="fade")
SCR(441, 1, 19.5, 29.0, label="البرومبت 1: التركيب", pointer=[(443, 72, 14), (458, 52, 17)], transition="fade")
sc(477, S(BAN("«افحص شو موجود عندي»", [478, 479, 480, 481], tone="orange"),
          T("بدونها ممكن ينزّل برامج عندك أصلاً، ويضيّع وقتك", 484, size="m"), gap=40), transition="fade")
SCR(495, 1, 29.0, 36.0, label="كتب قائمة مهام لحاله", pointer=[(498, 73, 32), (503, 73, 40)], transition="fade")
SCR(507, 1, 46.0, 51.6, label="الأربع برامج موجودين", pointer=[(509, 58, 31)], transition="fade")
SCR(526, 2, 1.0, 1.1, still=True, label="نزّل الناقص بس", pointer=[(530, 52, 41), (551, 52, 52), (560, 52, 53)], transition="fade")
sc(565, {"type": "mc-typing", "word": 565, "title": "إذا طلعتلك مشكلة", "text": "طلع معي هالخطأ: [الصق الرسالة]\nحلّه بأقصر طريقة، وما تعيد تنزيل شي موجود.", "end": 586}, transition="fade")
sc(587, S(BAN("وهالبرومبت كمان بالوصف", [587, 589, 590, 591], tone="orange"), ARR(591, w=220, rotate=70)), transition="fade")
sc(592, R(V(FE("hourglass-not-done"), 593, size="l"), S(T("كم دقيقة… مرة وحدة بس", 596), T("وبعدها بتستعملها كل يوم", 607, size="s", tone="green"), gap=20), gap=70), transition="fade")
SCR(613, 2, 1.0, 1.1, still=True, label="جاهز", pointer=[(613, 68, 62)], transition="fade")

# ---------------- 3: أول شورت (617–863)
SCR(617, 2, 10.5, 20.0, label="البرومبت 2: Make a Stick Story short", transition="push")
sc(639, R(IC(FE("artist-palette"), 642, "أي ستايل", size="l"), T("+", 645, size="l"), IC(FE("elevator"), 646, "عن شو", size="l"), gap=90), transition="fade")
SCR(648, 3, 0.0, 27.9, label="قبل ما يبني: قواعد الستايل والتأكد من المعلومات", pointer=[(657, 71, 67), (664, 70, 70), (667, 52, 84)], transition="fade")
SCR(700, 4, 0.0, 6.2, label="الخطة كاملة بجدول", pointer=[(706, 68, 22), (710, 49, 22), (715, 38, 22)], transition="fade")
SCR(722, 4, 6.2, 16.0, label="«أبني؟»", pointer=[(724, 50, 76), (751, 41, 76)], transition="fade")
SCR(755, 5, 0.0, 6.0, label="سجّل الصوت: 39 ثانية", pointer=[(758, 46, 60)], transition="fade")
SCR(768, 6, 0.0, 13.0, label="فحص كل اللقطات بصفحة وحدة", transition="fade")
SCR(784, 7, 7.0, 14.0, label="لقى 6 أخطاء وصلّحهم", pointer=[(788, 58, 70), (797, 58, 75), (803, 58, 81)], transition="fade")
sc(809, R(V(FE("eyes"), 812, size="l"), S(T("ما كنت رح انتبهلها لحالي", 811), T("لقاها وصلّحها بدون ما أطلب", 820, size="s", tone="green"), gap=20), gap=70), transition="fade")
SCR(825, 7, 13.4, 13.5, still=True, label="الفيديو + الغلاف + ملف النشر", pointer=[(826, 85, 34.5), (828, 85, 32), (830, 85, 39.5)], transition="fade")
sc(840, R(V(FE("stopwatch"), 848, size="l"), S(T("تقريباً ربع ساعة", 847), T("وإنت بتشتغل شغلة ثانية", 855, size="s", tone="green"), gap=20), gap=70), transition="fade")
sc(863, SH("شبظ-short-en", 863, h=960, loop=False), transition="fade")

# ---------------- 4: العربي والصوت (864–1131)
SCR(864, 8, 8.0, 20.0, label="البرومبت 3: نفس الشورت بالعربي", pointer=[(873, 57, 89)], transition="push")
SCR(894, 8, 20.0, 52.0, label="«جاوبني بالعربي»", transition="fade")
SCR(911, 8, 52.0, 75.0, label="3 خيارات للصوت", pointer=[(922, 72, 65), (924, 72, 72)], transition="fade")
sc(925, S(R(DISC(1, 925, size="s"), T("صوتك إنت على الموبايل", 925, size="m"), gap=30),
          R(DISC(2, 938, size="s"), T("صوت Microsoft: مجاني، بس مو رسمي", 938, size="m"), gap=30),
          R(DISC(3, 951, size="s"), T("Piper: بدون نت، بس أضعف", 951, size="m"), gap=30), gap=40), transition="fade")
SCR(962, 9, 0.0, 26.2, label="عيّنتين: لهجة وفصحى", pointer=[(970, 40, 19), (983, 65, 92)], transition="fade")
SCR(985, 10, 0.0, 10.6, label="خط عربي، يمين لليسار، كل كلمة بوقتها", pointer=[(990, 67, 45)], transition="fade")
sc(1004, R(S({"type": "counter", "to": 39, "word": 1004, "size": "l"}, T("إنجليزي", 1004, size="s"), gap=6),
           S({"type": "counter", "to": 53, "word": 1008, "size": "l"}, T("عربي (ثانية)", 1009, size="s"), gap=6),
           S(BAR("×1.4", [1017]), T("مسرّعة لتشوفها", 1017, size="s"), gap=10), gap=140), transition="fade")
sc(1021, SH("شبظ-short-ar", 1021, h=960, loop=False), transition="fade")
sc(1022, R(S(T("الرسوم ✓  القصة ✓  الكتابة ✓", 1022), T("جيدة جداً", 1025, size="s", tone="green"), gap=20),
            S(V(FE("robot"), 1031, size="l"), T("بس الصوت آلي", 1031, size="s", tone="red"), gap=10), gap=150), transition="fade")
sc(1036, R(S({"type": "counter", "to": 2, "word": 1043, "size": "xl"}, T("أول ثانيتين بالصوت", 1043, size="s"), gap=6),
           T("هنن يلي بيقرروا: بيكمّل ولا بيقلب", 1045), gap=90), transition="fade")
sc(1053, S(T("3 طرق لصوت قوي", 1057, size="m"),
           R(DISC(1, 1060, size="s"), IC(FE("studio-microphone"), 1060, "سجّل صوتك إنت", size="m"), T("الناس بتحس في روح", 1066, size="s", tone="green"), gap=50), gap=40), transition="fade")
sc(1077, R(DISC(2, 1077, size="s"), IC("logos:elevenlabs", 1084, "ElevenLabs", size="l"), IC("logos:google-gemini-icon", 1086, "أصوات Gemini", size="l"),
           S(T("فيهم خيارات مجانية", 1088, size="m"), T("بتعطي الصوت لكلود وهو بيكمّل", 1095, size="s"), gap=16), gap=70), transition="fade")
sc(1101, R(DISC(3, 1101, size="s"), V(CLAUDE, 1103, size="l"), S(T("خلّي كلود يجرّبلك أكثر من صوت", 1102), T("وإنت بتسمع وبتختار", 1109, size="s"), gap=20), gap=60), transition="fade")
sc(1112, R(V(FE("speech-balloon"), 1116, size="l"), S(BAN("اكتبلي بالتعليقات", [1116, 1117, 1118], tone="orange"), T("فيديو كامل عن الأصوات المجانية الاحترافية", 1119, size="s"), gap=24), gap=60), transition="fade")

# ---------------- 5: بمجالك (1132–1184)
sc(1132, R(V(FE("light-bulb"), 1135, size="l"), T("كيف تستعمله بمجالك إنت", 1135), gap=70), transition="push")
sc(1141, R(IC(FE("person-lifting-weights"), 1142, "مدرب رياضة", size="l"), T("«شو بيصير لجسمك\nإذا مشيت 10 آلاف خطوة؟»", 1144, size="m"), gap=70), transition="fade")
sc(1154, R(IC(FE("fork-and-knife-with-plate"), 1156, "مطعم", size="l"), T("«قصة أكلة مشهورة: من وين إجت؟»", 1157, size="m"), gap=70), transition="fade")
sc(1163, R(IC(FE("briefcase"), 1165, "أي مجال", size="l"), T("«شو بيصير إذا…؟»", 1169, size="m"), gap=70), transition="fade")
sc(1176, S(T("نفس السكيل · نفس البرومبت", 1176), T("بس الموضوع من عندك", 1182, size="m", tone="green"), gap=26), transition="fade")

# ---------------- BRIDGE + CTA (1185–1239): energy back
sc(1185, R(V(FE("clapper-board"), 1191, size="l"), BAN("السكيل بتعملك فيديو", [1189, 1190, 1191, 1193], tone="purple"), gap=50), transition="push")
sc(1194, R(V(FE("robot"), 1200, size="l"), BAN("اللي بيفرق: كلود يشتغل عنك بكل شغلك", [1195, 1196, 1199, 1200, 1201, 1203], tone="orange"), gap=50), transition="zoom", bg="rays")
sc(1208, S(F(COVER, 1211, look="card", size="xl"), BAN("ماستر كلاس مجاني عن كلود", [1211, 1212, 1214], tone="orange")), transition="flash")
sc(1215, R(V(CLAUDE, 1215, size="l"), BAN("كيف تبني هالنظام خطوة بخطوة", [1215, 1216, 1217, 1218, 1219], tone="purple"), gap=50), transition="push")
sc(1221, S(BAN("الرابط بوصف هالفيديو", [1221, 1222, 1223], tone="orange"), T("+ البرومبتات ورابط السكيل", 1224, size="m"), ARR(1222, w=260, rotate=70)), transition="push")
sc(1233, {"type": "subscribe", "word": 1233, "clickAt": 1234}, transition="zoom")

# ---------------- cut the screen clips to fit their scenes
froms = [s["from"] for s in scenes]
END = CAP[-1]["endMs"] / 1000 + 1.5
def scene_len(frm):
    i = froms.index(frm)
    nxt = wt(froms[i + 1]) if i + 1 < len(froms) else END
    return nxt - wt(frm)

if "--clips" in sys.argv:
    for c in clips:
        dur = scene_len(c["from"]) + 0.8
        src, a, b = SRC[c["n"]], c["a"], c["b"]
        # Adil 2026-11-08: OBS shows its own window in the first ~0.5 s (start) and the last ~2.5 s (stop) of EVERY
        # recording → never take the first 1.5 s or the last 3.5 s.
        full = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)],
                                    capture_output=True, text=True).stdout)
        a, b = max(a, 1.5), min(b, full - 3.5)
        if c["still"]: b = a + 0.1
        if c["site"]:  # left half of the split screen: the browser page only
            look = "crop=760:620:250:68,scale=1520:1240:flags=lanczos,unsharp=5:5:0.5,fps=30"
        else:  # whole Claude window minus title bar / taskbar; the chats list (sidebar under «New») softly blurred
            look = "crop=1280:660:0:28,split[m][s];[s]crop=180:600:0:60,boxblur=7:2[bl];[m][bl]overlay=0:60,scale=1920:990:flags=lanczos,unsharp=5:5:0.5,fps=30"
        if c["still"] or (b - a) <= dur:
            speed = 1.0
            vf = f"trim={a}:{b},setpts=PTS-STARTPTS,{look},tpad=stop_mode=clone:stop_duration={dur - (b - a) + 0.5:.2f}"
        else:
            speed = (b - a) / dur
            vf = f"trim={a}:{b},setpts=(PTS-STARTPTS)/{speed:.4f},{look}"
        out = OUTD / f"{c['name']}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter_complex", vf, "-an", "-t", f"{dur:.2f}",
                        "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", str(out)], check=True)
        print(c["name"], f"rec{c['n']} {a}-{b}", f"scene {dur:.1f}s", f"x{speed:.2f}")

chapters = {
    "top": True,
    "endWord": 1185,
    "hide": [{"from": 863, "to": 864}, {"from": 1021, "to": 1022}],
    "items": [
        {"label": "شو بتحتاج", "short": "شو بتحتاج", "word": 160},
        {"label": "التركيب", "short": "التركيب", "word": 387},
        {"label": "أول شورت", "short": "أول شورت", "word": 617},
        {"label": "العربي والصوت", "short": "العربي والصوت", "word": 864},
        {"label": "بمجالك", "short": "بمجالك", "word": 1132},
    ],
}

plan = {"source": json.loads((ROOT / "public/explainer/timeline.json").read_text(encoding="utf8"))["source"]}
PLAN.write_text(json.dumps({"source": plan["source"], "transition": "push", "music": {"volume": 0.025}, "sfxVolume": 0.5,
                            "calm": {"from": 160, "to": 1185}, "chapters": chapters, "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf8")
print("scenes:", len(scenes), "clips:", len(clips))
