# Read a YouTube Studio audience-retention export and say where viewers left — and what Adil was saying there.
# Adapted from youtube-agent-skill (MIT) retention.py; matched against our own word-level timings instead of an SRT.
#
#   python scripts/retention.py <retention.csv> <الأفكار/<name>/توقيت-الكلمات.json> [--json]
#
# The CSV: YouTube Studio → the video → Analytics → Engagement → audience-retention chart → download → "Audience retention".
# Any CSV whose rows start with two numbers works: position (percent of the video, or seconds) and % still watching.
# The timings file is the final video's captions.json (archived by /montage after the render), so seconds map 1:1.
#
# Three different problems, three different fixes:
#   الهوك    what was lost in the first 30 s          → rewrite the first 15 s of the script
#   الهاويات single steep drops (a specific moment)   → cut / signpost that moment
#   النزيف   the steady bleed across the middle       → pacing: shorten, do not rewrite
import csv
import json
import sys
from pathlib import Path


def load_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig", errors="replace") as fh:
        for r in csv.reader(fh):
            nums = []
            for c in r:
                c = c.strip().replace("%", "").replace(",", "")
                try:
                    nums.append(float(c))
                except ValueError:
                    pass
            if len(nums) >= 2:
                rows.append((nums[0], nums[1]))
    return rows


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv
    if len(args) < 2:
        print(__doc__ if __doc__ else "usage: retention.py <retention.csv> <توقيت-الكلمات.json>")
        sys.exit(1)
    rows = load_csv(args[0])
    words = json.loads(Path(args[1]).read_text(encoding="utf8"))
    if len(rows) < 8:
        print("ما قدرت أقرأ 8 نقاط على الأقل من ملف الاحتفاظ")
        sys.exit(1)
    dur = words[-1]["endMs"] / 1000 + 0.5
    xs, ys = [r[0] for r in rows], [r[1] for r in rows]
    pct_axis = max(xs) <= 100.5
    sec = (lambda x: x / 100 * dur) if pct_axis else (lambda x: x)

    def said(t, span=4.0):
        return " ".join(w["text"].strip() for w in words if t - span <= w["startMs"] / 1000 <= t + span)

    start = ys[0] or 100.0
    hook_end = min((y for x, y in rows if sec(x) <= 30), default=start)
    hook_leak = start - hook_end

    drops = []
    for i in range(1, len(rows)):
        d = ys[i - 1] - ys[i]
        span = (sec(xs[i]) - sec(xs[i - 1])) or 1
        drops.append((d / span, sec(xs[i - 1]), d))
    # Steepest drops after the hook (the hook has its own line), at least 0.8 % lost.
    cliffs = sorted([c for c in drops if c[1] > 30 and c[2] > 0.8], reverse=True)[:5]
    mid = [c[0] for c in drops if 30 < c[1] < dur * 0.9]
    slide = sum(mid) / len(mid) if mid else 0  # % per second

    out = {
        "duration_s": round(dur, 1),
        "start": start,
        "end": ys[-1],
        "hook_leak": round(hook_leak, 1),
        "cliffs": [{"at_s": round(t, 1), "lost": round(d, 1), "said": said(t)} for _, t, d in sorted(cliffs, key=lambda c: c[1])],
        "slide_per_min": round(slide * 60, 2),
    }
    if as_json:
        print(json.dumps(out, ensure_ascii=False, indent=1))
        return

    mmss = lambda t: f"{int(t // 60)}:{int(t % 60):02d}"
    verdict = "سليم" if hook_leak < 25 else "يتسرّب" if hook_leak < 40 else "نزيف حاد"
    print(f"\nمدة الفيديو {mmss(dur)} · بدأ {start:.0f}% ← انتهى {ys[-1]:.0f}%\n")
    print(f"الهوك: خسرنا {hook_leak:.1f}% بأول 30 ثانية [{verdict}] (أقل من 25% = سليم)")
    print(f"   كان يقول: «{said(8, 8)}»\n")
    print("الهاويات (لحظات طلع فيها الناس):")
    for c in out["cliffs"]:
        print(f"   {mmss(c['at_s'])}  -{c['lost']}%  «{c['said']}»")
    if not out["cliffs"]:
        print("   لا يوجد: الخسارة كلها نزيف تدريجي، لا لحظات محددة")
    print(f"\nالنزيف بالمنتصف: {out['slide_per_min']}% بالدقيقة (نزيف ثابت = إيقاع بطيء: اختصر، لا تعيد الكتابة)\n")


if __name__ == "__main__":
    main()
